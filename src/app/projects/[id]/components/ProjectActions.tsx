"use client";
import Link from "next/link";

export default function ProjectActions({ project, user, t }: any) {
  const isOwner = user?.uid === project.clientId;

  /** 🧩 Only allow if userType includes 'freelancer' */
  const isFreelancer =
    Array.isArray(user?.userType) && user.userType.includes("freelancer");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("projectDetail.actions")}
      </h3>
      <div className="space-y-3">
        {/* ✅ Submit Proposal — only freelancer and not owner */}
        {user && project.status === "open" && !isOwner && isFreelancer && (
          <Link
            href={`/projects/${project.id}/propose`}
            className="btn btn-primary w-full"
          >
            {t("projectDetail.submitProposal")}
          </Link>
        )}

        {/* 🚫 Cannot propose own project */}
        {user && project.status === "open" && isOwner && (
          <div className="p-3 bg-background-secondary rounded-lg border border-border">
            <p className="text-sm text-text-secondary text-center">
              {t("projectDetail.ownProjectMessage") ||
                "You cannot submit proposals to your own project"}
            </p>
          </div>
        )}

        {/* 🚫 Not a freelancer */}
        {user && project.status === "open" && !isOwner && !isFreelancer && (
          <div className="p-3 bg-background-secondary rounded-lg border border-border">
            <p className="text-sm text-text-secondary text-center">
              {t("projectDetail.onlyFreelancerMessage") ||
                "Only freelancers can submit proposals"}
            </p>
          </div>
        )}

        {/* ✏️ Edit Project — for owner */}
        {user && isOwner && (
          <Link
            href={`/projects/${project.id}/edit`}
            className="btn btn-outline w-full"
          >
            {t("projectDetail.editProject")}
          </Link>
        )}

        {/* 🔙 Back to projects */}
        <Link href="/" className="btn btn-outline w-full">
          {t("common.back2home")}
        </Link>
      </div>
    </div>
  );
}
