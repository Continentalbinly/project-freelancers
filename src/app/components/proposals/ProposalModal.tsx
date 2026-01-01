"use client";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import type { ProposalWithDetails } from "@/types/proposal";

interface ProposalModalProps {
  proposal: ProposalWithDetails;
  onClose: () => void;
  onAccept: (proposal: ProposalWithDetails) => void;
  onReject: (proposal: ProposalWithDetails) => void;
}

export default function ProposalModal({
  proposal,
  onClose,
  onAccept,
  onReject,
}: ProposalModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold  ">
            Proposal from {proposal.freelancer?.fullName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={proposal.freelancer?.avatar}
              alt={proposal.freelancer?.fullName}
              name={proposal.freelancer?.fullName}
              size="lg"
            />
            <div>
              <h4 className="font-medium">{proposal.freelancer?.fullName}</h4>
              <p className="text-sm text-text-secondary">
                Rating: {proposal.freelancer?.rating || 0}/5 ⭐
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-secondary">Budget:</span>
              <p className="font-semibold text-primary">
                {formatEarnings(proposal.proposedBudget)}
              </p>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Duration:</span>
              <p className="font-semibold">{proposal.estimatedDuration}</p>
            </div>
          </div>

          <div>
            <span className="text-sm text-text-secondary">Cover Letter:</span>
            <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap">
              {proposal.coverLetter}
            </p>
          </div>

          {proposal.status === "pending" && (
            <div className="flex gap-2 pt-4 border-t border-border">
              <button
                onClick={() => {
                  onAccept(proposal);
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 inline mr-2" /> Accept
              </button>
              <button
                onClick={() => {
                  onReject(proposal);
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                <XMarkIcon className="w-4 h-4 inline mr-2" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

