"use client";

interface QuoteItem {
  ticker: string;
  price?: number;
  changePct?: number;
}

export default function TickerTape({ quotes }: { quotes: QuoteItem[] }) {
  const items = [...quotes, ...quotes]; // duplicate for seamless loop

  return (
    <div
      className="ticker-wrap py-2"
      style={{ borderBottom: "1px solid rgba(48,54,61,0.6)", background: "rgba(13,17,23,0.85)" }}
    >
      <div className="ticker-track">
        {items.map((q, i) => {
          const pct = q.changePct ?? 0;
          const color = pct >= 0 ? "#3FB950" : "#F85149";
          const sign  = pct >= 0 ? "▲" : "▼";
          return (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-[12px] font-mono">
              <span className="text-lss-secondary">{q.ticker.replace(".NS", "")}</span>
              {q.price != null && (
                <span className="text-lss-text font-semibold">
                  ₹{q.price.toFixed(2)}
                </span>
              )}
              {q.changePct != null && (
                <span style={{ color }}>
                  {sign} {Math.abs(pct).toFixed(2)}%
                </span>
              )}
              <span className="text-lss-border">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
