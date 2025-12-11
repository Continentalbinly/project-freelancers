"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import ProposalsTabs from "./components/ProposalsTabs";
import ProposalsFilter from "./components/ProposalsFilter";
import ProposalsList from "./components/ProposalsList";
import ProposalsSkeleton from "./components/ProposalsSkeleton";
import ProposalsEmptyState from "./components/ProposalsEmptyState";

export default function ProposalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslationContext();

  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [activeTab, setActiveTab] = useState<"submitted" | "received">(
    "submitted"
  );
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "received" || tab === "submitted") setActiveTab(tab);
    else router.replace("/proposals?tab=submitted", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (user) fetchProposals();
  }, [user, activeTab, statusFilter]);

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      if (!user) return;

      // Fetch submitted proposals
      const submittedSnap = await getDocs(
        query(
          collection(db, "proposals"),
          where("freelancerId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
      );
      const submitted = submittedSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch received proposals (client)
      const projectSnap = await getDocs(
        query(collection(db, "projects"), where("clientId", "==", user.uid))
      );
      const projectIds = projectSnap.docs.map((doc) => doc.id);

      let received: any[] = [];
      if (projectIds.length) {
        const allProposals = await getDocs(
          query(collection(db, "proposals"), orderBy("createdAt", "desc"))
        );
        received = allProposals.docs
          .filter((p) => projectIds.includes(p.data().projectId))
          .map((p) => ({ id: p.id, ...p.data() }));
      }

      const all = activeTab === "submitted" ? submitted : received;
      const detailed = await Promise.all(
        all.map(async (p) => {
          const projectDoc = await getDoc(doc(db, "projects", p.projectId));
          const project = projectDoc.exists() ? projectDoc.data() : null;

          const freelancerDoc = await getDoc(
            doc(db, "profiles", p.freelancerId)
          );
          const freelancer = freelancerDoc.exists()
            ? freelancerDoc.data()
            : null;

          let client = null;
          if (project?.clientId) {
            const cDoc = await getDoc(doc(db, "profiles", project.clientId));
            client = cDoc.exists() ? cDoc.data() : null;
          }

          return { ...p, project, freelancer, client };
        })
      );

      setProposals(detailed);
    } catch (err) {
      //console.error("❌ Error loading proposals:", err);
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

        <ProposalsTabs activeTab={activeTab} onChange={setActiveTab} t={t} />
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
