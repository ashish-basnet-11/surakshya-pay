import { UserInDB } from "./user";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: UserInDB;
}

export interface ForgotPasswordInterface {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordInterface {
  email: string;
  otp: string;
  new_password: string;
}