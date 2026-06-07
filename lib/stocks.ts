/**
 * Real stock data via yahoo-finance2 (server-side only).
 * All prices are fetched from Yahoo Finance — no synthetic data.
 */
import yahooFinanceDefault from "yahoo-finance2";
// bundler moduleResolution resolves the default export as the class type, not the singleton instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yahooFinance = yahooFinanceDefault as any;
import { SECTOR_META, DATA_START, dataEnd } from "@/lib/sectors";
import type { SectorKey } from "@/types";

export interface OHLCVRow {
  ticker: string;
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface DailyReturn {
  date:   string;
  return: number; // decimal, e.g. 0.0123 = +1.23%
}

/** Fetch OHLCV for a single ticker between two ISO date strings. */
export async function fetchTickerHistory(
  ticker: string,
  from: string = DATA_START,
  to:   string = dataEnd()
): Promise<OHLCVRow[]> {
  try {
    const result = await yahooFinance.historical(ticker, {
      period1: from,
      period2: to,
      interval: "1d",
    });

    return result
      .filter((r) => r.close != null)
      .map((r) => ({
        ticker,
        date:   r.date.toISOString().slice(0, 10),
        open:   r.open   ?? r.close,
        high:   r.high   ?? r.close,
        low:    r.low    ?? r.close,
        close:  r.close!,
        volume: r.volume ?? 0,
      }));
  } catch {
    return [];
  }
}

/** Fetch equal-weighted basket close prices for a sector. */
export async function fetchSectorBasket(
  sector: SectorKey,
  from: string = DATA_START,
  to:   string = dataEnd()
): Promise<Map<string, Map<string, number>>> {
  const tickers = SECTOR_META[sector]?.tickers ?? [];
  const byDate = new Map<string, Map<string, number>>();

  await Promise.all(
    tickers.map(async (tkr) => {
      const rows = await fetchTickerHistory(tkr, from, to);
      for (const row of rows) {
        if (!byDate.has(row.date)) byDate.set(row.date, new Map());
        byDate.get(row.date)!.set(tkr, row.close);
      }
    })
  );

  return byDate;
}

/** Compute equal-weighted daily returns for a sector basket. */
export async function computeSectorReturns(
  sector: SectorKey,
  from: string = DATA_START,
  to:   string = dataEnd()
): Promise<DailyReturn[]> {
  const basket = await fetchSectorBasket(sector, from, to);
  const dates  = [...basket.keys()].sort();

  const basketPrices: { date: string; avg: number }[] = dates
    .map((d) => {
      const prices = [...basket.get(d)!.values()].filter((v) => v > 0);
      return prices.length ? { date: d, avg: prices.reduce((a, b) => a + b, 0) / prices.length } : null;
    })
    .filter(Boolean) as { date: string; avg: number }[];

  const returns: DailyReturn[] = [];
  for (let i = 1; i < basketPrices.length; i++) {
    const prev = basketPrices[i - 1].avg;
    const curr = basketPrices[i].avg;
    if (prev > 0) {
      returns.push({ date: basketPrices[i].date, return: (curr - prev) / prev });
    }
  }
  return returns;
}

/** Return the basket return at offset trading days from a target date. */
export function basketReturnAtOffset(
  returns: DailyReturn[],
  targetDate: string,
  offset: number
): number | null {
  const sorted = [...returns].sort((a, b) => a.date.localeCompare(b.date));

  // Find the first return date on or after targetDate
  let idx = sorted.findIndex((r) => r.date >= targetDate);
  if (idx === -1) return null;

  const targetIdx = idx + offset;
  if (targetIdx < 0 || targetIdx >= sorted.length) return null;
  return sorted[targetIdx].return;
}

/** Average daily return over the full history. */
export function averageDailyReturn(returns: DailyReturn[]): number {
  if (!returns.length) return 0;
  return returns.reduce((s, r) => s + r.return, 0) / returns.length;
}

/** Fetch current quote for a ticker (real-time). */
export async function fetchQuote(ticker: string) {
  try {
    const q = await yahooFinance.quote(ticker);
    return {
      ticker,
      price:       q.regularMarketPrice,
      change:      q.regularMarketChange,
      changePct:   q.regularMarketChangePercent,
      marketState: q.marketState,
      updatedAt:   new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Fetch live quotes for all tracked tickers (for ticker tape). */
export async function fetchAllQuotes(tickers: string[]) {
  const results = await Promise.allSettled(tickers.map(fetchQuote));
  return results
    .filter((r) => r.status === "fulfilled" && r.value != null)
    .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>>).value!);
}
