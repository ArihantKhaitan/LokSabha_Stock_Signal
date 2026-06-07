"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { SESSIONS_REGISTRY } from "@/lib/sectors";

const COLORS = {
  completed: "#FF6B35",
  active:    "#3FB950",
  scheduled: "#30363D",
};

export default function SessionTimeline() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg    = d3.select(ref.current);
    const width  = ref.current.clientWidth || 800;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 160 };
    const inner  = { w: width - margin.left - margin.right, h: height - margin.top - margin.bottom };

    svg.selectAll("*").remove();
    svg.attr("height", height);

    const today = new Date();
    const allDates = SESSIONS_REGISTRY.flatMap((s) => [new Date(s.start), new Date(s.end)]);
    const domainMax = d3.max([...allDates, today])!;
    const xScale = d3.scaleTime()
      .domain([d3.min(allDates)!, domainMax])
      .range([0, inner.w]);

    const yScale = d3.scaleBand()
      .domain(SESSIONS_REGISTRY.map((s) => s.name))
      .range([0, inner.h])
      .padding(0.35);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${inner.h})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(6)
          .tickSize(-inner.h)
          .tickFormat(() => "")
      )
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick line")
          .attr("stroke", "#21262d")
          .attr("stroke-dasharray", "4,4");
      });

    // Bars
    g.selectAll(".bar")
      .data(SESSIONS_REGISTRY)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(new Date(d.start)))
      .attr("y", (d) => yScale(d.name)!)
      .attr("width", (d) => Math.max(2, xScale(new Date(d.end)) - xScale(new Date(d.start))))
      .attr("height", yScale.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => COLORS[d.status])
      .attr("opacity", (d) => (d.status === "scheduled" ? 0.35 : 0.85))
      .attr("stroke", (d) => COLORS[d.status])
      .attr("stroke-width", 1);

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${inner.h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %Y") as never))
      .call((ax) => {
        ax.select(".domain").attr("stroke", "#30363D");
        ax.selectAll("text")
          .attr("fill", "#6E7681")
          .attr("font-size", "10px");
        ax.selectAll(".tick line").attr("stroke", "#30363D");
      });

    // Y labels
    g.selectAll(".y-label")
      .data(SESSIONS_REGISTRY)
      .join("text")
      .attr("class", "y-label")
      .attr("x", -8)
      .attr("y", (d) => yScale(d.name)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#8B949E")
      .attr("font-size", "10px")
      .text((d) => d.name);

    // Today line — always show
    {
      g.append("line")
        .attr("x1", xScale(today)).attr("x2", xScale(today))
        .attr("y1", 0).attr("y2", inner.h)
        .attr("stroke", "#3FB950")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3");

      g.append("text")
        .attr("x", xScale(today) + 4)
        .attr("y", -4)
        .attr("fill", "#3FB950")
        .attr("font-size", "9px")
        .text("Today");
    }
  }, []);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-lss-text">Parliament Sessions</h3>
        <div className="flex items-center gap-4 text-[11px] text-lss-tertiary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lss-accent inline-block" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lss-green inline-block" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lss-border inline-block" /> Scheduled</span>
        </div>
      </div>
      <svg ref={ref} width="100%" className="overflow-visible" />
    </div>
  );
}
