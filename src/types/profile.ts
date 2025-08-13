// Profile type for users (students, teachers, admins)
export interface Profile {
  title: string
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  userType: ('freelancer' | 'client' | 'admin')[] // New array structure
  userRoles?: ('freelancer' | 'client')[] // Legacy support
  
  // Personal Information
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  phone?: string
  location?: string
  country?: string
  city?: string
  website?: string
  
  // Education (Student-specific)
  university?: string
  fieldOfStudy?: string
  graduationYear?: string
  
  // Professional Information
  skills?: string[]
  bio?: string
  hourlyRate?: number | string
  rating?: number
  totalRatings?: number
  totalEarned?: number
  projectsCompleted?: number
  activeProjects?: number
  totalProjects?: number
  favoriteCount?: number
  
  // Teacher-specific fields
  institution?: string
  department?: string
  position?: string
  yearsOfExperience?: number
  projectPreferences?: string
  budgetRange?: string
  projectsPosted?: number
  totalSpent?: number
  freelancersHired?: number
  completedProjects?: number
  openProjects?: number
  
  // Email verification
  emailVerified?: boolean
  isActive?: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  
  // Portfolio fields
  portfolio?: any
  sections?: any[]
  experience?: Array<{
    title: string
    company: string
    period: string
    description: string
  }>
  projects?: Array<{
    title: string
    description: string
    technologies: string[]
    link?: string
  }>
  
  // Notification settings
  emailNotifications?: boolean
  projectUpdates?: boolean
  proposalNotifications?: boolean
  marketingEmails?: boolean
  weeklyDigest?: boolean
  browserNotifications?: boolean
  
  // Privacy settings
  profileVisibility?: boolean
  showEmail?: boolean
  showPhone?: boolean
  allowMessages?: boolean
  searchableProfile?: boolean
  showFavorites?: boolean
  
  // Rating breakdown
  communicationRating?: number
  qualityRating?: number
  valueRating?: number
  timelinessRating?: number
  
  // Terms and conditions
  acceptTerms?: boolean
  acceptPrivacyPolicy?: boolean
  
  createdAt: Date
  updatedAt: Date
} 