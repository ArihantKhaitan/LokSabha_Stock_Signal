import { NextResponse } from "next/server";
import { computeAllSignals, computeAllCorrelations, buildSummaryStats } from "@/lib/signals";

export const dynamic = "force-dynamic";

// Cache in-process for 1h (Next.js server-side only)
let _cache: { signals: Awaited<ReturnType<typeof computeAllSignals>>; ts: number } | null = null;
const CACHE_MS = 60 * 60 * 1000;

async function getCachedSignals() {
  const now = Date.now();
  if (_cache && now - _cache.ts < CACHE_MS) return _cache.signals;
  const signals = await computeAllSignals();
  _cache = { signals, ts: now };
  return signals;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");

  try {
    const signals      = await getCachedSignals();
    const correlations = computeAllCorrelations(signals);
    const summary      = buildSummaryStats(signals);

    let filtered = signals;
    if (sector) filtered = signals.filter((s) => s.event.sector === sector);

    return NextResponse.json({ signals: filtered, correlations, summary });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
