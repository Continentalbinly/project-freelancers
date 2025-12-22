export interface Category {
  id: string;
  name_en: string;
  name_lo: string;
  postingFee?: number;
  description?: string;
  [key: string]: unknown; // Allow additional properties from Firestore
}

