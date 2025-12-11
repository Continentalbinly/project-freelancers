"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickLinkCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Link
        href={href}
        aria-label={title}
        className="group relative border border-border rounded-md shadow-sm p-6 flex flex-col justify-between supports-[backdrop-filter]:backdrop-blur-sm hover:shadow-lg hover:bg-background transition-all duration-500 bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
        </div>

        <div className="mt-5 inline-flex items-center gap-1 text-primary font-medium text-sm transition-all group-hover:gap-1.5">
          Go to page
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
