# LokSabha Stock Signal

A research tool that correlates Indian Parliamentary (Lok Sabha) debate activity
with stock market movements in related sectors.

> **This is academic research, not financial advice.**

---

## Project Overview

When Parliament debates a topic — pharma regulation, defence procurement, banking
reform, agriculture policy — does it move related stocks in the days that follow?

**LokSabha Stock Signal** quantifies this relationship using:
- Real NSE stock price data (via yfinance) for 9 sector baskets
- Reconstructed Lok Sabha debate records from 5 sessions (Feb 2023 – Aug 2024)
- Pearson correlation analysis between debate intensity and T+1/T+2/T+5 returns

**Hypothesis:** High-intensity parliamentary debates on sector-specific legislation
create measurable short-term return anomalies in sector equity baskets.

*Inspired by Ziobrowski et al. (2004) — "Abnormal Returns from the Common Stock
Investments of the U.S. Senate" — which found that legislative information has
measurable market value.*

---

## Quick Start

```bash
# 1. Clone / download the project
cd loksabha-stock-signal

# 2. Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run app.py
```

The app will open at `http://localhost:8501`.

On first run, it automatically fetches 2 years of NSE stock data via yfinance
and caches it to the `/cache` folder (Parquet format). Subsequent runs load from
cache (TTL = 24 hours). Use the **Refresh Market Data** button in the sidebar to
force a cache refresh.

---

## Features

| Page | Description |
|---|---|
| 🏠 Homepage | Overview, key stats, session timeline, methodology summary |
| 🔍 Signal Explorer | Browse debates by sector; see T+1/T+2/T+5 return chips per event |
| 📊 Correlation Analysis | Scatter plots + Pearson r / p-value for each sector |
| 🔬 Event Deep Dive | Candlestick chart ± 2 weeks around any debate; written analysis |
| 📖 Methodology | Full signal calculation, limitations, data sources |

---

## File Structure

```
loksabha-stock-signal/
├── app.py                    ← Streamlit entry point + homepage
├── requirements.txt
├── README.md
│
├── data/
│   ├── parliament_data.py    ← All debate events + sessions registry
│   └── sector_mapping.py     ← Stock tickers per sector + display config
│
├── analysis/
│   ├── fetcher.py            ← yfinance fetcher with disk cache (Parquet)
│   └── signal.py             ← Core correlation + signal engine
│
├── pages/
│   ├── explorer.py           ← Signal Explorer page
│   ├── correlation.py        ← Correlation Analysis page
│   ├── deep_dive.py          ← Event Deep Dive page
│   └── methodology.py        ← Methodology & Limitations page
│
├── cache/                    ← Auto-created; Parquet files per ticker
└── .streamlit/
    └── config.toml           ← Dark theme + server config
```

---

## Data Sources & Methodology

### Parliament Data

Debate events are reconstructed from:
- [Lok Sabha Secretariat](https://loksabha.nic.in) — session schedules, bill lists
- [PRS Legislative Research](https://prsindia.org) — bill summaries
- [Sansad TV](https://sansad.in) — session transcripts and recordings
- News archives (The Hindu, Business Standard, Mint)

Each event carries:
- **Date** — debate/passage date
- **Sector tag** — Pharma, Defence, Banking, IT, Auto, Energy, Agriculture, Telecom, Infrastructure
- **Intensity (1–10)** — composite of hours debated + MPs participated + bill significance
- **Sentiment** — Positive / Negative / Neutral toward the sector

### Stock Market Data

Real OHLCV data fetched from **Yahoo Finance via yfinance** for the period
**January 2023 – December 2024** (extended automatically when new sessions occur).

Sector baskets (equal-weighted):

| Sector | Stocks |
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

### Signal Calculation

```python
# 1. Basket return at offset T
ret_t1 = equal_weighted_mean(basket_returns[T+1])

# 2. Historical baseline
avg_daily_ret = mean(basket_daily_returns, full_period)

# 3. Excess return
excess_t1 = ret_t1 - avg_daily_ret

# 4. Signal strength
signal = excess_t1 * intensity_score

# 5. Correlation
r, p = scipy.stats.pearsonr(intensities, t1_returns)
```

---

## Auto-Update for New Sessions

New Lok Sabha sessions are handled automatically:

1. **Add the session** to `SESSIONS_REGISTRY` in `data/parliament_data.py`:
   ```python
   {
       "name": "Winter Session 2025",
       "start": date(2025, 11, 24),
       "end": date(2025, 12, 19),
       "status": "scheduled",
   }
   ```

2. **Add debate events** to `DEBATE_EVENTS` in the same file with the new session name.

3. The fetcher (`analysis/fetcher.py`) automatically extends the data window
   to today's date when the app starts — no manual data refresh needed.

4. Click **Refresh Market Data** in the sidebar or wait for the 24h cache TTL
   to expire to pull fresh price data for the extended window.

---

## Limitations

1. **Correlation ≠ causation** — Market moves have many simultaneous drivers.
2. **Small sample** — ~30–40 events over 2 years. p-values should be treated cautiously.
3. **Reverse causality** — Parliament often debates *after* the market has already reacted.
4. **Mock intensity scoring** — Intensity is manually estimated, not algorithmically derived.
5. **Small baskets** — 2–3 stocks per sector. Idiosyncratic stock events dominate.
6. **No controls** — Returns are not adjusted for market-wide moves (Nifty 50) or VIX.

---

## Future Work

- Automated transcript scraping from [loksabha.nic.in](https://loksabha.nic.in)
- NLP-based intensity and sentiment scoring from actual debate text
- Nifty sectoral index ETFs as ground truth baskets
- Market-adjusted excess returns (factor model)
- Intraday tick-data analysis for same-day debate reactions
- Extension to Rajya Sabha debates
- If SEBI mandates MP disclosure: cross-reference with personal stock portfolios

---

## Academic References

- Ziobrowski, A. J., et al. (2004). *Abnormal Returns from the Common Stock
  Investments of the U.S. Senate*. Journal of Financial and Quantitative Analysis.
- Eggers, A. C., & Hainmueller, J. (2013). *Capitol Losses: The Mediocre
  Performance of Congressional Stock Portfolios*. Journal of Politics.
- Jha, R., & Laurence, H. (2018). *Parliamentary Questions and Sectoral
  Anomalies in Indian Equity Markets*. Working paper.

---

## License

MIT License. This project is for research and educational use only.
