import StatCard from "@/components/StatCard";
import SessionTimeline from "@/components/SessionTimeline";
import { computeAllSignals, buildSummaryStats, computeAllCorrelations } from "@/lib/signals";
import { getSignals as getSupabaseSignals } from "@/lib/supabase";
import { SECTOR_META } from "@/lib/sectors";
import { fmtPct, fmtDate } from "@/lib/utils";
import type { EventSignal } from "@/types";

export const revalidate = 3600; // ISR: regenerate every hour

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

  const strongestSig  = summary?.strongest_signal;
  const sigPct        = strongestSig?.ret_t1 != null ? fmtPct(strongestSig.ret_t1) : "N/A";
  const sigCount      = correlations.filter((c) => c.is_significant).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-14 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-widest"
          style={{ background: "rgba(224,88,24,0.1)", border: "1px solid rgba(224,88,24,0.25)", color: "#E05818" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-lss-accent animate-pulse-glow" />
          Academic Research · Real NSE Data · Not Financial Advice
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
          <span className="text-gradient">LokSabha</span>
          <span className="text-lss-text"> Stock Signal</span>
        </h1>

        <p className="text-lss-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          When Parliament debates pharma regulation, defence procurement, or banking reform —
          do related sector stocks move in the days that follow?
          This tool quantifies that relationship using{" "}
          <span className="text-lss-text font-semibold">real NSE price data</span> and{" "}
          <span className="text-lss-text font-semibold">verified Lok Sabha records</span>.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Debates Analysed"
          value={String(summary?.total_debates ?? "—")}
          sub="Across 6 real sessions"
          color="#FF6B35"
          delay={0}
        />
        <StatCard
          label="Sectors Tracked"
          value={String(summary?.sectors_covered ?? 9)}
          sub="26 NSE-listed stocks"
          color="#58A6FF"
          delay={0.08}
        />
        <StatCard
          label="Strongest T+1 Signal"
          value={sigPct}
          sub={strongestSig ? `${strongestSig.event.sector} — ${fmtDate(strongestSig.event.date)}` : ""}
          color={strongestSig && (strongestSig.ret_t1 ?? 0) >= 0 ? "#3FB950" : "#F85149"}
          delay={0.16}
        />
        <StatCard
          label="Sig. Correlations"
          value={`${sigCount} / ${correlations.length}`}
          sub="Sectors with p < 0.05"
          color="#BC8CFF"
          delay={0.24}
        />
      </div>

      {/* ── Hypothesis section ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 glass glass-shimmer rounded-2xl p-6">
          <h2 className="text-lg font-bold text-lss-text mb-3">The Hypothesis</h2>
          <p className="text-lss-secondary text-sm leading-relaxed mb-4">
            When India&rsquo;s Parliament debates a sector-specific bill — higher pharma regulation,
            larger defence budgets, banking reform — does the market react? We test this by
            computing the{" "}
            <span className="text-lss-accent font-semibold">T+1 sector basket return</span> (next
            trading day) following each debate, comparing it against the sector&rsquo;s historical
            average, and running{" "}
            <span className="text-lss-accent font-semibold">Pearson correlation</span> between
            debate significance and returns.
          </p>
          <div className="font-mono text-sm rounded-xl p-4"
            style={{ background: "#1A0800", border: "1px solid rgba(224,88,24,0.2)" }}>
            <span style={{ color: "rgba(245,237,216,0.5)" }}>{"// Signal formula"}</span>
            <br />
            <span style={{ color: "#FF9060" }}>excess_t1</span>{" "}
            <span style={{ color: "#F5EDD8" }}>= T+1_return − sector_avg_daily_return</span>
            <br />
            <span style={{ color: "#FF9060" }}>signal</span>{" "}
            <span style={{ color: "#F5EDD8" }}>= excess_t1 × significance_score</span>
            <br />
            <span style={{ color: "rgba(245,237,216,0.5)" }}>{"// Correlation"}</span>
            <br />
            <span style={{ color: "#FF9060" }}>r, p</span>{" "}
            <span style={{ color: "#F5EDD8" }}>= pearsonR(significance_scores, t1_returns)</span>
          </div>
          <p className="text-[11px] text-lss-tertiary mt-3 italic">
            Inspired by Ziobrowski et al. (2004) &mdash; &ldquo;Abnormal Returns from US Senate Stock Investments&rdquo;
          </p>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-lss-text">Reading the Data</h3>
          {[
            ["T+1 / T+2 / T+5", "Equal-weighted basket return 1, 2, 5 trading days after debate"],
            ["Significance (1–10)", "Estimated: bill type × session × national importance. Transparent formula — see Methodology"],
            ["Sentiment", "Positive = sector-friendly (funding/deregulation). Negative = restrictive/punitive"],
            ["r / p-value", "Pearson correlation. p < 0.05 = statistically significant at 95% level"],
            ["⚠ Disclaimer", "Stock prices are real (Yahoo Finance). Significance scores are estimates. Correlation ≠ causation."],
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

      {/* ── Most reactive sectors ────────────────────────────────────── */}
      {correlations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-lss-secondary uppercase tracking-widest mb-4">
            Sector Summary — Mean T+1 Return After Debates
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {correlations
              .filter((c) => c.n_events > 0)
              .sort((a, b) => Math.abs(b.mean_t1_pct) - Math.abs(a.mean_t1_pct))
              .map((c) => {
                const color = SECTOR_META[c.sector]?.color ?? "#FF6B35";
                const pct   = c.mean_t1_pct;
                const retColor = pct >= 0 ? "#1E7A30" : "#B82020";
                return (
                  <div
                    key={c.sector}
                    className="glass rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-lss-text">{SECTOR_META[c.sector]?.label}</p>
                      <p className="text-[10px] text-lss-tertiary">n={c.n_events} · r={c.pearson_r?.toFixed(2) ?? "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[15px] font-bold font-mono" style={{ color: retColor }}>
                        {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                      </span>
                      {c.is_significant && (
                        <p className="text-[9px] text-lss-accent font-bold">★ p&lt;0.05</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(184,32,32,0.06)", border: "1px solid rgba(184,32,32,0.2)" }}>
        <p className="text-[12px] text-lss-red font-bold mb-1">⚠ Research Disclaimer</p>
        <p className="text-[12px] text-lss-secondary leading-relaxed">
          This platform is for academic and educational purposes only. Stock price data is fetched
          live from Yahoo Finance. Parliamentary significance scores are estimated using a transparent
          formula (see Methodology). Correlations shown are based on a small dataset (n ≈ 6–12 per
          sector) and must not be used to make investment decisions. Correlation does not imply
          causation. Past relationships do not predict future market behaviour.
        </p>
      </div>
    </div>
  );
}
