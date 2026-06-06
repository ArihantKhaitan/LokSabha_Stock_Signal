"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay?: number;
}

export default function StatCard({ label, value, sub, color = "#FF6B35", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="glass glass-shimmer rounded-2xl p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="text-3xl font-bold tracking-tight mb-1 font-mono"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold text-lss-secondary uppercase tracking-widest">
        {label}
      </div>
      {sub && (
        <div className="text-xs text-lss-tertiary mt-1 truncate">{sub}</div>
      )}
    </motion.div>
  );
}
