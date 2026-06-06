"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn, fmtDate, sentimentClass, intensityBar } from "@/lib/utils";
import ReturnChips from "@/components/ReturnChips";
import { SECTOR_META } from "@/lib/sectors";
import type { EventSignal } from "@/types";

interface EventCardProps {
  signal: EventSignal;
  defaultOpen?: boolean;
}

export default function EventCard({ signal, defaultOpen = false }: EventCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { event: ev } = signal;
  const color = SECTOR_META[ev.sector]?.color ?? "#FF6B35";

  return (
    <motion.div
      className="glass glass-shimmer rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      layout
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        {/* Sector color bar */}
        <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-mono text-lss-tertiary">{fmtDate(ev.date)}</span>
            <span className={sentimentClass(ev.sentiment)}>{ev.sentiment}</span>
            {ev.is_bill_passage && (
              <span className="badge-positive">✓ Passed</span>
            )}
          </div>
          <p className="text-[13px] font-semibold text-lss-text leading-snug line-clamp-2">
            {ev.topic}
          </p>
          <p className="text-[11px] text-lss-tertiary mt-0.5">{ev.session}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {/* Intensity bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-lss-tertiary">Sig.</span>
            <span
              className="text-[11px] font-bold font-mono"
              style={{ color }}
            >
              {ev.significance_score}/10
            </span>
          </div>
          {signal.ret_t1 != null && (
            <ReturnChips t1={signal.ret_t1} t5={signal.ret_t5} compact />
          )}
          <span className="text-lss-tertiary text-lg">{open ? "▴" : "▾"}</span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4 pt-0"
              style={{ borderTop: `1px solid rgba(48,54,61,0.6)` }}
            >
              <p className="text-[13px] text-lss-secondary mt-3 mb-3 leading-relaxed">
                {ev.summary}
              </p>

              <div className="flex flex-wrap gap-3 items-center mb-3">
                <ReturnChips
                  tm1={signal.ret_tm1}
                  t1={signal.ret_t1}
                  t2={signal.ret_t2}
                  t5={signal.ret_t5}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-[11px]">
                <span className="text-lss-tertiary">
                  Bill: <span className="text-lss-secondary font-medium">{ev.bill}</span>
                </span>
                {signal.signal_strength != null && (
                  <span className="text-lss-tertiary">
                    Signal strength:{" "}
                    <span
                      className="font-bold font-mono"
                      style={{ color: signal.signal_strength >= 0 ? "#3FB950" : "#F85149" }}
                    >
                      {signal.signal_strength >= 0 ? "+" : ""}
                      {(signal.signal_strength * 100).toFixed(3)}
                    </span>
                  </span>
                )}
                <span className="text-lss-tertiary">
                  Avg. daily ret:{" "}
                  <span className="font-mono text-lss-secondary">
                    {signal.avg_daily_ret >= 0 ? "+" : ""}
                    {(signal.avg_daily_ret * 100).toFixed(3)}%
                  </span>
                </span>
              </div>

              <p className="text-[10px] text-lss-tertiary mt-2 italic">
                ⚠ Significance score is an estimate. See Methodology for formula.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
