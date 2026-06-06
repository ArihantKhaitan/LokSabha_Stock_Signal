"use client";
import { motion } from "framer-motion";

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
}

export default function TextShimmer({ children, className = "", duration = 2.5 }: TextShimmerProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #8B949E 0%, #E6EDF3 30%, #FF6B35 50%, #E6EDF3 70%, #8B949E 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
      animate={{ backgroundPosition: ["200% center", "-200% center"] }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}
