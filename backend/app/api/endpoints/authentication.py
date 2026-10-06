import logging
import secrets
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import rate_limit
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.crud.user import get_user_by_email, reset_password, set_reset_password_otp
from app.schemas.password import ForgotPasswordRequest, ResetPasswordRequest, VerifyOTPRequest
from app.schemas.response import CommonResponse
from app.schemas.token import Token, TokenPair
from app.schemas.user import User
from app.services.notification_service import send_otp_email
from app.utils.dependencies import get_db
from app.utils.zkp_helper import generate_proof_and_verify

logger = logging.getLogger(__name__)
router = APIRouter()

INVALID_LOGIN = "Incorrect email or password."
LOGIN_LIMIT, LOGIN_WINDOW = 10, 15 * 60  # attempts per email per window
OTP_LIMIT, OTP_WINDOW = 5, 10 * 60  # wrong codes before the code is burned
OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW = 3, 10 * 60


def _tokens_for(email: str) -> dict:
    return {
        "access_token": create_access_token(data={"sub": email}),
        "refresh_token": create_refresh_token(data={"sub": email}),
        "token_type": "bearer",
    }


@router.post("/login", response_model=CommonResponse[Token])
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username.strip().lower()
    # Each attempt costs a ZK proof on the server, so cap attempts per account.
    if not rate_limit.hit(f"login:{email}", LOGIN_LIMIT, LOGIN_WINDOW):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many sign-in attempts. Try again in 15 minutes.")

    user = get_user_by_email(db, email=email)
    # Same message whether the email exists or the password is wrong (no account enumeration).
    if not user or not user.zkp_salt:
        return CommonResponse(success=False, message=INVALID_LOGIN)

    proof = await generate_proof_and_verify(form_data.password, user.zkp_salt, user.zkp_nullifier)
    if not (proof.get("verified") and proof.get("zkp_commitment") == user.zkp_commitment and proof.get("zkp_nullifier") == user.zkp_nullifier):
        return CommonResponse(success=False, message=INVALID_LOGIN)

    if not user.is_active:
        return CommonResponse(success=False, message="This account has been deactivated. Contact support.")

    rate_limit.reset(f"login:{email}")
    user_data = User.model_validate(user).model_dump()
    return CommonResponse(success=True, message="Login successful", data={**_tokens_for(user.email), "user": user_data})


@router.post("/refresh", response_model=CommonResponse[TokenPair])
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = verify_token(refresh_token, credentials_exception, expected_type="refresh")
    user = get_user_by_email(db, email=email)
    if not user or not user.is_active:
        raise credentials_exception
    return CommonResponse(success=True, message="Token refreshed successfully", data=_tokens_for(user.email))


@router.post("/forgot-password", response_model=CommonResponse)
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    if not rate_limit.hit(f"otp-request:{email}", OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many code requests. Try again in a few minutes.")

    user = get_user_by_email(db, email=email)
    if user and user.is_active:
        user = set_reset_password_otp(db, user)
        rate_limit.reset(f"otp:{email}")
        background_tasks.add_task(
            _send_otp, email=user.email, user_name=user.full_name or "User", otp_code=user.reset_password_otp
        )
    # Identical response either way, so this can't be used to discover registered emails.
    return CommonResponse(success=True, message="If an account exists for that email, a verification code is on its way.")


async def _send_otp(email: str, user_name: str, otp_code: str):
    try:
        await send_otp_email(email=email, user_name=user_name, otp_code=otp_code, purpose="password_reset", expiry_minutes=10)
    except Exception:
        logger.exception("Failed to send OTP email to %s", email)


def _check_otp(db: Session, email: str, otp: str):
    """Validate a reset code; after OTP_LIMIT wrong guesses the code is invalidated."""
    email = email.strip().lower()
    user = get_user_by_email(db, email=email)
    invalid = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code.")
    if not user or not user.reset_password_otp:
        raise invalid
    if user.reset_password_otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This code has expired. Request a new one.")
    if not secrets.compare_digest(user.reset_password_otp, otp.strip()):
        if not rate_limit.hit(f"otp:{email}", OTP_LIMIT, OTP_WINDOW):
            user.reset_password_otp = None
            db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many wrong codes. Request a new one.")
        raise invalid
    return user


@router.post("/verify-otp", response_model=CommonResponse)
async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    _check_otp(db, request.email, request.otp)
    return CommonResponse(success=True, message="Code verified")


@router.post("/reset-password", response_model=CommonResponse)
async def reset_password_flow(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(request.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters.")
    user = _check_otp(db, request.email, request.otp)
    await reset_password(db, user, request.new_password)
    rate_limit.reset(f"otp:{user.email}")
    rate_limit.reset(f"login:{user.email}")
    return CommonResponse(success=True, message="Password reset successfully")
