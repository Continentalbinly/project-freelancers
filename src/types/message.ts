// Message type for communication between users
export interface Message {
  id: string
  senderId: string
  receiverId: string
  projectId?: string
  content: string
  isRead: boolean
  createdAt: Date
} 