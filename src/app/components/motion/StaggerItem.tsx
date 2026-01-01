"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StaggerItemProps {
  children: ReactNode;
  y?: number;
  className?: string;
}

export default function StaggerItem({
  children,
  y = 16,
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

