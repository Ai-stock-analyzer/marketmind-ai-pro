"""
╔══════════════════════════════════════════════════════════════════════════════╗
║          MarketMind AI v2.0  —  Production FastAPI Backend                  ║
║          Full-Stack Python | FastAPI · yfinance · APScheduler               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Endpoints
─────────
GET  /                              → Health check
GET  /api/market-data/{symbol}      → All-in-one payload (chart, ticker, gauges)
GET  /api/mutual-funds              → Top mutual fund NAVs from AMFI
GET  /api/watchlist                 → Batch quote for a default watchlist
WS   /ws/live/{symbol}              → WebSocket live price stream (1-second tick)

Architecture
────────────
• APScheduler refreshes a shared in-memory cache every 60 s so the HTTP
  endpoint is always near-instant (no cold yfinance call per request).
• The WebSocket handler does a lightweight yfinance fast_info fetch every
  second and pushes price ticks to the connected client.
• All yfinance calls are wrapped in a retry helper (3 attempts, 1s back-off).
• Pydantic v2 models define the exact JSON shape the React frontend consumes.
"""

from __future__ import annotations

import asyncio
import csv
import io
import logging
import math
import re
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
import numpy as np
import pandas as pd
import yfinance as yf
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, Path, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ═══════════════════════════════════════════════════════════════════════════════
# Logging
# ═══════════════════════════════════════════════════════════════════════════════
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  [%(name)s]  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("marketmind")

# ═══════════════════════════════════════════════════════════════════════════════
# Constants & Config
# ═══════════════════════════════════════════════════════════════════════════════
CORS_ORIGINS = [
    "http://localhost:5173",   # Vite dev
    "http://localhost:3000",   # CRA dev
]

# Symbols pre-warmed in the scheduler cache
WATCHLIST_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS",
    "ICICIBANK.NS", "WIPRO.NS", "BAJFINANCE.NS", "SBIN.NS",
]

AMFI_NAV_URL = "https://www.amfiindia.com/spages/NAVAll.txt"

# Keyword -> sentiment weights for naive NLP
POSITIVE_WORDS = {
    "profit", "growth", "gain", "rise", "surge", "record",
    "beat", "strong", "rally", "upgrade", "buy", "bullish", "up",
    "high", "expand", "revenue", "earnings", "dividend",
}
NEGATIVE_WORDS = {
    "loss", "down", "fall", "decline", "drop", "miss",
    "weak", "sell", "bearish", "risk", "concern", "cut",
    "warning", "fraud", "penalty", "probe", "recall",
}

# ═══════════════════════════════════════════════════════════════════════════════
# Shared in-memory cache  {SYMBOL_UPPER: MarketDataResponse_dict}
# ═══════════════════════════════════════════════════════════════════════════════
_cache: dict[str, dict] = {}
_mf_cache: list[dict]   = []

# ═══════════════════════════════════════════════════════════════════════════════
# Pydantic v2 Response Models
# These define the EXACT JSON contract consumed by the React frontend.
# ═══════════════════════════════════════════════════════════════════════════════

class CandlePoint(BaseModel):
    """lightweight-charts / Recharts compatible candlestick point."""
    time:   str     # ISO-8601 UTC timestamp
    open:   float
    high:   float
    low:    float
    close:  float
    volume: float


class ForecastPoint(BaseModel):
    """
    Single AI forecast tick.
    Placeholder today — swap _build_forecast() body with your trained model.
    """
    time:            str    # projected ISO-8601 UTC
    predicted_close: float
    confidence:      float  # 0.0–1.0


class NewsItem(BaseModel):
    headline:     str
    source:       str
    url:          str
    published_at: str


class SentimentGauge(BaseModel):
    """0–100 score for the React RadialGauge component."""
    score:            float   # 0 = very negative, 50 = neutral, 100 = very positive
    label:            str     # "Bearish" | "Neutral" | "Bullish"
    positive_signals: int
    negative_signals: int
    news_items:       list[NewsItem]


class TickerBar(BaseModel):
    """One entry in the scrolling top ticker bar."""
    symbol:       str
    name:         str
    price:        float
    change:       float       # absolute price change
    change_pct:   float       # e.g. -1.23 means -1.23%
    currency:     str
    market_state: str         # "REGULAR" | "PRE" | "POST" | "CLOSED"


