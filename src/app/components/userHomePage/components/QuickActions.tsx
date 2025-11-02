"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function QuickActions({ profile }: any) {
  const { t } = useTranslationContext();
  const type = profile?.userType;
  const isClient = Array.isArray(type)
    ? type.includes("client")
    : type === "client";
  const isFreelancer = Array.isArray(type)
    ? type.includes("freelancer")
    : type === "freelancer";

  const actions = [
    {
      icon: "📊",
      title: t("userHomePage.quickActions.dashboard.title"),
      desc: t("userHomePage.quickActions.dashboard.description"),
      href: "/dashboard",
      show: true,
    },
    {
      icon: "🔍",
      title: t("userHomePage.quickActions.findProjects.title"),
      desc: t("userHomePage.quickActions.findProjects.description"),
      href: "/projects",
      show: isFreelancer,
    },
    {
      icon: "📝",
      title: t("userHomePage.quickActions.postProject.title"),
      desc: t("userHomePage.quickActions.postProject.description"),
      href: "/projects/create",
      show: isClient,
    },
    {
      icon: "📋",
      title: t("userHomePage.quickActions.myProposals.title"),
      desc: t("userHomePage.quickActions.myProposals.description"),
      href: "/proposals",
      show: isFreelancer,
    },
    {
      icon: "📁",
      title: t("userHomePage.quickActions.manageProjects.title"),
      desc: t("userHomePage.quickActions.manageProjects.description"),
      href: "/projects/manage",
      show: isClient,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-5 sm:p-6">
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
        {t("userHomePage.quickActions.title")}
      </h2>

      {/* Responsive layout: scroll on mobile, grid on tablet+ */}
      <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible pb-2 sm:pb-0">
        {actions
          .filter((a) => a.show)
          .map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="min-w-[75%] sm:min-w-0 flex items-center flex-shrink-0 sm:flex-shrink p-3 sm:p-4 rounded-lg border border-border bg-white hover:shadow-md transition-all"
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-light rounded-lg flex items-center justify-center mr-3 sm:mr-4 text-xl sm:text-2xl">
                {a.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <h3 className="font-medium text-text-primary text-sm sm:text-base">
                  {a.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-tight">
                  {a.desc}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
