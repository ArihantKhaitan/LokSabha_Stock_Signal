import StatCard from "@/components/StatCard";
import SessionTimeline from "@/components/SessionTimeline";
import { computeAllSignals, buildSummaryStats, computeAllCorrelations } from "@/lib/signals";
import { getSignals as getSupabaseSignals } from "@/lib/supabase";
import { SECTOR_META } from "@/lib/sectors";
import { fmtPct, fmtDate } from "@/lib/utils";
import type { EventSignal } from "@/types";

export const revalidate = 3600;

async function getStats() {
  try {
    let signals: EventSignal[] = [];
    try {
      const cached = await getSupabaseSignals();
      if (cached.length >= 10) signals = cached;
    } catch { /* fall through */ }
    if (!signals.length) signals = await computeAllSignals();

    const summary      = buildSummaryStats(signals);
    const correlations = computeAllCorrelations(signals);
    return { summary, correlations, ok: true };
  } catch {
    return { summary: null, correlations: [], ok: false };
  }
}

export default async function HomePage() {
  const { summary, correlations } = await getStats();

  const strongestSig = summary?.strongest_signal;
  const sigPct       = strongestSig?.ret_t1 != null ? fmtPct(strongestSig.ret_t1) : "N/A";
  const sigCount     = correlations.filter((c) => c.is_significant).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-14 animate-fade-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-none">
          <span className="text-gradient">LokSabha</span>
          <span className="text-lss-text"> Stock Signal</span>
        </h1>
        <p className="text-lss-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          When Parliament debates pharma regulation, defence budgets, or banking reform —
          do related stocks move the next day?
          We track <span className="text-lss-text font-semibold">43 real parliamentary debates</span> and
          measure what happened to stock prices immediately after.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Debates Tracked"
          value={String(summary?.total_debates ?? "—")}
          sub="Real Lok Sabha sessions"
          color="#FF6B35"
          delay={0}
        />
        <StatCard
          label="Sectors Covered"
          value={String(summary?.sectors_covered ?? 9)}
          sub="Pharma, Defence, IT & more"
          color="#58A6FF"
          delay={0.08}
        />
        <StatCard
          label="Biggest Single-Day Move"
          value={sigPct}
          sub={strongestSig ? `${strongestSig.event.sector} · ${fmtDate(strongestSig.event.date)}` : ""}
          color={strongestSig && (strongestSig.ret_t1 ?? 0) >= 0 ? "#3FB950" : "#F85149"}
          delay={0.16}
        />
        <StatCard
          label="Sectors That Reacted"
          value={`${sigCount} / ${correlations.length}`}
          sub="With a statistically real pattern"
          color="#BC8CFF"
          delay={0.24}
        />
      </div>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 glass glass-shimmer rounded-2xl p-6">
          <h2 className="text-lg font-bold text-lss-text mb-4">How It Works</h2>

          {/* 3-step flow */}
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {[
              {
                step: "1",
                title: "Parliament debates",
                desc: "A sector-specific bill is discussed — e.g. higher defence budget, pharma pricing regulation, or banking reform.",
              },
              {
                step: "2",
                title: "We track stocks",
                desc: "We measure how much that sector's stocks moved the next day, 2 days later, and 5 days later.",
              },
              {
                step: "3",
                title: "Is there a pattern?",
                desc: "We check whether bigger/more important debates consistently lead to bigger stock moves.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
                  style={{ background: "rgba(224,88,24,0.15)", color: "#E05818", border: "1px solid rgba(224,88,24,0.3)" }}
                >
                  {step}
                </div>
                <p className="text-[13px] font-semibold text-lss-text">{title}</p>
                <p className="text-[12px] text-lss-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-lss-tertiary italic">
            Inspired by Ziobrowski et al. (2004) — &ldquo;Abnormal Returns from US Senate Stock Investments&rdquo;.
            Stock prices are real NSE/BSE data from Yahoo Finance.
          </p>
        </div>

        {/* Glossary */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-lss-text">What the numbers mean</h3>
          {[
            ["+1.2% next-day", "The sector basket moved +1.2% the trading day after the debate"],
            ["Debate importance (1–10)", "How significant we estimated the debate to be — based on bill type and national impact"],
            ["Sentiment", "Did the debate favour the sector (positive) or threaten it (negative)?"],
            ["Pattern strength (r)", "How consistently bigger debates led to bigger moves. Near ±1 = strong, near 0 = no pattern"],
            ["Statistically real (p<0.05)", "There's less than 5% chance this pattern is random noise"],
          ].map(([label, desc]) => (
            <div key={label} className="flex gap-2">
              <span className="text-lss-accent text-[11px] font-bold shrink-0 mt-0.5">{label}</span>
              <span className="text-lss-secondary text-[11px]">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Session timeline ─────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-lss-secondary uppercase tracking-widest mb-4">
          Parliament Sessions in Dataset
        </h2>
        <SessionTimeline />
      </div>

      {/* ── Sector summary ───────────────────────────────────────────── */}
      {correlations.length > 0 && (
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-lss-secondary uppercase tracking-widest">
              Average Stock Move After Debates
            </h2>
            <p className="text-[11px] text-lss-tertiary mt-1">
              The day after Parliament debated each sector — did those stocks go up or down on average?
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {correlations
              .filter((c) => c.n_events > 0)
              .sort((a, b) => Math.abs(b.mean_t1_pct) - Math.abs(a.mean_t1_pct))
              .map((c) => {
                const color    = SECTOR_META[c.sector]?.color ?? "#FF6B35";
                const pct      = c.mean_t1_pct;
                const retColor = pct >= 0 ? "#1E7A30" : "#B82020";
                return (
                  <div
                    key={c.sector}
                    className="glass rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-lss-text">{SECTOR_META[c.sector]?.label}</p>
                      <p className="text-[10px] text-lss-tertiary">{c.n_events} debates analysed</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[15px] font-bold font-mono" style={{ color: retColor }}>
                        {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                      </span>
                      {c.is_significant && (
                        <p className="text-[9px] text-lss-accent font-bold">consistent pattern</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Footer note ──────────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-lss-tertiary">
        Stock prices are real data from Yahoo Finance. Debate importance scores are estimated.
        This is a research tool — not investment advice.
      </p>
    </div>
  );
}