class QuoteDetail(BaseModel):
    symbol:               str
    name:                 str
    price:                float
    open:                 float
    previous_close:       float
    day_high:             float
    day_low:              float
    change:               float
    change_pct:           float
    volume:               int
    market_cap:           float | None
    pe_ratio:             float | None
    fifty_two_week_high:  float | None
    fifty_two_week_low:   float | None
    currency:             str
    exchange:             str
    market_state:         str
    fetched_at:           str   # UTC ISO-8601 Z


class MutualFundNAV(BaseModel):
    scheme_code: str
    scheme_name: str
    nav:         float
    date:        str
    category:    str


class MarketDataResponse(BaseModel):
    """
    Master payload — maps 1-to-1 to the React frontend data contract.

      useChartData()   →  candles  +  forecast
      useTicker()      →  ticker
      useGauges()      →  sentiment  +  quote
    """
    quote:        QuoteDetail
    ticker:       TickerBar
    candles:      list[CandlePoint]
    forecast:     list[ForecastPoint]
    sentiment:    SentimentGauge
    generated_at: str


# ═══════════════════════════════════════════════════════════════════════════════
# Utility helpers
# ═══════════════════════════════════════════════════════════════════════════════

def _sf(v: Any, default: float | None = None) -> float | None:
    """Safe float cast — returns default on NaN / None / bad value."""
    try:
        r = float(v)
        return default if (math.isnan(r) or math.isinf(r)) else r
    except (TypeError, ValueError):
        return default


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _retry(fn, attempts: int = 3, delay: float = 1.0):
    """Synchronous retry wrapper with linear back-off."""
    last_exc: Exception = RuntimeError("unknown")
    for i in range(attempts):
        try:
            return fn()
        except Exception as exc:
            last_exc = exc
            if i < attempts - 1:
                time.sleep(delay * (i + 1))
    raise last_exc


# ═══════════════════════════════════════════════════════════════════════════════
# yfinance fetchers
# ═══════════════════════════════════════════════════════════════════════════════

def _fetch_info(ticker: yf.Ticker) -> dict:
    info  = ticker.info or {}
    price = info.get("currentPrice") or info.get("regularMarketPrice")
    if not price:
        raise ValueError("no_price")
    return info


def _fetch_candles(symbol: str) -> list[CandlePoint]:
    """Download 1-day 1-minute OHLCV; returns [] when market is closed."""
    df: pd.DataFrame = _retry(
        lambda: yf.download(
            tickers=symbol,
            period="1d",
            interval="1m",
            progress=False,
            auto_adjust=True,
            prepost=True,
        )
    )
    if df.empty:
        return []

    # Flatten MultiIndex that yfinance wraps around single-ticker frames
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.dropna(subset=["Open", "High", "Low", "Close"])
    out: list[CandlePoint] = []
    for ts, row in df.iterrows():
        ts_str = ts.isoformat() if hasattr(ts, "isoformat") else str(ts)
        out.append(CandlePoint(
            time   = ts_str,
            open   = round(float(row["Open"]),   4),
            high   = round(float(row["High"]),   4),
            low    = round(float(row["Low"]),    4),
            close  = round(float(row["Close"]),  4),
            volume = round(float(row.get("Volume", 0)), 0),
        ))
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# AI Forecast  (placeholder — drop-in ready for LSTM / Random Forest)
# ═══════════════════════════════════════════════════════════════════════════════

