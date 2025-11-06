"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Users } from "lucide-react";

export default function AdminSubHeader({
  title = "Manage Users",
}: {
  title?: string;
  desc?: string;
}) {
  const router = useRouter();
  const { id } = useParams();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/panel/${id}`)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> {title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
