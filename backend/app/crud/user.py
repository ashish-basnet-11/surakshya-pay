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

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_guid = str(uuid.uuid4())
    # Create a new wallet for the user
    wallet = create_new_wallet()
    wallet_address = wallet['address']
    private_key = wallet['private_key']
    encrypted_private_key = encrypt_private_key(private_key, settings.SECRET_KEY)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        fingerprint_signature=user.fingerprint_signature if hasattr(user, 'fingerprint_signature') else None,
        wallet_address=wallet_address,
        public_key=user.public_key if hasattr(user, 'public_key') else None,
        private_key_encrypted=encrypted_private_key,
        guid=user_guid,
        zkp_commitment=user.zkp_commitment if hasattr(user, 'zkp_commitment') else None,
        zkp_nullifier=user.zkp_nullifier if hasattr(user, 'zkp_nullifier') else None,
        zkp_salt=user.zkp_salt if hasattr(user, 'zkp_salt') else None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Onchain registration using GUID as zk_hash
    try:
        zk_hash = user_guid  # Use unique GUID as zk_hash
        tx_hash = register_user_onchain(wallet_address, zk_hash, private_key)
        # Optionally, store tx_hash or log it
    except Exception as e:
        print(f"Onchain registration failed: {e}")
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate):
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        db_user.hashed_password = hashed_password
    if user_in.full_name:
        db_user.full_name = user_in.full_name
    if user_in.email:
        db_user.email = user_in.email
    if hasattr(user_in, 'fingerprint_signature') and user_in.fingerprint_signature is not None:
        db_user.fingerprint_signature = user_in.fingerprint_signature
    if hasattr(user_in, 'zkp_commitment') and user_in.zkp_commitment is not None:
        db_user.zkp_commitment = user_in.zkp_commitment
    if hasattr(user_in, 'zkp_nullifier') and user_in.zkp_nullifier is not None:
        db_user.zkp_nullifier = user_in.zkp_nullifier
    if hasattr(user_in, 'zkp_salt') and user_in.zkp_salt is not None:
        db_user.zkp_salt = user_in.zkp_salt
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
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

def reset_password(db: Session, db_user: User, new_password: str):
    hashed_password = get_password_hash(new_password)
    db_user.hashed_password = hashed_password
    db_user.reset_password_otp = None
    db_user.reset_password_otp_expires_at = None
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user 