"use client";
import StepInReviewClient from "./StepInReviewClient"; // rename your existing client file
import StepInReviewFreelancer from "./StepInReviewFreelancer";
import type { UserRole } from "./utils";
import type { Project } from "@/types/project";

interface StepInReviewProps {
  project: Project;
  role: UserRole;
}

export default function StepInReview({
  project,
  role,
}: StepInReviewProps) {
  if (role === "client") {
    return <StepInReviewClient project={project} />;
  }

  if (role === "freelancer") {
    return <StepInReviewFreelancer project={project} />;
  }

  return (
    <div className="text-center py-10 text-gray-400">
      <p>Unknown role — cannot display project step.</p>
    </div>
  );
}
