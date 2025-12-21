"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import Link from "next/link";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import type { Proposal, ProposalWithDetails } from "@/types/proposal";
import StatsGrid from "../StatsGrid";
import QuickActions from "../QuickActions";
import RecentProposals from "../RecentProposals";

export default function FreelancerDashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();

  // Memoize query to prevent unnecessary recalculations
  const proposalsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(requireDb(), "proposals"),
      where("freelancerId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(6)
    );
  }, [user]);

  // Use optimized query hook with caching
  const { data: proposals = [], loading: dataLoading } = useFirestoreQuery<Proposal>(
    `freelancer_proposals_${user?.uid}`,
    proposalsQuery,
    {
      enabled: !!user,
      ttl: 3 * 60 * 1000, // 3 minutes
      dependencies: [user?.uid],
    }
  );

  // Compute stats from proposals and profile
  const stats = useMemo(() => {
    if (!proposals) {
      return {
        pendingProposals: 0,
        completedProjects: 0,
        totalEarned: 0,
      };
    }

    const pending = proposals.filter((p: any) => p.status === "pending").length;
    const completedFromProfile = profile?.projectsCompleted || 0;

    return {
      pendingProposals: pending,
      completedProjects: completedFromProfile,
      totalEarned: profile?.totalEarned || 0,
    };
  }, [proposals, profile?.projectsCompleted, profile?.totalEarned]);

  // Transform proposals to include project details from cache
  const myProposals: ProposalWithDetails[] = useMemo(() => {
    if (!proposals || proposals.length === 0) {
      return [];
    }
    
    return proposals.map((p: any) => ({
      ...p,
      project: {
        id: p.projectId,
        title: p.projectTitle || p.projectId,
        description: "",
        budget: 0,
        clientId: "",
        skillsRequired: [],
        status: "",
        acceptedFreelancerId: "",
      },
    }));
  }, [proposals]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary-hover text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            {t("welcome")}, {profile?.fullName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/90 text-lg">
            {t("freelancerDashboard.subtitle") || "Find opportunities and manage your proposals"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StatsGrid stats={stats} variant="freelancer" />
        <QuickActions variant="freelancer" />
        <RecentProposals proposals={myProposals} isLoading={dataLoading} />

        {/* Profile Completion */}
        {profile && (!profile.bio || !profile.skills || profile.skills.length === 0) && (
          <div className="mt-12 bg-warning/10 border border-warning/30 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-warning mb-2">
                  {t("freelancerDashboard.completeProfile") || "Complete Your Profile"}
                </h3>
                <p className="text-text-secondary mb-4">
                  {t("freelancerDashboard.completeProfileDesc") ||
                    "Add a bio and skills to attract more clients"}
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-warning text-white font-medium rounded-lg hover:bg-warning/90 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t("common.editProfile") || "Edit Profile"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
