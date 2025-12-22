"use client";

import ProposalStatusBadge from "./ProposalStatusBadge";
import ProposalImage from "@/app/utils/proposalImageHandler";
import {
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { formatEarnings } from "@/service/currencyUtils";
import type { ProposalWithDetails, Milestone, WorkSample } from "@/types/proposal";

interface ProposalMainProps {
  proposal: ProposalWithDetails;
  t: (key: string) => string;
  setSelectedImage: (url: string | null) => void;
}

export default function ProposalMain({ proposal, t, setSelectedImage }: ProposalMainProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      {/* ==== Project Info ==== */}
      <section className="border border-border bg-background p-6 hover:shadow-sm transition-all">
        <header className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-xl font-semibold mb-1">
              {proposal.project?.title || "Untitled Project"}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {proposal.project?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {proposal.project?.skillsRequired?.map(
                (skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-md"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="text-right min-w-[120px]">
            <div className="text-xl font-bold text-primary">
              {formatEarnings(proposal.proposedBudget)}
            </div>
            <p className="text-xs text-text-secondary">
              {t("proposals.detail.proposedBudget")}
            </p>
          </div>
        </header>

        <ProposalStatusBadge status={proposal.status} t={t} />
      </section>

      {/* ==== Cover Letter ==== */}
      {proposal.coverLetter && (
        <section className="border border-border bg-background backdrop-blur rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            {t("proposals.detail.coverLetter")}
          </h3>
          <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed border-l-2 border-primary/20 pl-4">
            {proposal.coverLetter}
          </p>
        </section>
      )}

      {/* ==== Milestones ==== */}
      {proposal.milestones && proposal.milestones.length > 0 && (
        <section className="border border-border bg-background backdrop-blur rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FlagIcon className="w-5 h-5 text-secondary" />
            {t("proposals.detail.milestones")}{" "}
            <span className="text-xs text-text-secondary">
              ({proposal.milestones.length})
            </span>
          </h3>

          <ul className="divide-y divide-border">
            {proposal.milestones.map((m: Milestone, index: number) => {
              const dueDateStr = m.dueDate instanceof Date 
                ? m.dueDate.toLocaleDateString()
                : typeof m.dueDate === 'string' 
                ? m.dueDate 
                : 'N/A';
              return (
                <li key={index} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm mb-1">
                        {m.title}
                      </p>
                      {m.description && (
                        <p className="text-xs text-text-secondary leading-snug">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {t("proposals.detail.due")}: {dueDateStr}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ==== Work Samples ==== */}
      {proposal.workSamples && proposal.workSamples.length > 0 && (
        <section className="border border-border bg-background backdrop-blur rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-secondary" />
            {t("proposals.detail.workSamples")}
            <span className="text-xs text-text-secondary font-normal">
              ({proposal.workSamples.length})
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {proposal.workSamples.map((sample: WorkSample, index: number) => (
              <div
                key={index}
                onClick={() => setSelectedImage(sample.url)}
                className="group relative overflow-hidden rounded-md border border-border bg-background-secondary hover:border-primary/40 transition-all cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <ProposalImage
                    src={sample.url}
                    alt={sample.title}
                    type="work-sample"
                    proposalTitle={sample.title}
                    size="lg"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 w-full bg-linear-to-t from-black/60 to-transparent px-2 py-1">
                  <p className="text-[11px] text-white truncate text-center">
                    {sample.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
