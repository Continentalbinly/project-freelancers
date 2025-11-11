"use client";
import {
  Backpack,
  MessageCircle,
  User,
  UserCheck,
  PlusCircle,
  FolderOpen,
  Inbox,
} from "lucide-react";
import Link from "next/link";

export default function QuickActions({ profile, t }: any) {
  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";

  const actions = [
    ...(isFreelancer ? freelancerActions(t) : []),
    ...(isClient ? clientActions(t) : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        {t("dashboard.quickActions.title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {actions.map((item, i) => (
          <ActionCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

function ActionCard({ href, label, icon: Icon }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all text-sm sm:text-base"
    >
      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
      <span className="font-medium text-text-primary line-clamp-1">
        {label}
      </span>
    </Link>
  );
}

function freelancerActions(t: any) {
  return [
    {
      href: "/projects",
      label: t("dashboard.quickActions.findProjects.title"),
      icon: Backpack,
    },
    {
      href: "/profile",
      label: t("dashboard.quickActions.updateProfile.title"),
      icon: User,
    },
    {
      href: "/proposals",
      label: t("dashboard.quickActions.myProposals.title"),
      icon: UserCheck,
    },
    {
      href: "/messages",
      label: t("dashboard.quickActions.messages.title"),
      icon: MessageCircle,
    },
  ];
}

function clientActions(t: any) {
  return [
    {
      href: "/projects/create",
      label: t("dashboard.quickActions.postProject.title"),
      icon: PlusCircle,
    },
    {
      href: "/projects/manage",
      label: t("dashboard.quickActions.manageProjects.title"),
      icon: FolderOpen,
    },
    {
      href: "/proposals?tab=received",
      label: t("dashboard.quickActions.reviewProposals.title"),
      icon: Inbox,
    },
    {
      href: "/messages",
      label: t("dashboard.quickActions.messagesClient.title"),
      icon: MessageCircle,
    },
  ];
}
