export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  phone_number?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
  wallet_address?: string | null;
  balance?: string | null;
  kyc_status?: string | null;
  kyc_submitted_at?: string | null;
  kyc_reviewed_at?: string | null;
  created_at?: string | null;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface ProfileInput {
  full_name?: string;
  phone_number?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: User;
}
