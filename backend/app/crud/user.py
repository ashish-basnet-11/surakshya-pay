import asyncio
import logging
import secrets
import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.security import encrypt_private_key
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.notification_service import send_welcome_email
from app.utils.blockchain import create_new_wallet, register_user_onchain
from app.utils.zkp_helper import get_zkp_fields

logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        _add_kyc_info(user)
    return user

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()
    if user:
        _add_kyc_info(user)
    return user

def get_user_by_username(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if user:
        _add_kyc_info(user)
    return user

def get_user_by_wallet_address(db: Session, wallet_address: str):
    """Get user by wallet address"""
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if user:
        _add_kyc_info(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    for user in users:
        _add_kyc_info(user)
    return users

def _add_kyc_info(user: User):
    """Add KYC information to user object"""
    if hasattr(user, 'kyc') and user.kyc:
        user.kyc_status = user.kyc.status.value
        user.kyc_submitted_at = user.kyc.submitted_at
        user.kyc_reviewed_at = user.kyc.reviewed_at
    else:
        user.kyc_status = None
        user.kyc_submitted_at = None
        user.kyc_reviewed_at = None

async def create_user(db: Session, user: UserCreate):
    email = user.email.strip().lower()
    phone = getattr(user, "phone_number", None) or None
    if phone and db.query(User).filter(User.phone_number == phone).first():
        raise HTTPException(status_code=400, detail="This phone number is already registered.")

    user_guid = str(uuid.uuid4())
    wallet = create_new_wallet()
    zkp_fields = await get_zkp_fields(user.password)

    # Register the wallet on-chain *before* saving the account: an account whose wallet
    # isn't registered can never deposit or transfer, so fail the signup instead.
    try:
        await run_in_threadpool(register_user_onchain, wallet["address"], user_guid, wallet["private_key"])
    except Exception:
        logger.exception("On-chain registration failed for %s", email)
        raise HTTPException(status_code=503, detail="We couldn't set up your wallet right now. Please try again shortly.")

    username = user.username or _generate_unique_username(db)
    db_user = User(
        email=email,
        phone_number=phone,
        full_name=user.full_name,
        wallet_address=wallet["address"],
        private_key_encrypted=encrypt_private_key(wallet["private_key"], settings.SECRET_KEY),
        guid=user_guid,
        zkp_commitment=zkp_fields["zkp_commitment"],
        zkp_nullifier=zkp_fields["nullifier"],
        zkp_salt=zkp_fields["salt"],
        username=username,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Don't make signup wait on SMTP.
    asyncio.create_task(_send_welcome(db_user.email, db_user.full_name or "User", db_user.username))

    _add_kyc_info(db_user)
    return db_user


def _generate_unique_username(db: Session) -> str:
    while True:
        username = User.generate_username()
        if not db.query(User).filter(User.username == username).first():
            return username


async def _send_welcome(email: str, name: str, username: str):
    try:
        await send_welcome_email(email=email, user_name=name, generated_user_name=username)
    except Exception:
        logger.exception("Failed to send welcome email to %s", email)

def update_user(db: Session, db_user: User, user_in: UserUpdate):
    if user_in.full_name is not None:
        db_user.full_name = user_in.full_name
    if user_in.email is not None:
        db_user.email = user_in.email
    if user_in.phone_number is not None:
        db_user.phone_number = user_in.phone_number
    if user_in.fingerprint_signature is not None:
        db_user.fingerprint_signature = user_in.fingerprint_signature
    if user_in.zkp_commitment is not None:
        db_user.zkp_commitment = user_in.zkp_commitment
    if user_in.zkp_nullifier is not None:
        db_user.zkp_nullifier = user_in.zkp_nullifier
    if user_in.zkp_salt is not None:
        db_user.zkp_salt = user_in.zkp_salt
    if user_in.wallet_address is not None:
        db_user.wallet_address = user_in.wallet_address
    if user_in.public_key is not None:
        db_user.public_key = user_in.public_key
    if user_in.private_key_encrypted is not None:
        db_user.private_key_encrypted = user_in.private_key_encrypted
    if user_in.balance is not None:
        db_user.balance = user_in.balance
    if user_in.guid is not None:
        db_user.guid = user_in.guid
    if user_in.username is not None:
        db_user.username = user_in.username
    if user_in.reset_password_otp is not None:
        db_user.reset_password_otp = user_in.reset_password_otp
    if user_in.reset_password_otp_expires_at is not None:
        db_user.reset_password_otp_expires_at = user_in.reset_password_otp_expires_at
    if user_in.is_active is not None:
        db_user.is_active = user_in.is_active
    if user_in.is_superuser is not None:
        db_user.is_superuser = user_in.is_superuser
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add KYC info before returning
    _add_kyc_info(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    db.delete(db_user)
    db.commit()
    return db_user

def set_reset_password_otp(db: Session, db_user: User):
    otp = f"{secrets.randbelow(10**6):06d}"
    otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db_user.reset_password_otp = otp
    db_user.reset_password_otp_expires_at = otp_expires_at
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def reset_password(db: Session, db_user: User, new_password: str):
    zkp_fields = await get_zkp_fields(new_password)
    db_user.zkp_commitment = zkp_fields["zkp_commitment"]
    db_user.zkp_nullifier = zkp_fields["nullifier"]
    db_user.zkp_salt = zkp_fields["salt"]
    db_user.reset_password_otp = None
    db_user.reset_password_otp_expires_at = None
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user 

def count_total_users(db: Session) -> int:
    from app.models.user import User
    return db.query(User).count()

def count_total_admins(db: Session) -> int:
    from app.models.user import User
    return db.query(User).filter(User.is_superuser == True).count()

def count_active_users(db: Session) -> int:
    from app.models.user import User
    return db.query(User).filter(User.is_active == True).count()

def count_new_users_this_week(db: Session) -> int:
    week_ago = datetime.utcnow() - timedelta(days=7)
    return db.query(User).filter(User.created_at >= week_ago).count()

def count_kyc_verified_users(db: Session) -> int:
    from app.models.user import User
    from app.models.kyc import KYCStatus
    return db.query(User).join(User.kyc).filter(User.kyc.has(status=KYCStatus.APPROVED)).count() 