"""
Page 5 — Methodology & Limitations
Full explanation of signal calculation, honest limitations, and data sources.
"""
from __future__ import annotations

import streamlit as st


def render() -> None:
    st.markdown("## Methodology & Limitations")

    st.markdown(
        """
        <div style='background:#161B22;border-left:4px solid #FF6B35;
                    padding:16px 20px;border-radius:8px;margin-bottom:24px;'>
            <span style='color:#FF6B35;font-weight:700;font-size:16px;'>Disclaimer</span><br>
            <span style='color:#94a3b8;font-size:13px;'>
                This is an academic research tool. Nothing on this platform constitutes
                financial advice, investment recommendations, or trading signals.
                The correlations shown are based on a small dataset and should not be
                used to make investment decisions.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Signal Calculation ───────────────────────────────────────────────────
    st.markdown("### How the Signal is Calculated")

    st.markdown(
        """
For each parliamentary debate event, we compute the following:

**Step 1 — Sector Basket**
Each sector (e.g. Defence, Pharma) is represented by a basket of 2–3 NSE-listed stocks.
Returns within the basket are equally weighted.

| Sector | Basket Stocks |
|---|---|
| Pharma | SUNPHARMA, DRREDDY, CIPLA |
| Defence | HAL, BEL, MIDHANI |
| Banking | HDFCBANK, ICICIBANK, SBIN |
| IT | TCS, INFY, WIPRO |
| Auto | MARUTI, TATAMOTORS, M&M |
| Energy | RELIANCE, ONGC, NTPC |
| Agriculture | UPL, PIIND, COROMANDEL |
| Telecom | BHARTIARTL, IDEA |
| Infrastructure | L&T, NCCLTD, KNRCON |

**Step 2 — Return Windows**

| Window | Definition |
|---|---|
| T−1 | Day before the debate (baseline / pre-event) |
| T+1 | First trading day after the debate |
| T+2 | Two trading days after |
| T+5 | Five trading days after (~1 week) |

**Step 3 — Excess Return**
```
excess_t1 = T+1 basket return − sector historical mean daily return
```
This isolates the parliament effect from normal market drift.

**Step 4 — Signal Strength**
```
signal_strength = excess_t1 × intensity_score
```
Higher intensity events should produce stronger signals if the hypothesis holds.

**Step 5 — Correlation**
For each sector we compute the Pearson correlation coefficient between
debate intensity (1–10) and T+1 basket return across all events for that sector.

```
r, p = scipy.stats.pearsonr(intensities, t1_returns)
```
A p-value < 0.05 is considered statistically significant at the 95% confidence level.
        """
    )

    # ── Intensity Score Methodology ──────────────────────────────────────────
    st.markdown("### Intensity Score (1–10)")

    st.markdown(
        """
The intensity score is a composite proxy for how much parliamentary attention a topic received.

**Components:**
- Hours of floor time devoted to the debate
- Number of MPs who participated
- Whether it was a bill passage, discussion, or motion
- Whether the no-confidence motion framework applied

**Scale:**
| Score | Meaning |
|---|---|
| 9–10 | Full-day debate, 50+ MPs, major legislation |
| 7–8 | Half-day session, 30–50 MPs |
| 5–6 | Committee-stage debate or supplementary discussion |
| 1–4 | Brief question period or incidental mention |

*In the current dataset, intensity is manually coded from parliamentary records and news sources.
Future versions will automate this via transcript analysis.*
        """
    )

    # ── Limitations ──────────────────────────────────────────────────────────
    st.markdown("### Honest Limitations")

    limitations = [
        (
            "Correlation is not causation",
            "Even a statistically significant correlation between debate intensity and "
            "stock returns does not mean Parliament *caused* the movement. Both may be "
            "caused by a third factor (e.g., a ministry policy announcement that triggers "
            "both the debate and the market reaction).",
        ),
        (
            "Small sample size",
            "We have 30–40 debate events across 2 years. This is statistically small. "
            "The p-values shown should be interpreted cautiously — with this sample size, "
            "there is a meaningful risk of false positives even at p < 0.05.",
        ),
        (
            "Reverse causality",
            "Parliament often debates issues *after* the market has already moved. "
            "A sector sell-off might prompt MPs to raise concerns — the debate follows "
            "the event rather than preceding it. This creates reverse causality that "
            "confounds the signal.",
        ),
        (
            "Confounding factors",
            "Stock prices are driven by dozens of factors simultaneously: global risk-off, "
            "US Fed decisions, commodity prices, FII flows, quarterly results. "
            "Attributing any specific return to a parliamentary debate requires controls "
            "we do not apply here.",
        ),
        (
            "Mock parliament data",
            "The debate events, intensity scores, and sentiment labels in this tool are "
            "reconstructed from news reports and public parliamentary records — not from "
            "automated transcript analysis. They may not perfectly reflect the actual "
            "nature of each session.",
        ),
        (
            "Basket composition",
            "Small baskets (2–3 stocks) are highly sensitive to individual stock "
            "idiosyncratic events. A single stock's earnings announcement can dominate "
            "the basket return, obscuring any parliament effect.",
        ),
        (
            "Market microstructure",
            "Indian markets close at 15:30 IST. Debates that begin after market hours "
            "are counted as the next trading day. Intraday timing nuances are not captured.",
        ),
    ]

    for title, body in limitations:
        st.markdown(
            f"""
            <div style='background:#161B22;border-left:3px solid #64748b;
                        padding:12px 16px;border-radius:6px;margin-bottom:10px;'>
                <span style='color:#e6edf3;font-weight:600;font-size:14px;'>⚠ {title}</span><br>
                <span style='color:#94a3b8;font-size:13px;'>{body}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ── Data Sources ─────────────────────────────────────────────────────────
    st.markdown("### Data Sources")

    st.markdown(
        """
| Source | URL | Usage |
|---|---|---|
| Lok Sabha Secretariat | [loksabha.nic.in](https://loksabha.nic.in) | Session schedules, bill lists |
| NSE India | [nseindia.com](https://www.nseindia.com) | Reference for ticker symbols |
| yfinance (Yahoo Finance) | [pypi.org/project/yfinance](https://pypi.org/project/yfinance/) | OHLCV stock price data |
| PRS Legislative Research | [prsindia.org](https://prsindia.org) | Bill summaries and analysis |
| Rajya Sabha TV / Sansad TV | [sansad.in](https://sansad.in) | Session recordings and transcripts |
        """
    )

    # ── Academic Context ─────────────────────────────────────────────────────
    st.markdown("### Academic Context")

    st.markdown(
        """
This tool is inspired by academic research on legislative signals and market reactions:

- **Ziobrowski et al. (2004, 2011)** — *Abnormal Returns from the Common Stock Investments
  of the U.S. Senate / House of Representatives* — found statistically significant alpha in
  US Congress members' personal stock trades, suggesting legislative information has market value.

- **Eggers & Hainmueller (2013)** — Follow-up work questioning the magnitude of the effect,
  highlighting small sample concerns. Relevant caution for this project.

- **Jha & Laurence (2018)** — Research on Indian parliamentary questions and sectoral
  anomalies — the closest Indian analogue to this analysis.

The hypothesis tested here — that **high-intensity debates on sector-specific legislation
create measurable short-term sector return anomalies** — is academically plausible but
remains unproven at rigorous statistical standards with the data available.
        """
    )

    # ── Future Work ───────────────────────────────────────────────────────────
    st.markdown("### Future Work")

    st.markdown(
        """
- **Real transcript scraping**: Automated ingestion from [loksabha.nic.in](https://loksabha.nic.in)
  using their public debate transcripts (available as PDFs). NLP-based intensity and sentiment scoring.
- **Wider stock basket**: Include Nifty sectoral index ETFs as ground truth rather than 3-stock proxies.
- **Control variables**: Regress out Nifty 50 market return and VIX before computing excess return.
- **Intraday data**: Use NSE tick data to detect intraday reactions to same-day debates.
- **MP disclosure data**: If SEBI and Parliament align on disclosure requirements, cross-reference
  MP stock holdings with debate participation (as Ziobrowski did for the US).
- **Multi-lag analysis**: Extend to T+10, T+20, T+60 to detect longer-term legislative effects.
        """
    )
