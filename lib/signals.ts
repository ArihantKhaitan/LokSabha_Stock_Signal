/**
 * Signal computation engine.
 * Combines real stock returns with parliament event dates to produce
 * EventSignal records with Pearson correlation analysis.
 */
import { computeSectorReturns, basketReturnAtOffset, averageDailyReturn } from "@/lib/stocks";
import { PARLIAMENT_EVENTS } from "@/lib/parliament";
import { ALL_SECTORS } from "@/lib/sectors";
import type { EventSignal, SectorCorrelation, SectorKey, SummaryStats } from "@/types";

/** Pearson r and p-value (two-tailed) — pure TS implementation. */
function pearsonR(xs: number[], ys: number[]): { r: number; p: number } {
  const n = xs.length;
  if (n < 3) return { r: 0, p: 1 };

  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, sdx = 0, sdy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    sdx += (xs[i] - mx) ** 2;
    sdy += (ys[i] - my) ** 2;
  }

  const denom = Math.sqrt(sdx * sdy);
  if (denom === 0) return { r: 0, p: 1 };
  const r = num / denom;

  // t-statistic → p-value via regularised incomplete beta (approx)
  const t   = r * Math.sqrt((n - 2) / (1 - r * r + 1e-12));
  const df  = n - 2;
  const p   = 2 * (1 - tCDF(Math.abs(t), df));

  return { r: Math.max(-1, Math.min(1, r)), p };
}

/** Incomplete beta-based CDF approximation for Student's t. */
function tCDF(t: number, df: number): number {
  const x  = df / (df + t * t);
  const a  = df / 2;
  const b  = 0.5;
  return 1 - 0.5 * incompleteBeta(x, a, b);
}

function incompleteBeta(x: number, a: number, b: number): number {
  // Continued fraction approx (Lentz)
  if (x < 0 || x > 1) return 0;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  return front * betaCF(x, a, b);
}

