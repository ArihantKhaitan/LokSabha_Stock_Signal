import { createClient } from "@supabase/supabase-js";
import type {
  ParliamentEvent,
  StockPrice,
  EventSignal,
  DataFreshness,
} from "@/types";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);

/* ── Parliament events ─────────────────────────────────────────────── */
export async function getParliamentEvents(): Promise<ParliamentEvent[]> {
  const { data, error } = await supabase
    .from("parliament_events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data as ParliamentEvent[];
}

export async function getEventById(id: string): Promise<ParliamentEvent | null> {
  const { data, error } = await supabase
    .from("parliament_events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as ParliamentEvent;
}

/* ── Stock prices ──────────────────────────────────────────────────── */
export async function getStockPrices(
  ticker: string,
  from: string,
  to: string
): Promise<StockPrice[]> {
  const { data, error } = await supabase
    .from("stock_prices")
    .select("*")
    .eq("ticker", ticker)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as StockPrice[];
}

export async function upsertStockPrices(prices: StockPrice[]): Promise<void> {
  if (!prices.length) return;
  const { error } = await supabase
    .from("stock_prices")
    .upsert(prices, { onConflict: "ticker,date" });
  if (error) throw error;
}

/* ── Signals ───────────────────────────────────────────────────────── */
export async function getSignals(): Promise<EventSignal[]> {
  const { data, error } = await supabase
    .from("signals")
    .select(`
      *,
      event:parliament_events(*)
    `);
  if (error) throw error;
  return data as unknown as EventSignal[];
}

export async function upsertSignal(
  sig: Omit<EventSignal, "event">
): Promise<void> {
  const { error } = await supabase
    .from("signals")
    .upsert(
      {
        event_id:       sig.event_id,
        ret_tm1:        sig.ret_tm1,
        ret_t0:         sig.ret_t0,
        ret_t1:         sig.ret_t1,
        ret_t2:         sig.ret_t2,
        ret_t5:         sig.ret_t5,
        avg_daily_ret:  sig.avg_daily_ret,
        excess_t1:      sig.excess_t1,
        signal_strength: sig.signal_strength,
        computed_at:    new Date().toISOString(),
      },
      { onConflict: "event_id" }
    );
  if (error) throw error;
}

/* ── Freshness ─────────────────────────────────────────────────────── */
export async function getFreshness(key: string): Promise<DataFreshness | null> {
  const { data } = await supabase
    .from("data_freshness")
    .select("*")
    .eq("key", key)
    .single();
  return data as DataFreshness | null;
}

export async function setFreshness(
  key: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await supabase.from("data_freshness").upsert({
    key,
    last_updated: new Date().toISOString(),
    metadata: meta ?? {},
  });
}
