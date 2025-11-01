"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/service/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc as firestoreDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useTranslationContext } from "@/app/components/LanguageProvider";
// Components
import ProposalsHeader from "./components/ProposalsHeader";
import ProposalsFilter from "./components/ProposalsFilter";
import ProposalsList from "./components/ProposalsList";
import ProposalModal from "./components/ProposalModal";

// ------------------------------------
// Types
// ------------------------------------
export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  proposedBudget: number;
  proposedRate: number;
  estimatedDuration: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: any;
  updatedAt: any;
  freelancer?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    skills?: string[];
    hourlyRate?: number;
  };
  project?: {
    id: string;
    title: string;
    description?: string;
    budget?: number;
    clientId: string;
    skillsRequired?: string[];
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "fixed" | "hourly";
  status: string;
  clientId: string;
  skillsRequired?: string[];
}

// ------------------------------------
// Page Component
// ------------------------------------
export default function ProjectProposalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { t } = useTranslationContext();

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filtered, setFiltered] = useState<Proposal[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [loadingProposals, setLoadingProposals] = useState(true);

  // ------------------------------------
  // Auth Redirect
  // ------------------------------------
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // ------------------------------------
  // Fetch data when ready
  // ------------------------------------
  useEffect(() => {
    if (user && projectId) fetchData();
  }, [user, projectId]);

  // ------------------------------------
  // Firestore Fetch
  // ------------------------------------
  const fetchData = async () => {
    try {
      setLoadingProposals(true);

      // 🔹 1. Fetch the project
      const projectDoc = await getDoc(firestoreDoc(db, "projects", projectId));
      if (!projectDoc.exists()) {
        router.push("/projects/manage");
        return;
      }

      const projectData = projectDoc.data() as Project;

      // ✅ Check owner
      if (projectData.clientId !== user?.uid) {
        router.push("/projects/manage");
        return;
      }

      const projectWithId = { ...projectData, id: projectId };
      setProject(projectWithId);

      // 🔹 2. Fetch proposals for this project
      const q = query(
        collection(db, "proposals"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const list: Proposal[] = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const freelancerRef = firestoreDoc(db, "profiles", data.freelancerId);
          const freelancerDoc = await getDoc(freelancerRef);
          const freelancerData = freelancerDoc.exists()
            ? (freelancerDoc.data() as any)
            : null;

          // ✅ Merge freelancer + project data into proposal
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
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            project: {
              id: projectWithId.id,
              title: projectWithId.title,
              description: projectWithId.description,
              budget: projectWithId.budget,
              clientId: projectWithId.clientId,
              skillsRequired: projectWithId.skillsRequired || [],
            },
          } as Proposal;
        })
      );

      // ✅ Update both main + filtered lists
      setProposals(list);
      setFiltered(list);
    } catch (error) {
      console.error("❌ Error fetching project and proposals:", error);
    } finally {
      setLoadingProposals(false);
    }
  };

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const handleFilter = (status: string) => {
    setStatusFilter(status);
    if (status === "all") setFiltered(proposals);
    else setFiltered(proposals.filter((p) => p.status === status));
  };

  const handleAccept = async (proposal: Proposal) => {
    await updateDoc(firestoreDoc(db, "proposals", proposal.id), {
      status: "accepted",
      updatedAt: new Date(),
    });

    await updateDoc(firestoreDoc(db, "projects", projectId), {
      status: "in_progress",
      acceptedFreelancerId: proposal.freelancerId,
      updatedAt: new Date(),
    });

    // Reject all other proposals
    const otherProposals = proposals.filter((p) => p.id !== proposal.id);
    await Promise.all(
      otherProposals.map(async (p) =>
        updateDoc(firestoreDoc(db, "proposals", p.id), {
          status: "rejected",
          updatedAt: new Date(),
        })
      )
    );

    fetchData();
  };

  const handleReject = async (proposal: Proposal) => {
    await updateDoc(firestoreDoc(db, "proposals", proposal.id), {
      status: "rejected",
      updatedAt: new Date(),
    });
    fetchData();
  };

  // ------------------------------------
  // Render
  // ------------------------------------
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🧭 Header */}
        <ProposalsHeader project={project} router={router} />

        {/* 🔍 Filter Bar */}
        <ProposalsFilter
          status={statusFilter}
          setStatus={handleFilter}
          total={proposals.length}
          filtered={filtered.length}
        />

        {/* 📋 Proposal List */}
        <ProposalsList
          proposals={filtered}
          loading={loadingProposals}
          activeTab="received" // ✅ for client view
          t={t} // ✅ placeholder translator
          onAccept={handleAccept}
          onReject={handleReject}
          onSelect={setSelectedProposal}
        />

        {/* 🪟 Proposal Modal */}
        {selectedProposal && (
          <ProposalModal
            proposal={selectedProposal}
            onClose={() => setSelectedProposal(null)}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  );
}
