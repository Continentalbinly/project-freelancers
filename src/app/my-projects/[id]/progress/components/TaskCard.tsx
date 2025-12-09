"use client";

import Image from "next/image";
import { toast } from "react-toastify";

interface TaskCardProps {
  step: any;
  index: number;
  role: "freelancer" | "client" | null;
  projectStatus: string;
  onToggle: (index: number) => void;
  onApprove: (index: number) => void;
}

export default function TaskCard({
  step,
  index,
  role,
  projectStatus,
  onToggle,
  onApprove,
}: TaskCardProps) {
  const canFreelancerAct =
    role === "freelancer" && projectStatus === "in_progress" && !step.completed;
  const canClientAct =
    role === "client" &&
    projectStatus === "in_review" &&
    step.completed &&
    !step.approved;

  return (
    <div
      className={`p-5 border rounded-xl transition-all ${
        step.approved
          ? "bg-green-50 border-green-300"
          : step.completed
          ? "bg-blue-50 border-blue-300"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-800">{step.title}</h3>
        {step.approved ? (
          <span className="text-green-600 text-sm font-semibold">
            ✓ Approved
          </span>
        ) : step.completed ? (
          <span className="text-blue-600 text-sm font-medium">
            Waiting Review
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Pending</span>
        )}
      </div>

      {step.description && (
        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
      )}

      {step.deliverableUrl && (
        <div className="mb-3">
          <Image
            src={step.deliverableUrl}
            alt="Deliverable"
            width={400}
            height={250}
            className="rounded-lg object-cover border"
          />
        </div>
      )}

      {/* Freelancer Controls */}
      {canFreelancerAct && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onToggle(index)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Mark as Done
          </button>
          <button
            onClick={() =>
              toast.warn("Upload proof feature coming soon!", {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
              })
            }
            className="px-4 py-2 text-sm bg-gray-100 border rounded-lg hover:bg-gray-200 transition"
          >
            Upload Proof
          </button>
        </div>
      )}

      {/* Client Controls */}
      {canClientAct && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onApprove(index)}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() =>
              toast.warn("Request changes coming soon!", {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
              })
            }
            className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
}
