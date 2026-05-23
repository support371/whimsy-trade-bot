"""
CoinMarketCap provider integration.

Returns placeholder data for market capitalization context.  Real integration
would require an API key.
"""
from __future__ import annotations

from typing import Dict, Any


async def get_market_cap_overview() -> Dict[str, Any]:
    """
    Return placeholder market cap overview.
    """
    return {
        "provider": "CoinMarketCap",
        "summary": "CoinMarketCap integration not implemented yet.",
    }