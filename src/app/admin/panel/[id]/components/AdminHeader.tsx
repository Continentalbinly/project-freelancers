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
    <header className="sticky top-0 z-40 supports-[backdrop-filter]:backdrop-blur-sm border-b border-border bg-background shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* 🏷️ Title */}
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent select-none">
            Admin Panel
          </h1>
        </div>

        {/* 🧭 Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-3">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center gap-2 border border-border text-text-primary hover:text-primary hover:border-primary hover:bg-primary/5 active:scale-[0.98] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
              {label}
            </Link>
          ))}
        </nav>

        {/* 📱 Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 rounded-md border border-border text-text-primary transition bg-background"
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-text-primary" />
          ) : (
            <Menu className="w-5 h-5 text-text-primary" />
          )}
        </button>
      </div>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border supports-[backdrop-filter]:backdrop-blur-sm bg-background">
          <nav className="flex flex-col items-start px-4 py-3 space-y-2">
            {links.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 w-full text-sm font-medium text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
