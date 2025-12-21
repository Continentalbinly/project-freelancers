import type { Timestamp } from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  type: "order_status_changed" | "order_revision_requested" | "order_revision_accepted" | "order_revision_declined" | "order_accepted" | "order_accepted_by_client" | "order_delivered" | "order_completed" | "order_payment_received" | "order_created" | "topup_completed" | "proposal_submitted" | "proposal_accepted" | "proposal_rejected";
  title: string;
  message: string;
  orderId?: string;
  orderStatus?: string;
  projectId?: string;
  proposalId?: string;
  amount?: number;
  credits?: number;
  read: boolean;
  createdAt: Date | Timestamp;
  relatedUserId?: string; // ID of the other party (client or freelancer)
}

