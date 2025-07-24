from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.kyc import KYCStatus, KYCDocumentType

class KYCCreate(BaseModel):
    full_name: str
    date_of_birth: date
    address: str
    document_type: KYCDocumentType
    document_number: str

class KYCUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    document_type: Optional[KYCDocumentType] = None
    document_number: Optional[str] = None

class KYCInDBBase(KYCCreate):
    id: int
    user_id: int
    status: KYCStatus
    document_front_url: str
    document_back_url: Optional[str] = None
    selfie_url: str

    class Config:
        from_attributes = True

class KYC(KYCInDBBase):
    pass

class KYCAdminUpdate(BaseModel):
    status: KYCStatus
    rejection_reason: Optional[str] = None 