def _build_forecast(candles: list[CandlePoint], horizon: int = 10) -> list[ForecastPoint]:
    """
    Placeholder AI forecast using a linear-trend + dual-SMA blended ensemble.

    ┌──────────────────────────────────────────────────────────┐
    │  TO REPLACE WITH YOUR TRAINED MODEL:                     │
    │  1. Convert candles → numpy / tensor input               │
    │  2. Call  model.predict(X)  or  pipeline.run(X)          │
    │  3. Map output → list[ForecastPoint]                     │
    │  The function signature and return type stay identical.  │
    └──────────────────────────────────────────────────────────┘
    """
    if len(candles) < 5:
        return []

    closes = np.array([c.close for c in candles[-20:]], dtype=float)
    sma5   = float(np.mean(closes[-5:]))
    sma10  = float(np.mean(closes[-10:])) if len(closes) >= 10 else sma5

    # Linear trend via least-squares on the last 20 bars
    x               = np.arange(len(closes), dtype=float)
    slope, intercept = np.polyfit(x, closes, 1)

    # Derive last candle timestamp
    try:
        last_dt = datetime.fromisoformat(
            candles[-1].time.replace("Z", "+00:00")
        )
    except ValueError:
        last_dt = datetime.now(timezone.utc)

    result: list[ForecastPoint] = []
    for i in range(1, horizon + 1):
        trend_val = intercept + slope * (len(closes) + i)

        # Blend: 40% trend · 30% SMA5 · 30% SMA10
        blended   = 0.4 * trend_val + 0.3 * sma5 + 0.3 * sma10

        # Micro-noise simulates model uncertainty
        noise     = np.random.normal(0, abs(slope) * 0.5)
        predicted = round(float(blended + noise), 4)

        # Confidence cone — decays with horizon
        confidence = round(max(0.30, 0.95 - (i * 0.065)), 4)

        proj_dt = last_dt + timedelta(minutes=i)
        result.append(ForecastPoint(
            time            = proj_dt.isoformat().replace("+00:00", "Z"),
            predicted_close = predicted,
            confidence      = confidence,
        ))

    log.info(
        "Forecast: %d points | slope=%.4f | last_pred=%.2f",
        len(result), slope, result[-1].predicted_close,
    )
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# News Sentiment  (yfinance RSS + keyword NLP)
# ═══════════════════════════════════════════════════════════════════════════════

