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
        className="group relative bg-white/80 border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between backdrop-blur-sm hover:shadow-lg transition-all duration-500"
      >
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>

        <div className="mt-5 flex items-center text-primary font-medium text-sm">
          Go to page
          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
