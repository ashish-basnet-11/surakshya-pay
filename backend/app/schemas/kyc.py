from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.kyc import KYCDocumentType, KYCStatus

MIN_AGE = 16


class KYCCreate(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=255)
    date_of_birth: date
    address: str = Field(..., min_length=5, max_length=500)
    document_type: KYCDocumentType
    document_number: str = Field(..., min_length=4, max_length=50)

    @field_validator("full_name", "address", "document_number", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("date_of_birth")
    @classmethod
    def old_enough(cls, v: date):
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if v > today or age < MIN_AGE:
            raise ValueError(f"You must be at least {MIN_AGE} years old.")
        return v


class KYCUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    document_type: Optional[KYCDocumentType] = None
    document_number: Optional[str] = None


class KYCUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    username: str


class KYC(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    full_name: str
    date_of_birth: date
    address: str
    document_type: KYCDocumentType
    document_number: str
    status: KYCStatus
    document_front_url: str
    document_back_url: Optional[str] = None
    selfie_url: str
    rejection_reason: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    user: Optional[KYCUser] = None


class KYCAdminUpdate(BaseModel):
    status: KYCStatus
    rejection_reason: Optional[str] = Field(None, max_length=1000)
