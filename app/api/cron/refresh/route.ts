/**
 * Vercel Cron: runs daily at 02:00 UTC (07:30 IST — before NSE open).
 * Fetches fresh stock data and recomputes signals in Supabase.
 *
 * Protect with CRON_SECRET env var (set in Vercel dashboard).
 * Vercel sends: Authorization: Bearer <CRON_SECRET>
 */
import { NextResponse } from "next/server";
import { computeAllSignals } from "@/lib/signals";
import { fetchTickerHistory } from "@/lib/stocks";
import { upsertStockPrices, upsertSignal, setFreshness } from "@/lib/supabase";
import { SECTOR_META, DATA_START, dataEnd } from "@/lib/sectors";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min (Vercel Pro)

export async function GET(req: Request) {
  // Auth check
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const started = Date.now();
  const to      = dataEnd();
  const tickers = [...new Set(Object.values(SECTOR_META).flatMap((m) => m.tickers))];
  const results: Record<string, string> = {};

  // 1. Refresh all stock price data
  for (const ticker of tickers) {
    try {
      const rows = await fetchTickerHistory(ticker, DATA_START, to);
      await upsertStockPrices(
        rows.map((r) => ({
          ticker:  r.ticker,
          date:    r.date,
          open:    r.open,
          high:    r.high,
          low:     r.low,
          close:   r.close,
          volume:  r.volume,
        }))
      );
      results[ticker] = `ok (${rows.length} rows)`;
    } catch (err) {
      results[ticker] = `error: ${err}`;
    }
  }

  // 2. Recompute signals
  try {
    const signals = await computeAllSignals();
    for (const sig of signals) {
      await upsertSignal(sig);
    }
    results["signals"] = `computed ${signals.length}`;
  } catch (err) {
    results["signals"] = `error: ${err}`;
  }

  // 3. Update freshness
  await setFreshness("stock_prices", { tickers, to, durationMs: Date.now() - started });
  await setFreshness("signals", { count: tickers.length, durationMs: Date.now() - started });

  return NextResponse.json({
    ok: true,
    duration: `${((Date.now() - started) / 1000).toFixed(1)}s`,
    results,
  });
}
