"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { SECTOR_META } from "@/lib/sectors";
import { fmtR, fmtP } from "@/lib/utils";
import type { EventSignal, SectorCorrelation } from "@/types";

interface CorrelationGridProps {
  correlations: SectorCorrelation[];
  signals:      EventSignal[];
}

function ScatterPlot({
  corr,
  signals,
}: {
  corr: SectorCorrelation;
  signals: EventSignal[];
}) {
  const ref = useRef<SVGSVGElement>(null);
  const color = SECTOR_META[corr.sector]?.color ?? "#FF6B35";
  const sigColor = corr.is_significant ? "#FF6B35" : "#484F58";

  useEffect(() => {
    if (!ref.current) return;
    const size   = ref.current.clientWidth || 220;
    const margin = { top: 10, right: 10, bottom: 28, left: 32 };
    const inner  = { w: size - margin.left - margin.right, h: size - margin.top - margin.bottom };

    const data = signals
      .filter((s) => s.event.sector === corr.sector && s.ret_t1 != null)
      .map((s) => ({ x: s.event.significance_score, y: s.ret_t1! * 100, topic: s.event.topic }));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("height", size);

    if (!data.length) {
      svg.append("text")
        .attr("x", size / 2).attr("y", size / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#484F58")
        .attr("font-size", "11px")
        .text("No data");
      return;
    }

    const xExt = d3.extent(data, (d) => d.x) as [number, number];
    const yExt = d3.extent(data, (d) => d.y) as [number, number];
    const pad  = 0.5;

    const x = d3.scaleLinear().domain([xExt[0] - pad, xExt[1] + pad]).range([0, inner.w]);
    const y = d3.scaleLinear().domain([yExt[0] - 0.2, yExt[1] + 0.2]).range([inner.h, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid
    g.append("g").call(
      d3.axisLeft(y).ticks(4).tickSize(-inner.w).tickFormat(() => "")
    ).call((ax) => { ax.select(".domain").remove(); ax.selectAll(".tick line").attr("stroke", "#21262d"); });

    // Zero line
    if (y(0) >= 0 && y(0) <= inner.h) {
      g.append("line")
        .attr("x1", 0).attr("x2", inner.w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", "#30363D").attr("stroke-width", 1);
    }

    // Trend line
    if (data.length >= 2 && corr.pearson_r != null) {
      const xs = data.map((d) => d.x), ys = data.map((d) => d.y);
      const mx = xs.reduce((a, b) => a + b) / xs.length;
      const my = ys.reduce((a, b) => a + b) / ys.length;
      const m  = xs.reduce((s, xi, i) => s + (xi - mx) * (ys[i] - my), 0) /
                 xs.reduce((s, xi) => s + (xi - mx) ** 2, 0);
      const b  = my - m * mx;
      const x0 = xExt[0], x1 = xExt[1];
      g.append("line")
        .attr("x1", x(x0)).attr("y1", y(m * x0 + b))
        .attr("x2", x(x1)).attr("y2", y(m * x1 + b))
        .attr("stroke", sigColor)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3")
        .attr("opacity", 0.7);
    }

    // Dots
    const tooltip = d3.select("body").selectAll(".d3-tooltip-scatter")
      .data([0]).join("div").attr("class", "d3-tooltip d3-tooltip-scatter")
      .style("opacity", 0).style("position", "fixed").style("pointer-events", "none");

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .attr("fill", color)
      .attr("opacity", 0.7)
      .attr("stroke", "#0D1117")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
          .html(`<b>${d.topic.slice(0, 50)}…</b><br>Significance: ${d.x}<br>T+1: ${d.y.toFixed(2)}%`)
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY - 10}px`);
        d3.select(this).attr("r", 7).attr("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).attr("r", 5).attr("opacity", 0.7);
      });

    // Axes
    g.append("g").attr("transform", `translate(0,${inner.h})`).call(
      d3.axisBottom(x).ticks(4).tickFormat(d3.format("d") as never)
    ).call((ax) => {
      ax.select(".domain").attr("stroke", "#30363D");
      ax.selectAll("text").attr("fill", "#6E7681").attr("font-size", "9px");
      ax.selectAll(".tick line").attr("stroke", "#30363D");
    });
    g.append("g").call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}%`))
      .call((ax) => {
        ax.select(".domain").attr("stroke", "#30363D");
        ax.selectAll("text").attr("fill", "#6E7681").attr("font-size", "9px");
        ax.selectAll(".tick line").attr("stroke", "none");
      });
  }, [corr, signals]);

  const sig = corr.is_significant;

  return (
    <motion.div
      className="glass rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold text-lss-text">
            {SECTOR_META[corr.sector]?.label}
          </p>
          <p className="text-[10px] text-lss-tertiary">n={corr.n_events} events</p>
        </div>
        <div className="text-right">
          <span
            className="text-[11px] font-bold font-mono"
            style={{ color: sig ? "#FF6B35" : "#484F58" }}
          >
            {fmtR(corr.pearson_r)}
          </span>
          <p className="text-[10px] text-lss-tertiary">{fmtP(corr.p_value)}</p>
          {sig && (
            <span className="text-[9px] font-bold text-lss-accent">★ p&lt;0.05</span>
          )}
        </div>
      </div>

      <svg ref={ref} width="100%" />

      <p className="text-[10px] text-lss-tertiary leading-relaxed mt-1">
        {corr.interpretation}
      </p>
    </motion.div>
  );
}

export default function CorrelationGrid({ correlations, signals }: CorrelationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {correlations.map((c) => (
        <ScatterPlot key={c.sector} corr={c} signals={signals} />
      ))}
    </div>
  );
}
