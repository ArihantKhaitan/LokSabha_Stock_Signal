import { NextResponse } from "next/server";
import { computeAllSignals, computeAllCorrelations, buildSummaryStats } from "@/lib/signals";
import { getSignals as getSupabaseSignals } from "@/lib/supabase";
import type { EventSignal } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

let _cache: { signals: EventSignal[]; ts: number } | null = null;
const CACHE_MS = 60 * 60 * 1000;

async function getCachedSignals(): Promise<EventSignal[]> {
  const now = Date.now();
  if (_cache && now - _cache.ts < CACHE_MS) return _cache.signals;

  // Try Supabase cache first (pre-computed signals, fast)
  try {
    const supabaseSignals = await getSupabaseSignals();
    if (supabaseSignals.length >= 10) {
      _cache = { signals: supabaseSignals, ts: now };
      return supabaseSignals;
    }
  } catch {
    // Supabase unavailable — fall through to live compute
  }

  // Fall back: compute live from Yahoo Finance
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
