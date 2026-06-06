import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtPct(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "N/A";
  const sign = val >= 0 ? "+" : "";
  return `${sign}${(val * 100).toFixed(decimals)}%`;
}

export function fmtR(r: number | null | undefined): string {
  if (r == null) return "N/A";
  return `r = ${r >= 0 ? "+" : ""}${r.toFixed(3)}`;
}

export function fmtP(p: number | null | undefined): string {
  if (p == null) return "";
  return `p = ${p.toFixed(4)}`;
}

export function chipClass(val: number | null | undefined): string {
  if (val == null) return "chip chip-neutral";
  const pct = val * 100;
  if (pct >= 0.3) return "chip chip-positive";
  if (pct <= -0.3) return "chip chip-negative";
  return "chip chip-neutral";
}

export function sentimentClass(sentiment: string): string {
  if (sentiment === "Positive") return "badge-positive";
  if (sentiment === "Negative") return "badge-negative";
  return "badge-neutral";
}

export function intensityBar(score: number, max = 10): string {
  const filled = "█".repeat(score);
  const empty  = "░".repeat(max - score);
  return filled + empty;
}

/** Format a date string (YYYY-MM-DD) to "1 Feb 2023" */
export function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

/** Trading-day offset: given a sorted list of date strings, return the date
 *  at `offset` positions from the first index >= targetDate. */
export function dateAtOffset(dates: string[], targetDate: string, offset: number): string | null {
  const sorted = [...dates].sort();
  const idx    = sorted.findIndex((d) => d >= targetDate);
  if (idx === -1) return null;
  const newIdx = idx + offset;
  if (newIdx < 0 || newIdx >= sorted.length) return null;
  return sorted[newIdx];
}
