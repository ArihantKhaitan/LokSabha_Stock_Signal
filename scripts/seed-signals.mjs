/**
 * Local seed script — run once from your machine to populate Supabase with real
 * Yahoo Finance data. Yahoo Finance works fine from home IPs; Vercel IPs get blocked.
 *
 * Usage:
 *   node scripts/seed-signals.mjs
 *
 * Reads credentials from .env.local automatically.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = ".env.local";
const envVars = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
};

// ── Constants ────────────────────────────────────────────────────────────────
const DATA_START = "2023-01-01";
const dataEnd = () => new Date().toISOString().slice(0, 10);

const SECTOR_META = {
  Pharma:         { tickers: ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS"] },
  Defence:        { tickers: ["HAL.NS", "BEL.NS", "MIDHANI.NS"] },
  Banking:        { tickers: ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS"] },
  IT:             { tickers: ["TCS.NS", "INFY.NS", "WIPRO.NS"] },
  Auto:           { tickers: ["MARUTI.NS", "TATAMOTORS.BO", "M&M.NS"] },
  Energy:         { tickers: ["RELIANCE.NS", "ONGC.NS", "NTPC.NS"] },
  Agriculture:    { tickers: ["UPL.NS", "PIIND.NS", "COROMANDEL.NS"] },
  Telecom:        { tickers: ["BHARTIARTL.NS", "IDEA.NS"] },
  Infrastructure: { tickers: ["LT.NS", "NCC.NS", "KNRCON.NS"] },
};

// Parliament events (matches lib/parliament.ts exactly)
const PARLIAMENT_EVENTS = [
  { id: "BS2023-001", session: "Budget Session 2023",  date: "2023-02-01", sector: "Pharma",         significance_score: 8,  sentiment: "Positive" },
  { id: "BS2023-002", session: "Budget Session 2023",  date: "2023-02-01", sector: "Infrastructure", significance_score: 9,  sentiment: "Positive" },
  { id: "BS2023-003", session: "Budget Session 2023",  date: "2023-02-01", sector: "Defence",        significance_score: 9,  sentiment: "Positive" },
  { id: "BS2023-004", session: "Budget Session 2023",  date: "2023-02-01", sector: "Energy",         significance_score: 8,  sentiment: "Positive" },
  { id: "BS2023-005", session: "Budget Session 2023",  date: "2023-02-07", sector: "Banking",        significance_score: 6,  sentiment: "Neutral"  },
  { id: "BS2023-006", session: "Budget Session 2023",  date: "2023-02-09", sector: "Agriculture",    significance_score: 7,  sentiment: "Positive" },
  { id: "BS2023-007", session: "Budget Session 2023",  date: "2023-07-27", sector: "Pharma",         significance_score: 7,  sentiment: "Positive" },
  { id: "BS2023-008", session: "Budget Session 2023",  date: "2023-03-15", sector: "Banking",        significance_score: 7,  sentiment: "Negative" },
  { id: "BS2023-009", session: "Budget Session 2023",  date: "2023-04-03", sector: "Auto",           significance_score: 6,  sentiment: "Positive" },
  { id: "MS2023-001", session: "Monsoon Session 2023", date: "2023-07-20", sector: "IT",             significance_score: 8,  sentiment: "Negative" },
  { id: "MS2023-002", session: "Monsoon Session 2023", date: "2023-08-07", sector: "IT",             significance_score: 9,  sentiment: "Neutral"  },
  { id: "MS2023-003", session: "Monsoon Session 2023", date: "2023-07-25", sector: "Defence",        significance_score: 7,  sentiment: "Positive" },
  { id: "MS2023-004", session: "Monsoon Session 2023", date: "2023-07-26", sector: "Agriculture",    significance_score: 9,  sentiment: "Negative" },
  { id: "MS2023-005", session: "Monsoon Session 2023", date: "2023-08-02", sector: "Telecom",        significance_score: 9,  sentiment: "Positive" },
  { id: "MS2023-006", session: "Monsoon Session 2023", date: "2023-08-07", sector: "Banking",        significance_score: 6,  sentiment: "Positive" },
  { id: "MS2023-007", session: "Monsoon Session 2023", date: "2023-08-09", sector: "Pharma",         significance_score: 7,  sentiment: "Negative" },
  { id: "MS2023-008", session: "Monsoon Session 2023", date: "2023-08-10", sector: "Energy",         significance_score: 7,  sentiment: "Positive" },
  { id: "WS2023-001", session: "Winter Session 2023",  date: "2023-12-20", sector: "Telecom",        significance_score: 9,  sentiment: "Positive" },
  { id: "WS2023-002", session: "Winter Session 2023",  date: "2023-12-20", sector: "Banking",        significance_score: 7,  sentiment: "Neutral"  },
  { id: "WS2023-003", session: "Winter Session 2023",  date: "2023-12-12", sector: "Defence",        significance_score: 5,  sentiment: "Positive" },
  { id: "WS2023-004", session: "Winter Session 2023",  date: "2023-12-14", sector: "Pharma",         significance_score: 6,  sentiment: "Negative" },
  { id: "WS2023-005", session: "Winter Session 2023",  date: "2023-12-18", sector: "Agriculture",    significance_score: 5,  sentiment: "Positive" },
  { id: "BS2024-001", session: "Budget Session 2024",  date: "2024-02-01", sector: "Defence",        significance_score: 9,  sentiment: "Positive" },
  { id: "BS2024-002", session: "Budget Session 2024",  date: "2024-02-01", sector: "Infrastructure", significance_score: 10, sentiment: "Positive" },
  { id: "BS2024-003", session: "Budget Session 2024",  date: "2024-02-01", sector: "Energy",         significance_score: 8,  sentiment: "Positive" },
  { id: "BS2024-004", session: "Budget Session 2024",  date: "2024-02-05", sector: "Banking",        significance_score: 5,  sentiment: "Negative" },
  { id: "BS2024-005", session: "Budget Session 2024",  date: "2024-02-08", sector: "IT",             significance_score: 7,  sentiment: "Positive" },
  { id: "BS2024-006", session: "Budget Session 2024",  date: "2024-02-09", sector: "Agriculture",    significance_score: 7,  sentiment: "Positive" },
  { id: "BS2024-007", session: "Budget Session 2024",  date: "2024-03-15", sector: "Defence",        significance_score: 6,  sentiment: "Positive" },
  { id: "BS2024-008", session: "Budget Session 2024",  date: "2024-04-10", sector: "Pharma",         significance_score: 6,  sentiment: "Negative" },
  { id: "MS2024-001", session: "Monsoon Session 2024", date: "2024-07-23", sector: "Defence",        significance_score: 10, sentiment: "Positive" },
  { id: "MS2024-002", session: "Monsoon Session 2024", date: "2024-07-23", sector: "IT",             significance_score: 8,  sentiment: "Positive" },
  { id: "MS2024-003", session: "Monsoon Session 2024", date: "2024-07-23", sector: "Banking",        significance_score: 9,  sentiment: "Negative" },
  { id: "MS2024-004", session: "Monsoon Session 2024", date: "2024-07-23", sector: "Agriculture",    significance_score: 8,  sentiment: "Positive" },
  { id: "MS2024-005", session: "Monsoon Session 2024", date: "2024-07-23", sector: "Energy",         significance_score: 8,  sentiment: "Positive" },
  { id: "MS2024-006", session: "Monsoon Session 2024", date: "2024-07-23", sector: "Banking",        significance_score: 8,  sentiment: "Negative" },
  { id: "MS2024-007", session: "Monsoon Session 2024", date: "2024-08-08", sector: "Infrastructure", significance_score: 9,  sentiment: "Neutral"  },
  { id: "MS2024-008", session: "Monsoon Session 2024", date: "2024-08-01", sector: "Infrastructure", significance_score: 8,  sentiment: "Positive" },
  { id: "MS2024-009", session: "Monsoon Session 2024", date: "2024-08-02", sector: "Auto",           significance_score: 6,  sentiment: "Neutral"  },
  { id: "MS2024-010", session: "Monsoon Session 2024", date: "2024-08-07", sector: "Telecom",        significance_score: 6,  sentiment: "Positive" },
  { id: "MS2024-011", session: "Monsoon Session 2024", date: "2024-08-08", sector: "Banking",        significance_score: 7,  sentiment: "Positive" },
  { id: "WS2024-001", session: "Winter Session 2024",  date: "2024-12-02", sector: "Banking",        significance_score: 6,  sentiment: "Neutral"  },
  { id: "WS2024-002", session: "Winter Session 2024",  date: "2024-12-04", sector: "Defence",        significance_score: 7,  sentiment: "Positive" },
  { id: "BS2025-001", session: "Budget Session 2025",  date: "2025-02-01", sector: "Defence",        significance_score: 9,  sentiment: "Positive", topic: "Union Budget 2025-26 — Defence ₹6.81 Lakh Crore, Capex ₹1.80 Lakh Crore Record",               bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8) + national security relevance +1 = 9", summary: "Defence budget ₹6.81 lakh crore. Capital outlay ₹1.80 lakh crore (record high). HAL Tejas Mk2, BEL electronic warfare, Bharat Forge munitions funded. Source: indiabudget.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-002", session: "Budget Session 2025",  date: "2025-02-01", sector: "Infrastructure", significance_score: 9,  sentiment: "Positive", topic: "Union Budget 2025-26 — Infrastructure Capex ₹11.21 Lakh Crore",                                bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8) + sustained record-level capex +1 = 9", summary: "Infrastructure capex maintained at ₹11.21 lakh crore. PM Gati Shakti, national highways, railways, airports. L&T, NCC, KNR among key contractors. Source: indiabudget.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-003", session: "Budget Session 2025",  date: "2025-02-01", sector: "Banking",        significance_score: 9,  sentiment: "Positive", topic: "Union Budget 2025-26 — Zero Income Tax up to ₹12 Lakh: Consumption Boost",                     bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8) + largest personal income tax relief in a decade +1 = 9", summary: "Income tax exemption raised to ₹12 lakh under new regime. Consumption stimulus expected. HDFC Bank, ICICI projected higher retail credit growth. Source: indiabudget.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-004", session: "Budget Session 2025",  date: "2025-02-01", sector: "Energy",         significance_score: 8,  sentiment: "Positive", topic: "Union Budget 2025-26 — Nuclear Energy Mission: Private Sector Entry",                           bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8); landmark policy opening nuclear to private sector for first time", summary: "Nuclear Energy Mission announced with private sector participation allowed. 100 GW nuclear target by 2047. NTPC nuclear JV potential, ONGC diversification. Source: indiabudget.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-005", session: "Budget Session 2025",  date: "2025-02-01", sector: "Agriculture",    significance_score: 8,  sentiment: "Positive", topic: "Union Budget 2025-26 — PM-Dhan Dhanya Krishi Yojana & Agri Credit ₹20 Lakh Crore",            bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8); PM-Dhan Dhanya and record agri credit target", summary: "PM-Dhan Dhanya Krishi Yojana targeting 100 low-productivity districts. Agricultural credit target ₹20 lakh crore. Kisan Credit Card limit doubled. UPL, Coromandel beneficiaries. Source: agricoop.nic.in 2025", is_bill_passage: false },
  { id: "BS2025-006", session: "Budget Session 2025",  date: "2025-02-01", sector: "Pharma",         significance_score: 7,  sentiment: "Positive", topic: "Union Budget 2025-26 — Pharma PLI Phase 2 & MedTech ₹13,000 Cr",                              bill: "Finance Bill 2025", significance_basis: "Full Budget (base 8) − 1 = 7; PLI Phase 2 continuation for pharma and MedTech", summary: "Pharma PLI Phase 2 continued with ₹13,000 Cr. MedTech PLI expanded. Sun Pharma, Cipla, Dr Reddy API domestic production targets. Source: pharmaceuticals.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-007", session: "Budget Session 2025",  date: "2025-02-01", sector: "IT",             significance_score: 7,  sentiment: "Positive", topic: "Union Budget 2025-26 — AI Centre of Excellence & Gig Workers Social Security",                  bill: "Finance Bill 2025", significance_basis: "Full Budget; AI Centre of Excellence + gig workers social security scheme", summary: "National Centre of Excellence for AI allocation. Gig workers social security registration portal — 1 crore workers. TCS, Infosys implementation partnerships cited. Source: indiabudget.gov.in 2025-26", is_bill_passage: false },
  { id: "BS2025-008", session: "Budget Session 2025",  date: "2025-03-14", sector: "Energy",         significance_score: 6,  sentiment: "Positive", topic: "Oilfields (Regulation and Development) Amendment Bill 2025 — Passed",                           bill: "Oilfields (Regulation and Development) Amendment Bill 2025", significance_basis: "Bill passage (base 6); modernises 1948 Act, opens exploration to private/foreign sector", summary: "Oilfields Amendment Bill replaces 1948 Act. Enables private and foreign investment in oil/gas exploration. ONGC, Reliance Industries domestic E&P expansion. Source: petroleum.nic.in", is_bill_passage: true },
  { id: "BS2025-009", session: "Budget Session 2025",  date: "2025-04-02", sector: "Banking",        significance_score: 8,  sentiment: "Positive", topic: "Insurance Laws (Amendment) Bill 2025 — FDI Raised to 100%",                                     bill: "Insurance Laws (Amendment) Bill 2025", significance_basis: "Bill passage (base 6) + 100% FDI in insurance (landmark change) +2 = 8", summary: "Insurance Laws Amendment Bill raises FDI in insurance to 100% from 74%. HDFC Life, SBI Life, ICICI Prudential positive analyst upgrades. Source: irdai.gov.in, prsindia.org", is_bill_passage: true },
];

// ── Stock data helpers ───────────────────────────────────────────────────────
async function fetchTickerHistory(ticker, from, to) {
  try {
    const p1  = Math.floor(new Date(from).getTime() / 1000);
    const p2  = Math.floor(new Date(to).getTime()   / 1000) + 86400;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${p1}&period2=${p2}&interval=1d`;

    const res  = await fetch(url, { headers: YF_HEADERS });
    if (!res.ok) { console.warn(`  ⚠ ${ticker}: HTTP ${res.status}`); return []; }
    const data = await res.json();

    const result = data?.chart?.result?.[0];
    if (!result?.timestamp) return [];

    const ts = result.timestamp;
    const q  = result.indicators?.quote?.[0];
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
      .filter(Boolean);
  } catch (e) {
    console.warn(`  ⚠ ${ticker} failed: ${e.message}`);
    return [];
  }
}

async function fetchSectorBasket(sector, from, to) {
  const tickers = SECTOR_META[sector]?.tickers ?? [];
  const byDate = new Map();
  await Promise.all(
    tickers.map(async (tkr) => {
      const rows = await fetchTickerHistory(tkr, from, to);
      for (const row of rows) {
        if (!byDate.has(row.date)) byDate.set(row.date, new Map());
        byDate.get(row.date).set(tkr, row.close);
      }
    })
  );
  return byDate;
}

function computeSectorReturns(byDate) {
  const dates = Array.from(byDate.keys()).sort();
  const basketPrices = dates
    .map((d) => {
      const prices = Array.from(byDate.get(d).values()).filter((v) => v > 0);
      return prices.length ? { date: d, avg: prices.reduce((a, b) => a + b, 0) / prices.length } : null;
    })
    .filter(Boolean);

  const returns = [];
  for (let i = 1; i < basketPrices.length; i++) {
    const prev = basketPrices[i - 1].avg;
    const curr = basketPrices[i].avg;
    if (prev > 0) returns.push({ date: basketPrices[i].date, return: (curr - prev) / prev });
  }
  return returns;
}

function averageDailyReturn(returns) {
  if (!returns.length) return 0;
  return returns.reduce((s, r) => s + r.return, 0) / returns.length;
}

function basketReturnAtOffset(returns, targetDate, offset) {
  const sorted = [...returns].sort((a, b) => a.date.localeCompare(b.date));
  const idx = sorted.findIndex((r) => r.date >= targetDate);
  if (idx === -1) return null;
  const targetIdx = idx + offset;
  if (targetIdx < 0 || targetIdx >= sorted.length) return null;
  return sorted[targetIdx].return;
}

// ── Upsert helpers ───────────────────────────────────────────────────────────
async function upsertParliamentEvent(ev) {
  const { error } = await supabase.from("parliament_events").upsert(ev, { onConflict: "id" });
  if (error) console.warn(`  ⚠ parliament_events upsert error for ${ev.id}: ${error.message}`);
}

async function upsertStockPrices(prices) {
  if (!prices.length) return;
  // Batch in chunks of 500
  for (let i = 0; i < prices.length; i += 500) {
    const chunk = prices.slice(i, i + 500);
    const { error } = await supabase.from("stock_prices").upsert(chunk, { onConflict: "ticker,date" });
    if (error) console.warn(`  ⚠ stock_prices upsert error: ${error.message}`);
  }
}

async function upsertSignal(sig) {
  const { error } = await supabase.from("signals").upsert(
    {
      event_id:        sig.event_id,
      ret_tm1:         sig.ret_tm1,
      ret_t0:          sig.ret_t0,
      ret_t1:          sig.ret_t1,
      ret_t2:          sig.ret_t2,
      ret_t5:          sig.ret_t5,
      avg_daily_ret:   sig.avg_daily_ret,
      excess_t1:       sig.excess_t1,
      signal_strength: sig.signal_strength,
      computed_at:     new Date().toISOString(),
    },
    { onConflict: "event_id" }
  );
  if (error) console.warn(`  ⚠ signal upsert error for ${sig.event_id}: ${error.message}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const from = DATA_START;
  const to   = dataEnd();
  console.log(`\n🌱 Seeding LokSabha Stock Signal — ${from} → ${to}\n`);

  // Cache sector returns so we only fetch Yahoo Finance once per sector
  const sectorReturns = {};
  const sectorBaskets = {};

  for (const sector of Object.keys(SECTOR_META)) {
    console.log(`\n📈 ${sector}`);
    const byDate = await fetchSectorBasket(sector, from, to);
    sectorBaskets[sector] = byDate;

    // Upsert stock prices to Supabase
    const allRows = [];
    for (const [, tickerMap] of byDate) {
      for (const [tkr, close] of tickerMap) {
        // We stored full rows in fetchTickerHistory; rebuild from byDate
        // (byDate only has date→ticker→close; full OHLCV is in fetchTickerHistory directly)
      }
    }

    const returns = computeSectorReturns(byDate);
    sectorReturns[sector] = returns;
    console.log(`  → ${returns.length} daily returns computed`);
  }

  // Fetch and upsert all ticker history to stock_prices table
  console.log("\n💾 Upserting stock prices to Supabase...");
  const allTickers = [...new Set(Object.values(SECTOR_META).flatMap((m) => m.tickers))];
  for (const ticker of allTickers) {
    try {
      const rows = await fetchTickerHistory(ticker, from, to);
      await upsertStockPrices(rows);
      console.log(`  ✅ ${ticker}: ${rows.length} rows`);
    } catch (e) {
      console.warn(`  ⚠ ${ticker}: ${e.message}`);
    }
  }

  // Compute and upsert signals
  console.log("\n🧮 Computing signals...");
  for (const ev of PARLIAMENT_EVENTS) {
    const returns = sectorReturns[ev.sector];
    if (!returns || !returns.length) {
      console.warn(`  ⚠ No returns for ${ev.sector} — skipping ${ev.id}`);
      continue;
    }

    const avgRet = averageDailyReturn(returns);
    const rtm1  = basketReturnAtOffset(returns, ev.date, -1);
    const rt0   = basketReturnAtOffset(returns, ev.date,  0);
    const rt1   = basketReturnAtOffset(returns, ev.date,  1);
    const rt2   = basketReturnAtOffset(returns, ev.date,  2);
    const rt5   = basketReturnAtOffset(returns, ev.date,  5);

    const excess   = rt1 != null ? rt1 - avgRet : null;
    const strength = excess != null ? excess * ev.significance_score : null;

    // Ensure parliament_event row exists (satisfies FK constraint)
    await upsertParliamentEvent({
      id: ev.id, session: ev.session, date: ev.date, sector: ev.sector,
      significance_score: ev.significance_score, sentiment: ev.sentiment,
      topic: ev.topic ?? ev.id, bill: ev.bill ?? "", significance_basis: ev.significance_basis ?? "",
      summary: ev.summary ?? "", is_bill_passage: ev.is_bill_passage ?? false,
    });

    await upsertSignal({
      event_id:        ev.id,
      ret_tm1:         rtm1,
      ret_t0:          rt0,
      ret_t1:          rt1,
      ret_t2:          rt2,
      ret_t5:          rt5,
      avg_daily_ret:   avgRet,
      excess_t1:       excess,
      signal_strength: strength,
    });

    const t1str = rt1 != null ? `${(rt1 * 100).toFixed(2)}%` : "N/A";
    console.log(`  ✅ ${ev.id} — T+1: ${t1str}`);
  }

  // Update freshness
  await supabase.from("data_freshness").upsert(
    { key: "signals", last_updated: new Date().toISOString(), metadata: { count: PARLIAMENT_EVENTS.length, source: "local-seed" } },
    { onConflict: "key" }
  );

  console.log("\n✅ Seed complete!\n");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
