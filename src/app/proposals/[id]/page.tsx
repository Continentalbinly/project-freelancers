"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import ProposalMain from "./components/ProposalMain";
import ProposalSidebar from "./components/ProposalSidebar";
import ProposalImageModal from "./components/ProposalImageModal";
import ProposalSkeleton from "./components/ProposalSkeleton";

interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  proposedBudget: number;
  proposedRate: number;
  estimatedDuration: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  workSamples?: any[];
  workPlan?: string;
  milestones?: any[];
  availability?: string;
  communicationPreferences?: string;
  createdAt: any;
  updatedAt: any;
  processedAt?: any;
  processedBy?: string;
  project?: any | null;
  freelancer?: any | null;
  client?: any | null;
}

export default function ProposalDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslationContext();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user && params.id) fetchProposalDetails();
  }, [user, params.id]);

  const fetchProposalDetails = async () => {
    try {
      setLoadingProposal(true);
      if (!user || !params.id) return;

      const proposalDocRef = doc(db, "proposals", params.id as string);
      const proposalDoc = await getDoc(proposalDocRef);
      if (!proposalDoc.exists()) return router.push("/proposals");

      const proposalData = proposalDoc.data();
      const projectDoc = await getDoc(
        doc(db, "projects", proposalData.projectId)
      );
      const freelancerDoc = await getDoc(
        doc(db, "profiles", proposalData.freelancerId)
      );

      let clientData = null;
      let projectData = projectDoc.exists() ? projectDoc.data() : null;
      if (projectData) {
        const clientDoc = await getDoc(
          doc(db, "profiles", projectData.clientId)
        );
        clientData = clientDoc.exists() ? clientDoc.data() : null;
      }

      setProposal({
        id: proposalDoc.id,
        ...proposalData,
        project: projectData,
        freelancer: freelancerDoc.exists() ? freelancerDoc.data() : null,
        client: clientData,
      } as Proposal);
    } catch (err) {
      //console.error("Error fetching proposal:", err);
    } finally {
      setLoadingProposal(false);
    }
  };

  if (loadingProposal) return <ProposalSkeleton t={t} />;
  if (!proposal) return <div>{t("proposals.notFound")}</div>;

  const isClient = user?.uid === proposal.project?.clientId;
  const isFreelancer = user?.uid === proposal.freelancerId;

  return (
    <div className="rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProposalMain
            proposal={proposal}
            t={t}
            setSelectedImage={setSelectedImage}
          />
          <ProposalSidebar
            proposal={proposal}
            t={t}
            isClient={isClient}
            isFreelancer={isFreelancer}
          />
        </div>

        <ProposalImageModal
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      </div>
    </div>
  );
}
