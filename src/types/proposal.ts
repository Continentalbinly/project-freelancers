import type { Timestamp } from "firebase/firestore";

// ------------------------------------------------------
// ✅ Work Sample and Milestone Types
// ------------------------------------------------------
export interface WorkSample {
  id: string;
  type: "image" | "file" | "link";
  url: string;
  title: string;
  description: string;
  uploadedAt: Date | Timestamp;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: number;
  dueDate: Date | Timestamp;
  status: "pending" | "in_progress" | "completed";
}

// ------------------------------------------------------
// ✅ Base Proposal (Firestore document-level type)
// ------------------------------------------------------
export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;

  coverLetter: string;
  proposedBudget: number;
  proposedRate: number;
  estimatedDuration: string;

  status: "pending" | "accepted" | "rejected" | "withdrawn";

  // Optional fields
  workSamples?: WorkSample[];
  workPlan?: string;
  milestones?: Milestone[];
  communicationPreferences?: string;
  availability?: string;

  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  processedAt?: Date | Timestamp;
  processedBy?: string;
}

// ------------------------------------------------------
// ✅ Extended version (for UI, joins, and nested data)
// ------------------------------------------------------
export interface ProposalWithDetails extends Proposal {
  project?: {
    id: string;
    title: string;
    description?: string;
    budget?: number;
    clientId: string;
    skillsRequired?: string[];
  };
  freelancer?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    totalProjects?: number; // ✅ add this
    hourlyRate?: number; // ✅ optional but useful
    skills?: string[];
  };
  client?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    totalProjects?: number; // ✅ add this too (in case client profiles include it)
  };
}
