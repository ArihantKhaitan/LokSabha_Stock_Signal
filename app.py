"""
LokSabha Stock Signal — main Streamlit entry point.
Run with: streamlit run app.py
"""
from __future__ import annotations

import sys
import os

# Ensure project root is on the path so 'data', 'analysis', 'pages' resolve.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st

# ── Page config (must be the very first Streamlit call) ─────────────────────
st.set_page_config(
    page_title="LokSabha Stock Signal",
    page_icon="🏛",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ───────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    html, body, [class*="css"] {
        font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
    }
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    section[data-testid="stSidebar"] {
        background: #0D1117;
        border-right: 1px solid #21262d;
    }

    .main .block-container {
        padding-top: 1.5rem;
        max-width: 1200px;
    }

    .lss-header {
        position: sticky;
        top: 0;
        z-index: 999;
        background: #0D1117;
        border-bottom: 1px solid #FF6B35;
        padding: 8px 0;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .metric-card {
        background: #161B22;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 16px 20px;
        text-align: center;
    }

    hr { border-color: #21262d !important; }
    details summary { color: #E6EDF3 !important; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0D1117; }
    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Sticky header ────────────────────────────────────────────────────────────
st.markdown(
    """
    <div class="lss-header">
        <span style="color:#FF6B35;font-weight:800;font-size:16px;letter-spacing:0.5px;">
            🏛 LokSabha Stock Signal
        </span>
        <span style="color:#64748b;font-size:12px;">|</span>
        <span style="color:#94a3b8;font-size:12px;">Research Tool</span>
        <span style="color:#64748b;font-size:12px;">|</span>
        <span style="color:#ef4444;font-size:12px;font-weight:600;">
            ⚠ Not Financial Advice
        </span>
    </div>
    """,
    unsafe_allow_html=True,
)


# ── Data loader (cached 24h) ─────────────────────────────────────────────────
@st.cache_data(ttl=86400, show_spinner=False)
def load_signals():
    from analysis.fetcher import ensure_data_current
    from analysis.signal import compute_event_signals
    ensure_data_current()
    return compute_event_signals()


# ── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown(
        """
        <div style='margin-bottom:24px;'>
            <div style='color:#FF6B35;font-weight:800;font-size:18px;'>LSS</div>
            <div style='color:#64748b;font-size:11px;'>LokSabha Stock Signal</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    page = st.radio(
        "Navigate",
        options=[
            "🏠  Homepage",
            "🔍  Signal Explorer",
            "📊  Correlation Analysis",
            "🔬  Event Deep Dive",
            "📖  Methodology",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")

    from data.parliament_data import DEBATE_EVENTS, get_active_session, get_upcoming_sessions

    active = get_active_session()
    upcoming = get_upcoming_sessions()

    if active:
        st.markdown(
            f"<div style='background:#0d3320;border-radius:6px;padding:8px 12px;"
            f"font-size:12px;color:#4ade80;'>🟢 Active session:<br>"
            f"<b>{active['name']}</b></div>",
            unsafe_allow_html=True,
        )
    elif upcoming:
        nxt = upcoming[0]
        st.markdown(
            f"<div style='background:#1a1f2e;border-radius:6px;padding:8px 12px;"
            f"font-size:12px;color:#94a3b8;'>📅 Next session:<br>"
            f"<b>{nxt['name']}</b><br>{nxt['start'].strftime('%d %b %Y')}</div>",
            unsafe_allow_html=True,
        )

    st.markdown(
        f"<div style='margin-top:12px;font-size:11px;color:#555;'>"
        f"{len(DEBATE_EVENTS)} debate events loaded</div>",
        unsafe_allow_html=True,
    )

    st.markdown("---")

    if st.button("🔄 Refresh Market Data", use_container_width=True):
        from analysis.fetcher import ensure_data_current
        with st.spinner("Fetching latest data from yfinance…"):
            ensure_data_current(force=True)
        st.cache_data.clear()
        st.success("Cache cleared — data will reload on next page.")
        st.rerun()


# ── Homepage renderer ────────────────────────────────────────────────────────
def render_home():
    import plotly.graph_objects as go
    from analysis.signal import get_summary_stats
    from data.parliament_data import SESSIONS_REGISTRY

    st.markdown(
        """
        <div style='text-align:center;padding:32px 0 24px;'>
            <div style='font-size:42px;font-weight:900;color:#FF6B35;
                        letter-spacing:-1px;margin-bottom:10px;'>
                LokSabha Stock Signal
            </div>
            <div style='font-size:16px;color:#94a3b8;max-width:680px;margin:0 auto;line-height:1.6;'>
                Does Indian Parliamentary debate move sector stocks in the days that follow?
                This tool quantifies the relationship between Lok Sabha debate intensity
                and short-term equity returns across 9 NSE sectors — using real yfinance
                data and reconstructed parliamentary records (2023–2024).
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Key stats
    with st.spinner("Computing signals…"):
        signals = load_signals()

    stats = get_summary_stats(signals)

    if stats:
        c1, c2, c3, c4 = st.columns(4)
        for col, val, label, sub in [
            (c1, str(stats["total_debates"]), "Debates Analysed", ""),
            (c2, str(stats["sectors_covered"]), "Sectors Tracked", "NSE listed baskets"),
            (
                c3,
                f"{'+'if stats['strongest_signal_pct']>=0 else ''}{stats['strongest_signal_pct']:.2f}%",
                "Strongest T+1 Signal",
                stats["strongest_signal_sector"],
            ),
            (
                c4,
                f"{'+'if stats['most_reactive_t5_pct']>=0 else ''}{stats['most_reactive_t5_pct']:.2f}%",
                "Most Reactive (T+5 avg)",
                stats["most_reactive_sector"],
            ),
        ]:
            color = "#4ade80" if (val.startswith("+") or (val[0].isdigit())) else "#ef4444"
            if label in ("Debates Analysed", "Sectors Tracked"):
                color = "#FF6B35"
            with col:
                st.markdown(
                    f"<div class='metric-card'>"
                    f"<div style='font-size:30px;font-weight:700;color:{color};'>{val}</div>"
                    f"<div style='color:#94a3b8;font-size:12px;margin-top:4px;'>{label}</div>"
                    f"<div style='color:#555;font-size:11px;'>{sub}</div>"
                    f"</div>",
                    unsafe_allow_html=True,
                )

    st.markdown("<br>", unsafe_allow_html=True)

    col_left, col_right = st.columns([3, 2])

    with col_left:
        st.markdown("### The Hypothesis")
        st.markdown(
            """
When Parliament debates a topic — pharma regulation, defence procurement,
banking reform, agricultural policy — does it shift investor expectations
in related sectors?

This tool tests that hypothesis using **real NSE stock data** (via yfinance)
against **reconstructed Lok Sabha debate records** from 5 sessions spanning
February 2023 to August 2024.

We calculate a **Signal Strength** metric for each event:

```
Signal = (T+1 return − sector average) × intensity score
```

And compute **Pearson correlations** between debate intensity and stock
returns, with p-values so you can judge statistical significance yourself.

> *"High-intensity parliamentary debates on sector-specific legislation
> may create short-term information signals for sector equity baskets,
> but the evidence is mixed and causality cannot be established."*

The tool is inspired by Ziobrowski et al. (2004) who found abnormal returns
in US Congressional stock portfolios — suggesting legislative information
has measurable market value.
            """
        )

    with col_right:
        st.markdown("### How to Read This Tool")
        st.markdown(
            """
**Intensity (1–10)**
How much floor time and MP participation the debate received.
10 = full-day major legislation. 1 = brief incidental mention.

**Sentiment**
The overall parliamentary tone toward the sector:
- 🟢 **Positive** = spending / deregulation favourable to sector
- 🔴 **Negative** = restrictive, punitive, or cautionary
- ⚪ **Neutral** = mixed or procedural debate

**T+1 / T+2 / T+5**
Equal-weighted basket return 1, 2, and 5 trading days *after* debate.

**Excess Return**
Return minus the sector's historical daily average —
isolates the parliament effect from normal drift.

**r / p-value**
Pearson correlation between intensity and T+1 return.
p < 0.05 = statistically significant. But with n < 15
per sector, treat all results with healthy scepticism.
            """
        )

    st.markdown("---")

    # Session timeline
    st.markdown("### Parliament Sessions in Dataset")

    fig = go.Figure()
    base_date = SESSIONS_REGISTRY[0]["start"]

    for session in SESSIONS_REGISTRY:
        status = session["status"]
        fill_color = "#FF6B35" if status == "completed" else "rgba(30,37,48,0.6)"
        border_color = "#FF6B35" if status == "completed" else "#4ade80"

        duration = (session["end"] - session["start"]).days
        offset = (session["start"] - base_date).days

        fig.add_trace(go.Bar(
            x=[duration],
            y=[session["name"]],
            base=[offset],
            orientation="h",
            marker=dict(
                color=fill_color,
                line=dict(color=border_color, width=1.5),
            ),
            customdata=[[
                session["start"].strftime("%d %b %Y"),
                session["end"].strftime("%d %b %Y"),
                status.capitalize(),
                duration,
            ]],
            hovertemplate=(
                "<b>%{y}</b><br>"
                "Start: %{customdata[0]}<br>"
                "End: %{customdata[1]}<br>"
                "Duration: %{customdata[3]} days<br>"
                "Status: %{customdata[2]}"
                "<extra></extra>"
            ),
            showlegend=False,
        ))

    fig.update_layout(
        plot_bgcolor="#0D1117",
        paper_bgcolor="#0D1117",
        font=dict(color="#E6EDF3"),
        height=260,
        margin=dict(l=0, r=0, t=10, b=20),
        xaxis=dict(title="Days from Jan 2023", gridcolor="#1e2530"),
        yaxis=dict(autorange="reversed"),
    )

    st.plotly_chart(fig, use_container_width=True)
    st.caption(
        "🟠 Orange filled = completed sessions with market data.  "
        "Outlined = scheduled future sessions (data will auto-fetch when dates pass)."
    )

    st.markdown("---")

    st.markdown(
        """
        <div style='background:#1a0808;border:1px solid #7f1d1d;border-radius:8px;
                    padding:16px 20px;'>
            <span style='color:#ef4444;font-weight:700;'>⚠ Research Disclaimer</span><br>
            <span style='color:#fca5a5;font-size:13px;'>
                This platform is for academic and educational purposes only.
                The correlations shown are based on a small, non-random sample and
                cannot be used to predict future stock returns. Past relationships
                between parliamentary debates and stock movements do not predict
                future relationships. Do not make investment decisions based on
                anything shown here. The parliamentary debate data is reconstructed
                from public records and may contain inaccuracies.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ── Page routing ─────────────────────────────────────────────────────────────
if page == "🏠  Homepage":
    render_home()

elif page == "🔍  Signal Explorer":
    with st.spinner("Loading market data…"):
        signals = load_signals()
    from pages.explorer import render
    render(signals)

elif page == "📊  Correlation Analysis":
    with st.spinner("Computing correlations…"):
        signals = load_signals()
    from pages.correlation import render
    render(signals)

elif page == "🔬  Event Deep Dive":
    with st.spinner("Loading event data…"):
        signals = load_signals()
    from pages.deep_dive import render
    render(signals)

elif page == "📖  Methodology":
    from pages.methodology import render
    render()
