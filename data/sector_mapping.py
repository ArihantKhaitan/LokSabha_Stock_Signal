"""
Maps each sector tag to a basket of NSE-listed stocks (yfinance tickers).
Weights are equal within each basket.
"""

SECTOR_STOCKS: dict[str, list[str]] = {
    "Pharma": [
        "SUNPHARMA.NS",
        "DRREDDY.NS",
        "CIPLA.NS",
    ],
    "Defence": [
        "HAL.NS",
        "BEL.NS",
        "MIDHANI.NS",
    ],
    "Banking": [
        "HDFCBANK.NS",
        "ICICIBANK.NS",
        "SBIN.NS",
    ],
    "IT": [
        "TCS.NS",
        "INFY.NS",
        "WIPRO.NS",
    ],
    "Auto": [
        "MARUTI.NS",
        "TATAMOTORS.NS",
        "M&M.NS",
    ],
    "Energy": [
        "RELIANCE.NS",
        "ONGC.NS",
        "NTPC.NS",
    ],
    "Agriculture": [
        "UPL.NS",
        "PIIND.NS",
        "COROMANDEL.NS",
    ],
    "Telecom": [
        "BHARTIARTL.NS",
        "IDEA.NS",
    ],
    "Infrastructure": [
        "LT.NS",
        "NCCLTD.NS",
        "KNRCON.NS",
    ],
}

# Human-readable display names
SECTOR_DISPLAY: dict[str, str] = {
    "Pharma": "Pharma & Healthcare",
    "Defence": "Defence & Aerospace",
    "Banking": "Banking & Financial Services",
    "IT": "Information Technology",
    "Auto": "Automobile & EV",
    "Energy": "Energy & Renewables",
    "Agriculture": "Agriculture & Agrochemicals",
    "Telecom": "Telecommunications",
    "Infrastructure": "Infrastructure & Construction",
}

# Color coding per sector for charts
SECTOR_COLORS: dict[str, str] = {
    "Pharma": "#4FC3F7",
    "Defence": "#EF5350",
    "Banking": "#66BB6A",
    "IT": "#AB47BC",
    "Auto": "#FFA726",
    "Energy": "#26C6DA",
    "Agriculture": "#D4E157",
    "Telecom": "#FF7043",
    "Infrastructure": "#8D6E63",
}


def get_stocks(sector: str) -> list[str]:
    return SECTOR_STOCKS.get(sector, [])


def get_all_tickers() -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for tickers in SECTOR_STOCKS.values():
        for t in tickers:
            if t not in seen:
                seen.add(t)
                out.append(t)
    return out


def ticker_to_sector() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for sector, tickers in SECTOR_STOCKS.items():
        for t in tickers:
            mapping[t] = sector
    return mapping
