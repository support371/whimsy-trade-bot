"""
Coingecko provider integration.

Provides a simple wrapper around the public Coingecko API to fetch global
market overview metrics.  If the call fails (e.g. no network access), the
error is returned in the response.
"""
from __future__ import annotations

from typing import Dict, Any

import httpx


async def get_global_market_overview() -> Dict[str, Any]:
    """
    Fetch a global market overview from the public Coingecko API.

    Returns a dictionary containing market cap, volume and other metrics.
    If the fetch fails for any reason, an error message is returned.
    """
    url = "https://api.coingecko.com/api/v3/global"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
    except Exception as exc:  # Catch broad errors: network, JSON, etc
        return {"error": f"Failed to fetch Coingecko data: {exc}"}