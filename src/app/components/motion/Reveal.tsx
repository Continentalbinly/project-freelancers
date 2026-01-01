"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
}

export default function Reveal({
  children,
  delay = 0,
  y = 16,
  once = true,
  className,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ 
        once, 
        margin: "0px 0px -20% 0px", // Smaller margin on mobile, triggers earlier
        amount: 0.3 // Trigger when 30% of element is visible
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

