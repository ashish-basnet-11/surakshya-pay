from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, encrypt_private_key
from app.core.config import settings
import random
import string
from datetime import datetime, timedelta
from app.utils.blockchain import register_user_onchain, create_new_wallet
import uuid
from app.utils.zkp_helper import get_zkp_fields
from app.services.notification_service import send_welcome_email

def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        _add_kyc_info(user)
    return user

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
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
    user_guid = str(uuid.uuid4())
    wallet = create_new_wallet()
    wallet_address = wallet['address']
    private_key = wallet['private_key']
    encrypted_private_key = encrypt_private_key(private_key, settings.SECRET_KEY)

    zkp_fields = await get_zkp_fields(user.password)
    print(zkp_fields)

    def generate_unique_username():
        while True:
            username = User.generate_username()
            if not db.query(User).filter(User.username == username).first():
                return username
            
    username = user.username if user.username else generate_unique_username()
    db_user = User(
        email=user.email,
        phone_number=getattr(user, 'phone_number', None),
        full_name=user.full_name,
        fingerprint_signature=getattr(user, 'fingerprint_signature', None),
        wallet_address=wallet_address,
        public_key=getattr(user, 'public_key', None),
        private_key_encrypted=encrypted_private_key,
        guid=user_guid,
        zkp_commitment=zkp_fields["zkp_commitment"],
        zkp_nullifier=zkp_fields["nullifier"],
        zkp_salt=zkp_fields["salt"],
        username=username,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    try:
        zk_hash = user_guid
        tx_hash = register_user_onchain(wallet_address, zk_hash, private_key)
        print(tx_hash)
    except Exception as e:
        print(f"Onchain registration failed: {e}")
    
    # Send welcome email
    try:
        await send_welcome_email(
            email=db_user.email,
            user_name=db_user.full_name or "User",
            generated_user_name=db_user.username
        )
        print(f"Welcome email sent to {db_user.email}")
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    # Add KYC info before returning
    _add_kyc_info(db_user)
    return db_user

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
    otp = ''.join(random.choices(string.digits, k=6))
    otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db_user.reset_password_otp = otp
    db_user.reset_password_otp_expires_at = otp_expires_at
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def reset_password(db: Session, db_user: User, new_password: str):
    zkp_fields = await get_zkp_fields(new_password)
    db_user.zkp_commitment=zkp_fields["zkp_commitment"],
    db_user.zkp_nullifier=zkp_fields["nullifier"],
    db_user.zkp_salt=zkp_fields["salt"],
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