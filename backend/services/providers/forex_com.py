"""
FOREX.com provider integration.

Currently returns a static placeholder because a public FOREX.com API is not
readily available without authentication.  This module can be extended with
requests to other FX data sources if needed.
"""
from __future__ import annotations

from typing import Dict, Any


async def get_forex_context() -> Dict[str, Any]:
    """
    Return a basic forex context placeholder.

    This function can be expanded with calls to FX or macro‑economic APIs.
    """
    return {
        "provider": "FOREX.com",
        "summary": "Forex market integration not implemented yet.",
        "pairs": [],
    }