"use client";

import { FolderOpen, TrendingUp, Send, Briefcase, DollarSign } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ClientStatsProps {
  stats: {
    activeProjects: number;
    completedProjects: number;
    credit: number;
  };
  variant?: "client";
}

interface FreelancerStatsProps {
  stats: {
    pendingProposals: number;
    completedProjects: number;
    totalEarned: number;
  };
  variant: "freelancer";
}

type StatsGridProps = ClientStatsProps | FreelancerStatsProps;

export default function StatsGrid(props: StatsGridProps) {
  const { t } = useTranslationContext();
  const variant = props.variant || "client";

  if (variant === "freelancer") {
    const { stats } = props as FreelancerStatsProps;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Pending Proposals */}
        <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">
                {t("freelancerDashboard.pendingProposals") || "Pending Proposals"}
              </p>
              <p className="text-3xl font-bold text-secondary">
                {stats.pendingProposals}
              </p>
            </div>
            <Send className="w-12 h-12 text-secondary/20" />
          </div>
        </div>

        {/* Completed Projects */}
        <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">
                {t("freelancerDashboard.completedProjects") ||
                  t("dashboard.completedProjects") ||
                  "Completed Projects"}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completedProjects}
              </p>
            </div>
            <Briefcase className="w-12 h-12 text-green-600/20" />
          </div>
        </div>

        {/* Total Earned */}
        <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">
                {t("freelancerDashboard.totalEarned") || "Total Earned"}
              </p>
              <p className="text-3xl font-bold text-success">
                {(stats.totalEarned || 0).toLocaleString()} {t("common.currncyLAK")}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-success/20" />
          </div>
        </div>
      </div>
    );
  }

  // Client variant
  const { stats } = props as ClientStatsProps;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Active Projects */}
      <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">
              {t("dashboard.activeProjects") || "Active Projects"}
            </p>
            <p className="text-3xl font-bold text-primary">
              {stats.activeProjects}
            </p>
          </div>
          <FolderOpen className="w-12 h-12 text-primary/20" />
        </div>
      </div>

      {/* Completed Projects */}
      <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">
              {t("dashboard.completedProjects") || "Completed"}
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats.completedProjects}
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-600/20" />
        </div>
      </div>

      {/* Account Balance */}
      <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">
              {t("dashboard.credits") || "Account Credit"}
            </p>
            <p className="text-3xl font-bold text-secondary">
              {stats.credit?.toLocaleString()} {t("common.credits")}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-secondary/40" />
        </div>
      </div>
    </div>
  );
}
