// Review type for ratings and feedback
export interface Review {
  id: string
  projectId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: Date
} 