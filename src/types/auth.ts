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
  email: string;
  password: string;
  fullName: string;
  userType: "freelancer" | "client" | "admin";
  userRoles: ("freelancer" | "client" | "admin")[]; // Multiple roles support (used as userType array)
  occupation?: string;
  avatarUrl?: string;
  // Additional personal information
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phone?: string;
  location?: string;
  country?: string;
  city?: string;
  university?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  // Student-specific fields
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  // User category (student, worker, or freelancer)
  userCategory?: "" | "student" | "worker" | "freelancer";
  // Client category (teacher, worker, or freelancer)
  clientCategory?: "" | "teacher" | "worker" | "freelancer";
  // Teacher-specific fields
  institution?: string;
  department?: string;
  position?: string;
  yearsOfExperience?: number;
  // Terms and conditions
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  acceptMarketingEmails?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: "freelancer" | "client" | "admin";
  avatarUrl?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}
