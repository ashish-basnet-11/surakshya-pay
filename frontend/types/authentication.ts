import { UserInDB } from "./user";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: UserInDB;
}