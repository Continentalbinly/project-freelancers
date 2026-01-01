"use client";

import { useParams } from "next/navigation";
import ProjectProposalsPanel from "@/app/components/proposals/ProjectProposalsPanel";

export default function ProjectProposalsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <ProjectProposalsPanel projectId={projectId} variant="standalone" />
  );
}
