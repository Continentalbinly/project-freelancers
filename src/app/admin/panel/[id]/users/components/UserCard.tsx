"use client";

import { User, Mail, Shield } from "lucide-react";
import type { UserProfile } from "../page";

export default function UserCard({ user }: { user: UserProfile }) {
  const roles = Array.isArray(user.userType)
    ? user.userType.join(", ")
    : user.userType || "—";

  const statusColor = user.isActive ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> {user.email || "No email"}
          </p>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium text-gray-600">Role:</span> {roles}
        </p>
        <p>
          <span className="font-medium text-gray-600">Plan:</span>{" "}
          {user.plan || "—"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Status:</span>{" "}
          <span className={statusColor}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </p>
      </div>

      <div className="mt-3 border-t pt-2 text-xs text-gray-500 flex items-center justify-between">
        <p>
          {user.createdAt
            ? new Date(user.createdAt.toDate()).toLocaleDateString()
            : "—"}
        </p>
        {roles.includes("admin") && (
          <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
            <Shield className="w-3 h-3" /> Admin
          </span>
        )}
      </div>
    </div>
  );
}
