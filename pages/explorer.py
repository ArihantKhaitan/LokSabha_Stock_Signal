"""
Page 2 — Signal Explorer
Browse all debate events by sector and inspect T+1/T+2/T+5 returns.
"""
from __future__ import annotations

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import date

from data.sector_mapping import SECTOR_STOCKS, SECTOR_DISPLAY, SECTOR_COLORS
from analysis.signal import EventSignal


def _fmt_pct(val: float | None) -> str:
    if val is None:
        return "N/A"
    sign = "+" if val >= 0 else ""
    return f"{sign}{val*100:.2f}%"


def _chip(val: float | None) -> str:
    """Return a colored HTML chip for a return value."""
    if val is None:
        return "<span style='color:#888;background:#1e1e1e;padding:2px 8px;border-radius:4px;font-size:12px;'>N/A</span>"
    pct = val * 100
    if pct >= 0.5:
        bg, fg = "#0d3320", "#4ade80"
    elif pct >= 0:
        bg, fg = "#1a2e1a", "#86efac"
    elif pct > -0.5:
        bg, fg = "#3b1219", "#fca5a5"
    else:
        bg, fg = "#2d0b0b", "#ef4444"
    sign = "+" if pct >= 0 else ""
    return (
        f"<span style='color:{fg};background:{bg};padding:2px 8px;"
        f"border-radius:4px;font-size:12px;font-weight:600;'>{sign}{pct:.2f}%</span>"
    )


def _sentiment_badge(sentiment: str) -> str:
    colors = {
        "Positive": ("#0d3320", "#4ade80"),
        "Negative": ("#2d0b0b", "#ef4444"),
        "Neutral": ("#1a1f2e", "#94a3b8"),
    }
    bg, fg = colors.get(sentiment, ("#222", "#fff"))
    return (
        f"<span style='color:{fg};background:{bg};padding:2px 8px;"
        f"border-radius:4px;font-size:11px;font-weight:600;'>{sentiment}</span>"
    )


