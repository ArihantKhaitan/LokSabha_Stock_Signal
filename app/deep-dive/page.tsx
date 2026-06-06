"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import CandlestickChart from "@/components/CandlestickChart";
import { PARLIAMENT_EVENTS, ALL_SESSIONS } from "@/lib/parliament";
import { SECTOR_META } from "@/lib/sectors";
import { fmtDate, fmtPct, sentimentClass } from "@/lib/utils";
import type { EventSignal } from "@/types";

type OHLCV = { date: string; open: number; high: number; low: number; close: number; volume: number };

export default function DeepDivePage() {
  const [eventId,  setEventId]  = useState(PARLIAMENT_EVENTS[0]?.id ?? "");
  const [signal,   setSignal]   = useState<EventSignal | null>(null);
  const [ohlcv,    setOhlcv]    = useState<OHLCV[]>([]);
  const [usedTicker, setUsedTicker] = useState("");
  const [loadingSig,  setLoadingSig]  = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load signal for selected event
  const loadSignal = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingSig(true);
    setError(null);
    try {
      const ev = PARLIAMENT_EVENTS.find((e) => e.id === id);
      if (!ev) return;
      const res  = await fetch(`/api/signals?sector=${ev.sector}`);
      const json = await res.json();
      const sig  = (json.signals as EventSignal[]).find((s) => s.event_id === id) ?? null;
      setSignal(sig);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingSig(false);
    }
  }, []);

  // Load candlestick for primary ticker of the sector
  const loadChart = useCallback(async (id: string) => {
    const ev = PARLIAMENT_EVENTS.find((e) => e.id === id);
    if (!ev) return;
    const tickers = SECTOR_META[ev.sector]?.tickers ?? [];
    const ticker  = tickers[0];
    if (!ticker) return;

    setLoadingChart(true);
    try {
      const evDate = new Date(ev.date);
      const from   = new Date(evDate); from.setDate(from.getDate() - 21);
      const to     = new Date(evDate); to.setDate(to.getDate()   + 21);
      const res    = await fetch(
        `/api/stocks/${encodeURIComponent(ticker)}?from=${from.toISOString().slice(0,10)}&to=${to.toISOString().slice(0,10)}`
      );
      const json = await res.json();
      setOhlcv(json.rows ?? []);
      setUsedTicker(ticker.replace(".NS", ""));
    } catch {
      setOhlcv([]);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    loadSignal(eventId);
    loadChart(eventId);
  }, [eventId, loadSignal, loadChart]);

  const ev    = PARLIAMENT_EVENTS.find((e) => e.id === eventId);
  const color = ev ? (SECTOR_META[ev.sector]?.color ?? "#FF6B35") : "#FF6B35";

  // Group events by session for the select
  const grouped = ALL_SESSIONS.reduce<Record<string, typeof PARLIAMENT_EVENTS>>((acc, sess) => {
    acc[sess] = PARLIAMENT_EVENTS.filter((e) => e.session === sess);
    return acc;
  }, {});

  const writtenAnalysis = () => {
    if (!ev || !signal?.ret_t1) return null;
    const dir  = signal.ret_t1 >= 0 ? "rose" : "fell";
    const dirT5 = (signal.ret_t5 ?? 0) >= 0 ? "rose" : "fell";
    const pct1 = Math.abs(signal.ret_t1 * 100).toFixed(2);
    const pct5 = Math.abs((signal.ret_t5 ?? 0) * 100).toFixed(2);
    const exPct = signal.excess_t1 ? Math.abs(signal.excess_t1 * 100).toFixed(2) : "0.00";
    const exDir = (signal.excess_t1 ?? 0) > 0 ? "above" : "below";
    return (
      <p className="text-lss-secondary text-sm leading-relaxed">
        On <strong className="text-lss-text">{fmtDate(ev.date)}</strong>, the Lok Sabha debated{" "}
        <strong className="text-lss-text">{ev.topic}</strong> during the {ev.session}.
        The session had an estimated significance of <strong className="text-lss-text">{ev.significance_score}/10</strong>{" "}
        and the parliamentary tone was <strong className="text-lss-text">{ev.sentiment}</strong> toward the {ev.sector} sector.
        <br /><br />
        In the trading session immediately following (T+1), the {SECTOR_META[ev.sector]?.label ?? ev.sector} basket{" "}
        <strong style={{ color: signal.ret_t1 >= 0 ? "#3FB950" : "#F85149" }}>{dir} {pct1}%</strong>.
        This was <strong className="text-lss-text">{exPct}%</strong> {exDir} the sector&rsquo;s historical daily average,{" "}
        {parseFloat(exPct) > 0.2 ? "suggesting a non-trivial market reaction." : "a movement consistent with normal daily variance."}
        <br /><br />
        Over the following week (T+5), the basket{" "}
        <strong style={{ color: (signal.ret_t5 ?? 0) >= 0 ? "#3FB950" : "#F85149" }}>{dirT5} {pct5}%</strong>.{" "}
        <em className="text-lss-tertiary text-[11px]">
          Note: These movements reflect the equal-weighted basket average across {SECTOR_META[ev.sector]?.tickers.length} stocks
          and are influenced by many concurrent market factors beyond the parliamentary debate. Correlation ≠ causation.
        </em>
      </p>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-lss-text mb-2">Event Deep Dive</h1>
        <p className="text-lss-secondary text-sm">
          Select any bill or debate to see a 6-week candlestick chart around that date,
          exact return figures, and written analysis. All chart data is real (Yahoo Finance).
        </p>
      </motion.div>

      {/* Event selector */}
      <div className="glass rounded-2xl p-4 mb-6">
        <label className="text-[10px] font-bold text-lss-tertiary uppercase tracking-widest block mb-2">
          Select a debate event
        </label>
        <select
          className="input-glass"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {Object.entries(grouped).map(([sess, events]) => (
            <optgroup key={sess} label={sess}>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {fmtDate(e.date)} · {e.topic.slice(0, 70)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Event metadata banner */}
      {ev && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ borderLeft: `4px solid ${color}`, background: "rgba(22,27,34,0.7)", border: `1px solid ${color}33`, borderLeftWidth: 4 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-mono text-lss-tertiary">{fmtDate(ev.date)}</span>
            <span className={sentimentClass(ev.sentiment)}>{ev.sentiment}</span>
            {ev.is_bill_passage && <span className="badge-positive">✓ Passed</span>}
            <span className="badge-neutral">{ev.session}</span>
            <span className="badge-neutral" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
              {SECTOR_META[ev.sector]?.label}
            </span>
          </div>
          <h2 className="text-base font-bold text-lss-text mb-1">{ev.topic}</h2>
          <p className="text-[12px] text-lss-secondary mb-2">{ev.summary}</p>
          <p className="text-[11px] text-lss-tertiary">Bill: {ev.bill} · Significance: {ev.significance_score}/10 (estimated)</p>
        </div>
      )}

      {/* Candlestick chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-lss-text">
            {usedTicker} — 6-Week Window Around Debate
          </h2>
          <span className="text-[11px] text-lss-tertiary">
            {SECTOR_META[ev?.sector ?? "Pharma"]?.description}
          </span>
        </div>
        {loadingChart ? (
          <div className="glass rounded-2xl h-80 animate-pulse" />
        ) : ohlcv.length > 0 ? (
          <CandlestickChart
            data={ohlcv}
            debateDate={ev?.date ?? ""}
            title={`${usedTicker} · Orange line = debate date`}
            height={380}
          />
        ) : (
          <div className="glass rounded-2xl p-10 text-center text-lss-tertiary text-sm">
            No chart data available for this period.
          </div>
        )}
        <p className="text-[10px] text-lss-tertiary mt-1">
          ✅ Real OHLCV data from Yahoo Finance · Showing primary basket ticker
        </p>
      </div>

      {/* Return summary table */}
      {!loadingSig && signal && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-lss-text mb-4">Return Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-lss-tertiary text-left" style={{ borderBottom: "1px solid #30363D" }}>
                  <th className="pb-2 font-semibold">Window</th>
                  <th className="pb-2 font-semibold">Basket Return</th>
                  <th className="pb-2 font-semibold">vs Historical Avg</th>
                </tr>
              </thead>
              <tbody className="text-lss-secondary">
                {[
                  { label: "T−1 (day before)", val: signal.ret_tm1, excess: null },
                  { label: "T+1 (next day) ★", val: signal.ret_t1, excess: signal.excess_t1 },
                  { label: "T+2 (2 days after)", val: signal.ret_t2, excess: null },
                  { label: "T+5 (1 week after)", val: signal.ret_t5, excess: null },
                ].map((row) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid #21262d" }}>
                    <td className="py-2">{row.label}</td>
                    <td className="py-2">
                      <span
                        className="font-bold font-mono"
                        style={{ color: (row.val ?? 0) >= 0 ? "#3FB950" : "#F85149" }}
                      >
                        {fmtPct(row.val)}
                      </span>
                    </td>
                    <td className="py-2 text-lss-tertiary font-mono">
                      {row.excess != null
                        ? <span style={{ color: row.excess >= 0 ? "#3FB950" : "#F85149" }}>
                            {fmtPct(row.excess)} vs avg
                          </span>
                        : "—"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-2 text-lss-tertiary">Hist. avg daily</td>
                  <td className="pt-2 font-mono text-lss-tertiary">{fmtPct(signal.avg_daily_ret)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Written analysis */}
      {!loadingSig && signal && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-lss-text mb-3">Analysis</h2>
          {writtenAnalysis()}
        </div>
      )}

      {error && (
        <div className="glass-negative rounded-2xl p-4 mt-4 text-lss-red text-sm">{error}</div>
      )}
    </div>
  );
}
