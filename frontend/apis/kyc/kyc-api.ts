import { apiPost, apiGet } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";

export interface KYCCreate {
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD format
  address: string;
  document_type: "passport" | "citizenship" | "driving_license";
  document_number: string;
}

export interface KYC {
  id: number;
  user_id: number;
  full_name: string;
  date_of_birth: string;
  address: string;
  document_type: "passport" | "citizenship" | "driving_license";
  document_number: string;
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  status: "pending" | "approved" | "rejected" | "resubmit_required";
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export interface KYCSubmissionData {
  kyc_data: string;
  document_front: any; // React Native file object
  selfie: any; // React Native file object
  document_back?: any; // React Native file object
}

// Submit KYC
export async function submitKYC(data: KYCSubmissionData): Promise<ApiResponse<any>> {
  const formData = new FormData();
  console.log('KYC Data:', data.kyc_data);
  
  // Add KYC data as JSON string
  formData.append('kyc_data', data.kyc_data);
  
  // Add files with proper React Native file format
  // React Native FormData expects objects with uri, type, name properties
  formData.append('document_front', {
    uri: data.document_front.uri,
    type: data.document_front.type || 'image/jpeg',
    name: data.document_front.name || 'document_front.jpg'
  } as any);
  
  formData.append('selfie', {
    uri: data.selfie.uri,
    type: data.selfie.type || 'image/jpeg',
    name: data.selfie.name || 'selfie.jpg'
  } as any);
  
  if (data.document_back) {
    formData.append('document_back', {
      uri: data.document_back.uri,
      type: data.document_back.type || 'image/jpeg',
      name: data.document_back.name || 'document_back.jpg'
    } as any);
  }

  console.log('FormData created with files');

  const response = await apiPost<ApiResponse<any>>('/kyc/', formData);
  
  return response;
}

// Get user's KYC status
export async function getMyKYC(): Promise<ApiResponse<KYC>> {
  const response = await apiGet<ApiResponse<KYC>>('/kyc/me');
  return response;
}

// Check if user has submitted KYC
export async function checkKYCStatus(): Promise<ApiResponse<KYC | null>> {
  try {
    const response = await getMyKYC();
    return response;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        success: true,
        message: "KYC not found",
        data: null
      };
    }
    throw error;
  }
} 