export interface WorkSample {
  id: string
  type: 'image' | 'file' | 'link'
  url: string
  title: string
  description: string
  uploadedAt: Date
}

export interface Milestone {
  id: string
  title: string
  description: string
  budget: number
  dueDate: Date
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Proposal {
  id: string
  projectId: string
  freelancerId: string
  coverLetter: string
  proposedBudget: number
  proposedRate: number
  estimatedDuration: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' // Enhanced fields
  workSamples?: WorkSample[]
  workPlan?: string
  milestones?: Milestone[]
  communicationPreferences?: string
  availability?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  processedAt?: Date
  processedBy?: string
}

export interface ProposalWithDetails extends Proposal {
  project?: {
    id: string
    title: string
    description: string
    budget: number
    clientId: string
  }
  freelancer?: {
    id: string
    fullName: string
    avatar?: string
    rating?: number
    skills?: string[]
  }
  client?: {
    id: string
    fullName: string
    avatar?: string
  }
} 