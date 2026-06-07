"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CorrelationGrid from "@/components/CorrelationGrid";
import type { EventSignal, SectorCorrelation } from "@/types";

export default function CorrelationPage() {
  const [signals,      setSignals]      = useState<EventSignal[]>([]);
  const [correlations, setCorrelations] = useState<SectorCorrelation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((j) => {
        setSignals(j.signals);
        setCorrelations(j.correlations);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const sigCount = correlations.filter((c) => c.is_significant).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-lss-text mb-2">Did Debates Move Markets?</h1>
        <p className="text-lss-secondary text-sm max-w-2xl">
          Each chart asks: when Parliament had a more important debate about a sector, did that
          sector&rsquo;s stocks move more the next day? Each dot = one debate.
          An <span className="text-lss-accent font-semibold">orange trend line</span> means yes — there&rsquo;s a real pattern.
          A grey line means the moves look random.
        </p>
      </motion.div>

      {/* Summary */}
      {correlations.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            ["Sectors analysed", String(correlations.length)],
            ["Sectors with real pattern", `${sigCount} / ${correlations.length}`],
            ["Debates tracked", String(signals.length)],
            ["With price data", String(signals.filter((s) => s.ret_t1 != null).length)],
          ].map(([label, val]) => (
            <div key={label} className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-lss-accent font-bold font-mono text-base">{val}</div>
              <div className="text-lss-tertiary text-[10px] uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="glass rounded-2xl h-72 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="glass-negative rounded-2xl p-5 text-lss-red text-sm">{error}</div>
      ) : (
        <CorrelationGrid correlations={correlations} signals={signals} />
      )}

      {/* Interpretation legend */}
      <div className="glass rounded-2xl p-5 mt-8 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="text-lss-text font-semibold mb-2">How to read each chart</h3>
          <ul className="space-y-1.5 text-lss-secondary text-[12px]">
            <li><span className="text-lss-accent font-bold">Horizontal (→)</span> — How important was the debate (1 = minor, 10 = major)</li>
            <li><span className="text-lss-accent font-bold">Vertical (↑)</span> — How much the sector moved the next trading day</li>
            <li><span className="text-lss-accent font-bold">Orange trend line</span> — Bigger debates consistently led to bigger moves</li>
            <li><span className="text-lss-tertiary font-bold">Grey trend line</span> — No consistent pattern found</li>
            <li><span className="text-lss-accent font-bold">r = 0.6</span> — Strong pattern · <span className="text-lss-accent font-bold">r ≈ 0</span> — No pattern</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lss-text font-semibold mb-2">Keep in mind</h3>
          <ul className="space-y-1.5 text-lss-secondary text-[12px]">
            <li>Each sector has only 5–12 debates — patterns may not hold longer-term</li>
            <li>Debate importance scores are our estimates, not official measures</li>
            <li>Many other factors move markets on any given day</li>
            <li>A pattern existing doesn&apos;t mean Parliament caused the move</li>
            <li>All stock prices are real, live data from Yahoo Finance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
