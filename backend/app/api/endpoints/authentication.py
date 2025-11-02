from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import create_access_token, create_refresh_token, verify_password, verify_token
from app.crud.user import get_user_by_email, set_reset_password_otp, reset_password
from app.schemas.token import Token
from app.schemas.password import ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
from app.schemas.response import CommonResponse
from app.services.notification_service import send_otp_email
from app.utils.dependencies import get_db
from datetime import datetime
from app.utils.zkp_helper import generate_proof_and_verify
from app.schemas.user import User

router = APIRouter()

@router.post("/login", response_model=CommonResponse[Token])
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(db, email=form_data.username)
    
    if not user:
        return CommonResponse(success=False, message="User not found!")
    
    zkp_proof_verification = await generate_proof_and_verify(form_data.password, user.zkp_salt, user.zkp_nullifier)

    if not zkp_proof_verification["verified"]:
        return CommonResponse(success=False, message="ZKP verification failed!")
    
    zkp_commitment = zkp_proof_verification["zkp_commitment"]
    zkp_nullifier = zkp_proof_verification["zkp_nullifier"]

    if not (zkp_commitment == user.zkp_commitment and zkp_nullifier == user.zkp_nullifier):
        return CommonResponse(success=False, message="ZKP identity verification failed!")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    token_data = {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    user_data = User.model_validate(user).model_dump()
    return CommonResponse(success=True, message="Login successful", data={**token_data, "user": user_data})

@router.post("/refresh", response_model=CommonResponse[Token])
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = verify_token(refresh_token, credentials_exception)
    user = get_user_by_email(db, email=email)
    if not user:
        raise credentials_exception
    access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    token_data = {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
    return CommonResponse(success=True, message="Token refreshed successfully", data=token_data)

@router.post("/forgot-password", response_model=CommonResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user = set_reset_password_otp(db, user)
    
    await send_otp_email(
        email=user.email,
        user_name=user.full_name or "User",
        otp_code=user.reset_password_otp,
        purpose="password_reset",
        expiry_minutes=10
    )
    
    return CommonResponse(success=True, message="OTP sent to your email")

@router.post("/verify-otp", response_model=CommonResponse)
async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request.email)
    if not user or user.reset_password_otp != request.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    
    if user.reset_password_otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired")
    
    return CommonResponse(success=True, message="OTP verified successfully")

@router.post("/reset-password", response_model=CommonResponse)
async def reset_password_flow(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request.email)
    if not user or user.reset_password_otp != request.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    
    if user.reset_password_otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired")
    
    await reset_password(db, user, request.new_password)
    
    return CommonResponse(success=True, message="Password reset successfully") 

@router.post("/login/fingerprint", response_model=CommonResponse[Token])
async def login_with_fingerprint(
    db: Session = Depends(get_db),
    email: str = Body(...),
    fingerprint_signature: str = Body(...),
):
    user = get_user_by_email(db, email=email)
    if not user or user.fingerprint_signature != fingerprint_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or fingerprint signature",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    token_data = {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    return CommonResponse(success=True, message="Login successful", data=token_data) 
