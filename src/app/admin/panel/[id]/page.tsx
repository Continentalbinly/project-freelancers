"use client";

import { BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "./components/AdminHeader";
import AdminStatsOverview from "./components/AdminStatsOverview";
import QuickLinkCard from "./components/QuickLinkCard";
import { useParams } from "next/navigation";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const userId = id || user?.uid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* 📊 Overview */}
        <AdminStatsOverview />

        {/* 📈 Chart Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Monthly Overview
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-xl">
            📊 Chart integration coming soon (Recharts or Chart.js)
          </div>
        </section>

        {/* 🔗 Quick Management */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLinkCard
            title="Manage Transactions"
            desc="View and verify all user payments, credit top-ups, and project funding."
            href={`/admin/panel/${userId}/transactions`}
          />
          <QuickLinkCard
            title="Manage Categories"
            desc="Add, edit, or remove skill categories displayed on the create project page."
            href={`/admin/panel/${userId}/categories`}
          />
        </section>
      </main>
    </div>
  );
}