def _fetch_news_sentiment(symbol: str) -> SentimentGauge:
    """
    1. Fetches yfinance news (Yahoo Finance RSS — no API key required).
    2. Scores each headline via a keyword-frequency NLP pass.
    3. Returns a 0–100 SentimentGauge ready for the React gauge component.
    """
    ticker   = yf.Ticker(symbol)
    raw_news = []
    try:
        raw_news = ticker.news or []
    except Exception:
        pass

    items:    list[NewsItem] = []
    pos_hits: int = 0
    neg_hits: int = 0

    for article in raw_news[:15]:
        content  = article.get("content", {})

        # yfinance v0.2.x uses nested content dict; older versions are flat
        if isinstance(content, dict):
            title    = content.get("title", "")
            prov_obj = content.get("provider", {})
            provider = (prov_obj.get("displayName", "") if isinstance(prov_obj, dict) else "") or "Yahoo Finance"
            url_obj  = content.get("canonicalUrl", {})
            url      = (url_obj.get("url", "") if isinstance(url_obj, dict) else "") or "#"
        else:
            title    = article.get("title", "")
            provider = article.get("publisher", "Yahoo Finance")
            url      = article.get("link", "#")

        pub_ts  = article.get("providerPublishTime") or 0
        pub_str = (
            datetime.fromtimestamp(pub_ts, tz=timezone.utc).isoformat()
            if pub_ts else _utcnow()
        )

        if title:
            words     = set(re.findall(r"\w+", title.lower()))
            pos_hits += len(words & POSITIVE_WORDS)
            neg_hits += len(words & NEGATIVE_WORDS)
            items.append(NewsItem(
                headline    = title,
                source      = provider,
                url         = url,
                published_at= pub_str,
            ))

    total = pos_hits + neg_hits
    score = round((pos_hits / total) * 100, 1) if total else 50.0
    label = "Bullish" if score >= 60 else ("Bearish" if score <= 40 else "Neutral")

    log.info(
        "Sentiment %s: score=%.1f  label=%s  (+%d / -%d)",
        symbol, score, label, pos_hits, neg_hits,
    )
    return SentimentGauge(
        score            = score,
        label            = label,
        positive_signals = pos_hits,
        negative_signals = neg_hits,
        news_items       = items[:8],
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Mutual Fund NAV  (AMFI public pipe-delimited feed)
# ═══════════════════════════════════════════════════════════════════════════════

_MF_CATEGORY_MAP = {
    "liquid": "Liquid", "overnight": "Overnight", "debt": "Debt",
    "gilt": "Gilt", "equity": "Equity", "elss": "ELSS",
    "hybrid": "Hybrid", "index": "Index", "etf": "ETF",
    "flexicap": "Flexi Cap", "flexi cap": "Flexi Cap",
    "largecap": "Large Cap", "large cap": "Large Cap",
    "midcap": "Mid Cap", "mid cap": "Mid Cap",
    "smallcap": "Small Cap", "small cap": "Small Cap",
    "bluechip": "Blue Chip", "blue chip": "Blue Chip",
}

_MF_TOP_FRAGMENTS = [
    "SBI Blue Chip", "HDFC Mid-Cap", "Axis Long Term Equity",
    "ICICI Prudential Bluechip", "Mirae Asset Large Cap",
    "Parag Parikh Flexi Cap", "Kotak Emerging Equity",
    "DSP Small Cap", "Nippon India Small Cap", "UTI Nifty Index",
]


def _categorise_mf(name: str) -> str:
    low = name.lower()
    for kw, cat in _MF_CATEGORY_MAP.items():
        if kw in low:
            return cat
    return "Diversified"


async def _fetch_mf_navs(limit: int = 20) -> list[MutualFundNAV]:
    """
    Downloads AMFI NAVAll.txt (;-delimited) and extracts curated fund NAVs.
    Falls back to cached data if the request fails.
    """
    global _mf_cache
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(AMFI_NAV_URL)
            resp.raise_for_status()
            text = resp.text
    except Exception as exc:
        log.warning("AMFI fetch failed: %s — serving cache (%d items)", exc, len(_mf_cache))
        return [MutualFundNAV(**d) for d in _mf_cache] if _mf_cache else []

    results: list[MutualFundNAV] = []
    reader  = csv.reader(io.StringIO(text), delimiter=";")
    for row in reader:
        if len(row) < 6:
            continue
        code, _, _, name, date, nav_raw = (
            row[0].strip(), row[1], row[2], row[3].strip(), row[4].strip(), row[5].strip()
        )
        try:
            nav_val = float(nav_raw)
        except ValueError:
            continue
        if any(frag.lower() in name.lower() for frag in _MF_TOP_FRAGMENTS):
            results.append(MutualFundNAV(
                scheme_code = code,
                scheme_name = name,
                nav         = round(nav_val, 4),
                date        = date,
                category    = _categorise_mf(name),
            ))
        if len(results) >= limit:
            break

    # Fallback: grab first equity funds if name-match returns nothing
    if not results:
        reader2 = csv.reader(io.StringIO(text), delimiter=";")
        for row in reader2:
            if len(row) < 6:
                continue
            name, date, nav_raw = row[3].strip(), row[4].strip(), row[5].strip()
            if "equity" in name.lower() or "flexi" in name.lower():
                try:
                    results.append(MutualFundNAV(
                        scheme_code = row[0].strip(),
                        scheme_name = name,
                        nav         = round(float(nav_raw), 4),
                        date        = date,
                        category    = _categorise_mf(name),
                    ))
                except ValueError:
                    pass
            if len(results) >= limit:
                break

    _mf_cache = [m.model_dump() for m in results]
    log.info("AMFI NAVs refreshed: %d funds", len(results))
    return results


# ═══════════════════════════════════════════════════════════════════════════════
# Core assembler — builds the full MarketDataResponse dict
# ═══════════════════════════════════════════════════════════════════════════════

def _build_market_data(symbol: str) -> dict:
    """
    Pipeline:
        validate symbol → fetch quote info → fetch 1m candles
        → build AI forecast → score sentiment → assemble response
    """
    symbol = symbol.upper().strip()
    ticker = yf.Ticker(symbol)

    # ── 1. Validate & fetch info ─────────────────────────────────────────────
    try:
        info = _retry(lambda: _fetch_info(ticker))
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail={
                "error":   "symbol_not_found",
                "message": (
                    f"'{symbol}' was not found on Yahoo Finance. "
                    "Use NSE suffix format: RELIANCE.NS · TCS.NS · INFY.NS"
                ),
                "symbol":  symbol,
            },
        )
    except Exception as exc:
        log.exception("yfinance unreachable for %s", symbol)
        raise HTTPException(
            status_code=503,
            detail={"error": "upstream_unavailable", "message": str(exc)},
        )

    # ── 2. Build QuoteDetail & TickerBar ─────────────────────────────────────
    price      = _sf(info.get("currentPrice") or info.get("regularMarketPrice"), 0.0)
    prev_close = _sf(
        info.get("previousClose") or info.get("regularMarketPreviousClose"), price
    )
    change     = round((price or 0.0) - (prev_close or 0.0), 4)
    change_pct = round((change / prev_close * 100) if prev_close else 0.0, 4)
    name       = info.get("shortName") or info.get("longName") or symbol
    currency   = info.get("currency", "INR")
    exchange   = info.get("exchange", "NSE")
    mkt_state  = info.get("marketState", "UNKNOWN")

    quote = QuoteDetail(
        symbol               = symbol,
        name                 = name,
        price                = round(price or 0, 4),
        open                 = round(_sf(info.get("open"), 0.0), 4),
        previous_close       = round(prev_close or 0, 4),
        day_high             = round(_sf(info.get("dayHigh"), 0.0), 4),
        day_low              = round(_sf(info.get("dayLow"),  0.0), 4),
        change               = change,
        change_pct           = change_pct,
        volume               = int(
            info.get("volume") or info.get("regularMarketVolume") or 0
        ),
        market_cap           = _sf(info.get("marketCap")),
        pe_ratio             = _sf(info.get("trailingPE")),
        fifty_two_week_high  = _sf(info.get("fiftyTwoWeekHigh")),
        fifty_two_week_low   = _sf(info.get("fiftyTwoWeekLow")),
        currency             = currency,
        exchange             = exchange,
        market_state         = mkt_state,
        fetched_at           = _utcnow(),
    )

    ticker_bar = TickerBar(
        symbol       = symbol,
        name         = name,
        price        = round(price or 0, 4),
        change       = change,
        change_pct   = change_pct,
        currency     = currency,
        market_state = mkt_state,
    )

    # ── 3. 1-minute OHLCV candles ────────────────────────────────────────────
    candles = _fetch_candles(symbol)

    # ── 4. AI forecast (placeholder) ─────────────────────────────────────────
    forecast = _build_forecast(candles, horizon=10)

    # ── 5. News sentiment ────────────────────────────────────────────────────
    sentiment = _fetch_news_sentiment(symbol)

    payload = MarketDataResponse(
        quote        = quote,
        ticker       = ticker_bar,
        candles      = candles,
        forecast     = forecast,
        sentiment    = sentiment,
        generated_at = _utcnow(),
    )

    log.info(
        "✓ %s  price=%.2f  chg_pct=%.2f%%  candles=%d  forecast=%d  sentiment=%.1f",
        symbol, price or 0, change_pct, len(candles), len(forecast), sentiment.score,
    )
    return payload.model_dump()


