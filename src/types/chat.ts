import type { Timestamp } from "firebase/firestore";

export interface ChatRoom {
  id: string;
  projectId?: string;
  orderId?: string;
  projectTitle?: string;
  participants: string[];
  participantNames?: Record<string, string>;
  participantAvatars?: Record<string, string>;
  lastMessage?: string;
  lastMessageTime?: Date | Timestamp;
  unreadCount?: number;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  message: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  timestamp: Date | Timestamp;
  type?: "text" | "image" | "file";
  attachments?: string[];
}

export interface ProfileCache {
  [userId: string]: {
    fullName: string;
    avatarUrl: string;
  };
}

