// Proposal type for student applications to projects
export interface Proposal {
  id: string
  projectId: string
  freelancerId: string
  coverLetter: string
  proposedRate: number
  proposedBudget?: number
  estimatedDuration: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
} 