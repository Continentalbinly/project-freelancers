"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CreditCard, Folder, Menu, X, Shield, Users } from "lucide-react";

export default function AdminHeader() {
  const { id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    {
      label: "Users",
      href: `/admin/panel/${id}/users`,
      icon: Users,
    },
    {
      label: "Transactions",
      href: `/admin/panel/${id}/transactions`,
      icon: CreditCard,
    },
    {
      label: "Categories",
      href: `/admin/panel/${id}/categories`,
      icon: Folder,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* 🏷️ Title */}
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent select-none">
            Admin Panel
          </h1>
        </div>

        {/* 🧭 Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-3">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center gap-2 border border-primary/20 text-primary/90 hover:text-primary bg-white hover:bg-primary/5 active:scale-[0.98] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
              {label}
            </Link>
          ))}
        </nav>

        {/* 📱 Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <nav className="flex flex-col items-start px-4 py-3 space-y-2">
            {links.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 w-full text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
