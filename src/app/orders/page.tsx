"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, onSnapshot, orderBy, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { convertTimestampToDate } from "@/service/timeUtils";
import type { Order, OrderStatus } from "@/types/order";
import { ChevronRight, Calendar, DollarSign, Package, Clock, CheckCircle, AlertCircle, XCircle, User } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import OrdersListSkeleton from "./components/OrdersListSkeleton";

const statusOptions: OrderStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "delivered",
  "awaiting_payment",
  "completed",
  "cancelled",
  "refunded",
];

// Status color and icon mapping
const statusConfig: Record<OrderStatus | "all", { color: string; bgColor: string; icon: React.ReactNode }> = {
  all: { color: "text-text-secondary", bgColor: "bg-background", icon: null },
  pending: { color: "text-amber-600", bgColor: "bg-amber-50", icon: <Clock className="w-4 h-4" /> },
  accepted: { color: "text-blue-600", bgColor: "bg-blue-50", icon: <CheckCircle className="w-4 h-4" /> },
  in_progress: { color: "text-purple-600", bgColor: "bg-purple-50", icon: <Clock className="w-4 h-4" /> },
  delivered: { color: "text-green-600", bgColor: "bg-green-50", icon: <CheckCircle className="w-4 h-4" /> },
  awaiting_payment: { color: "text-orange-600", bgColor: "bg-orange-50", icon: <DollarSign className="w-4 h-4" /> },
  completed: { color: "text-success", bgColor: "bg-success/10", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { color: "text-error", bgColor: "bg-error/10", icon: <XCircle className="w-4 h-4" /> },
  refunded: { color: "text-error", bgColor: "bg-error/10", icon: <XCircle className="w-4 h-4" /> },
};

// Skeleton Loader
function OrderSkeleton() {
  return (
    <div className="border border-border rounded-xl p-5 bg-background-secondary animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-background rounded w-2/3"></div>
            <div className="h-4 bg-background rounded w-1/3"></div>
          </div>
          <div className="h-6 w-20 bg-background rounded-full"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-background rounded w-24"></div>
          <div className="h-4 bg-background rounded w-24"></div>
          <div className="h-4 bg-background rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersListPage(): React.ReactElement {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);

  // Detect user role
  useEffect(() => {
    if (!profile) return;
    const roles = profile.userRoles || [];
    const types = profile.userType || [];
    
    const isFreelancer = roles.includes("freelancer") || types.includes("freelancer");
    const isClient = roles.includes("client") || types.includes("client");
    
    // Prioritize freelancer view if both roles
    if (isFreelancer) {
      setUserRole("freelancer");
    } else if (isClient) {
      setUserRole("client");
    }
  }, [profile]);

  useEffect(() => {
    if (!user || !userRole) return;
    
    // Query based on role: freelancers see orders to fulfill, clients see orders they placed
    const field = userRole === "freelancer" ? "sellerId" : "buyerId";
    const q = query(collection(db, "orders"), where(field, "==", user.uid), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setOrders(rows as Order[]);
      setLoading(false);
    });
    return () => unsub();
  }, [user, userRole]);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const statusMatch = status === "all" || o.status === status;
        const searchMatch = o.packageName.toLowerCase().includes(searchText.toLowerCase());
        return statusMatch && searchMatch;
      }),
    [orders, status, searchText]
  );

  // Stats (different for client vs freelancer)
  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => o.status === "in_progress").length,
      completed: orders.filter((o) => o.status === "completed").length,
      amount: orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.packagePrice || 0), 0),
    }),
    [orders]
  );

  if (!user || !userRole) return <OrdersListSkeleton />;

  const isFreelancer = userRole === "freelancer";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t("ordersPage.title") || "My Orders"}
          </h1>
          <p className="text-text-secondary">
            {isFreelancer 
              ? (t("ordersPage.freelancerSubtitle") || "Manage your freelance orders and deliveries")
              : (t("ordersPage.clientSubtitle") || "Track your catalog orders and delivery progress")
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">{t("ordersPage.totalOrders") || "Total Orders"}</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">{t("ordersPage.pending") || "Pending"}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">{t("ordersPage.inProgress") || "In Progress"}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">{t("ordersPage.completed") || "Completed"}</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 w-full">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("ordersPage.searchPlaceholder") || "Search orders by package name…"}
            className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm sm:text-base"
          />
        </div>

        {/* Status Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setStatus("all")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
              status === "all"
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                : "bg-background border-2 border-border text-text-primary hover:border-primary/30"
            }`}
          >
            {t("ordersPage.all") || "All"}<span className="hidden sm:inline"> ({stats.total})</span>
            <span className="sm:hidden">({stats.total})</span>
          </button>
          {statusOptions.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            const config = statusConfig[s];
            const statusLabel = t(`ordersPage.status.${s}`) || s.replace("_", " ");
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                  status === s
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                    : "bg-background border-2 border-border text-text-primary hover:border-primary/30"
                }`}
              >
                <span className="hidden sm:inline">{config.icon}</span>
                <span className="hidden sm:inline">{statusLabel}</span>
                <span className="sm:hidden">{statusLabel.substring(0, 3)}</span>
                <span className="hidden sm:inline">({count})</span>
                <span className="sm:hidden text-xs">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-background-secondary/50 py-16 text-center">
            <Package className="w-12 h-12 text-text-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t("ordersPage.noOrdersFound") || "No Orders Found"}
            </h3>
            <p className="text-text-secondary">
              {t("ordersPage.noOrdersMessage") || "No orders match your filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const config = statusConfig[order.status];
              const statusLabel = t(`ordersPage.status.${order.status}`) || order.status.replace("_", " ");
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group border border-border rounded-xl p-5 bg-background-secondary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-between gap-4"
                >
                  {/* Left: Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        {config.icon && <div className={`${config.color} text-xs sm:text-base`}>{config.icon}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                          {order.packageName}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 flex-wrap text-xs sm:text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                            <span className="font-medium text-text-primary">₭{(order.packagePrice || 0).toLocaleString()}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{convertTimestampToDate(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {!isFreelancer && (
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{t("ordersPage.freelancer") || "Freelancer"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Action */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${config.bgColor} ${config.color}`}>
                      <span className="hidden sm:inline">{statusLabel}</span>
                      <span className="sm:hidden">{statusLabel.substring(0, 3)}</span>
                    </div>
                    <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
