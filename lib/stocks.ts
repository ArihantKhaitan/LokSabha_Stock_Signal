/**
 * Real stock data via Yahoo Finance v8 API (server-side only).
 * Uses direct HTTP to Yahoo Finance chart endpoint — no third-party wrapper needed.
 * All prices are fetched live — no synthetic data.
 */
import { SECTOR_META, DATA_START, dataEnd } from "@/lib/sectors";
import type { SectorKey } from "@/types";

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
};

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
  return: number;
}

/** Fetch OHLCV for a single ticker between two ISO date strings. */
export async function fetchTickerHistory(
  ticker: string,
  from: string = DATA_START,
  to:   string = dataEnd()
): Promise<OHLCVRow[]> {
  try {
    const p1  = Math.floor(new Date(from).getTime() / 1000);
    const p2  = Math.floor(new Date(to).getTime()   / 1000) + 86400;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${p1}&period2=${p2}&interval=1d`;

    const res  = await fetch(url, { headers: YF_HEADERS });
    if (!res.ok) return [];
    const data = await res.json() as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{ open: (number|null)[]; high: (number|null)[]; low: (number|null)[]; close: (number|null)[]; volume: (number|null)[] }>;
          };
        }>;
      };
    };

    const result = data?.chart?.result?.[0];
    if (!result?.timestamp) return [];

    const ts    = result.timestamp;
    const q     = result.indicators?.quote?.[0];
    if (!q) return [];

    return ts
      .map((unix, i) => {
        const close = q.close[i];
        if (close == null) return null;
        return {
          ticker,
          date:   new Date(unix * 1000).toISOString().slice(0, 10),
          open:   q.open[i]   ?? close,
          high:   q.high[i]   ?? close,
          low:    q.low[i]    ?? close,
          close,
          volume: q.volume[i] ?? 0,
        };
      })
      .filter((r): r is OHLCVRow => r !== null);
  } catch {
    return [];
  }
}

/** Fetch live quote for a single ticker via Yahoo Finance v8 API. */
async function fetchQuoteRaw(ticker: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res  = await fetch(url, { headers: YF_HEADERS });
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            regularMarketTime?: number;
            marketState?: string;
          };
        }>;
      };
    };
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const price  = meta.regularMarketPrice;
    const prev   = meta.chartPreviousClose ?? price;
    const change = price - prev;
    return {
      ticker,
      price,
      change,
      changePct:   prev > 0 ? (change / prev) * 100 : 0,
      marketState: meta.marketState ?? null,
      updatedAt:   new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Fetch equal-weighted basket close prices for a sector. */
export async function fetchSectorBasket(
  sector: SectorKey,
  from: string = DATA_START,
  to:   string = dataEnd()
): Promise<Map<string, Map<string, number>>> {
  const tickers = SECTOR_META[sector]?.tickers ?? [];
  const byDate  = new Map<string, Map<string, number>>();

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
  const dates  = Array.from(basket.keys()).sort();

  const basketPrices: { date: string; avg: number }[] = dates
    .map((d) => {
      const prices = Array.from(basket.get(d)!.values()).filter((v) => v > 0);
      return prices.length ? { date: d, avg: prices.reduce((a, b) => a + b, 0) / prices.length } : null;
    })
    .filter((x): x is { date: string; avg: number } => x !== null);

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
  const sorted = Array.from(returns).sort((a, b) => a.date.localeCompare(b.date));
  const idx = sorted.findIndex((r) => r.date >= targetDate);
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
  return fetchQuoteRaw(ticker);
}

/** Fetch live quotes for all tracked tickers (for ticker tape). */
export async function fetchAllQuotes(tickers: string[]) {
  const results = await Promise.allSettled(tickers.map(fetchQuote));
  return results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>> =>
      r.status === "fulfilled" && r.value != null
    )
    .map((r) => r.value!);
}
