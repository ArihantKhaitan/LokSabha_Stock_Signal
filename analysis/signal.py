"""
Core correlation / signal calculation engine.

For each debate event the engine computes:
  - T-1, T+1, T+2, T+5 sector-basket returns
  - excess return over the sector's historical average
  - signal strength = (T+1 excess return) * intensity
  - Pearson r and p-value between debate intensity and return magnitude
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats

from data.parliament_data import DEBATE_EVENTS
from data.sector_mapping import SECTOR_STOCKS
from analysis.fetcher import (
    fetch_sector_basket,
    basket_return,
    average_daily_return,
    DATA_START,
    DATA_END,
)


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class EventSignal:
    event_id: str
    session: str
    debate_date: date
    topic: str
    bill: str
    sector: str
    intensity: int
    sentiment: str
    summary: str

    # Raw returns (None = market closed / data unavailable)
    ret_tm1: Optional[float] = None   # T-1
    ret_t0:  Optional[float] = None   # T+0 (same day, debate day)
    ret_t1:  Optional[float] = None   # T+1
    ret_t2:  Optional[float] = None   # T+2
    ret_t5:  Optional[float] = None   # T+5

    avg_daily_ret: float = 0.0        # sector historical mean
    excess_t1: Optional[float] = None # ret_t1 - avg_daily_ret
    signal_strength: Optional[float] = None  # excess_t1 * intensity

    @property
    def has_data(self) -> bool:
        return self.ret_t1 is not None


@dataclass
class SectorCorrelation:
    sector: str
    n_events: int
    pearson_r: Optional[float]
    p_value: Optional[float]
    mean_t1_return: float
    mean_excess_t1: float
    high_intensity_mean_t1: float   # events with intensity >= 7
    low_intensity_mean_t1: float    # events with intensity < 7
    interpretation: str = ""


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

# Cached sector data keyed by sector name
_sector_cache: dict[str, pd.DataFrame] = {}


def _get_sector_data(sector: str) -> pd.DataFrame:
    if sector not in _sector_cache:
        _sector_cache[sector] = fetch_sector_basket(sector, DATA_START, DATA_END)
    return _sector_cache[sector]


def compute_event_signals(events: list[dict] | None = None) -> list[EventSignal]:
    """
    Compute EventSignal for every debate event (or a supplied subset).
    """
    source = events if events is not None else DEBATE_EVENTS
    signals: list[EventSignal] = []

    for ev in source:
        sector = ev["sector"]
        close = _get_sector_data(sector)
        avg = average_daily_return(close) if not close.empty else 0.0

        sig = EventSignal(
            event_id=ev["id"],
            session=ev["session"],
            debate_date=ev["date"],
            topic=ev["topic"],
            bill=ev["bill"],
            sector=sector,
            intensity=ev["intensity"],
            sentiment=ev["sentiment"],
            summary=ev["summary"],
            avg_daily_ret=avg,
        )

        if not close.empty:
            sig.ret_tm1 = basket_return(close, ev["date"], -1)
            sig.ret_t0  = basket_return(close, ev["date"],  0)
            sig.ret_t1  = basket_return(close, ev["date"],  1)
            sig.ret_t2  = basket_return(close, ev["date"],  2)
            sig.ret_t5  = basket_return(close, ev["date"],  5)

            if sig.ret_t1 is not None:
                sig.excess_t1 = sig.ret_t1 - avg
                sig.signal_strength = sig.excess_t1 * sig.intensity

        signals.append(sig)

    return signals


def compute_sector_correlation(
    sector: str,
    signals: list[EventSignal] | None = None,
) -> SectorCorrelation:
    """
    Pearson correlation between debate intensity and T+1 return for one sector.
    """
    if signals is None:
        signals = compute_event_signals()

    sector_sigs = [s for s in signals if s.sector == sector and s.has_data]
    n = len(sector_sigs)

    if n < 3:
        return SectorCorrelation(
            sector=sector, n_events=n,
            pearson_r=None, p_value=None,
            mean_t1_return=0.0, mean_excess_t1=0.0,
            high_intensity_mean_t1=0.0, low_intensity_mean_t1=0.0,
            interpretation="Insufficient data (< 3 events with market data).",
        )

    intensities = np.array([s.intensity for s in sector_sigs], dtype=float)
    t1_returns  = np.array([s.ret_t1 for s in sector_sigs], dtype=float)  # type: ignore

    r, p = stats.pearsonr(intensities, t1_returns)
    mean_t1 = float(np.mean(t1_returns))
    mean_excess = float(np.mean([s.excess_t1 for s in sector_sigs if s.excess_t1 is not None]))  # type: ignore

    hi = [s.ret_t1 for s in sector_sigs if s.intensity >= 7 and s.ret_t1 is not None]
    lo = [s.ret_t1 for s in sector_sigs if s.intensity < 7  and s.ret_t1 is not None]

    return SectorCorrelation(
        sector=sector,
        n_events=n,
        pearson_r=round(float(r), 3),
        p_value=round(float(p), 4),
        mean_t1_return=round(mean_t1 * 100, 3),
        mean_excess_t1=round(mean_excess * 100, 3),
        high_intensity_mean_t1=round(float(np.mean(hi)) * 100, 3) if hi else 0.0,
        low_intensity_mean_t1=round(float(np.mean(lo)) * 100, 3) if lo else 0.0,
        interpretation=_interpret(float(r), float(p), sector, mean_t1),
    )


def compute_all_correlations(signals: list[EventSignal] | None = None) -> dict[str, SectorCorrelation]:
    if signals is None:
        signals = compute_event_signals()
    return {sector: compute_sector_correlation(sector, signals) for sector in SECTOR_STOCKS}


# ---------------------------------------------------------------------------
# Interpretation helpers
# ---------------------------------------------------------------------------

def _interpret(r: float, p: float, sector: str, mean_t1: float) -> str:
    direction = "positive" if r >= 0 else "negative"
    significance = "statistically significant (p < 0.05)" if p < 0.05 else "not statistically significant (p ≥ 0.05)"

    if abs(r) >= 0.5:
        strength = "Strong"
    elif abs(r) >= 0.3:
        strength = "Moderate"
    elif abs(r) >= 0.15:
        strength = "Weak"
    else:
        strength = "Negligible"

    direction_word = "upward" if mean_t1 > 0 else "downward"
    pct = abs(mean_t1 * 100)

    return (
        f"{strength} {direction} correlation (r={r:.2f}, p={p:.3f}) — {significance}. "
        f"On average, {sector} sector stocks moved {direction_word} {pct:.2f}% the day after "
        f"a high-intensity parliamentary debate on this sector."
    )


# ---------------------------------------------------------------------------
# Summary statistics for homepage
# ---------------------------------------------------------------------------

def get_summary_stats(signals: list[EventSignal]) -> dict:
    with_data = [s for s in signals if s.has_data]
    if not with_data:
        return {}

    strongest = max(
        with_data,
        key=lambda s: abs(s.signal_strength) if s.signal_strength else 0,
    )

    sector_means: dict[str, list[float]] = {}
    for s in with_data:
        if s.ret_t5 is not None:
            sector_means.setdefault(s.sector, []).append(s.ret_t5)

    most_reactive = max(
        sector_means,
        key=lambda sec: abs(np.mean(sector_means[sec])),
    ) if sector_means else "N/A"

    most_reactive_pct = (
        float(np.mean(sector_means[most_reactive])) * 100 if most_reactive != "N/A" else 0.0
    )

    return {
        "total_debates": len(signals),
        "debates_with_data": len(with_data),
        "strongest_signal_event": strongest.topic,
        "strongest_signal_sector": strongest.sector,
        "strongest_signal_pct": round((strongest.ret_t1 or 0) * 100, 2),
        "strongest_signal_date": strongest.debate_date,
        "most_reactive_sector": most_reactive,
        "most_reactive_t5_pct": round(most_reactive_pct, 2),
        "sectors_covered": len(SECTOR_STOCKS),
    }