function betaCF(x: number, a: number, b: number): number {
  const MAX = 200, EPS = 3e-7;
  let c = 1, d = 1 - (a + b) * x / (a + 1);
  d = Math.abs(d) < 1e-30 ? 1e-30 : d;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX; m++) {
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d; d = Math.abs(d) < 1e-30 ? 1e-30 : d;
    c = 1 + aa / c; c = Math.abs(c) < 1e-30 ? 1e-30 : c;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d; d = Math.abs(d) < 1e-30 ? 1e-30 : d;
    c = 1 + aa / c; c = Math.abs(c) < 1e-30 ? 1e-30 : c;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function lgamma(x: number): number {
  // Stirling approx (good for x > 0.5)
  return (x - 0.5) * Math.log(x + 4.5) - (x + 4.5) + 0.5 * Math.log(2 * Math.PI) +
    Math.log(1 + 76.18009173 / x - 86.50532033 / (x + 1) + 24.01409824 / (x + 2) -
      1.231739572 / (x + 3) + 0.001208651 / (x + 4) - 0.000005395 / (x + 5));
}

/* ── Public API ──────────────────────────────────────────────────────── */

export async function computeSignalsForSector(sector: SectorKey): Promise<EventSignal[]> {
  const returns = await computeSectorReturns(sector);
  const avgRet  = averageDailyReturn(returns);
  const events  = PARLIAMENT_EVENTS.filter((e) => e.sector === sector);

  return events.map((ev) => {
    const rtm1 = basketReturnAtOffset(returns, ev.date, -1);
    const rt0  = basketReturnAtOffset(returns, ev.date,  0);
    const rt1  = basketReturnAtOffset(returns, ev.date,  1);
    const rt2  = basketReturnAtOffset(returns, ev.date,  2);
    const rt5  = basketReturnAtOffset(returns, ev.date,  5);

    const excess = rt1 != null ? rt1 - avgRet : null;
    const strength = excess != null ? excess * ev.significance_score : null;

    return {
      event_id:       ev.id,
      event:          ev,
      ret_tm1:        rtm1,
      ret_t0:         rt0,
      ret_t1:         rt1,
      ret_t2:         rt2,
      ret_t5:         rt5,
      avg_daily_ret:  avgRet,
      excess_t1:      excess,
      signal_strength: strength,
    };
  });
}

export async function computeAllSignals(): Promise<EventSignal[]> {
  const results = await Promise.all(ALL_SECTORS.map(computeSignalsForSector));
  return results.flat();
}

export function computeSectorCorrelation(
  signals: EventSignal[],
  sector: SectorKey
): SectorCorrelation {
  const s = signals.filter((x) => x.event.sector === sector && x.ret_t1 != null);
  const n = s.length;

  if (n < 3) {
    return {
      sector, n_events: n,
      pearson_r: null, p_value: null,
      mean_t1_pct: 0, mean_excess_t1_pct: 0,
      hi_intensity_mean_t1_pct: 0, lo_intensity_mean_t1_pct: 0,
      interpretation: "Insufficient data (< 3 events with market data).",
      is_significant: false,
    };
  }

  const xs = s.map((x) => x.event.significance_score);
  const ys = s.map((x) => x.ret_t1!);
  const { r, p } = pearsonR(xs, ys);

  const mean = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const hi = s.filter((x) => x.event.significance_score >= 7).map((x) => x.ret_t1!);
  const lo = s.filter((x) => x.event.significance_score < 7).map((x) => x.ret_t1!);

  return {
    sector,
    n_events: n,
    pearson_r: +r.toFixed(4),
    p_value:   +p.toFixed(6),
    mean_t1_pct:          +(mean(ys) * 100).toFixed(3),
    mean_excess_t1_pct:   +(mean(s.map((x) => x.excess_t1 ?? 0)) * 100).toFixed(3),
    hi_intensity_mean_t1_pct: +(mean(hi) * 100).toFixed(3),
    lo_intensity_mean_t1_pct: +(mean(lo) * 100).toFixed(3),
    interpretation: buildInterpretation(r, p, sector, mean(ys)),
    is_significant: p < 0.006, // Bonferroni-corrected: 0.05 / 9 sectors ≈ 0.006
  };
}

export function computeAllCorrelations(signals: EventSignal[]): SectorCorrelation[] {
  return ALL_SECTORS.map((s) => computeSectorCorrelation(signals, s));
}

export function buildSummaryStats(signals: EventSignal[]): SummaryStats {
  const withData = signals.filter((s) => s.ret_t1 != null);

  const strongest = withData.reduce<EventSignal | null>((best, s) => {
    const a = Math.abs(s.signal_strength ?? 0);
    const b = Math.abs(best?.signal_strength ?? 0);
    return a > b ? s : best;
  }, null);

  const byT5: Record<string, number[]> = {};
  for (const s of withData) {
    if (s.ret_t5 != null) {
      (byT5[s.event.sector] ??= []).push(s.ret_t5);
    }
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mostReactive = Object.entries(byT5).reduce<[string, number] | null>(
    (best, [sec, vals]) => {
      const v = Math.abs(mean(vals));
      return !best || v > Math.abs(best[1]) ? [sec, mean(vals)] : best;
    },
    null
  );

  return {
    total_debates:       signals.length,
    debates_with_data:   withData.length,
    sectors_covered:     ALL_SECTORS.length,
    strongest_signal:    strongest,
    most_reactive_sector: (mostReactive?.[0] as SectorKey) ?? null,
    most_reactive_t5_pct: +(((mostReactive?.[1] ?? 0) * 100).toFixed(2)),
    data_as_of:          signals.reduce((max, s) => s.event.date > max ? s.event.date : max, "2023-01-01"),
  };
}

function buildInterpretation(r: number, p: number, sector: string, meanT1: number): string {
  const dir  = r >= 0 ? "positive" : "negative";
  const sig  = p < 0.006 ? "statistically significant after correction (p < 0.006)" : "not statistically significant";
  const str  = Math.abs(r) >= 0.5 ? "Strong" : Math.abs(r) >= 0.3 ? "Moderate" : Math.abs(r) >= 0.15 ? "Weak" : "Negligible";
  const dirW = meanT1 > 0 ? "upward" : "downward";
  return `${str} ${dir} correlation (r=${r.toFixed(2)}, p=${p.toFixed(3)}) — ${sig}. On average, ${sector} stocks moved ${dirW} ${Math.abs(meanT1 * 100).toFixed(2)}% the day after a parliamentary debate on this sector.`;
}
