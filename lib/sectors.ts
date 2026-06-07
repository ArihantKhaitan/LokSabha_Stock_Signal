import type { SectorKey, SectorMeta, LokSabhaSession } from "@/types";

export const SECTOR_META: Record<SectorKey, SectorMeta> = {
  Pharma: {
    label: "Pharma & Healthcare",
    tickers: ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS"],
    color: "#4FC3F7",
    description: "Sun Pharma · Dr Reddy's · Cipla",
  },
  Defence: {
    label: "Defence & Aerospace",
    tickers: ["HAL.NS", "BEL.NS", "MIDHANI.NS"],
    color: "#EF5350",
    description: "HAL · BEL · MIDHANI",
  },
  Banking: {
    label: "Banking & Finance",
    tickers: ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS"],
    color: "#66BB6A",
    description: "HDFC Bank · ICICI Bank · SBI",
  },
  IT: {
    label: "Information Technology",
    tickers: ["TCS.NS", "INFY.NS", "WIPRO.NS"],
    color: "#AB47BC",
    description: "TCS · Infosys · Wipro",
  },
  Auto: {
    label: "Automobile & EV",
    tickers: ["MARUTI.NS", "TATAMOTORS.BO", "M&M.NS"],
    color: "#FFA726",
    description: "Maruti · Tata Motors · M&M",
  },
  Energy: {
    label: "Energy & Renewables",
    tickers: ["RELIANCE.NS", "ONGC.NS", "NTPC.NS"],
    color: "#26C6DA",
    description: "Reliance · ONGC · NTPC",
  },
  Agriculture: {
    label: "Agriculture & Agrochem",
    tickers: ["UPL.NS", "PIIND.NS", "COROMANDEL.NS"],
    color: "#D4E157",
    description: "UPL · PI Industries · Coromandel",
  },
  Telecom: {
    label: "Telecommunications",
    tickers: ["BHARTIARTL.NS", "IDEA.NS"],
    color: "#FF7043",
    description: "Bharti Airtel · Vodafone Idea",
  },
  Infrastructure: {
    label: "Infrastructure & Construction",
    tickers: ["LT.NS", "NCC.NS", "KNRCON.NS"],
    color: "#8D6E63",
    description: "L&T · NCC · KNR Constructions",
  },
};

export const ALL_SECTORS = Object.keys(SECTOR_META) as SectorKey[];

export const SESSIONS_REGISTRY: LokSabhaSession[] = [
  { name: "Budget Session 2023",  start: "2023-02-01", end: "2023-05-05", status: "completed" },
  { name: "Monsoon Session 2023", start: "2023-07-20", end: "2023-08-11", status: "completed" },
  { name: "Winter Session 2023",  start: "2023-12-04", end: "2023-12-22", status: "completed" },
  { name: "Budget Session 2024",  start: "2024-02-02", end: "2024-06-04", status: "completed" },
  { name: "Monsoon Session 2024", start: "2024-07-22", end: "2024-08-09", status: "completed" },
  { name: "Winter Session 2024",  start: "2024-11-25", end: "2024-12-20", status: "completed" },
  { name: "Budget Session 2025",  start: "2025-01-31", end: "2025-05-09", status: "completed" },
  { name: "Monsoon Session 2025", start: "2025-07-21", end: "2025-08-22", status: "completed" },
  { name: "Winter Session 2025",  start: "2025-11-25", end: "2025-12-19", status: "completed" },
  { name: "Budget Session 2026",  start: "2026-01-31", end: "2026-04-04", status: "completed" },
];

export function getActiveSession(): LokSabhaSession | null {
  const today = new Date().toISOString().slice(0, 10);
  return SESSIONS_REGISTRY.find(
    (s) => s.start <= today && s.end >= today
  ) ?? null;
}

export function getNextSession(): LokSabhaSession | null {
  const today = new Date().toISOString().slice(0, 10);
  return SESSIONS_REGISTRY.find((s) => s.start > today) ?? null;
}

export const DATA_START = "2023-01-01";

export function dataEnd(): string {
  return new Date().toISOString().slice(0, 10);
}
