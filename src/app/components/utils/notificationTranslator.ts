/**
 * Translate notification titles and messages based on type
 */

export function translateNotificationTitle(
  type: string,
  title: string,
  t: (key: string) => string
): string {
  // Map of notification types to translation keys
  const titleMap: Record<string, string> = {
    order_accepted: "notifications.titles.orderAccepted",
    order_accepted_by_client: "notifications.titles.orderAcceptedByClient",
    order_status_changed: "notifications.titles.orderInProgress",
    order_delivered: "notifications.titles.orderDelivered",
    order_completed: "notifications.titles.orderCompleted",
    order_payment_received: "notifications.titles.paymentReceived",
    order_revision_requested: "notifications.titles.revisionRequested",
    order_revision_accepted: "notifications.titles.revisionAccepted",
    order_revision_declined: "notifications.titles.revisionDeclined",
    order_created: "notifications.titles.orderCreated",
    topup_completed: "notifications.titles.topupCompleted",
    proposal_submitted: "notifications.titles.proposalSubmitted",
    proposal_accepted: "notifications.titles.proposalAccepted",
    proposal_rejected: "notifications.titles.proposalRejected",
  };

  const translationKey = titleMap[type];
  if (translationKey) {
    return t(translationKey) || title;
  }

  return title;
}

