"use client";

import { User, Mail, Shield } from "lucide-react";
import type { UserProfile } from "../page";

export default function UserCard({ user }: { user: UserProfile }) {
  const roles = user.role || "—";

  const statusColor = user.isActive ? "text-green-600" : "text-red-600";

  return (
    <div className="border border-border rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h3 className="font-semibold text-text-primary">{user.fullName}</h3>
          <p className="text-sm text-text-muted flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> {user.email || "No email"}
          </p>
        </div>
      </div>

      <div className="mt-3 text-sm text-text-secondary space-y-1">
        <p>
          <span className="font-medium text-text-secondary">Role:</span> {roles}
        </p>
        <p>
          <span className="font-medium text-text-secondary">Plan:</span>{" "}
          {user.plan || "—"}
        </p>
        <p>
          <span className="font-medium text-text-secondary">Status:</span>{" "}
          <span className={statusColor}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </p>
      </div>

      <div className="mt-3 border-t pt-2 text-xs text-text-muted flex items-center justify-between">
        <p>
          {user.createdAt
            ? new Date(user.createdAt.toDate()).toLocaleDateString()
            : "—"}
        </p>
        {roles === "admin" && (
          <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
            <Shield className="w-3 h-3" /> Admin
          </span>
        )}
      </div>
    </div>
  );
}
