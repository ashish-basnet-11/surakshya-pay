export type DocumentType = "citizenship" | "passport" | "driving_license";
export type KycStatus = "pending" | "approved" | "rejected" | "resubmit_required";

export interface Kyc {
  id: number;
  user_id: number;
  full_name: string;
  date_of_birth: string;
  address: string;
  document_type: DocumentType;
  document_number: string;
  document_front_url: string;
  document_back_url?: string | null;
  selfie_url: string;
  status: KycStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export interface KycInput {
  full_name: string;
  date_of_birth: string;
  address: string;
  document_type: DocumentType;
  document_number: string;
}

/** A picked image/document from expo-image-picker or expo-document-picker. */
export interface PickedFile {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  file?: File;
}
