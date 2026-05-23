# Aggregate provider modules and expose functions used by the API layer.
"""
Provider integration modules.

This package contains thin async wrappers around public APIs for external
market/education providers such as Coingecko, Yahoo Finance, FOREX.com, etc.
These functions are intentionally minimal and may return a simple error
message if the remote provider is unavailable.  They can be expanded with
real API keys and rate-limiting logic when needed.
"""

from .coingecko import get_global_market_overview  # noqa: F401
from .forex_com import get_forex_context  # noqa: F401
from .investopedia import get_glossary  # noqa: F401
from .yahoo_finance import get_market_overview  # noqa: F401
from .tradingview import get_charting_context  # noqa: F401
from .coinmarketcap import get_market_cap_overview  # noqa: F401

__all__ = [
    "get_global_market_overview",
    "get_forex_context",
    "get_glossary",
    "get_market_overview",
    "get_charting_context",
    "get_market_cap_overview",
]