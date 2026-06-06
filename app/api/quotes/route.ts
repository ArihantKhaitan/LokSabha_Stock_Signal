import { NextResponse } from "next/server";
import { fetchAllQuotes } from "@/lib/stocks";
import { SECTOR_META } from "@/lib/sectors";

export const dynamic = "force-dynamic";

// All tracked tickers
const ALL_TICKERS = Array.from(new Set(Object.values(SECTOR_META).flatMap((m) => m.tickers)));

let _quoteCache: { data: unknown[]; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000; // 5 min

export async function GET() {
  const now = Date.now();
  if (_quoteCache && now - _quoteCache.ts < CACHE_MS) {
    return NextResponse.json({ quotes: _quoteCache.data, cached: true });
  }

  try {
    const quotes = await fetchAllQuotes(ALL_TICKERS);
    _quoteCache = { data: quotes, ts: now };
    return NextResponse.json({ quotes, cached: false, updatedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
