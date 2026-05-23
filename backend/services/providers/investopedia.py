"""
Investopedia provider integration.

Returns simple educational glossary entries.  In the absence of a live API,
this implementation echoes the requested term and invites the user to
consult Investopedia.  This module can be upgraded with web scraping or
official API calls when available.
"""
from __future__ import annotations

from typing import Dict, Any


async def get_glossary(term: str | None = None) -> Dict[str, Any]:
    """
    Return a placeholder glossary entry for the requested term.

    :param term: Optional glossary term.
    """
    if not term:
        return {
            "provider": "Investopedia",
            "summary": "No term provided.  This endpoint will return definitions when implemented.",
        }
    return {
        "provider": "Investopedia",
        "term": term,
        "definition": f"Definition for '{term}' is not implemented yet. Please consult Investopedia directly.",
    }