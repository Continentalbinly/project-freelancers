// Project type for work posted by teachers/clients

export interface CategoryRef {
  id: string;
  name_en: string;
  name_lo: string;
}
export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "fixed" | "hourly";
  deadline?: Date;
  skillsRequired: string[];
  status: "open" | "in_progress" | "completed" | "cancelled";
  category: string | CategoryRef;
  clientId: string;
  freelancerId?: string;
  proposalsCount?: number;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  timeline?: string;
  acceptedFreelancerId?: string;
  acceptedProposalId?: string;
  attachments?: any[];
  imageUrl?: string;
  clientCompleted?: {
    completedAt?: Date;
    completionNotes?: string | null;
    userId?: string;
    userType?: string;
  };
  freelancerCompleted?: {
    completedAt?: Date;
    completionNotes?: string | null;
    userId?: string;
    userType?: string;
  };
}
