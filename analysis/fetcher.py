"""
yfinance data fetcher with CSV-based disk cache (TTL = 24 hours).
Also provides a Streamlit @st.cache_data wrapper for in-session caching.
"""
from __future__ import annotations

import os
import time
import hashlib
import logging
from datetime import datetime, timedelta, date
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np
import yfinance as yf

from data.sector_mapping import SECTOR_STOCKS

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).resolve().parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

DATA_START = "2023-01-01"
DATA_END = "2024-12-31"
CACHE_TTL_HOURS = 24


# ---------------------------------------------------------------------------
# Disk cache helpers
# ---------------------------------------------------------------------------

def _cache_path(key: str) -> Path:
    safe = hashlib.md5(key.encode()).hexdigest()
    return CACHE_DIR / f"{safe}.parquet"


def _is_fresh(path: Path) -> bool:
    if not path.exists():
        return False
    age = time.time() - path.stat().st_mtime
    return age < CACHE_TTL_HOURS * 3600


def _save(df: pd.DataFrame, path: Path) -> None:
    df.to_parquet(path, compression="snappy")


def _load(path: Path) -> pd.DataFrame:
    return pd.read_parquet(path)


# ---------------------------------------------------------------------------
# Core fetch
# ---------------------------------------------------------------------------

def fetch_ticker(
    ticker: str,
    start: str = DATA_START,
    end: str = DATA_END,
    force_refresh: bool = False,
) -> pd.DataFrame:
    """Return OHLCV dataframe for one ticker. Uses disk cache."""
    key = f"{ticker}_{start}_{end}"
    path = _cache_path(key)

    if not force_refresh and _is_fresh(path):
        try:
            return _load(path)
        except Exception:
            pass

    try:
        df = yf.download(ticker, start=start, end=end, progress=False, auto_adjust=True)
        if df.empty:
            logger.warning("No data returned for %s", ticker)
            return pd.DataFrame()
        # Flatten multi-level columns if present
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        df.index = pd.to_datetime(df.index).tz_localize(None)
        _save(df, path)
        return df
    except Exception as exc:
        logger.error("yfinance error for %s: %s", ticker, exc)
        if path.exists():
            return _load(path)
        return pd.DataFrame()


def fetch_sector_basket(
    sector: str,
    start: str = DATA_START,
    end: str = DATA_END,
    force_refresh: bool = False,
) -> pd.DataFrame:
    """
    Fetch all tickers in a sector and return a single DataFrame with
    one column per ticker (Close prices only).
    """
    tickers = SECTOR_STOCKS.get(sector, [])
    frames: dict[str, pd.Series] = {}

    for tkr in tickers:
        df = fetch_ticker(tkr, start, end, force_refresh)
        if not df.empty and "Close" in df.columns:
            frames[tkr] = df["Close"]

    if not frames:
        return pd.DataFrame()

    combined = pd.DataFrame(frames)
    combined = combined.ffill().dropna(how="all")
    return combined


def fetch_all_sectors(
    start: str = DATA_START,
    end: str = DATA_END,
    force_refresh: bool = False,
) -> dict[str, pd.DataFrame]:
    """Return {sector: close-price DataFrame} for every sector."""
    return {
        sector: fetch_sector_basket(sector, start, end, force_refresh)
        for sector in SECTOR_STOCKS
    }


# ---------------------------------------------------------------------------
# Daily-return helpers
# ---------------------------------------------------------------------------

def daily_returns(close: pd.DataFrame) -> pd.DataFrame:
    return close.pct_change().dropna()


def basket_return(close: pd.DataFrame, target_date: date, offset_days: int) -> Optional[float]:
    """
    Equal-weighted average basket return for a trading-day offset from target_date.
    offset_days = 0 → same day, +1 → next trading day, -1 → prior trading day.
    """
    if close.empty:
        return None

    rets = daily_returns(close)
    ts = pd.Timestamp(target_date)

    # Find the index position of the nearest trading day >= target_date
    idx = rets.index.searchsorted(ts)
    if idx >= len(rets):
        return None

    target_idx = idx + offset_days
    if target_idx < 0 or target_idx >= len(rets):
        return None

    row = rets.iloc[target_idx]
    valid = row.dropna()
    if valid.empty:
        return None
    return float(valid.mean())


def average_daily_return(close: pd.DataFrame) -> float:
    """Mean of equal-weighted daily returns across the full history."""
    rets = daily_returns(close)
    if rets.empty:
        return 0.0
    means = rets.mean(axis=1)
    return float(means.mean())


# ---------------------------------------------------------------------------
# Auto-refresh: detect new sessions and extend the data window
# ---------------------------------------------------------------------------

def ensure_data_current(force: bool = False) -> None:
    """
    Called once at app startup. If today is beyond DATA_END, extends
    the data window and refreshes all sector caches.
    """
    today_str = date.today().isoformat()
    if today_str <= DATA_END and not force:
        return

    new_end = today_str
    logger.info("Extending data window to %s", new_end)
    for sector in SECTOR_STOCKS:
        fetch_sector_basket(sector, DATA_START, new_end, force_refresh=True)
