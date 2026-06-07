"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface OHLCV {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

interface CandlestickChartProps {
  data:        OHLCV[];
  debateDate:  string;
  title?:      string;
  height?:     number;
}

export default function CandlestickChart({
  data,
  debateDate,
  title = "",
  height = 360,
}: CandlestickChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const w      = ref.current.clientWidth || 700;
    const margin = { top: 24, right: 16, bottom: 36, left: 60 };
    const inner  = { w: w - margin.left - margin.right, h: height - margin.top - margin.bottom };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("height", height);

    const parsed = data.map((d) => ({ ...d, dt: new Date(d.date + "T00:00:00") }));

    const x = d3.scaleBand()
      .domain(parsed.map((d) => d.date))
      .range([0, inner.w])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([d3.min(parsed, (d) => d.low)! * 0.998, d3.max(parsed, (d) => d.high)! * 1.002])
      .range([inner.h, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid
    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickSize(-inner.w).tickFormat(() => ""))
      .call((ax) => { ax.select(".domain").remove(); ax.selectAll(".tick line").attr("stroke", "#21262d").attr("stroke-dasharray", "3,3"); });

    // Candles
    const candle = g.selectAll(".candle").data(parsed).join("g").attr("class", "candle");

    candle.append("line") // wick
      .attr("x1", (d) => x(d.date)! + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.date)! + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.high))
      .attr("y2", (d) => y(d.low))
      .attr("stroke", (d) => d.close >= d.open ? "#3FB950" : "#F85149")
      .attr("stroke-width", 1);

    candle.append("rect") // body
      .attr("x", (d) => x(d.date)!)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(Math.max(d.open, d.close)))
      .attr("height", (d) => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr("fill", (d) => d.close >= d.open ? "#3FB950" : "#F85149")
      .attr("opacity", 0.85);

    // Debate date annotation
    const debateX = x(debateDate);
    const debateInRange = debateX != null;

    if (!debateInRange) {
      svg.append("text")
        .attr("x", margin.left + inner.w / 2)
        .attr("y", margin.top + inner.h / 2 + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#9C7850")
        .attr("font-size", "10px")
        .text("⚠ Debate date falls on a market holiday — marker not shown");
    }

    if (debateX != null) {
      const cx = debateX + x.bandwidth() / 2;
      g.append("line")
        .attr("x1", cx).attr("x2", cx)
        .attr("y1", 0).attr("y2", inner.h)
        .attr("stroke", "#FF6B35")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3");

      g.append("rect")
        .attr("x", cx + 4).attr("y", 2)
        .attr("width", 70).attr("height", 18)
        .attr("rx", 4)
        .attr("fill", "rgba(255,107,53,0.15)")
        .attr("stroke", "rgba(255,107,53,0.5)")
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", cx + 8).attr("y", 14)
        .attr("fill", "#FF6B35")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .text("🏛 Debate Day");
    }

    // X axis (show only some dates)
    const tickInterval = Math.max(1, Math.floor(parsed.length / 8));
    const tickDates = parsed.filter((_, i) => i % tickInterval === 0).map((d) => d.date);

    g.append("g")
      .attr("transform", `translate(0,${inner.h})`)
      .call(d3.axisBottom(x).tickValues(tickDates).tickFormat((d) => {
        const dt = new Date(d + "T00:00:00");
        return d3.timeFormat("%d %b")(dt);
      }))
      .call((ax) => {
        ax.select(".domain").attr("stroke", "#30363D");
        ax.selectAll("text").attr("fill", "#6E7681").attr("font-size", "10px").attr("transform", "rotate(-20)").attr("text-anchor", "end");
        ax.selectAll(".tick line").attr("stroke", "#30363D");
      });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat((d) => `₹${(+d).toFixed(0)}`))
      .call((ax) => {
        ax.select(".domain").attr("stroke", "#30363D");
        ax.selectAll("text").attr("fill", "#6E7681").attr("font-size", "10px");
        ax.selectAll(".tick line").attr("stroke", "none");
      });

    // Title
    if (title) {
      svg.append("text")
        .attr("x", margin.left)
        .attr("y", 14)
        .attr("fill", "#8B949E")
        .attr("font-size", "11px")
        .text(title);
    }
  }, [data, debateDate, height, title]);

  return (
    <div className="glass rounded-2xl p-4">
      <svg ref={ref} width="100%" className="overflow-visible" />
    </div>
  );
}
