"use client";

import Link from "next/link";
import { Briefcase, Send, Layers, ShoppingBag, FolderKanban, Users } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface QuickActionsProps {
  variant: "client" | "freelancer";
}

export default function QuickActions({ variant }: QuickActionsProps) {
  const { t } = useTranslationContext();

  if (variant === "client") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Manage Projects */}
        <Link
          href="/projects/manage"
          className="bg-gradient-to-br from-primary to-primary-hover hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.manageProjects") || "Manage Projects"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.manageProjectsDesc") || "View, edit, and track your projects"}
              </p>
            </div>
            <FolderKanban className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* My Orders (Catalog purchases) */}
        <Link
          href="/orders"
          className="bg-gradient-to-br from-secondary to-secondary-hover hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.myOrders") || "My Orders"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.myOrdersDesc") || "Track catalog orders and delivery progress"}
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* My Projects */}
        <Link
          href="/my-projects"
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.myProjects") || "My Projects"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.myProjectsDesc") ||
                  "Track your posted projects and progress"}
              </p>
            </div>
            <Briefcase className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* Hire Freelancer */}
        <Link
          href="/gigs"
          className="bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.hireFreelancer") || "Hire Freelancer"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.hireFreelancerDesc") || "Find and hire talented freelancers"}
              </p>
            </div>
            <Users className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>
    );
  }

  // Freelancer variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Browse Opportunities */}
      <Link
        href="/projects"
        className="bg-gradient-to-br from-secondary to-secondary-hover hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
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

      {/* My Projects (Project-based work) */}
      <Link
        href="/my-projects"
        className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.myProjects") || "My Projects"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.myProjectsDesc") ||
                "Track accepted projects and deliverables"}
            </p>
          </div>
          <FolderKanban className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </Link>

      {/* My Services (Catalog) */}
      <Link
        href="/catalog/manage"
        className="bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.myServices") || "My Services"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.myServicesDesc") || "Manage your gigs and packages"}
            </p>
          </div>
          <Layers className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </Link>

      {/* Orders */}
      <Link
        href="/orders"
        className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.orders") || "Orders"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.ordersDesc") || "Track catalog orders and delivery"}
            </p>
          </div>
          <ShoppingBag className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
