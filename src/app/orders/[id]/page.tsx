"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { requireDb } from "@/service/firebase";
import { doc, getDoc, serverTimestamp, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import type { Order, OrderStatus } from "@/types/order";
import OrderProgressTimeline from "../components/OrderProgressTimeline";
import OrderDetailsCard from "../components/OrderDetailsCard";
import FreelancerSection from "../components/FreelancerSection";
import ClientSection from "../components/ClientSection";
import DeliveryHistory from "../components/DeliveryHistory";
import OrderPaymentStep from "../components/OrderPaymentStep";
import OrderSidebar from "../components/OrderSidebar";
import OrderDetailSkeleton from "../components/OrderDetailSkeleton";
import OrderReviewSection from "../components/OrderReviewSection";
import { createOrderNotification, createRevisionNotification, createRevisionDecisionNotification } from "../utils/notificationService";

export default function OrderDetailPage() {
  const { t } = useTranslationContext();
  const { user, profile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const statusConfig = {
    pending: { color: "text-amber-600", bgColor: "bg-amber-50", label: t("orderDetail.statusPending") || "Pending" },
    accepted: { color: "text-blue-600", bgColor: "bg-blue-50", label: t("orderDetail.statusAccepted") || "Accepted" },
    in_progress: { color: "text-purple-600", bgColor: "bg-purple-50", label: t("orderDetail.statusInProgress") || "In Progress" },
    delivered: { color: "text-green-600", bgColor: "bg-green-50", label: t("orderDetail.statusDelivered") || "Delivered" },
    awaiting_payment: { color: "text-orange-600", bgColor: "bg-orange-50", label: t("orderDetail.statusAwaitingPayment") || "Awaiting Payment" },
    completed: { color: "text-success", bgColor: "bg-success/10", label: t("orderDetail.statusCompleted") || "Completed" },
    cancelled: { color: "text-error", bgColor: "bg-error/10", label: t("orderDetail.statusCancelled") || "Cancelled" },
    refunded: { color: "text-error", bgColor: "bg-error/10", label: t("orderDetail.statusRefunded") || "Refunded" },
  } as Record<OrderStatus, { color: string; bgColor: string; label: string }>;

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Detect user role
  useEffect(() => {
    if (!profile) return;
    if (profile.role === "freelancer") setUserRole("freelancer");
    else if (profile.role === "client") setUserRole("client");
    else setUserRole(null);
  }, [profile]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const db = requireDb();
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) {
        const data = snap.data();
        // Check authorization: freelancer must own order, client must be buyer
        const isAuthorized = 
          (userRole === "freelancer" && data.sellerId === user.uid) ||
          (userRole === "client" && data.buyerId === user.uid);
        
        if (isAuthorized) {
          setOrder({ id: snap.id, ...data } as Order);
        }
      }
      setLoading(false);
    };
    if (id && userRole) load();
  }, [id, user, userRole]);

  if (!user || !userRole || loading) return <OrderDetailSkeleton />;

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        Order not found.
      </div>
    );

  const config = statusConfig[order.status];

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      const now = new Date();
      const updateData: any = {
        status, 
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status,
          timestamp: now,
          note: statusConfig[status]?.label || status,
        }),
      };

      // Create transaction for payment when moving to awaiting_payment
      if (status === "awaiting_payment" && !order?.transactionId) {
        const amount = order?.packagePrice || order?.price || 0;
        
        if (!amount || amount <= 0) {
          toast.error("Invalid order amount");
          setUpdating(false);
          return;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: amount,
                description: `Order payment for ${order?.catalogTitle || order?.packageName || "Order"}`,
                tag1: user?.uid,
                tag2: "order_payout",
                tag3: order?.id,
              }),
            }
          );

          const data = await res.json();
          
          if (!data.success) {
            throw new Error(data.error || "QR creation failed");
          }

          updateData.transactionId = data.transactionId;
        } catch (err: any) {
          console.error("Failed to create transaction:", err);
          toast.error(err.message || "Failed to create payment transaction");
          setUpdating(false);
          return;
        }
      }

      const db = requireDb();
      await updateDoc(doc(db, "orders", order!.id), updateData);
      const updatedOrder = { ...(order as Order), status, transactionId: updateData.transactionId || order?.transactionId };
      setOrder(updatedOrder);

      // Create notification for the other party
      if (profile?.role && (profile.role === "client" || profile.role === "freelancer")) {
        await createOrderNotification(
          updatedOrder,
          status,
          profile.role,
          user?.uid
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const deliver = async (type: "text" | "github" | "file", files?: string[], screenshots?: string[]) => {
    setUpdating(true);
    try {
      const now = new Date();
      const updateData: any = {
        status: "delivered",
        delivery: deliveryNote,
        deliveryType: type,
        deliveryFiles: files || [],
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: "delivered",
          timestamp: now,
          note: statusConfig.delivered?.label || "Delivered",
        }),
      };

      // Add screenshots if provided (for file delivery)
      if (screenshots && screenshots.length > 0) {
        updateData.deliveryScreenshots = screenshots;
      }

      const db = requireDb();
      await updateDoc(doc(db, "orders", order.id), updateData);
      
      const updatedOrder = {
        ...(order as Order), 
        status: "delivered" as OrderStatus, 
        delivery: deliveryNote, 
        deliveryType: type, 
        deliveryFiles: files || [],
        deliveryScreenshots: screenshots || []
      };
      setOrder(updatedOrder);
      setDeliveryNote("");

      // Create notification for the client
      if (profile?.role === "freelancer") {
        await createOrderNotification(
          updatedOrder,
          "delivered",
          "freelancer",
          user?.uid
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const requestRevision = async (reason: string) => {
    setUpdating(true);
    try {
      const revisionCount = (order.revisionCount || 0) + 1;
      const now = Timestamp.now(); // Use Firestore Timestamp instead of Date
      const revisionLimit = order.revisionLimit || 2;
      
      // Create translated note for status history
      const revisionRequestedText = t("orderDetail.revisionRequested") || "Revision Requested";
      const revisionNote = `${revisionRequestedText} (${revisionCount}/${revisionLimit})`;
      
      const db = requireDb();
      await updateDoc(doc(db, "orders", order.id), {
        revisionCount,
        revisionPending: true,
        status: "in_progress", // Change status to in_progress when revision is requested
        revisionRequests: arrayUnion({
          requestedAt: now, // Use Firestore Timestamp for arrayUnion
          reason,
        }),
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: "in_progress", // Status changes to in_progress
          timestamp: now, // Use Firestore Timestamp for arrayUnion
          note: revisionNote,
        }),
      });
      
      const updatedOrder = {
        ...(order as Order), 
        status: "in_progress" as OrderStatus, // Update local state
        revisionPending: true,
        revisionCount,
        revisionRequests: [...(order.revisionRequests || []), { 
          requestedAt: { seconds: now.seconds, nanoseconds: now.nanoseconds } as Record<string, unknown>, 
          reason 
        }],
      };
      setOrder(updatedOrder);

      // Create notification for the freelancer
      if (profile?.role === "client") {
        await createRevisionNotification(
          updatedOrder,
          "client",
          reason
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const acceptRevision = async () => {
    setUpdating(true);
    try {
      const now = Timestamp.now();
      const db = requireDb();
      
      await updateDoc(doc(db, "orders", order.id), {
        revisionPending: false,
        status: "in_progress", // Explicitly set status to in_progress when accepting revision
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: "in_progress",
          timestamp: now,
          note: t("orderDetail.revisionAccepted") || "Revision Accepted - Working on changes",
        }),
      });

      const updatedOrder = { 
        ...order, 
        revisionPending: false, 
        status: "in_progress" as OrderStatus 
      };
      setOrder(updatedOrder);

      // Create notification for the client about revision acceptance
      if (profile?.role === "freelancer") {
        await createRevisionDecisionNotification(
          updatedOrder,
          "accepted",
          "freelancer"
        );
      }
      
      toast.success(t("orderDetail.revisionAcceptedSuccess") || "Revision accepted. You can now work on the changes.");
    } catch (error: any) {
      toast.error(error.message || t("common.error") || "Failed to accept revision");
    } finally {
      setUpdating(false);
    }
  };

  const declineRevision = async () => {
    setUpdating(true);
    try {
      const now = Timestamp.now();
      const db = requireDb();
      
      await updateDoc(doc(db, "orders", order.id), {
        revisionPending: false,
        status: "delivered", // Return to delivered status
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: "delivered",
          timestamp: now,
          note: t("orderDetail.revisionDeclined") || "Revision Declined - Original delivery maintained",
        }),
      });
      
      const updatedOrder = {
        ...(order as Order), 
        revisionPending: false,
        status: "delivered" as OrderStatus,
      };
      setOrder(updatedOrder);

      // Create notification for the client about revision decline
      if (profile?.role === "freelancer") {
        await createRevisionDecisionNotification(
          updatedOrder,
          "declined",
          "freelancer"
        );
      }
      
      toast.success(t("orderDetail.revisionDeclinedSuccess") || "Revision declined. Order returned to delivered status.");
    } catch (error: any) {
      toast.error(error.message || t("common.error") || "Failed to decline revision");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async (e: React.MouseEvent) => {
    e.preventDefault();
    const chatUrl = `/messages?order=${order.id}`;

    if (!isMobile) {
      window.open(chatUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!user) return;

    try {
      setLoadingChat(true);
      const { createOrOpenChatRoomForOrder } = await import("@/app/utils/chatUtils");
      const room = await createOrOpenChatRoomForOrder(order.id, user.uid);
      if (room?.id) {
        router.push(`/messages/${room.id}`);
      }
    } catch (err) {
      //console.error("❌ Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {t("orderDetail.catalog") || "Catalog"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                {order.catalogTitle || order.packageName}
              </h1>
              {order.packageName && (
                <p className="text-sm text-text-secondary">
                  {t("orderDetail.package") || "Package"}:{" "}
                  <span className="font-semibold text-text-primary">{order.packageName}</span>
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${config.bgColor} ${config.color}`}>
              {config.label}
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        <OrderProgressTimeline status={order.status} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <OrderDetailsCard order={order} />

            {/* Freelancer Section */}
            {userRole === "freelancer" && (
              <FreelancerSection
                order={order}
                updating={updating}
                deliveryNote={deliveryNote}
                setDeliveryNote={setDeliveryNote}
                onUpdateStatus={updateStatus}
                onDeliver={deliver}
                onAcceptRevision={acceptRevision}
                onDeclineRevision={declineRevision}
              />
            )}

            {/* Client Section */}
            {userRole === "client" && (
              <ClientSection
                order={order}
                updating={updating}
                onAcceptDelivery={() => updateStatus("awaiting_payment")}
                onRequestRevision={requestRevision}
              />
            )}

            {/* Payment Step - Show when awaiting payment */}
            {order.status === "awaiting_payment" && (
              <OrderPaymentStep order={order} />
            )}

            {/* Delivery History */}
            <DeliveryHistory order={order} />

            {/* Review Section - Show when order is completed */}
            {order.status === "completed" && user && userRole && (
              <OrderReviewSection
                order={order}
                userRole={userRole}
                userId={user.uid}
                onReviewSubmitted={() => {
                  // Reload order to get updated rating status
                  const reload = async () => {
                    const db = requireDb();
                    const snap = await getDoc(doc(db, "orders", order.id));
                    if (snap.exists()) {
                      setOrder({ id: snap.id, ...snap.data() } as Order);
                    }
                  };
                  reload();
                }}
              />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <OrderSidebar
            order={order}
            userRole={userRole || "client"}
            statusConfig={statusConfig}
            loadingChat={loadingChat}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
