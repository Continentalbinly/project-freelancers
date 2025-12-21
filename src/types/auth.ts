// Auth types for authentication system
export interface AuthResponse {
  success: boolean;
  user?: User;
  requiresVerification?: boolean;
  error?: string; // human-readable message
  errorCode?: string; // firebase error code like "auth/wrong-password"
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  // ✅ Essential account fields
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  role: "freelancer" | "client" | "admin";
  
  // ✅ Optional profile fields
  occupation?: {
    id: string;
    name_en: string;
    name_lo: string;
  };
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  
  // ✅ Personal information
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phone?: string;
  location?: string;
  country?: string;
  city?: string;
  website?: string;
  
  // ✅ Portfolio fields
  portfolio?: Record<string, unknown>;
  sections?: Array<Record<string, unknown>>;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  
  // ✅ Terms and conditions
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  acceptMarketingEmails?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "freelancer" | "client" | "admin";
  avatarUrl?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}
