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
import ProposalsList from "./components/ProposalsList";
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
      const projectSnap = await getDocs(
        query(
          collection(firestore, "projects"),
          where("clientId", "==", user.uid)
        )
      );
      const projectIds = projectSnap.docs.map((doc) => doc.id);

      let received: Proposal[] = [];
      if (projectIds.length) {
        const allProposals = await getDocs(
          query(
            collection(firestore, "proposals"),
            orderBy("createdAt", "desc")
          )
        );
        received = allProposals.docs
          .filter((p) => {
            const data = p.data();
            return data.projectId && projectIds.includes(data.projectId);
          })
          .map((p) => {
            const data = p.data();
            return {
              id: p.id,
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
          const freelancer = freelancerDoc.exists()
            ? freelancerDoc.data()
            : null;

          let client = null;
          if (project?.clientId) {
            const cDoc = await getDoc(
              doc(firestore, "profiles", project.clientId)
            );
            client = cDoc.exists() ? cDoc.data() : null;
          }

          return { ...p, project, freelancer, client } as ProposalWithDetails;
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
          <ProposalsList proposals={filtered} activeTab={activeTab} t={t} />
        )}
      </div>
    </div>
  );
}
