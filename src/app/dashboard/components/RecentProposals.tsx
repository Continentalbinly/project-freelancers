"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { formatLAK, formatHourlyRate } from "@/service/currencyUtils";
import type { Proposal, ProposalWithDetails } from "@/types/proposal";

interface RecentProposalsProps {
  proposals: Array<ProposalWithDetails | Proposal>;
  isLoading: boolean;
}

export default function RecentProposals({
  proposals,
  isLoading,
}: RecentProposalsProps) {
  const { t } = useTranslationContext();
  const router = useRouter();
  const [projectTitles, setProjectTitles] = useState<Record<string, string>>({});

  // Fetch project titles for all proposals
  useEffect(() => {
    const fetchProjectTitles = async () => {
      const titles: Record<string, string> = {};
      
      for (const proposal of proposals) {
        const projectId = proposal.projectId;
        if (projectId && !titles[projectId]) {
          try {
            const projectDoc = await getDoc(doc(requireDb(), "projects", projectId));
            if (projectDoc.exists()) {
              titles[projectId] = projectDoc.data().title || projectId;
            } else {
              titles[projectId] = projectId;
            }
          } catch {
            titles[projectId] = projectId;
          }
        }
      }
      
      setProjectTitles(titles);
    };

    if (proposals.length > 0) {
      fetchProjectTitles();
    }
  }, [proposals]);

  return (
    <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {t("freelancerDashboard.recentProposals") || "Recent Proposals"}
        </h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/proposals?tab=submitted");
          }}
          className="text-secondary hover:text-secondary-dark font-medium cursor-pointer"
        >
          {t("common.viewAll")} →
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-background rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const projectTitle = 
              projectTitles[proposal.projectId] ||
              ("project" in proposal && proposal.project
                ? proposal.project.title
                : null) ||
              proposal.projectId;
            const budget = formatLAK(proposal.proposedBudget || 0);

            return (
              <div
                key={proposal.id}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/proposals/${proposal.id}`);
                }}
                className="flex items-center justify-between p-4 border border-border bg-background rounded-lg transition-colors cursor-pointer hover:border-primary/50"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/proposals/${proposal.id}`);
                  }
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{projectTitle}</h3>
                  <p className="text-text-secondary text-sm">
                    {proposal.estimatedDuration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">{budget}</p>
                  <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                    {proposal.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">
            {t("freelancerDashboard.noProposals") || "No proposals yet"}
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              router.push("/projects");
            }}
            className="btn bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-dark cursor-pointer"
          >
            {t("freelancerDashboard.browseNow") || "Browse Opportunities"}
          </button>
        </div>
      )}
    </div>
  );
}
