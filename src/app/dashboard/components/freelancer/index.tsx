"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import type { Proposal, ProposalWithDetails } from "@/types/proposal";
import StatsGrid from "../StatsGrid";
import QuickActions from "../QuickActions";
import RecentProposals from "../RecentProposals";

export default function FreelancerDashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();

  const [myProposals, setMyProposals] = useState<ProposalWithDetails[]>([]);
  const [stats, setStats] = useState({
    pendingProposals: 0,
    completedProjects: 0,
    totalEarned: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // 📊 Load FREELANCER dashboard data
  useEffect(() => {
    if (!user) return;

    const loadFreelancerData = async () => {
      try {
        const proposalsQ = query(
          collection(db, "proposals"),
          where("freelancerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const proposalsSnap = await getDocs(proposalsQ);
        const proposals = proposalsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Proposal[];

        const projectIds = Array.from(new Set(proposals.map((p) => p.projectId)));
        const projectDocs = await Promise.all(
          projectIds.map(async (projectId) => {
            const snap = await getDoc(doc(db, "projects", projectId));
            if (!snap.exists()) return null;
            const data = snap.data() as any;
            return {
              id: snap.id,
              title: data?.title || projectId,
              description: data?.description,
              budget: data?.budget,
              clientId: data?.clientId || "",
              skillsRequired: data?.skillsRequired,
              status: data?.status,
              acceptedFreelancerId: data?.acceptedFreelancerId,
            };
          })
        );
        const projectMap = new Map(
          projectDocs
            .filter(Boolean)
            .map((p) => [p!.id, p! as ProposalWithDetails["project"]])
        );

        const proposalsWithDetails: ProposalWithDetails[] = proposals.map((p) => ({
          ...p,
          project: projectMap.get(p.projectId) || undefined,
        }));

        const pending = proposals.filter((p) => p.status === "pending").length;
        const completedStatuses = new Set(["completed", "closed", "done", "paid"]);
        const completedFromProjects = projectDocs.filter(
          (p) => p?.acceptedFreelancerId === user.uid && completedStatuses.has(p?.status)
        ).length;
        const completedFromProfile =
          typeof profile?.projectsCompleted === "number"
            ? profile.projectsCompleted
            : typeof profile?.completedProjects === "number"
            ? profile.completedProjects
            : null;
        const completedProjects = completedFromProfile ?? completedFromProjects;

        setMyProposals(proposalsWithDetails);
        setStats({
          pendingProposals: pending,
          completedProjects,
          totalEarned: profile?.totalEarned || 0,
        });
      } catch (err) {
        console.error("Error loading freelancer data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadFreelancerData();
  }, [user, profile?.totalEarned]);

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