export function translateNotificationMessage(
  type: string,
  message: string,
  orderStatus: string | undefined,
  userRole: "client" | "freelancer" | null,
  t: (key: string) => string
): string {
  // Extract package name from message (usually in quotes)
  const packageMatch = message.match(/"([^"]+)"/);
  const packageName = packageMatch ? packageMatch[1] : "";

  // Map of notification types to translation keys
  const messageMap: Record<string, { client: string; freelancer: string } | string> = {
    order_accepted: {
      client: "notifications.messages.orderAccepted.client",
      freelancer: "notifications.messages.orderAccepted.freelancer",
    },
    order_accepted_by_client: {
      freelancer: "notifications.messages.orderAcceptedByClient.freelancer",
      client: "notifications.messages.orderAcceptedByClient.freelancer", // Fallback for client role
    },
    order_status_changed: {
      client: "notifications.messages.orderInProgress.client",
      freelancer: "notifications.messages.orderInProgress.freelancer",
    },
    order_delivered: {
      client: "notifications.messages.orderDelivered.client",
      freelancer: "notifications.messages.orderDelivered.freelancer",
    },
    order_completed: {
      client: "notifications.messages.orderCompleted.client",
      freelancer: "notifications.messages.orderCompleted.freelancer",
    },
    order_payment_received: {
      client: "notifications.messages.paymentReceived.client",
      freelancer: "notifications.messages.paymentReceived.freelancer",
    },
    order_revision_requested: {
      client: "notifications.messages.revisionRequested.client",
      freelancer: "notifications.messages.revisionRequested.freelancer",
    },
    order_revision_accepted: {
      client: "notifications.messages.revisionAccepted.client",
      freelancer: "notifications.messages.revisionAccepted.freelancer",
    },
    order_revision_declined: {
      client: "notifications.messages.revisionDeclined.client",
      freelancer: "notifications.messages.revisionDeclined.freelancer",
    },
    order_created: {
      client: "notifications.messages.orderCreated.client",
      freelancer: "notifications.messages.orderCreated.freelancer",
    },
    topup_completed: "notifications.messages.topupCompleted",
    proposal_submitted: {
      client: "notifications.messages.proposalSubmitted.client",
      freelancer: "notifications.messages.proposalSubmitted.freelancer",
    },
    proposal_accepted: {
      client: "notifications.messages.proposalAccepted.client",
      freelancer: "notifications.messages.proposalAccepted.freelancer",
    },
    proposal_rejected: {
      client: "notifications.messages.proposalRejected.client",
      freelancer: "notifications.messages.proposalRejected.freelancer",
    },
  };

  const translationKeys = messageMap[type];
  if (typeof translationKeys === "string") {
    // Single translation key (like topup_completed)
    const translated = t(translationKeys);
    if (translated && translated !== translationKeys) {
      let result = translated;
      
      // For topup, extract and replace credits and amount
      if (type === "topup_completed") {
        const creditsMatch = message.match(/(\d[\d,]*)\s*credits/);
        const amountMatch = message.match(/\(([\d,]+)\s*LAK\)/);
        if (creditsMatch) {
          result = result.replace(/\{\{credits\}\}/g, creditsMatch[1]);
        }
        if (amountMatch) {
          result = result.replace(/\{\{amount\}\}/g, amountMatch[1]);
        }
      }
      
      return result;
    }
    return message;
  }
  
  if (translationKeys && userRole) {
    const key = typeof translationKeys === "object" ? (translationKeys[userRole] || translationKeys.client) : translationKeys;
    const translated = t(key);
    
    // If translation exists and is different from key
    if (translated && translated !== key) {
      let result = translated;
      
      // Replace package name placeholder
      if (packageName) {
        result = result.replace(/\{\{packageName\}\}/g, packageName);
      }
      
      // For revision requests, extract and replace reason
      if (type === "order_revision_requested" && message.includes("Reason:")) {
        const reasonMatch = message.match(/Reason:\s*(.+)/);
        const reason = reasonMatch ? reasonMatch[1].trim() : "";
        if (reason) {
          result = result.replace(/\{\{reason\}\}/g, reason);
        }
      }
      
      // For payment received, extract and replace amount
      if (type === "order_payment_received" && message.includes("Amount:")) {
        const amountMatch = message.match(/Amount:\s*([0-9,]+)\s*LAK/);
        const amount = amountMatch ? amountMatch[1] : "";
        if (amount) {
          result = result.replace(/\{\{amount\}\}/g, amount);
        }
      }

      // For topup, extract and replace credits and amount
      if (type === "topup_completed") {
        const creditsMatch = message.match(/(\d[\d,]*)\s*credits/);
        const amountMatch = message.match(/\(([\d,]+)\s*LAK\)/);
        if (creditsMatch) {
          result = result.replace(/\{\{credits\}\}/g, creditsMatch[1]);
        }
        if (amountMatch) {
          result = result.replace(/\{\{amount\}\}/g, amountMatch[1]);
        }
      }

      // For order created, extract and replace package name, order fee, and balance
      if (type === "order_created" && message.includes("credits")) {
        const packageMatch = message.match(/"([^"]+)"/);
        const feeMatch = message.match(/(\d[\d,]*)\s*credits have been deducted/);
        const balanceMatch = message.match(/Balance:\s*(\d[\d,]*)\s*credits/);
        if (packageMatch) {
          result = result.replace(/\{\{packageName\}\}/g, packageMatch[1]);
        }
        if (feeMatch) {
          result = result.replace(/\{\{orderFee\}\}/g, feeMatch[1]);
        }
        if (balanceMatch) {
          result = result.replace(/\{\{balance\}\}/g, balanceMatch[1]);
        }
      }

      // For proposal submitted, extract project title
      if (type === "proposal_submitted") {
        const projectMatch = message.match(/"([^"]+)"/);
        if (projectMatch) {
          result = result.replace(/\{\{projectTitle\}\}/g, projectMatch[1]);
        }
        const feeMatch = message.match(/(\d[\d,]*)\s*credits have been deducted/);
        if (feeMatch) {
          result = result.replace(/\{\{proposalFee\}\}/g, feeMatch[1]);
        }
      }

      // For proposal accepted, extract project title
      if (type === "proposal_accepted") {
        const projectMatch = message.match(/"([^"]+)"/);
        if (projectMatch) {
          result = result.replace(/\{\{projectTitle\}\}/g, projectMatch[1]);
        }
      }

      // For proposal rejected, extract project title and refund amount
      if (type === "proposal_rejected") {
        const projectMatch = message.match(/"([^"]+)"/);
        if (projectMatch) {
          result = result.replace(/\{\{projectTitle\}\}/g, projectMatch[1]);
        }
        const refundMatch = message.match(/(\d[\d,]*)\s*credits have been refunded/);
        if (refundMatch) {
          result = result.replace(/\{\{refundAmount\}\}/g, refundMatch[1]);
        }
      }
      
      return result;
    }
  }

  return message;
}

