"use client";

import Link from "next/link";
import { Plus, MessageSquare, Briefcase, Send } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface QuickActionsProps {
  variant: "client" | "freelancer";
}

export default function QuickActions({ variant }: QuickActionsProps) {
  const { t } = useTranslationContext();

  if (variant === "client") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Post New Project */}
        <Link
          href="/projects/create"
          className="bg-gradient-to-br from-primary to-primary-light hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.postProject") || "Post New Project"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.postProjectDesc") ||
                  "Get started by posting your first project"}
              </p>
            </div>
            <Plus className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* Browse Freelancers */}
        <Link
          href="/freelancers"
          className="bg-gradient-to-br from-secondary to-secondary-light hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.browseFfreelancers") || "Browse Freelancers"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.browseFfreelancersDesc") ||
                  "Find and hire talented freelancers"}
              </p>
            </div>
            <MessageSquare className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>
    );
  }

  // Freelancer variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* Browse Opportunities */}
      <Link
        href="/projects"
        className="bg-gradient-to-br from-secondary to-secondary-light hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.browseOpportunities") || "Browse Opportunities"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.browseOpportunitiesDesc") ||
                "Find and apply for new projects"}
            </p>
          </div>
          <Briefcase className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </Link>

      {/* View My Proposals */}
      <Link
        href="/proposals?tab=submitted"
        className="bg-gradient-to-br from-primary to-primary-light hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.myProposals") || "My Proposals"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.myProposalsDesc") ||
                "Track your submitted proposals"}
            </p>
          </div>
          <Send className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
