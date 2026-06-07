"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";
import { SECTOR_META, ALL_SECTORS } from "@/lib/sectors";
import { fmtPct } from "@/lib/utils";
import type { EventSignal, SectorKey } from "@/types";

export default function ExplorerPage() {
  const [sector,    setSector]    = useState<SectorKey>("Defence");
  const [sentiment, setSentiment] = useState<string>("All");
  const [minSig,    setMinSig]    = useState(1);
  const [signals,   setSignals]   = useState<EventSignal[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/signals?sector=${sector}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch signals");
      setSignals(json.signals as EventSignal[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [sector]);

  useEffect(() => { load(); }, [load]);

  const filtered = signals.filter((s) =>
    (sentiment === "All" || s.event.sentiment === sentiment) &&
    s.event.significance_score >= minSig
  );

  const withData = filtered.filter((s) => s.ret_t1 != null);
  const avgT1    = withData.length ? withData.reduce((a, s) => a + s.ret_t1!, 0) / withData.length : 0;
  const avgT5    = withData.filter((s) => s.ret_t5 != null).length
    ? withData.filter((s) => s.ret_t5 != null).reduce((a, s) => a + s.ret_t5!, 0) / withData.filter((s) => s.ret_t5 != null).length
    : 0;

  const color = SECTOR_META[sector]?.color ?? "#FF6B35";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-lss-text mb-2">Signal Explorer</h1>
        <p className="text-lss-secondary text-sm">
          Browse every real parliamentary debate event by sector. Return chips show next-day,
          2-day and 5-day sector basket returns fetched live from Yahoo Finance.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        {/* Sector */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] font-bold text-lss-tertiary uppercase tracking-widest">Sector</label>
          <select
            className="input-glass"
            value={sector}
            onChange={(e) => setSector(e.target.value as SectorKey)}
          >
            {ALL_SECTORS.map((s) => (
              <option key={s} value={s}>{SECTOR_META[s].label}</option>
            ))}
          </select>
        </div>

        {/* Sentiment */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-lss-tertiary uppercase tracking-widest">Sentiment</label>
          <div className="flex gap-1">
            {["All", "Positive", "Negative", "Neutral"].map((s) => (
              <button
                key={s}
                onClick={() => setSentiment(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  sentiment === s
                    ? "text-lss-text"
                    : "text-lss-tertiary hover:text-lss-text"
                }`}
                style={
                  sentiment === s
                    ? { background: "rgba(224,88,24,0.12)", border: "1px solid rgba(224,88,24,0.3)" }
                    : { background: "rgba(180,148,100,0.08)", border: "1px solid rgba(180,148,100,0.3)" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Min significance */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-lss-tertiary uppercase tracking-widest">
            Min Significance: {minSig}/10
          </label>
          <input
            type="range" min={1} max={10} value={minSig}
            onChange={(e) => setMinSig(Number(e.target.value))}
            className="w-28 accent-lss-accent"
          />
        </div>
      </div>

      {/* Summary banner */}
      {withData.length > 0 && (
        <motion.div
          className="mb-5 px-5 py-3 rounded-xl flex flex-wrap items-center gap-4 text-sm"
          style={{ borderLeft: `4px solid ${color}`, background: "rgba(250,246,238,0.8)", border: `1px solid ${color}55` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <span className="font-bold" style={{ color }}>{SECTOR_META[sector].label}</span>
          <span className="text-lss-secondary">
            {filtered.length} events · Avg T+1:{" "}
            <span className={`font-bold font-mono ${avgT1 >= 0 ? "text-lss-green" : "text-lss-red"}`}>
              {fmtPct(avgT1)}
            </span>
            {" "}· Avg T+5:{" "}
            <span className={`font-bold font-mono ${avgT5 >= 0 ? "text-lss-green" : "text-lss-red"}`}>
              {fmtPct(avgT5)}
            </span>
          </span>
          <span className="text-lss-tertiary text-[11px]">n={withData.length} with market data</span>
        </motion.div>
      )}

      {/* Events */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-negative rounded-2xl p-5 text-lss-red text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-lss-tertiary text-sm">
          No events match the current filters.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered
            .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
            .map((sig) => (
              <EventCard key={sig.event_id} signal={sig} />
            ))}
        </div>
      )}

      <p className="text-[10px] text-lss-tertiary mt-6 text-center">
        ✅ Stock returns: real data from Yahoo Finance via yahoo-finance2 ·
        ⚠ Significance scores: estimated (see Methodology for formula)
      </p>
    </div>
  );
}
