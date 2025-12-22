"use client";

import TaskCard from "./TaskCard";
import type { Project } from "@/types/project";

interface TaskListProps {
  project: Project;
  role: "freelancer" | "client" | null;
  onToggle: (i: number) => void;
  onApprove: (i: number) => void;
}

export default function TaskList({
  project,
  role,
  onToggle,
  onApprove,
}: TaskListProps) {
  if (!project.progress || project.progress.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-6">
        No progress tasks yet for this project.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {project.progress.map((step: NonNullable<Project["progress"]>[number], i: number) => (
        <TaskCard
          key={i}
          step={step}
          index={i}
          role={role}
          projectStatus={project.status}
          onToggle={onToggle}
          onApprove={onApprove}
        />
      ))}
    </div>
  );
}
