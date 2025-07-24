export interface UserBase {
  email: string;
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  wallet_address?: string;
  public_key?: string;
  private_key_encrypted?: string;
  balance?: string;
  network?: string;
  wallet_type?: string;
  fingerprint_signature?: string;
  zkp_commitment?: string;
  zkp_nullifier?: string;
  zkp_salt?: string;
  guid?: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate extends UserBase {
  password?: string;
}

export interface UserInDBBase extends UserBase {
  id: number;
}

export interface User extends UserInDBBase {}
export interface UserInDB extends UserInDBBase {} 

export interface UserLogin{
  email: string;
  password: string;
}