"""
Provider data API.

Exposes simplified endpoints for public provider integrations such as
Coingecko, FOREX.com, Investopedia, Yahoo Finance and others.  These
endpoints return stub or live data and can be expanded as integration
contracts mature.
"""
from __future__ import annotations

from fastapi import APIRouter, Query

from backend.services.providers import (
    get_global_market_overview,
    get_forex_context,
    get_glossary,
    get_market_overview,
    get_charting_context,
    get_market_cap_overview,
)

providers_router = APIRouter(prefix="/api/v1", tags=["providers"])


@providers_router.get("/market/overview", summary="Global market overview", response_model=dict)
async def market_overview() -> dict:
    """
    Return a global market overview using Coingecko's public API.
    """
    data = await get_global_market_overview()
    return {"provider": "coingecko", "data": data}


@providers_router.get("/macro/forex", summary="Forex/macroeconomic context", response_model=dict)
async def macro_forex() -> dict:
    """
    Return a basic forex context placeholder.
    """
    data = await get_forex_context()
    return {"provider": "forex_com", "data": data}


@providers_router.get("/education/glossary", summary="Educational glossary lookup", response_model=dict)
async def education_glossary(term: str = Query(default="", description="Optional glossary term")) -> dict:
    """
    Return a glossary definition for the requested term.
    """
    data = await get_glossary(term.strip() or None)
    return {"provider": "investopedia", "data": data}


@providers_router.get("/charting/context", summary="Charting context", response_model=dict)
async def charting_context(symbol: str = Query(default="", description="Trading symbol")) -> dict:
    """
    Return a charting context placeholder for TradingView.
    """
    data = await get_charting_context(symbol.strip() or None)
    return {"provider": "tradingview", "data": data}


@providers_router.get("/market/cap", summary="Market cap overview", response_model=dict)
async def market_cap_overview() -> dict:
    """
    Return a market capitalization overview placeholder from CoinMarketCap.
    """
    data = await get_market_cap_overview()
    return {"provider": "coinmarketcap", "data": data}