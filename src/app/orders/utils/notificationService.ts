import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Order, OrderStatus } from "@/types/order";
import type { Notification } from "@/types/notification";

/**
 * Create a notification when order status changes
 */
export async function createOrderNotification(
  order: Order,
  newStatus: OrderStatus,
  userRole: "client" | "freelancer",
  relatedUserId?: string
): Promise<void> {
  try {
    const db = requireDb();
    // Determine recipient based on role
    // If userRole is "client", notify the freelancer (seller)
    // If userRole is "freelancer", notify the client (buyer)
    const recipientId = userRole === "client" 
      ? (order.sellerId || order.freelancerId)
      : (order.buyerId || order.clientId);

    if (!recipientId) {
      console.warn("No recipient ID found for notification");
      return;
    }

    // Generate notification based on status
    let notificationType: Notification["type"];
    let title: string;
    let message: string;

    switch (newStatus) {
      case "accepted":
        notificationType = "order_accepted";
        title = userRole === "client" 
          ? "Order Accepted" 
          : "Your Order Was Accepted";
        message = userRole === "client"
          ? `Your order "${order.packageName}" has been accepted by the freelancer.`
          : `Your order "${order.packageName}" has been accepted and work will begin soon.`;
        break;

      case "in_progress":
        notificationType = "order_status_changed";
        title = "Order In Progress";
        message = userRole === "client"
          ? `Your order "${order.packageName}" is now in progress.`
          : `Order "${order.packageName}" is now in progress.`;
        break;

      case "delivered":
        notificationType = "order_delivered";
        title = "Order Delivered";
        message = userRole === "client"
          ? `Your order "${order.packageName}" has been delivered. Please review it.`
          : `Order "${order.packageName}" has been delivered to the client.`;
        break;

      case "completed":
        notificationType = "order_completed";
        title = "Order Completed";
        message = userRole === "client"
          ? `Your order "${order.packageName}" has been completed.`
          : `Order "${order.packageName}" has been completed.`;
        break;

      case "awaiting_payment":
        // When client accepts delivery, notify freelancer that order is accepted (before payment)
        notificationType = "order_accepted_by_client";
        title = "Order Accepted by Client";
        message = `The client has accepted the delivery for order "${order.packageName || order.catalogTitle}". Payment is now being processed.`;
        break;

      default:
        notificationType = "order_status_changed";
        title = "Order Status Updated";
        message = `Order "${order.packageName}" status has been updated to ${newStatus}.`;
    }

    // Create notification
    await addDoc(collection(db, "notifications"), {
      userId: recipientId,
      type: notificationType,
      title,
      message,
      orderId: order.id,
      orderStatus: newStatus,
      read: false,
      relatedUserId: relatedUserId || undefined,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating order notification:", error);
    // Don't throw - notification failure shouldn't break order updates
  }
}

/**
 * Create a notification when revision is requested
 * Creates notifications for BOTH parties: the requester and the recipient
 */
export async function createRevisionNotification(
  order: Order,
  userRole: "client" | "freelancer",
  reason: string
): Promise<void> {
  try {
    const db = requireDb();
    // Determine both parties
    const clientId = order.buyerId || order.clientId;
    const freelancerId = order.sellerId || order.freelancerId;

    if (!clientId || !freelancerId) {
      console.warn("Missing client or freelancer ID for revision notification");
      return;
    }

    // Create notification for the freelancer (recipient of the request)
    const freelancerTitle = "Revision Requested";
    const freelancerMessage = `The client has requested a revision for order "${order.packageName}". Reason: ${reason.substring(0, 100)}`;

    await addDoc(collection(db, "notifications"), {
      userId: freelancerId,
      type: "order_revision_requested",
      title: freelancerTitle,
      message: freelancerMessage,
      orderId: order.id,
      orderStatus: order.status,
      read: false,
      relatedUserId: clientId,
      createdAt: serverTimestamp(),
    });

    // Create notification for the client (confirmation that their request was sent)
    const clientTitle = "Revision Request Sent";
    const clientMessage = `Your revision request for order "${order.packageName}" has been sent to the freelancer.`;

    await addDoc(collection(db, "notifications"), {
      userId: clientId,
      type: "order_revision_requested",
      title: clientTitle,
      message: clientMessage,
      orderId: order.id,
      orderStatus: order.status,
      read: false,
      relatedUserId: freelancerId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating revision notification:", error);
  }
}

/**
 * Create a notification when revision is accepted or declined
 */
export async function createRevisionDecisionNotification(
  order: Order,
  action: "accepted" | "declined",
  userRole: "client" | "freelancer" // The role of the person who made the decision (freelancer)
): Promise<void> {
  try {
    const db = requireDb();
    const clientId = order.buyerId || order.clientId;
    const freelancerId = order.sellerId || order.freelancerId;

    if (!clientId || !freelancerId) {
      console.warn("Missing client or freelancer ID for revision decision notification");
      return;
    }

    if (action === "accepted") {
      // Notify client that their revision request was accepted
      const clientTitle = "Revision Accepted";
      const clientMessage = `The freelancer has accepted your revision request for order "${order.packageName}". Work will resume on the changes.`;

      await addDoc(collection(db, "notifications"), {
        userId: clientId,
        type: "order_revision_accepted",
        title: clientTitle,
        message: clientMessage,
        orderId: order.id,
        orderStatus: order.status,
        read: false,
        relatedUserId: freelancerId,
        createdAt: serverTimestamp(),
      });
    } else if (action === "declined") {
      // Notify client that their revision request was declined
      const clientTitle = "Revision Declined";
      const clientMessage = `The freelancer has declined your revision request for order "${order.packageName}". The original delivery is maintained.`;

      await addDoc(collection(db, "notifications"), {
        userId: clientId,
        type: "order_revision_declined",
        title: clientTitle,
        message: clientMessage,
        orderId: order.id,
        orderStatus: order.status,
        read: false,
        relatedUserId: freelancerId,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error creating revision decision notification:", error);
  }
}

/**
 * Create a notification when a top-up is completed
 */
export async function createTopupNotification(
  userId: string,
  credits: number,
  amount: number
): Promise<void> {
  try {
    const db = requireDb();
    if (!userId) {
      throw new Error("Missing userId");
    }

    if (!credits || credits <= 0 || isNaN(credits)) {
      throw new Error(`Invalid credits value: ${credits}`);
    }

    if (!amount || amount <= 0 || isNaN(amount)) {
      throw new Error(`Invalid amount value: ${amount}`);
    }

    await addDoc(collection(db, "notifications"), {
      userId,
      type: "topup_completed",
      title: "Top-up Completed",
      message: `Your top-up of ${credits.toLocaleString()} credits (${amount.toLocaleString()} LAK) has been successfully added to your account.`,
      amount,
      credits,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw error; // Re-throw to be caught by webhook handler
  }
}

/**
 * Create notifications when an order is created
 * Notifies both the client (credit spent) and freelancer (new order)
 */
export async function createOrderCreatedNotification(
  order: Order,
  orderFee: number,
  clientPreviousBalance: number,
  clientNewBalance: number
): Promise<void> {
  try {
    const db = requireDb();
    const clientId = order.buyerId || order.clientId;
    const freelancerId = order.sellerId || order.freelancerId;

    if (!clientId || !freelancerId) {
      console.warn("Missing client or freelancer ID for order creation notification");
      return;
    }

    // Notify client about credit spent
    await addDoc(collection(db, "notifications"), {
      userId: clientId,
      type: "order_created",
      title: "Order Placed",
      message: `You've placed an order for "${order.packageName || order.catalogTitle}". ${orderFee.toLocaleString()} credits have been deducted. Balance: ${clientNewBalance.toLocaleString()} credits.`,
      orderId: order.id,
      orderStatus: "pending",
      amount: orderFee,
      read: false,
      relatedUserId: freelancerId,
      createdAt: serverTimestamp(),
    });

    // Notify freelancer about new order
    await addDoc(collection(db, "notifications"), {
      userId: freelancerId,
      type: "order_created",
      title: "New Order Received",
      message: `You've received a new order for "${order.packageName || order.catalogTitle}". Please review and accept it.`,
      orderId: order.id,
      orderStatus: "pending",
      read: false,
      relatedUserId: clientId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating order creation notification:", error);
  }
}

/**
 * Create notification when a proposal is submitted
 * Notifies the client about the new proposal
 */
export async function createProposalSubmittedNotification(
  clientId: string,
  freelancerId: string,
  projectId: string,
  projectTitle: string,
  proposalId: string,
  proposalFee: number
): Promise<void> {
  try {
    const db = requireDb();
    // Notify client about new proposal
    await addDoc(collection(db, "notifications"), {
      userId: clientId,
      type: "proposal_submitted",
      title: "New Proposal Received",
      message: `A freelancer has submitted a proposal for your project "${projectTitle}".`,
      projectId,
      proposalId,
      read: false,
      relatedUserId: freelancerId,
      createdAt: serverTimestamp(),
    });

    // Notify freelancer about proposal fee deduction (optional - if you want to track this)
    // This could be useful for freelancers to know their credits were used
    await addDoc(collection(db, "notifications"), {
      userId: freelancerId,
      type: "proposal_submitted",
      title: "Proposal Submitted",
      message: `Your proposal for "${projectTitle}" has been submitted successfully. ${proposalFee.toLocaleString()} credits have been deducted.`,
      projectId,
      proposalId,
      amount: proposalFee,
      read: false,
      relatedUserId: clientId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating proposal notification:", error);
  }
}

/**
 * Create notification when a proposal is accepted
 * Notifies the freelancer about the accepted proposal
 */
export async function createProposalAcceptedNotification(
  clientId: string,
  freelancerId: string,
  projectId: string,
  projectTitle: string,
  proposalId: string
): Promise<void> {
  try {
    const db = requireDb();
    // Notify freelancer about accepted proposal
    await addDoc(collection(db, "notifications"), {
      userId: freelancerId,
      type: "proposal_accepted",
      title: "Proposal Accepted",
      message: `Your proposal for project "${projectTitle}" has been accepted! You can now start working on the project.`,
      projectId,
      proposalId,
      read: false,
      relatedUserId: clientId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating proposal accepted notification:", error);
  }
}

/**
 * Create notification when a proposal is rejected
 * Notifies the freelancer about the rejected proposal and credit refund
 */
export async function createProposalRejectedNotification(
  clientId: string,
  freelancerId: string,
  projectId: string,
  projectTitle: string,
  proposalId: string,
  refundAmount: number
): Promise<void> {
  try {
    const db = requireDb();
    // Notify freelancer about rejected proposal and refund
    await addDoc(collection(db, "notifications"), {
      userId: freelancerId,
      type: "proposal_rejected",
      title: "Proposal Rejected",
      message: `Your proposal for project "${projectTitle}" has been rejected. ${refundAmount.toLocaleString()} credits have been refunded to your account.`,
      projectId,
      proposalId,
      amount: refundAmount,
      credits: refundAmount,
      read: false,
      relatedUserId: clientId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating proposal rejected notification:", error);
  }
}

