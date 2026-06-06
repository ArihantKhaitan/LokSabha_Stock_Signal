"""
Auto-update scheduler for LokSabha Stock Signal.

This script runs independently of the Streamlit app. It checks whether any
new Lok Sabha sessions have started since the last data fetch, extends the
yfinance data window, and invalidates the cache.

Run it:
  • Once manually:            python scheduler.py
  • As a daily cron job:      0 8 * * * python /path/to/scheduler.py
  • As a Windows Task:        See setup instructions below

Windows Task Scheduler quick setup:
  schtasks /create /tn "LSS_AutoUpdate" /tr "python C:\\...\\scheduler.py" ^
           /sc daily /st 08:00 /f
"""
from __future__ import annotations

import json
import logging
import sys
import os
from datetime import date, datetime
from pathlib import Path

# Allow running from any directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(
            Path(__file__).parent / "cache" / "scheduler.log",
            encoding="utf-8",
        ),
    ],
)
log = logging.getLogger("lss-scheduler")

STATE_FILE = Path(__file__).parent / "cache" / "scheduler_state.json"


# ---------------------------------------------------------------------------
# State persistence
# ---------------------------------------------------------------------------

def _load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"last_run": None, "last_data_end": None, "sessions_seen": []}


def _save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, default=str, indent=2))


# ---------------------------------------------------------------------------
# Core update logic
# ---------------------------------------------------------------------------

def check_and_update() -> None:
    from data.parliament_data import SESSIONS_REGISTRY, get_active_session
    from analysis.fetcher import (
        DATA_START,
        ensure_data_current,
        fetch_sector_basket,
    )
    from data.sector_mapping import SECTOR_STOCKS

    state = _load_state()
    today = date.today()
    today_str = today.isoformat()

    log.info("=== LokSabha Stock Signal — Auto-Update ===")
    log.info("Today: %s", today_str)

    # 1. Check for sessions that have newly started
    sessions_seen: list[str] = state.get("sessions_seen", [])
    new_sessions: list[dict] = []
    for s in SESSIONS_REGISTRY:
        if s["name"] not in sessions_seen and s["start"] <= today:
            new_sessions.append(s)
            sessions_seen.append(s["name"])

    if new_sessions:
        for s in new_sessions:
            log.info(
                "New session detected: %s (started %s)",
                s["name"], s["start"].isoformat(),
            )
    else:
        log.info("No new sessions detected.")

    # 2. Check if data window needs extending
    last_data_end = state.get("last_data_end") or "2024-12-31"
    data_needs_update = today_str > last_data_end or bool(new_sessions)

    # 3. Active session → always refresh
    active = get_active_session()
    if active:
        log.info("Active session in progress: %s — forcing refresh.", active["name"])
        data_needs_update = True

    # 4. Fetch / extend data
    if data_needs_update:
        log.info("Extending data window from %s to %s", DATA_START, today_str)
        try:
            ensure_data_current(force=True)
            # Pre-warm all sector baskets
            for sector in SECTOR_STOCKS:
                log.info("  Fetching sector: %s", sector)
                fetch_sector_basket(sector, DATA_START, today_str, force_refresh=True)
            state["last_data_end"] = today_str
            log.info("Data refresh complete.")
        except Exception as exc:
            log.error("Data refresh failed: %s", exc)
    else:
        log.info(
            "Data is current (last end: %s). No fetch needed.", last_data_end
        )

    state["last_run"] = today_str
    state["sessions_seen"] = sessions_seen
    _save_state(state)
    log.info("State saved. Next run recommended: tomorrow at 08:00.")


# ---------------------------------------------------------------------------
# Session watcher: prints upcoming sessions and their countdown
# ---------------------------------------------------------------------------

def print_upcoming_sessions() -> None:
    from data.parliament_data import SESSIONS_REGISTRY

    today = date.today()
    print("\n📅  Upcoming Lok Sabha Sessions")
    print("=" * 44)
    found = False
    for s in SESSIONS_REGISTRY:
        if s["start"] > today:
            days_to = (s["start"] - today).days
            print(f"  {s['name']:<30} starts in {days_to:>3} days ({s['start']})")
            found = True
    if not found:
        print("  No future sessions registered. Add them to data/parliament_data.py")
    print()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="LokSabha Stock Signal auto-updater")
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Print session status without fetching data",
    )
    args = parser.parse_args()

    if args.check_only:
        print_upcoming_sessions()
    else:
        check_and_update()
        print_upcoming_sessions()
