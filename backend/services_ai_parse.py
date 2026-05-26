"""Shared AI JSON parsing — handles markdown fences, leading prose, trailing prose.

GPT-5.2 and other LLMs sometimes wrap JSON output in ```json ... ``` fences
or prefix with prose ("Hier ist deine Antwort:\n{...}") despite explicit
instructions. A plain `json.loads()` fails in those cases.

This helper handles:
  1. Direct JSON string
  2. ```json ... ``` fenced code blocks
  3. ``` ... ``` (unlabelled) fenced code blocks
  4. Prose-prefixed JSON: "Hier kommt: {...}"  → extracts outer-most {...}

Returns the parsed dict on success, or None if no valid JSON found.
"""
from __future__ import annotations

import json
import re
from typing import Any


_FENCE_PATTERN = re.compile(r"```(?:json|JSON)?\s*(\{.*?\})\s*```", re.DOTALL)


def parse_ai_json(text: str) -> dict[str, Any] | None:
    """Best-effort JSON extraction from an LLM response.

    Returns None when nothing parseable was found — callers should handle this
    (typically by re-prompting the model or surfacing an error to the user).
    Never raises.
    """
    if not text or not isinstance(text, str):
        return None

    candidates: list[str] = [text]

    # Strip markdown fences
    fence_match = _FENCE_PATTERN.search(text)
    if fence_match:
        candidates.append(fence_match.group(1))

    # Outer-most {...} block
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        candidates.append(text[first_brace:last_brace + 1])

    for c in candidates:
        try:
            parsed = json.loads(c)
            if isinstance(parsed, dict):
                return parsed
        except (json.JSONDecodeError, ValueError):
            continue
    return None
