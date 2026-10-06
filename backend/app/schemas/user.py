from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    wallet_address: Optional[str] = None
    public_key: Optional[str] = None
    private_key_encrypted: Optional[str] = None
    balance: Optional[str] = "0"
    fingerprint_signature: Optional[str] = None
    guid: Optional[str] = None
    username: str
    reset_password_otp: Optional[str] = None
    reset_password_otp_expires_at: Optional[str] = None
    zkp_commitment: Optional[str] = None
    zkp_nullifier: Optional[str] = None
    zkp_salt: Optional[str] = None
    # KYC fields
    kyc_status: Optional[str] = None
    kyc_submitted_at: Optional[datetime] = None
    kyc_reviewed_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str
    # username is auto-generated, not required from client
    username: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    wallet_address: Optional[str] = None
    public_key: Optional[str] = None
    private_key_encrypted: Optional[str] = None
    balance: Optional[str] = None
    fingerprint_signature: Optional[str] = None
    guid: Optional[str] = None
    reset_password_otp: Optional[str] = None
    reset_password_otp_expires_at: Optional[str] = None
    zkp_commitment: Optional[str] = None
    zkp_nullifier: Optional[str] = None
    zkp_salt: Optional[str] = None
    username: Optional[str] = None

class ProfileUpdate(BaseModel):
    """Fields a user may change on their own account."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)

class UserInDBBase(UserBase):
    id: int
    class Config:
        from_attributes = True

SECRET_FIELDS = {
    "private_key_encrypted", "fingerprint_signature",
    "reset_password_otp", "reset_password_otp_expires_at",
    "zkp_commitment", "zkp_nullifier", "zkp_salt",
}

# Public response schema: every UserInDBBase field except secrets.
class User(BaseModel):
    id: int
    email: str
    username: str
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    wallet_address: Optional[str] = None
    public_key: Optional[str] = None
    balance: Optional[str] = "0"
    guid: Optional[str] = None
    kyc_status: Optional[str] = None
    kyc_submitted_at: Optional[datetime] = None
    kyc_reviewed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

assert set(UserInDBBase.model_fields) - set(User.model_fields) == SECRET_FIELDS

class UserInDB(UserInDBBase):
    pass 