"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { requireDb } from "@/service/firebase";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { ArrowRight, Clock, CheckCircle, AlertCircle, type LucideIcon } from "lucide-react";
import type { Order } from "@/types/order";
import type { Project } from "@/types/project";

interface CurrentProjectsOrdersProps {
  userId: string;
  userRole: "freelancer" | "client";
}

export default function CurrentProjectsOrders({ userId, userRole }: CurrentProjectsOrdersProps) {
  const { t } = useTranslationContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Load orders
    const field = userRole === "freelancer" ? "sellerId" : "buyerId";
    const ordersQuery = query(
      collection(requireDb(), "orders"),
      where(field, "==", userId),
      where("status", "in", ["pending", "accepted", "in_progress", "delivered"]),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snap) => {
      const ordersData = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    // Load projects
    const projectsField = userRole === "freelancer" ? "acceptedFreelancerId" : "clientId";
    const projectsQuery = query(
      collection(requireDb(), "projects"),
      where(projectsField, "==", userId),
      where("status", "in", ["open", "in_progress"]),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snap) => {
      const projectsData: Project[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          description: data.description || "",
          budget: data.budget || 0,
          budgetType: data.budgetType || "fixed",
          status: data.status || "open",
          category: data.category || "",
          clientId: data.clientId || "",
          skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : [],
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          freelancerId: data.freelancerId,
          proposalsCount: data.proposalsCount,
          views: data.views,
          timeline: data.timeline,
          acceptedFreelancerId: data.acceptedFreelancerId,
          acceptedProposalId: data.acceptedProposalId,
          attachments: data.attachments,
          imageUrl: data.imageUrl,
          deadline: data.deadline,
          clientCompleted: data.clientCompleted,
          freelancerCompleted: data.freelancerCompleted,
          postingFee: data.postingFee,
          progress: data.progress,
        } as Project;
      });
      setProjects(projectsData);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProjects();
    };
  }, [userId, userRole]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: LucideIcon; label: string }> = {
      pending: {
        color: "text-amber-600 bg-amber-50",
        icon: Clock,
        label: t("orderDetail.statusPending") || "Pending",
      },
      accepted: {
        color: "text-blue-600 bg-blue-50",
        icon: CheckCircle,
        label: t("orderDetail.statusAccepted") || "Accepted",
      },
      in_progress: {
        color: "text-purple-600 bg-purple-50",
        icon: AlertCircle,
        label: t("orderDetail.statusInProgress") || "In Progress",
      },
      delivered: {
        color: "text-green-600 bg-green-50",
        icon: CheckCircle,
        label: t("orderDetail.statusDelivered") || "Delivered",
      },
      open: {
        color: "text-blue-600 bg-blue-50",
        icon: Clock,
        label: t("common.status.statusOpen") || "Open",
      },
    };

    return configs[status] || { color: "text-gray-600 bg-gray-50", icon: Clock, label: status };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-background-secondary rounded-lg p-4 border border-border dark:border-gray-800 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allItems = [
    ...orders.map((o) => ({ ...o, type: "order" as const })),
    ...projects.map((p) => ({ ...p, type: "project" as const })),
  ].sort((a, b) => {
    const getTimestamp = (updatedAt: unknown): number => {
      if (updatedAt instanceof Timestamp) {
        return updatedAt.seconds;
      }
      if (updatedAt && typeof updatedAt === 'object' && 'seconds' in updatedAt) {
        return (updatedAt as { seconds: number }).seconds;
      }
      if (updatedAt instanceof Date) {
        return Math.floor(updatedAt.getTime() / 1000);
      }
      return 0;
    };
    const aTime = getTimestamp(a.updatedAt);
    const bTime = getTimestamp(b.updatedAt);
    return bTime - aTime;
  });

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-background-secondary">
        <Clock className="w-16 h-16 text-text-secondary mx-auto mb-4" />
        <p className="text-text-secondary">
          {t("profile.projects.currentItems.empty") || "No active projects or orders"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-text-primary mb-4">
        {t("profile.projects.currentItems.title") || "Current Projects & Orders"}
      </h3>
      {allItems.slice(0, 5).map((item) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;
        const href = item.type === "order" ? `/orders/${item.id}` : `/projects/${item.id}`;
        const title = item.type === "order" ? item.catalogTitle || item.packageName : item.title;

        return (
          <Link
            key={item.id}
            href={href}
            className="block bg-background-secondary rounded-lg p-4 border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className="w-4 h-4 text-text-secondary" />
                  <h4 className="font-semibold text-text-primary">{title}</h4>
                </div>
                <p className="text-sm text-text-secondary line-clamp-1">
                  {item.type === "order"
                    ? item.packageName
                    : item.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <ArrowRight className="w-4 h-4 text-text-secondary" />
              </div>
            </div>
          </Link>
        );
      })}
      {(orders.length > 5 || projects.length > 5) && (
        <Link
          href="/orders"
          className="block w-full text-center py-3 text-primary hover:underline cursor-pointer"
        >
          {t("profile.projects.currentItems.viewAll") || "View All →"}
        </Link>
      )}
    </div>
  );
}

