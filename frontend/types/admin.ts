import { Kyc } from "./kyc";
import { User } from "./user";

export interface AdminDashboardStats {
  total_users: number;
  total_admins: number;
  total_kyc_submitted: number;
  total_kyc_approved: number;
  total_kyc_pending: number;
  total_kyc_rejected: number;
  total_transactions: number;
  total_deposit_amount: number;
  total_withdrawal_amount: number;
  total_transfer_amount: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_week: number;
  kyc_verified_users: number;
}

export interface KycSubmission extends Kyc {
  user?: Pick<User, "id" | "email" | "username"> & { phone?: string };
}