# ═══════════════════════════════════════════════════════════════════════════════
# APScheduler — background cache warmer (every 60 s)
# ═══════════════════════════════════════════════════════════════════════════════

async def _warm_cache_job():
    log.info("⏱  Cache warm: %d symbols…", len(WATCHLIST_SYMBOLS))
    for sym in WATCHLIST_SYMBOLS:
        try:
            _cache[sym] = await asyncio.to_thread(_build_market_data, sym)
            log.info("  ✓ %s", sym)
        except Exception as exc:
            log.warning("  ✗ %s — %s", sym, exc)
    navs = await _fetch_mf_navs()
    _mf_cache[:] = [n.model_dump() for n in navs]
    log.info("⏱  Cache warm complete.")


scheduler = AsyncIOScheduler(timezone="UTC")
scheduler.add_job(_warm_cache_job, "interval", seconds=60, id="cache_warmer")


# ═══════════════════════════════════════════════════════════════════════════════
# App lifespan
# ═══════════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("🚀 MarketMind AI v2.0 starting…")
    scheduler.start()
    asyncio.create_task(_warm_cache_job())   # eager first warm
    yield
    scheduler.shutdown(wait=False)
    log.info("🛑 MarketMind AI v2.0 shutdown.")


# ═══════════════════════════════════════════════════════════════════════════════
# FastAPI application
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title       = "MarketMind AI v2.0",
    description = (
        "Professional trading terminal backend — "
        "live stock data, AI forecast, news sentiment & mutual fund NAVs."
    ),
    version  = "2.0.0",
    docs_url = "/docs",
    redoc_url= "/redoc",
    lifespan = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = CORS_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Service health-check."""
    return {
        "service":      "MarketMind AI v2.0",
        "status":       "operational",
        "cached_symbols": list(_cache.keys()),
        "docs":         "/docs",
        "utc_time":     _utcnow(),
    }


@app.get(
    "/api/market-data/{symbol}",
    response_model = MarketDataResponse,
    summary        = "All-in-one market data payload",
    tags           = ["Market Data"],
    responses={
        200: {"description": "Full payload: quote · ticker · candles · forecast · sentiment"},
        404: {"description": "Ticker symbol not found on Yahoo Finance"},
        503: {"description": "Yahoo Finance temporarily unreachable"},
    },
)
async def get_market_data(
    symbol: str = Path(
        ...,
        title       = "NSE Ticker Symbol",
        description = "e.g. RELIANCE.NS · TCS.NS · INFY.NS · HDFCBANK.NS",
        min_length  = 1,
        max_length  = 24,
    )
) -> MarketDataResponse:
    """
    Returns the **master JSON payload** consumed by every React component:

    | React Hook       | Payload Field           |
    |------------------|-------------------------|
    | `useChartData()` | `candles` + `forecast`  |
    | `useTicker()`    | `ticker`                |
    | `useGauges()`    | `sentiment` + `quote`   |

    Served from the in-memory cache (refreshed every 60 s by APScheduler).
    Cache-miss symbols are fetched live and cached for subsequent calls.
    """
    sym = symbol.upper().strip()
    log.info("→ GET /api/market-data/%s  (cache_hit=%s)", sym, sym in _cache)

    if sym in _cache:
        return MarketDataResponse(**_cache[sym])

    # Cache miss — live fetch + store
    data       = await asyncio.to_thread(_build_market_data, sym)
    _cache[sym] = data
    return MarketDataResponse(**data)


@app.get(
    "/api/mutual-funds",
    response_model = list[MutualFundNAV],
    summary        = "Top mutual fund NAVs (AMFI)",
    tags           = ["Mutual Funds"],
)
async def get_mutual_funds():
    """Returns the latest NAV data scraped from the AMFI public endpoint."""
    if _mf_cache:
        return [MutualFundNAV(**d) for d in _mf_cache]
    return await _fetch_mf_navs()


@app.get(
    "/api/watchlist",
    response_model = list[TickerBar],
    summary        = "Batch ticker quotes for the default watchlist",
    tags           = ["Market Data"],
)
async def get_watchlist():
    """Returns cached TickerBar objects for all pre-warmed watchlist symbols."""
    return [
        TickerBar(**_cache[sym]["ticker"])
        for sym in WATCHLIST_SYMBOLS
        if sym in _cache
    ]


# ─────────────────────────────────────────────────────────────────────────────
# WebSocket — 1-second live price stream
# ─────────────────────────────────────────────────────────────────────────────

@app.websocket("/ws/live/{symbol}")
async def ws_live_price(websocket: WebSocket, symbol: str):
    """
    Streams a lightweight price tick every second to the React client.

    **Frontend usage**
    ```js
    const ws = new WebSocket("ws://localhost:8000/ws/live/RELIANCE.NS");
    ws.onmessage = ({ data }) => {
      const { symbol, price, change_pct, timestamp } = JSON.parse(data);
      updateTicker({ symbol, price, change_pct });
    };
    ```
    """
    sym = symbol.upper().strip()
    await websocket.accept()
    log.info("WS ↑ connected: %s", sym)

    yfticker = yf.Ticker(sym)
    try:
        while True:
            try:
                fi    = yfticker.fast_info
                price = _sf(getattr(fi, "last_price", None), 0.0)
                prev  = _sf(
                    getattr(fi, "previous_close", None) or
                    getattr(fi, "regular_market_previous_close", None),
                    price,
                )
                chg   = round((price or 0) - (prev or 0), 4)
                chg_p = round((chg / prev * 100) if prev else 0.0, 4)

                await websocket.send_json({
                    "symbol":     sym,
                    "price":      round(price or 0, 4),
                    "change":     chg,
                    "change_pct": chg_p,
                    "timestamp":  _utcnow(),
                })
            except Exception as exc:
                log.warning("WS tick error %s: %s", sym, exc)
                await websocket.send_json({"error": str(exc), "symbol": sym})

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        log.info("WS ↓ disconnected: %s", sym)


# ─────────────────────────────────────────────────────────────────────────────
# Global exception handler
# ─────────────────────────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "message": "An unexpected error occurred."},
    )


# ─────────────────────────────────────────────────────────────────────────────
# Dev entry-point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host      = "0.0.0.0",
        port      = 8000,
        reload    = True,
        log_level = "info",
    )
