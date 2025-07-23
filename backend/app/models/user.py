from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    public_key = Column(String, nullable=True)
    private_key_encrypted = Column(String, nullable=True)
    balance = Column(String, default="0", nullable=True)
    network = Column(String, default="mainnet", nullable=True)
    wallet_type = Column(String, default="non-custodial", nullable=True)
    fingerprint_signature = Column(String, nullable=True)
    guid = Column(String, unique=True, index=True, nullable=False)
    
    reset_password_otp = Column(String, nullable=True)
    reset_password_otp_expires_at = Column(DateTime, nullable=True)
    zkp_commitment = Column(String, nullable=True)
    zkp_nullifier = Column(String, nullable=True)
    zkp_salt = Column(String, nullable=True)
    transactions = relationship("Transaction", back_populates="owner")

    notifications = relationship("Notification", back_populates="owner")
    kyc = relationship("KYC", uselist=False, back_populates="user", foreign_keys="KYC.user_id") 