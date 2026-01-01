"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { UserRole } from "./utils";
import type { Project } from "@/types/project";
import { collection, query, where, getDocs } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import Button from "@/app/components/ui/Button";
import { Clock, FileText, CheckCircle } from "lucide-react";
import ProjectProposalsPanel from "@/app/components/proposals/ProjectProposalsPanel";

interface StepOpenProps {
  project: Project;
  role: UserRole;
}

export default function StepOpen({ project, role }: StepOpenProps) {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();
  const [hasProposal, setHasProposal] = useState<boolean | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== "freelancer") {
      setLoading(false);
      return;
    }

    const checkProposal = async () => {
      try {
        const db = requireDb();
        const proposalsQuery = query(
          collection(db, "proposals"),
          where("projectId", "==", project.id),
          where("freelancerId", "==", user.uid)
        );
        const snap = await getDocs(proposalsQuery);
        if (!snap.empty) {
          setHasProposal(true);
          setProposalId(snap.docs[0].id);
        } else {
          setHasProposal(false);
        }
      } catch {
        setHasProposal(false);
      } finally {
        setLoading(false);
      }
    };

    checkProposal();
  }, [user, project.id, role]);

  if (role === "client") {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-text-primary">
            {t("myProjects.stepper.step1.title") || "Project is Open"}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("myProjects.stepper.step1.desc") ||
              "Waiting for freelancers to submit proposals"}
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <ProjectProposalsPanel
            projectId={project.id}
            variant="embedded"
            onAfterDecision={() => {
              // Optionally refresh project data or trigger a callback
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (role === "freelancer") {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      );
    }

    if (hasProposal) {
      return (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-text-primary">
              {t("myProjects.stepper.step1.proposalSubmitted") ||
                "Proposal Submitted"}
            </h2>
            <p className="text-text-secondary mb-6">
              {t("myProjects.stepper.step1.waitingForClient") ||
                "Your proposal has been submitted. Waiting for the client to review and accept."}
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/proposals/${proposalId}`)}
              className="w-full sm:w-auto"
            >
              {t("myProjects.stepper.step1.viewProposal") ||
                "View My Proposal"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-text-primary">
            {t("myProjects.stepper.step1.projectOpen") || "Project is Open"}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("myProjects.stepper.step1.submitProposal") ||
              "Submit a proposal to get started on this project"}
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/projects/${project.id}/propose`)}
            className="w-full sm:w-auto"
          >
            {t("myProjects.stepper.step1.submitProposalButton") ||
              "Submit Proposal"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
