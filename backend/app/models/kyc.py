from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
import datetime
import enum

class KYCStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    RESUBMIT_REQUIRED = "resubmit_required"

class KYCDocumentType(enum.Enum):
    PASSPORT = "passport"
    CITIZENSHIP = "citizenship"
    DRIVING_LICENSE = "driving_license"

class KYC(Base):
    __tablename__ = "kyc"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    address = Column(String, nullable=False)
    
    document_type = Column(Enum(KYCDocumentType), nullable=False)
    document_number = Column(String, nullable=False)
    document_front_url = Column(String, nullable=False)
    document_back_url = Column(String, nullable=True)
    selfie_url = Column(String, nullable=False)
    
    status = Column(Enum(KYCStatus), default=KYCStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="kyc", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by]) 