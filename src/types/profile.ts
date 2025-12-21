// Profile type for users in general marketplace (freelancers, clients, admins)
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  credit: number;
  // ✅ Single role system (no redundancy)
  role: "freelancer" | "client" | "admin";
  // ✅ Flexible occupation for any job type (employee, developer, teacher, accountant, etc.)
  occupation?: {
    id: string;
    name_en: string;
    name_lo: string;
  };

  // 🪙 Billing & Subscription
  plan: "free" | "pro" | "enterprise";
  planStatus: "inactive" | "pending" | "active" | "expired";
  planStartDate: Date | null;
  planEndDate: Date | null;
  lastPaymentDate?: Date | null;
  totalTopups: number; // total number of approved top-ups
  totalSpentOnPlans: number; // total amount spent on subscriptions

  // Personal Information
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phone?: string;
  location?: string;
  country?: string;
  city?: string;
  website?: string;

  // Professional Information (Freelancer & Client)
  skills?: string[];
  bio?: string;
  hourlyRate?: number | string;
  
  // Ratings & Statistics
  rating?: number;
  totalRatings?: number;
  totalEarned?: number;
  projectsCompleted?: number;
  activeProjects?: number;
  totalProjects?: number;
  favoriteCount?: number;
  
  // For Clients
  projectsPosted?: number;
  totalSpent?: number;
  freelancersHired?: number;

  // Email verification
  emailVerified?: boolean;
  isActive?: boolean;
  // Admin privilege overlay
  isAdmin?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // Portfolio fields
  portfolio?: Record<string, unknown>;
  sections?: Array<Record<string, unknown>>;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    startDate?: string; // Start date (YYYY-MM-DD)
    endDate?: string; // End date (YYYY-MM-DD) or empty for current
    type?: {
      en: string;
      lo: string;
    };
    description: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;

  // Notification settings
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  proposalNotifications?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
  browserNotifications?: boolean;

  // Privacy settings
  profileVisibility?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  allowMessages?: boolean;
  searchableProfile?: boolean;
  showFavorites?: boolean;

  // Rating breakdown
  communicationRating?: number;
  qualityRating?: number;
  valueRating?: number;
  timelinessRating?: number;

  // Terms and conditions
  acceptTerms?: boolean;
  acceptPrivacyPolicy?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
