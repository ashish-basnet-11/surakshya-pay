from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    wallet_address: Optional[str] = None
    public_key: Optional[str] = None
    private_key_encrypted: Optional[str] = None
    balance: Optional[str] = "0"
    network: Optional[str] = "mainnet"
    wallet_type: Optional[str] = "non-custodial"
    fingerprint_signature: Optional[str] = None
    zkp_commitment: Optional[str] = None
    zkp_nullifier: Optional[str] = None
    zkp_salt: Optional[str] = None
    guid: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str 