"""
Page 4 — Event Deep Dive
Pick a specific bill / debate and see a candlestick chart with the debate
date annotated, exact return figures, and a written analysis.
"""
from __future__ import annotations

from datetime import timedelta

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from data.parliament_data import DEBATE_EVENTS
from data.sector_mapping import SECTOR_COLORS, SECTOR_DISPLAY, SECTOR_STOCKS
from analysis.fetcher import fetch_ticker
from analysis.signal import EventSignal


def _get_ohlcv_window(tickers: list[str], center_date: pd.Timestamp, days: int = 14) -> pd.DataFrame:
    """Return concatenated OHLCV for first available ticker around a date window."""
    start = (center_date - timedelta(days=days + 10)).strftime("%Y-%m-%d")
    end   = (center_date + timedelta(days=days + 10)).strftime("%Y-%m-%d")

    for ticker in tickers:
        df = fetch_ticker(ticker, start=start, end=end)
        if not df.empty:
            mask = (df.index >= center_date - timedelta(days=days)) & \
                   (df.index <= center_date + timedelta(days=days))
            return df[mask], ticker
    return pd.DataFrame(), ""


def _fmt_pct(val: float | None) -> str:
    if val is None:
        return "N/A"
    sign = "+" if val >= 0 else ""
    return f"{sign}{val*100:.2f}%"


def _chip_html(label: str, val: float | None) -> str:
    if val is None:
        return f"<td style='color:#555;padding:6px 12px;'>{label}</td><td style='color:#555;padding:6px 12px;'>N/A</td>"
    pct = val * 100
    color = "#4ade80" if pct >= 0 else "#ef4444"
    sign = "+" if pct >= 0 else ""
    return (
        f"<td style='color:#94a3b8;padding:6px 12px;'>{label}</td>"
        f"<td style='color:{color};font-weight:700;padding:6px 12px;'>{sign}{pct:.2f}%</td>"
    )


def _written_analysis(sig: EventSignal) -> str:
    direction_t1 = "rose" if (sig.ret_t1 or 0) > 0 else "fell"
    direction_t5 = "rose" if (sig.ret_t5 or 0) > 0 else "fell"
    pct_t1 = abs((sig.ret_t1 or 0) * 100)
    pct_t5 = abs((sig.ret_t5 or 0) * 100)

    intensity_desc = (
        "highly intense" if sig.intensity >= 8
        else "moderately intense" if sig.intensity >= 5
        else "low-intensity"
    )
    sentiment_desc = {
        "Positive": "broadly positive toward the sector",
        "Negative": "broadly negative or cautious toward the sector",
        "Neutral": "neutral, with mixed views across party lines",
    }.get(sig.sentiment, "neutral")

    excess_note = ""
    if sig.excess_t1 is not None:
        ex = sig.excess_t1 * 100
        if abs(ex) > 0.1:
            direction_ex = "above" if ex > 0 else "below"
            excess_note = (
                f" This was {abs(ex):.2f}% {direction_ex} the sector's "
                f"historical daily average, suggesting a non-trivial market reaction."
            )

    return (
        f"On {sig.debate_date.strftime('%d %B %Y')}, the Lok Sabha debated "
        f"**{sig.topic}** during the **{sig.session}**. "
        f"The session was {intensity_desc} (intensity {sig.intensity}/10) "
        f"and the parliamentary tone was {sentiment_desc}. "
        f"\n\n"
        f"In the trading session immediately following the debate (T+1), "
        f"the {SECTOR_DISPLAY.get(sig.sector, sig.sector)} basket "
        f"**{direction_t1} {pct_t1:.2f}%**.{excess_note} "
        f"Over the subsequent week (T+5), the basket "
        f"**{direction_t5} {pct_t5:.2f}%** from the debate date. "
        f"\n\n"
        f"*Note: These movements reflect the equal-weighted average return across "
        f"the sector basket and are influenced by many concurrent market factors "
        f"beyond the parliamentary debate. Correlation ≠ causation.*"
    )


