from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base
import random
import string

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    public_key = Column(String, nullable=True)
    private_key_encrypted = Column(String, nullable=True)
    balance = Column(String, default="0", nullable=True)
    fingerprint_signature = Column(String, nullable=True)
    guid = Column(String, unique=True, index=True, nullable=False)
    username = Column(String(5), unique=True, index=True, nullable=False)
    reset_password_otp = Column(String, nullable=True)
    reset_password_otp_expires_at = Column(DateTime, nullable=True)
    zkp_commitment = Column(String, nullable=True)
    zkp_nullifier = Column(String, nullable=True)
    zkp_salt = Column(String, nullable=True)
    transactions = relationship("Transaction", back_populates="owner")
    notifications = relationship("Notification", back_populates="owner")
    kyc = relationship("KYC", uselist=False, back_populates="user", foreign_keys="KYC.user_id")

    @staticmethod
    def generate_username():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=5)) 