"use client";

import { BarChart3, CreditCard, Folder } from "lucide-react";
import Link from "next/link";
import AdminStatsOverview from "./components/AdminStatsOverview";
import QuickLinkCard from "./components/QuickLinkCard";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌐 Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* ✨ Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent select-none">
            Admin Dashboard
          </h1>

          {/* 🔗 Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/transactions"
              className="group flex items-center gap-2 border border-primary/20 text-primary/90 hover:text-primary bg-white hover:bg-primary/5 active:scale-[0.98] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <CreditCard className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
              Transactions
            </Link>

            <Link
              href="/admin/categories"
              className="group flex items-center gap-2 border border-primary/20 text-primary/90 hover:text-primary bg-white hover:bg-primary/5 active:scale-[0.98] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Folder className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-6" />
              Categories
            </Link>
          </div>
        </div>
      </header>

      {/* 🧭 Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* 📊 Live Overview */}
        <AdminStatsOverview />

        {/* 📈 Chart placeholder */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Monthly Overview
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-xl">
            📊 Chart integration coming soon (Recharts or Chart.js)
          </div>
        </section>

        {/* 🔗 Quick Management Sections */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLinkCard
            title="Manage Transactions"
            desc="View and verify all user payments, credit top-ups, and project funding."
            href="/admin/transactions"
          />
          <QuickLinkCard
            title="Manage Categories"
            desc="Add, edit, or remove skill categories displayed on the create project page."
            href="/admin/categories"
          />
        </section>
      </main>
    </div>
  );
}