def render(signals: list[EventSignal]) -> None:
    st.markdown("## Event Deep Dive")
    st.markdown(
        "Select any bill or debate to see a 4-week candlestick chart around that date, "
        "annotated with the debate event and exact return figures."
    )

    # ── Event selector ───────────────────────────────────────────────────────
    event_options = {
        f"{ev['date'].strftime('%d %b %Y')} · {ev['topic'][:70]}": ev["id"]
        for ev in sorted(DEBATE_EVENTS, key=lambda e: e["date"], reverse=True)
    }

    selected_label = st.selectbox("Select a debate event", list(event_options.keys()))
    selected_id = event_options[selected_label]
    sig = next((s for s in signals if s.event_id == selected_id), None)

    if sig is None:
        st.error("Signal data not found for this event.")
        return

    # ── Event metadata ───────────────────────────────────────────────────────
    color = SECTOR_COLORS.get(sig.sector, "#FF6B35")

    st.markdown(
        f"""
        <div style='background:#161B22;border-left:4px solid {color};
                    padding:16px 20px;border-radius:8px;margin:16px 0;'>
            <div style='font-size:18px;font-weight:700;color:{color};margin-bottom:6px;'>
                {sig.topic}
            </div>
            <div style='font-size:13px;color:#94a3b8;margin-bottom:4px;'>
                📅 {sig.debate_date.strftime('%d %B %Y')} &nbsp;·&nbsp;
                🏛 {sig.session} &nbsp;·&nbsp;
                🏷 {sig.sector} &nbsp;·&nbsp;
                Intensity: {sig.intensity}/10
            </div>
            <div style='font-size:13px;color:#64748b;'>
                Bill: {sig.bill}
            </div>
            <div style='font-size:13px;color:#94a3b8;margin-top:8px;'>
                {sig.summary}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Candlestick chart ────────────────────────────────────────────────────
    tickers = SECTOR_STOCKS.get(sig.sector, [])
    center = pd.Timestamp(sig.debate_date)
    ohlcv, used_ticker = _get_ohlcv_window(tickers, center, days=14)

    if ohlcv.empty:
        st.warning("Market data not available for this sector around that date.")
    else:
        fig = go.Figure()

        fig.add_trace(go.Candlestick(
            x=ohlcv.index,
            open=ohlcv["Open"],
            high=ohlcv["High"],
            low=ohlcv["Low"],
            close=ohlcv["Close"],
            increasing_line_color="#4ade80",
            decreasing_line_color="#ef4444",
            name=used_ticker,
        ))

        # Vertical annotation for debate date
        if not ohlcv.empty:
            y_min = float(ohlcv["Low"].min())
            y_max = float(ohlcv["High"].max())
            debate_ts = center

            fig.add_vline(
                x=debate_ts.timestamp() * 1000,
                line_color="#FF6B35",
                line_width=2,
                line_dash="dash",
            )
            fig.add_annotation(
                x=debate_ts,
                y=y_max,
                text=f"🏛 Debate Day<br>{sig.debate_date.strftime('%d %b')}",
                showarrow=True,
                arrowhead=2,
                arrowcolor="#FF6B35",
                font=dict(color="#FF6B35", size=11),
                bgcolor="#1a1008",
                bordercolor="#FF6B35",
                borderwidth=1,
            )

        fig.update_layout(
            title=f"{used_ticker} — 4-Week Window Around Debate",
            xaxis_title="Date",
            yaxis_title="Price (₹)",
            plot_bgcolor="#0D1117",
            paper_bgcolor="#0D1117",
            font=dict(color="#E6EDF3"),
            height=420,
            xaxis_rangeslider_visible=False,
            margin=dict(l=0, r=0, t=50, b=20),
            xaxis=dict(gridcolor="#1e2530"),
            yaxis=dict(gridcolor="#1e2530"),
        )

        st.plotly_chart(fig, use_container_width=True)
        st.caption(f"Showing {used_ticker} (first ticker in basket). Sector: {sig.sector}")

    # ── Return table ─────────────────────────────────────────────────────────
    st.markdown("### Return Summary")

    avg_pct = sig.avg_daily_ret * 100

    st.markdown(
        f"""
        <table style='width:100%;border-collapse:collapse;
                      background:#161B22;border-radius:8px;overflow:hidden;'>
            <thead>
                <tr style='background:#1e2530;'>
                    <th style='color:#94a3b8;padding:8px 12px;text-align:left;font-weight:600;'>Window</th>
                    <th style='color:#94a3b8;padding:8px 12px;text-align:left;font-weight:600;'>Basket Return</th>
                    <th style='color:#94a3b8;padding:8px 12px;text-align:left;font-weight:600;'>vs Historical Avg</th>
                </tr>
            </thead>
            <tbody>
                <tr style='border-top:1px solid #1e2530;'>
                    {_chip_html("T−1 (day before)", sig.ret_tm1)}
                    <td style='color:#555;padding:6px 12px;'>baseline</td>
                </tr>
                <tr style='border-top:1px solid #1e2530;background:#0f1419;'>
                    {_chip_html("T+1 (next day)", sig.ret_t1)}
                    <td style='color:{"#4ade80" if (sig.excess_t1 or 0) > 0 else "#ef4444"};padding:6px 12px;font-weight:600;'>
                        {f'{(sig.excess_t1 or 0)*100:+.2f}% vs avg' if sig.excess_t1 is not None else 'N/A'}
                    </td>
                </tr>
                <tr style='border-top:1px solid #1e2530;'>
                    {_chip_html("T+2 (2 days after)", sig.ret_t2)}
                    <td style='color:#555;padding:6px 12px;'>—</td>
                </tr>
                <tr style='border-top:1px solid #1e2530;background:#0f1419;'>
                    {_chip_html("T+5 (1 week after)", sig.ret_t5)}
                    <td style='color:#555;padding:6px 12px;'>—</td>
                </tr>
                <tr style='border-top:1px solid #1e2530;'>
                    <td style='color:#64748b;padding:6px 12px;'>Hist. avg daily</td>
                    <td style='color:#64748b;padding:6px 12px;'>{avg_pct:+.3f}%</td>
                    <td style='color:#555;padding:6px 12px;'>—</td>
                </tr>
            </tbody>
        </table>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("### Analysis")
    st.markdown(_written_analysis(sig))
