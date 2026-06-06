export interface ParliamentEvent {
  id: string;
  session: string;
  date: string; // ISO date string
  topic: string;
  bill: string;
  sector: SectorKey;
  significance_score: number; // 1-10, estimated based on bill type
  significance_basis: string; // transparent explanation of the score
  sentiment: "Positive" | "Negative" | "Neutral";
  summary: string;
  is_bill_passage: boolean;
}

export interface StockPrice {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EventSignal {
  event_id: string;
  event: ParliamentEvent;
  ret_tm1: number | null; // T-1 return
  ret_t0:  number | null; // T+0 same day
  ret_t1:  number | null; // T+1
  ret_t2:  number | null; // T+2
  ret_t5:  number | null; // T+5
  avg_daily_ret: number;
  excess_t1: number | null;
  signal_strength: number | null;
  computed_at?: string;
}

export interface SectorCorrelation {
  sector: SectorKey;
  n_events: number;
  pearson_r: number | null;
  p_value: number | null;
  mean_t1_pct: number;
  mean_excess_t1_pct: number;
  hi_intensity_mean_t1_pct: number;
  lo_intensity_mean_t1_pct: number;
  interpretation: string;
  is_significant: boolean;
}

export type SectorKey =
  | "Pharma"
  | "Defence"
  | "Banking"
  | "IT"
  | "Auto"
  | "Energy"
  | "Agriculture"
  | "Telecom"
  | "Infrastructure";

export interface SectorMeta {
  label: string;
  tickers: string[];
  color: string;
  description: string;
}

export interface SummaryStats {
  total_debates: number;
  debates_with_data: number;
  sectors_covered: number;
  strongest_signal: EventSignal | null;
  most_reactive_sector: SectorKey | null;
  most_reactive_t5_pct: number;
  data_as_of: string;
}

export interface DataFreshness {
  key: string;
  last_updated: string;
  metadata: Record<string, unknown>;
}

export interface LokSabhaSession {
  name: string;
  start: string;
  end: string;
  status: "completed" | "active" | "scheduled";
}
