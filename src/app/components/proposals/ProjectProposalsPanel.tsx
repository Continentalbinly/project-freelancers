"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { requireDb } from "@/service/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc as firestoreDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  createProposalAcceptedNotification,
  createProposalRejectedNotification,
} from "@/app/orders/utils/notificationService";
import type { Timestamp } from "firebase/firestore";
import type { ProposalWithDetails } from "@/types/proposal";
import ProposalsFilter from "./ProposalsFilter";
import ProposalList from "./ProposalList";
import EmptyState from "../ui/EmptyState";

// ------------------------------------
// Types
// ------------------------------------
interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "fixed" | "hourly";
  status: string;
  clientId: string;
  skillsRequired?: string[];
  postingFee?: number;
}

interface ProjectProposalsPanelProps {
  projectId: string;
  variant?: "standalone" | "embedded";
  onAfterDecision?: () => void;
}

// ------------------------------------
// Component
// ------------------------------------
export default function ProjectProposalsPanel({
  projectId,
  variant = "standalone",
  onAfterDecision,
}: ProjectProposalsPanelProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslationContext();

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [filtered, setFiltered] = useState<ProposalWithDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingProposals, setLoadingProposals] = useState(true);

  // ------------------------------------
  // Identify freelancer
  // ------------------------------------
  const isFreelancer = profile?.role === "freelancer";

  // ------------------------------------
  // Redirect unauthenticated user (standalone only)
  // ------------------------------------
  useEffect(() => {
    if (variant === "standalone" && !authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router, variant]);

  // ------------------------------------
  // Firestore Fetch
  // ------------------------------------
  const fetchData = useCallback(async () => {
    if (!user || !projectId) return;

    try {
      const firestore = requireDb();
      setLoadingProposals(true);

      const projectDoc = await getDoc(firestoreDoc(firestore, "projects", projectId));
      if (!projectDoc.exists()) {
        if (variant === "standalone") {
          router.push("/projects/manage");
        }
        return;
      }

      const projectData = projectDoc.data() as Project;

      // Ensure owner
      if (projectData.clientId !== user.uid) {
        if (variant === "standalone") {
          router.push("/projects/manage");
        }
        return;
      }

      const projectWithId = { ...projectData, id: projectId };
      setProject(projectWithId);

      // Fetch proposals
      const q = query(
        collection(firestore, "proposals"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const list: ProposalWithDetails[] = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();

          const freelancerRef = firestoreDoc(
            firestore,
            "profiles",
            data.freelancerId
          );
          const freelancerDoc = await getDoc(freelancerRef);
          const freelancerData = freelancerDoc.exists()
            ? freelancerDoc.data()
            : null;

          return {
            id: docSnap.id,
            ...data,
            freelancer: freelancerData
              ? {
                  id: data.freelancerId,
                  fullName: freelancerData.fullName,
                  avatar: freelancerData.avatarUrl,
                  rating: freelancerData.rating,
                  skills: freelancerData.skills,
                  hourlyRate: freelancerData.hourlyRate,
                }
              : undefined,
            createdAt:
              data.createdAt &&
              typeof data.createdAt === "object" &&
              "toDate" in data.createdAt
                ? (data.createdAt as Timestamp).toDate()
                : data.createdAt instanceof Date
                ? data.createdAt
                : (data.createdAt as Timestamp) || new Date(),
            updatedAt:
              data.updatedAt &&
              typeof data.updatedAt === "object" &&
              "toDate" in data.updatedAt
                ? (data.updatedAt as Timestamp).toDate()
                : data.updatedAt instanceof Date
                ? data.updatedAt
                : (data.updatedAt as Timestamp) || new Date(),
            project: {
              id: projectWithId.id,
              title: projectWithId.title,
              description: projectWithId.description,
              budget: projectWithId.budget,
              clientId: projectWithId.clientId,
              skillsRequired: projectWithId.skillsRequired || [],
            },
          } as ProposalWithDetails;
        })
      );

      setProposals(list);
      setFiltered(list);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoadingProposals(false);
    }
  }, [user, projectId, router, variant]);

  // ------------------------------------
  // Fetch data
  // ------------------------------------
  useEffect(() => {
    if (user && projectId && !isFreelancer) {
      fetchData();
    }
  }, [user, projectId, isFreelancer, fetchData]);

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const handleFilter = (status: string) => {
    setStatusFilter(status);
    setFiltered(
      status === "all"
        ? proposals
        : proposals.filter((p) => p.status === status)
    );
  };

  const handleAccept = async (proposal: ProposalWithDetails) => {
    try {
      const firestore = requireDb();
      // Get project info for notifications
      const projectSnap = await getDoc(
        firestoreDoc(firestore, "projects", projectId)
      );
      const projectTitle = projectSnap.exists()
        ? projectSnap.data().title ?? "Unknown Project"
        : "Unknown Project";

      await updateDoc(firestoreDoc(firestore, "proposals", proposal.id), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      await updateDoc(firestoreDoc(firestore, "projects", projectId), {
        status: "in_progress",
        acceptedFreelancerId: proposal.freelancerId,
        acceptedProposalId: proposal.id,
        updatedAt: serverTimestamp(),
      });

      // Reject other proposals and refund their fees
      const otherProposals = proposals.filter((p) => p.id !== proposal.id);
      const project = projectSnap.exists() ? projectSnap.data() : null;
      const refundAmount = project?.postingFee ?? 0;

      await Promise.all(
        otherProposals.map(async (p) => {
          await updateDoc(firestoreDoc(firestore, "proposals", p.id), {
            status: "rejected",
            updatedAt: serverTimestamp(),
          });

          // Refund credits for rejected proposals
          if (refundAmount > 0) {
            const freelancerRef = firestoreDoc(
              firestore,
              "profiles",
              p.freelancerId
            );
            const freelancerSnap = await getDoc(freelancerRef);

            if (freelancerSnap.exists()) {
              const freelancerData = freelancerSnap.data();
              const previousBalance = freelancerData.credit ?? 0;
              const newBalance = previousBalance + refundAmount;

              await updateDoc(freelancerRef, {
                credit: increment(refundAmount),
              });

              // Create transaction log
              const txRef = firestoreDoc(collection(firestore, "transactions"));
              await setDoc(txRef, {
                id: txRef.id,
                userId: p.freelancerId,
                projectId: projectId,
                type: "proposal_refund",
                direction: "in",
                amount: refundAmount,
                previousBalance,
                newBalance,
                currency: "LAK",
                status: "completed",
                description: `Refund for rejected proposal on project "${projectTitle}"`,
                createdAt: serverTimestamp(),
              });

              // Create notification for rejected proposal
              try {
                await createProposalRejectedNotification(
                  project?.clientId || user?.uid || "",
                  p.freelancerId,
                  projectId,
                  projectTitle,
                  p.id,
                  refundAmount
                );
              } catch (notifError) {
                console.error(
                  "Error creating proposal rejected notification:",
                  notifError
                );
              }
            }
          }
        })
      );

      // Create notification for accepted proposal
      try {
        await createProposalAcceptedNotification(
          project?.clientId || user?.uid || "",
          proposal.freelancerId,
          projectId,
          projectTitle,
          proposal.id
        );
      } catch (notifError) {
        console.error(
          "Error creating proposal accepted notification:",
          notifError
        );
      }

      await fetchData();
      if (onAfterDecision) {
        onAfterDecision();
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      await fetchData();
    }
  };

  const handleReject = async (proposal: ProposalWithDetails) => {
    try {
      const firestore = requireDb();
      // Get project info for refund and notifications
      const projectSnap = await getDoc(
        firestoreDoc(firestore, "projects", projectId)
      );
      const project = projectSnap.exists() ? projectSnap.data() : null;
      const projectTitle = project?.title ?? "Unknown Project";
      const refundAmount = project?.postingFee ?? 0;

      await updateDoc(firestoreDoc(firestore, "proposals", proposal.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      // Refund credits to freelancer
      if (refundAmount > 0) {
        const freelancerRef = firestoreDoc(
          firestore,
          "profiles",
          proposal.freelancerId
        );
        const freelancerSnap = await getDoc(freelancerRef);

        if (freelancerSnap.exists()) {
          const freelancerData = freelancerSnap.data();
          const previousBalance = freelancerData.credit ?? 0;
          const newBalance = previousBalance + refundAmount;

          await updateDoc(freelancerRef, {
            credit: increment(refundAmount),
          });

          // Create transaction log
          const txRef = firestoreDoc(collection(firestore, "transactions"));
          await setDoc(txRef, {
            id: txRef.id,
            userId: proposal.freelancerId,
            projectId: projectId,
            type: "proposal_refund",
            direction: "in",
            amount: refundAmount,
            previousBalance,
            newBalance,
            currency: "LAK",
            status: "completed",
            description: `Refund for rejected proposal on project "${projectTitle}"`,
            createdAt: serverTimestamp(),
          });

          // Create notification for freelancer
          try {
            await createProposalRejectedNotification(
              project?.clientId || user?.uid || "",
              proposal.freelancerId,
              projectId,
              projectTitle,
              proposal.id,
              refundAmount
            );
          } catch (notifError) {
            console.error(
              "Error creating proposal rejected notification:",
              notifError
            );
          }
        }
      }

      await fetchData();
      if (onAfterDecision) {
        onAfterDecision();
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      await fetchData();
    }
  };

  // ------------------------------------
  // Render
  // ------------------------------------

  // Still loading auth
  if (authLoading) {
    return (
      <div className="p-10 text-center">
        <p className="text-text-secondary">{t("common.loading")}</p>
      </div>
    );
  }

  // Not logged in (after loading)
  if (!user) {
    if (variant === "standalone") {
      return null; // Will redirect
    }
    return (
      <EmptyState
        title={t("common.signIn") || "Sign In Required"}
        description={
          t("common.signInRequired") ||
          "Please sign in to view proposals for this project"
        }
        action={{
          label: t("header.signIn") || "Sign In",
          onClick: () => router.push("/auth/login"),
          variant: "primary",
        }}
      />
    );
  }

  // Freelancer view block
  if (isFreelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-error mb-4">
            {t("createProject.permissionDenied") ||
              "Permission Denied"}
          </p>
          <p className="text-text-secondary">
            {t("createProject.freelancerAccessDenied") ||
              "Freelancers cannot access this page"}
          </p>
        </div>
      </div>
    );
  }

  // Access restricted (not project owner)
  if (project && project.clientId !== user.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-error mb-4">
            {t("common.accessRestrictedTitle") || "Access Restricted"}
          </p>
          <p className="text-text-secondary">
            {t("common.clientRedirectProjects") ||
              "You can only view proposals for your own projects"}
          </p>
        </div>
      </div>
    );
  }

  // Main content
  const containerClasses =
    variant === "embedded"
      ? "w-full"
      : "min-h-screen bg-gradient-to-br from-background to-background-secondary";

  return (
    <div className={containerClasses}>
      <div className={variant === "embedded" ? "" : "max-w-7xl mx-auto px-4 py-8"}>
        <ProposalsFilter
          status={statusFilter}
          setStatus={handleFilter}
          total={proposals.length}
          filtered={filtered.length}
        />

        <ProposalList
          proposals={filtered}
          loading={loadingProposals}
          role="client"
          context="project"
          showProjectTitle={false}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}

