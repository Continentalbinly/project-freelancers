"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { requireDb } from "@/service/firebase";
import { doc, getDoc, onSnapshot, serverTimestamp, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
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
import WorkroomLayout from "@/app/components/workroom/WorkroomLayout";
import Skeleton from "@/app/components/ui/Skeleton";
import StatusBadge from "@/app/components/ui/StatusBadge";
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

  // Real-time order listener - updates automatically when status changes
  useEffect(() => {
    if (!id || !user || !userRole) {
      setLoading(false);
      return;
    }

    const db = requireDb();
    const orderRef = doc(db, "orders", id);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      orderRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // Check authorization: freelancer must own order, client must be buyer
          const isAuthorized = 
            (userRole === "freelancer" && data.sellerId === user.uid) ||
            (userRole === "client" && data.buyerId === user.uid);
          
          if (isAuthorized) {
            setOrder({ id: snap.id, ...data } as Order);
          } else {
            setOrder(null);
          }
        } else {
          setOrder(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to order updates:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, user, userRole]);

  if (!user || !userRole || loading) {
    return (
      <WorkroomLayout
        title={t("common.loading") || "Loading..."}
        sidebarContent={
          <div className="space-y-4">
            <Skeleton height={100} />
            <Skeleton height={200} />
          </div>
        }
      >
        <div className="space-y-4">
          <Skeleton height={300} />
          <Skeleton height={200} />
        </div>
      </WorkroomLayout>
    );
  }

  if (!order) {
    return (
      <WorkroomLayout
        title={t("orderDetail.notFound") || "Order not found"}
        sidebarContent={null}
      >
        <p className="text-center text-text-secondary py-8">
          {t("orderDetail.notFoundDesc") || "The order you're looking for doesn't exist."}
        </p>
      </WorkroomLayout>
    );
  }

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      const now = new Date();
      const updateData: Record<string, unknown> = {
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
        } catch (err: unknown) {
          console.error("Failed to create transaction:", err);
          const errorMessage = err instanceof Error ? err.message : "Failed to create payment transaction";
          toast.error(errorMessage);
          setUpdating(false);
          return;
        }
      }

      const db = requireDb();
      await updateDoc(doc(db, "orders", order!.id), updateData);
      const updatedOrder = { ...(order as Order), status, transactionId: (updateData.transactionId && typeof updateData.transactionId === 'string' ? updateData.transactionId : order?.transactionId) || undefined };
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
      const updateData: Record<string, unknown> = {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("common.error") || "Failed to accept revision";
      toast.error(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("common.error") || "Failed to decline revision";
      toast.error(errorMessage);
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
    } catch  {
      //console.error("❌ Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  const orderTitle = order.catalogTitle || order.packageName || t("orderDetail.order") || "Order";
  const subtitle = userRole === "client"
    ? t("orderDetail.youAreClient") || "You are the client"
    : userRole === "freelancer"
    ? t("orderDetail.youAreFreelancer") || "You are the freelancer"
    : undefined;

  const breadcrumbs = [
    { label: t("navigation.orders") || t("dashboard.orders") || "Orders", href: "/orders" },
    { label: orderTitle },
  ];

  return (
    <WorkroomLayout
      title={orderTitle}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      sidebarContent={
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              {t("orderDetail.orderStatus") || "Status"}
            </h3>
            <StatusBadge status={order.status} type="order" />
          </div>
          {order.packagePrice && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                {t("orderDetail.totalAmount") || "Total Amount"}
              </h3>
              <p className="text-2xl font-bold text-text-primary">
                ₭{order.packagePrice.toLocaleString()}
              </p>
            </div>
          )}
          <OrderSidebar
            order={order}
            userRole={userRole || "client"}
            statusConfig={statusConfig}
            loadingChat={loadingChat}
            onSendMessage={handleSendMessage}
          />
        </div>
      }
    >
      <div className="space-y-8">
        <OrderProgressTimeline status={order.status} />

        <div className="mt-8 space-y-6">
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
      </div>
    </WorkroomLayout>
  );
}