def render(signals: list[EventSignal]) -> None:
    st.markdown("## Signal Explorer")
    st.markdown(
        "Browse every parliamentary debate event by sector. "
        "Green/red chips show next-day, 2-day and 5-day stock returns for the sector basket."
    )

    # ── Filters ─────────────────────────────────────────────────────────────
    col1, col2, col3 = st.columns([2, 2, 1])
    with col1:
        all_sectors = list(SECTOR_STOCKS.keys())
        selected_sector = st.selectbox(
            "Sector",
            options=all_sectors,
            format_func=lambda s: SECTOR_DISPLAY.get(s, s),
        )
    with col2:
        sentiments = ["All", "Positive", "Negative", "Neutral"]
        selected_sentiment = st.selectbox("Sentiment", sentiments)
    with col3:
        min_intensity = st.slider("Min Intensity", 1, 10, 1)

    # ── Filter signals ───────────────────────────────────────────────────────
    filtered = [
        s for s in signals
        if s.sector == selected_sector
        and (selected_sentiment == "All" or s.sentiment == selected_sentiment)
        and s.intensity >= min_intensity
    ]

    if not filtered:
        st.info("No events match the current filters.")
        return

    # ── Summary stat ─────────────────────────────────────────────────────────
    has_data = [s for s in filtered if s.has_data]
    if has_data:
        avg_t5 = np.mean([s.ret_t5 for s in has_data if s.ret_t5 is not None])
        avg_t1 = np.mean([s.ret_t1 for s in has_data if s.ret_t1 is not None])
        hi_events = [s for s in has_data if s.intensity >= 7]
        avg_hi_t5 = (
            np.mean([s.ret_t5 for s in hi_events if s.ret_t5 is not None])
            if hi_events else 0.0
        )

        color = SECTOR_COLORS.get(selected_sector, "#FF6B35")
        st.markdown(
            f"""
            <div style='background:#161B22;border-left:4px solid {color};
                        padding:12px 16px;border-radius:6px;margin-bottom:16px;'>
                <span style='color:{color};font-weight:700;font-size:14px;'>
                    {SECTOR_DISPLAY.get(selected_sector, selected_sector)}
                </span>
                &nbsp;·&nbsp;
                <span style='color:#94a3b8;font-size:13px;'>
                    {len(filtered)} debate events &nbsp;|&nbsp;
                    Avg T+1 return: <b style='color:#e6edf3;'>{_fmt_pct(avg_t1)}</b>
                    &nbsp;|&nbsp;
                    Avg T+5 return: <b style='color:#e6edf3;'>{_fmt_pct(avg_t5)}</b>
                    &nbsp;|&nbsp;
                    High-intensity avg T+5: <b style='color:#e6edf3;'>{_fmt_pct(avg_hi_t5)}</b>
                </span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ── Timeline chart ───────────────────────────────────────────────────────
    with_data = [s for s in filtered if s.has_data]
    if with_data:
        dates = [s.debate_date for s in with_data]
        t1_vals = [s.ret_t1 * 100 if s.ret_t1 else 0 for s in with_data]  # type: ignore
        intensities = [s.intensity for s in with_data]
        topics = [s.topic[:60] + "…" if len(s.topic) > 60 else s.topic for s in with_data]

        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=dates,
            y=t1_vals,
            marker_color=[
                "#4ade80" if v >= 0 else "#ef4444" for v in t1_vals
            ],
            customdata=list(zip(intensities, topics)),
            hovertemplate=(
                "<b>%{customdata[1]}</b><br>"
                "Date: %{x|%d %b %Y}<br>"
                "T+1 Return: %{y:.2f}%<br>"
                "Intensity: %{customdata[0]}/10"
                "<extra></extra>"
            ),
            name="T+1 Return",
        ))

        fig.update_layout(
            title=f"{SECTOR_DISPLAY.get(selected_sector, selected_sector)} — Debate Events & T+1 Returns",
            xaxis_title="Debate Date",
            yaxis_title="T+1 Return (%)",
            plot_bgcolor="#0D1117",
            paper_bgcolor="#0D1117",
            font=dict(color="#E6EDF3"),
            hovermode="x unified",
            height=320,
            margin=dict(l=0, r=0, t=40, b=0),
        )
        fig.add_hline(y=0, line_color="#444", line_width=1)

        st.plotly_chart(fig, use_container_width=True)

    # ── Event cards ──────────────────────────────────────────────────────────
    st.markdown(f"### Events ({len(filtered)}) — n={len(with_data)} with market data")
    st.markdown("---")

    for sig in sorted(filtered, key=lambda s: s.debate_date, reverse=True):
        intensity_bar = "█" * sig.intensity + "░" * (10 - sig.intensity)
        color = SECTOR_COLORS.get(sig.sector, "#FF6B35")

        with st.expander(
            f"📋 {sig.debate_date.strftime('%d %b %Y')} · {sig.topic[:80]}",
            expanded=False,
        ):
            st.markdown(
                f"""
                <div style='display:flex;gap:12px;align-items:center;flex-wrap:wrap;
                            margin-bottom:12px;'>
                    {_sentiment_badge(sig.sentiment)}
                    <span style='color:#94a3b8;font-size:12px;'>
                        Intensity: <b style='color:{color};'>{sig.intensity}/10</b>
                        &nbsp;<code style='font-size:11px;color:{color};'>{intensity_bar}</code>
                    </span>
                    <span style='color:#94a3b8;font-size:12px;'>Session: {sig.session}</span>
                </div>
                <p style='color:#94a3b8;font-size:13px;margin:0 0 12px;'>{sig.summary}</p>
                <p style='color:#64748b;font-size:12px;margin:0;'>Bill: {sig.bill}</p>
                """,
                unsafe_allow_html=True,
            )

            # Return chips
            st.markdown(
                f"""
                <div style='display:flex;gap:16px;align-items:center;
                            margin-top:12px;flex-wrap:wrap;'>
                    <span style='color:#64748b;font-size:12px;'>T−1 (baseline):</span>
                    {_chip(sig.ret_tm1)}
                    <span style='color:#64748b;font-size:12px;margin-left:8px;'>T+1:</span>
                    {_chip(sig.ret_t1)}
                    <span style='color:#64748b;font-size:12px;'>T+2:</span>
                    {_chip(sig.ret_t2)}
                    <span style='color:#64748b;font-size:12px;'>T+5 (1 week):</span>
                    {_chip(sig.ret_t5)}
                </div>
                """,
                unsafe_allow_html=True,
            )

            if sig.signal_strength is not None:
                sign = "+" if sig.signal_strength >= 0 else ""
                st.markdown(
                    f"<p style='color:#64748b;font-size:11px;margin-top:8px;'>"
                    f"Signal Strength: <b style='color:#FF6B35;'>"
                    f"{sign}{sig.signal_strength*100:.3f}</b> "
                    f"(excess return × intensity)</p>",
                    unsafe_allow_html=True,
                )
