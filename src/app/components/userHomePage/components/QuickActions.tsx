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
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">
        {t("userHomePage.quickActions.title")}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {actions
          .filter((a) => a.show)
          .map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="flex items-center p-4 rounded-lg border border-border hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mr-4 text-2xl">
                {a.icon}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{a.title}</h3>
                <p className="text-sm text-text-secondary">{a.desc}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
