export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "awaiting_payment"
  | "completed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  catalogId: string;
  // Legacy fields (for backward compatibility)
  clientId?: string;
  freelancerId?: string;
  // New fields
  buyerId?: string;
  sellerId?: string;
  catalogTitle?: string;
  packageName: string;
  packagePrice?: number;
  price?: number;
  orderFee?: number;
  deliveryDays?: number;
  features?: string[];
  requirements?: string;
  delivery?: string;
  deliveryType?: "text" | "github" | "file";
  deliveryFiles?: string[];
  deliveryScreenshots?: string[];
  attachments?: { url: string; type: string; title?: string }[];
  transactionId?: string;
  statusHistory?: { status: OrderStatus; timestamp: Record<string, unknown>; note?: string }[];
  revisionLimit?: number;
  revisionCount?: number;
  revisionRequests?: { requestedAt: Record<string, unknown>; reason: string; freelancerNote?: string }[];
  revisionPending?: boolean;
  clientRated?: boolean;
  freelancerRated?: boolean;
  status: OrderStatus;
  createdAt?: Record<string, unknown>;
  updatedAt?: Record<string, unknown>;
}
