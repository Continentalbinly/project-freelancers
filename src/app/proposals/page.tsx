"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { redirect } from "next/navigation";
import ProposalsFilter from "./components/ProposalsFilter";
import ProposalList from "@/app/components/proposals/ProposalList";
import ProposalsSkeleton from "./components/ProposalsSkeleton";
import ProposalsEmptyState from "./components/ProposalsEmptyState";
import type { Proposal, ProposalWithDetails } from "@/types/proposal";

export default function ProposalsPage() {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Determine user role and set proposal view type accordingly
  const isClient = profile?.role === "client";
  const activeTab: "submitted" | "received" = isClient
    ? "received"
    : "submitted";

  useEffect(() => {
    if (!loading && !user) redirect("/auth/login");
  }, [user, loading]);

  useEffect(() => {
    if (user && profile) fetchProposals();
  }, [user, profile, activeTab, statusFilter]);

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      if (!user) return;
      const firestore = requireDb();

      // Fetch submitted proposals
      const submittedSnap = await getDocs(
        query(
          collection(firestore, "proposals"),
          where("freelancerId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
      );
      const submitted: Proposal[] = submittedSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          freelancerId: data.freelancerId,
          coverLetter: data.coverLetter || "",
          proposedBudget: data.proposedBudget || 0,
          proposedRate: data.proposedRate || 0,
          estimatedDuration: data.estimatedDuration || "",
          status: data.status || "pending",
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
        } as Proposal;
      });

      // Fetch received proposals (client)
      // Get all projects owned by the client
      const projectSnap = await getDocs(
        query(
          collection(firestore, "projects"),
          where("clientId", "==", user.uid)
        )
      );
      const projectIds = projectSnap.docs.map((doc) => doc.id);

      let received: Proposal[] = [];
      if (projectIds.length > 0) {
        // Firestore whereIn supports up to 10 items
        // For more than 10 projects, we batch the queries
        if (projectIds.length <= 10) {
          const proposalsSnap = await getDocs(
            query(
              collection(firestore, "proposals"),
              where("projectId", "in", projectIds),
              orderBy("createdAt", "desc")
            )
          );
          received = proposalsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              projectId: data.projectId,
              freelancerId: data.freelancerId,
              coverLetter: data.coverLetter || "",
              proposedBudget: data.proposedBudget || 0,
              proposedRate: data.proposedRate || 0,
              estimatedDuration: data.estimatedDuration || "",
              status: data.status || "pending",
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date(),
            } as Proposal;
          });
        } else {
          // Batch queries for more than 10 projects
          const batches: Proposal[] = [];
          for (let i = 0; i < projectIds.length; i += 10) {
            const batch = projectIds.slice(i, i + 10);
            const proposalsSnap = await getDocs(
              query(
                collection(firestore, "proposals"),
                where("projectId", "in", batch),
                orderBy("createdAt", "desc")
              )
            );
            const batchProposals = proposalsSnap.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                projectId: data.projectId,
                freelancerId: data.freelancerId,
                coverLetter: data.coverLetter || "",
                proposedBudget: data.proposedBudget || 0,
                proposedRate: data.proposedRate || 0,
                estimatedDuration: data.estimatedDuration || "",
                status: data.status || "pending",
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
              } as Proposal;
            });
            batches.push(...batchProposals);
          }
          // Sort by createdAt descending (most recent first)
          received = batches.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate?.() || new Date(0);
            const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate?.() || new Date(0);
            return bDate.getTime() - aDate.getTime();
          });
        }
      }

      const all = activeTab === "submitted" ? submitted : received;
      const detailed = await Promise.all(
        all.map(async (p) => {
          const projectDoc = await getDoc(
            doc(firestore, "projects", p.projectId)
          );
          const project = projectDoc.exists() ? projectDoc.data() : null;

          const freelancerDoc = await getDoc(
            doc(firestore, "profiles", p.freelancerId)
          );
          const freelancerData = freelancerDoc.exists()
            ? freelancerDoc.data()
            : null;

          let client = null;
          if (project?.clientId) {
            const cDoc = await getDoc(
              doc(firestore, "profiles", project.clientId)
            );
            const clientData = cDoc.exists() ? cDoc.data() : null;
            client = clientData
              ? {
                  id: project.clientId,
                  fullName: clientData.fullName,
                  avatar: clientData.avatarUrl,
                  rating: clientData.rating,
                  totalProjects: clientData.totalProjects,
                }
              : null;
          }

          return {
            ...p,
            project,
            freelancer: freelancerData
              ? {
                  id: p.freelancerId,
                  fullName: freelancerData.fullName,
                  avatar: freelancerData.avatarUrl,
                  rating: freelancerData.rating,
                  totalProjects: freelancerData.totalProjects,
                  hourlyRate: freelancerData.hourlyRate,
                  skills: freelancerData.skills,
                }
              : undefined,
            client,
          } as ProposalWithDetails;
        })
      );

      setProposals(detailed);
    } catch {
    } finally {
      setLoadingProposals(false);
    }
  };

  const filtered = proposals.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t("proposals.title")}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {t("proposals.subtitle")}
            </p>
          </div>
        </div>

        <ProposalsFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          t={t}
        />

        {loadingProposals ? (
          <ProposalsSkeleton />
        ) : filtered.length === 0 ? (
          <ProposalsEmptyState activeTab={activeTab} t={t} />
        ) : (
          <ProposalList
            proposals={filtered}
            loading={false}
            role={isClient ? "client" : "freelancer"}
            context="global"
            showProjectTitle={true}
          />
        )}
      </div>
    </div>
  );
}
