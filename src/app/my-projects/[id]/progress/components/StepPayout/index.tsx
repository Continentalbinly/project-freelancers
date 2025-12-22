"use client";

import StepPayoutClient from "./StepPayoutClient";
import StepPayoutFreelancer from "./StepPayoutFreelancer";
import type { UserRole } from "../utils";
import type { Project } from "@/types/project";

interface StepPayoutProps {
  project: Project;
  role: UserRole;
}

export default function StepPayout({
  project,
  role,
}: StepPayoutProps) {
  if (role === "client") return <StepPayoutClient project={project} />;
  if (role === "freelancer") return <StepPayoutFreelancer project={project} />;

  return (
    <div className="text-center py-10 text-gray-400">
      <p>Unknown role — cannot display payout step.</p>
    </div>
  );
}
