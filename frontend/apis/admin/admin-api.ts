import { apiGet, apiPut } from "@/config/api";

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

export interface KYCSubmission {
  id: number;
  user_id: number;
  full_name: string;
  date_of_birth: string;
  address: string;
  document_type: string;
  document_number: string;
  status: 'pending' | 'approved' | 'rejected';
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  user?: {
    id: number;
    email: string;
    username: string;
    phone?: string;
  };
}

export interface KYCAdminUpdate {
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get admin dashboard statistics
export const getAdminDashboardStats = async (): Promise<CommonResponse<AdminDashboardStats>> => {
  return apiGet<CommonResponse<AdminDashboardStats>>('/statistics/admin/dashboard');
};

// Get all KYC submissions
export const getAllKYCSubmissions = async (): Promise<CommonResponse<KYCSubmission[]>> => {
  return apiGet<CommonResponse<KYCSubmission[]>>('/kyc/admin/all');
};

// Get KYC submissions by status
export const getKYCByStatus = async (status: string): Promise<CommonResponse<KYCSubmission[]>> => {
  return apiGet<CommonResponse<KYCSubmission[]>>(`/kyc/admin/status/${status}`);
};

// Update KYC status (approve/reject)
export const updateKYCStatus = async (
  userId: number, 
  kycUpdate: KYCAdminUpdate
): Promise<CommonResponse<any>> => {
  return apiPut<CommonResponse<any>>(`/kyc/admin/${userId}`, kycUpdate);
};

// Get KYC details by user ID
export const getKYCByUserId = async (userId: number): Promise<CommonResponse<KYCSubmission>> => {
  return apiGet<CommonResponse<KYCSubmission>>(`/kyc/admin/user/${userId}`);
};

// User Management Interfaces
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone_number?: string;
  is_active: boolean;
  is_superuser: boolean;
  wallet_address?: string;
  balance?: string;
  kyc_status?: string;
  kyc_submitted_at?: string;
  kyc_reviewed_at?: string;
  created_at?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_week: number;
  kyc_verified_users: number;
}

// User Management API Functions
export const getAllUsers = async (): Promise<CommonResponse<User[]>> => {
  return apiGet<CommonResponse<User[]>>('/users/admin/all');
};

export const getUserStats = async (): Promise<CommonResponse<UserStats>> => {
  return apiGet<CommonResponse<UserStats>>('/users/admin/stats');
};

export const updateUserStatus = async (
  userId: number, 
  isActive: boolean
): Promise<CommonResponse<User>> => {
  return apiPut<CommonResponse<User>>(`/users/admin/${userId}/status`, { is_active: isActive });
}; 