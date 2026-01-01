"use client";

interface ProposalsFilterProps {
  status: string;
  setStatus: (status: string) => void;
  total: number;
  filtered: number;
}

export default function ProposalsFilter({
  status,
  setStatus,
  total,
  filtered,
}: ProposalsFilterProps) {
  return (
    <div className="rounded-xl shadow-sm border border-border p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium  ">
            Filter by status:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        <div className="text-sm text-text-secondary">
          {filtered} of {total} proposals
        </div>
      </div>
    </div>
  );
}

