"use client";

import { useState } from "react";
import Link from "next/link";

export default function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Mobile accordion header */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full md:hidden text-left font-semibold text-text-primary py-2"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Section title for desktop */}
      <h3 className="hidden md:block font-semibold text-text-primary mb-3">
        {title}
      </h3>

      <ul
        className={`space-y-2 text-sm text-text-secondary transition-all duration-200 ${
          open ? "block" : "hidden md:block"
        }`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
