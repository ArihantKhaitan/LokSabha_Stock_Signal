"""
Page 3 — Correlation Analysis
Scatter plots (intensity vs T+1 return) for every sector in a 2×N grid.
Shows Pearson r, p-value, and plain-English interpretation.
"""
from __future__ import annotations

import numpy as np
import streamlit as st
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from data.sector_mapping import SECTOR_STOCKS, SECTOR_DISPLAY, SECTOR_COLORS
from analysis.signal import EventSignal, SectorCorrelation, compute_all_correlations


def _significance_color(p: float | None) -> str:
    if p is None:
        return "#555"
    return "#FF6B35" if p < 0.05 else "#64748b"


def _r_label(r: float | None) -> str:
    if r is None:
        return "N/A"
    return f"r = {r:+.3f}"


def _p_label(p: float | None) -> str:
    if p is None:
        return ""
    return f"p = {p:.4f}"


def render(signals: list[EventSignal]) -> None:
    st.markdown("## Correlation Analysis")
    st.markdown(
        "Each chart shows the relationship between debate intensity (X axis) "
        "and the sector's next-day stock return (Y axis). "
        "**Orange** label = statistically significant (p < 0.05). "
        "**Grey** = not significant."
    )

    correlations = compute_all_correlations(signals)
    sectors = list(SECTOR_STOCKS.keys())

    # ── Grid layout ──────────────────────────────────────────────────────────
    n_cols = 2
    n_rows = int(np.ceil(len(sectors) / n_cols))

    subplot_titles = []
    for sec in sectors:
        c = correlations[sec]
        r_str = _r_label(c.pearson_r)
        p_str = _p_label(c.p_value)
        subplot_titles.append(
            f"{SECTOR_DISPLAY.get(sec, sec)}<br>"
            f"<span style='font-size:11px;'>{r_str}  {p_str}  n={c.n_events}</span>"
        )

    fig = make_subplots(
        rows=n_rows, cols=n_cols,
        subplot_titles=subplot_titles,
        horizontal_spacing=0.10,
        vertical_spacing=0.12,
    )

    for i, sector in enumerate(sectors):
        row = i // n_cols + 1
        col = i % n_cols + 1
        c = correlations[sector]
        color = SECTOR_COLORS.get(sector, "#FF6B35")

        # Scatter data from signals
        sect_sigs = [s for s in signals if s.sector == sector and s.has_data]
        if not sect_sigs:
            fig.add_annotation(
                row=row, col=col,
                text="No market data",
                showarrow=False,
                font=dict(color="#555"),
            )
            continue

        x_vals = [s.intensity for s in sect_sigs]
        y_vals = [s.ret_t1 * 100 for s in sect_sigs]   # type: ignore
        hover = [s.topic[:50] for s in sect_sigs]

        sig_color = _significance_color(c.p_value)

        fig.add_trace(
            go.Scatter(
                x=x_vals,
                y=y_vals,
                mode="markers",
                marker=dict(
                    size=10,
                    color=color,
                    opacity=0.75,
                    line=dict(color="#0D1117", width=1),
                ),
                text=hover,
                hovertemplate=(
                    "<b>%{text}</b><br>"
                    "Intensity: %{x}<br>"
                    "T+1 Return: %{y:.2f}%"
                    "<extra></extra>"
                ),
                showlegend=False,
            ),
            row=row, col=col,
        )

        # Trend line
        if len(x_vals) >= 2:
            m, b = np.polyfit(x_vals, y_vals, 1)
            x_line = [min(x_vals), max(x_vals)]
            y_line = [m * xv + b for xv in x_line]
            fig.add_trace(
                go.Scatter(
                    x=x_line, y=y_line,
                    mode="lines",
                    line=dict(color=sig_color, width=2, dash="dot"),
                    showlegend=False,
                ),
                row=row, col=col,
            )

        # Zero line
        fig.add_hline(y=0, line_color="#333", line_width=1, row=row, col=col)

    fig.update_layout(
        height=260 * n_rows,
        plot_bgcolor="#0D1117",
        paper_bgcolor="#0D1117",
        font=dict(color="#E6EDF3", size=11),
        margin=dict(l=20, r=20, t=60, b=20),
    )

    # Style axes
    for i in range(1, n_rows * n_cols + 1):
        fig.update_xaxes(
            title_text="Intensity",
            gridcolor="#1e2530",
            zerolinecolor="#333",
            row=(i - 1) // n_cols + 1,
            col=(i - 1) % n_cols + 1,
        )
        fig.update_yaxes(
            title_text="T+1 Return (%)",
            gridcolor="#1e2530",
            zerolinecolor="#333",
            row=(i - 1) // n_cols + 1,
            col=(i - 1) % n_cols + 1,
        )

    st.plotly_chart(fig, use_container_width=True)

    # ── Interpretation table ─────────────────────────────────────────────────
    st.markdown("### Plain-English Interpretation")
    st.markdown("---")

    for sector, c in correlations.items():
        color = SECTOR_COLORS.get(sector, "#FF6B35")
        sig_marker = "🟠" if (c.p_value is not None and c.p_value < 0.05) else "⚪"
        r_disp = f"{c.pearson_r:+.3f}" if c.pearson_r is not None else "N/A"
        p_disp = f"{c.p_value:.4f}" if c.p_value is not None else "N/A"

        st.markdown(
            f"""
            <div style='background:#161B22;border-left:4px solid {color};
                        padding:12px 16px;border-radius:6px;margin-bottom:10px;'>
                <div style='display:flex;align-items:center;gap:12px;margin-bottom:6px;'>
                    <span style='color:{color};font-weight:700;font-size:14px;'>
                        {SECTOR_DISPLAY.get(sector, sector)}
                    </span>
                    <code style='color:#94a3b8;font-size:12px;'>
                        r={r_disp}  p={p_disp}  n={c.n_events}
                    </code>
                    <span>{sig_marker}</span>
                </div>
                <p style='color:#94a3b8;font-size:13px;margin:0 0 6px;'>{c.interpretation}</p>
                <div style='display:flex;gap:16px;font-size:12px;color:#64748b;'>
                    <span>Mean T+1: <b style='color:#e6edf3;'>{c.mean_t1_return:+.3f}%</b></span>
                    <span>High-intensity mean T+1: <b style='color:#e6edf3;'>{c.high_intensity_mean_t1:+.3f}%</b></span>
                    <span>Low-intensity mean T+1: <b style='color:#e6edf3;'>{c.low_intensity_mean_t1:+.3f}%</b></span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown(
        "<p style='color:#64748b;font-size:12px;margin-top:16px;'>"
        "🟠 = p < 0.05 (statistically significant at 95% confidence level) &nbsp;|&nbsp; "
        "⚪ = p ≥ 0.05 (not significant) &nbsp;|&nbsp; "
        "Sample sizes are small — interpret with caution."
        "</p>",
        unsafe_allow_html=True,
    )
