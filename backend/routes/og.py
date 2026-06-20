"""Dynamic OG image generation for shareable Leader-Score cards.

Renders premium dark (Apple-style) PNGs on the fly for LinkedIn / X / Slack
previews. Score → giant lime number, tier label, dezent "leaderos.de" footer.

URL pattern:
  GET /api/og/leader-score/{user_id}
  GET /api/og/default

All endpoints respond with image/png + 1h public Cache-Control so social
platforms can cache aggressively (they will, regardless).

Font fallback: tries /app/backend/assets/fonts/* first, falls back to PIL default.
"""
from __future__ import annotations

import io
import logging
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Response
from PIL import Image, ImageDraw, ImageFont

from config import db

logger = logging.getLogger("leader-os.og")
router = APIRouter(prefix="/api/og", tags=["og-images"])

# ────────────────────────────────────────────────────────────────────────────
# Style constants — Apple/Dark + Neon Lime
# ────────────────────────────────────────────────────────────────────────────
WIDTH, HEIGHT = 1200, 630
BG_BLACK = (10, 10, 10)           # #0A0A0A
NEON_LIME = (191, 255, 0)         # #BFFF00
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (153, 153, 153)
TEXT_DIM = (102, 102, 102)
ACCENT_GRADIENT_TOP = (20, 20, 20)
ACCENT_GRADIENT_BOTTOM = (5, 5, 5)


# Score → tier label mapping (matches Wlad's leadership scale)
def _score_to_tier(score: int) -> str:
    if score >= 90:
        return "Visionärer Leader"
    if score >= 80:
        return "Strategischer Denker"
    if score >= 70:
        return "Kommunikator"
    if score >= 55:
        return "Mentor"
    if score >= 40:
        return "Teamplayer"
    return "Emerging Leader"


def _font(size: int, *, weight: str = "regular") -> ImageFont.FreeTypeFont:
    """Try Outfit (premium), fall back to DejaVu, then PIL default."""
    candidates = [
        f"/app/backend/assets/fonts/Outfit-{weight.capitalize()}.ttf",
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if weight == 'bold' else ''}.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def _render_leader_score_card(
    *,
    score: int,
    tier_label: str,
    user_name: Optional[str] = None,
) -> bytes:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_BLACK)
    draw = ImageDraw.Draw(img)

    # Subtle vertical gradient — gives it premium depth
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(ACCENT_GRADIENT_TOP[0] * (1 - t) + ACCENT_GRADIENT_BOTTOM[0] * t)
        g = int(ACCENT_GRADIENT_TOP[1] * (1 - t) + ACCENT_GRADIENT_BOTTOM[1] * t)
        b = int(ACCENT_GRADIENT_TOP[2] * (1 - t) + ACCENT_GRADIENT_BOTTOM[2] * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Top-left brand mark
    f_brand = _font(28, weight="bold")
    draw.text((60, 50), "LEADER-OS", font=f_brand, fill=TEXT_WHITE)

    f_brand_sub = _font(18, weight="regular")
    draw.text((60, 88), "KI Leadership System", font=f_brand_sub, fill=TEXT_DIM)

    # Optional user attribution (small top-right)
    if user_name:
        f_user = _font(22, weight="regular")
        # right-align
        bbox = draw.textbbox((0, 0), user_name, font=f_user)
        text_w = bbox[2] - bbox[0]
        draw.text((WIDTH - 60 - text_w, 60), user_name, font=f_user, fill=TEXT_MUTED)

    # GIANT score — centerpiece
    score_str = f"{score}"
    f_score = _font(380, weight="bold")
    score_bbox = draw.textbbox((0, 0), score_str, font=f_score)
    score_w = score_bbox[2] - score_bbox[0]
    score_h = score_bbox[3] - score_bbox[1]
    score_x = (WIDTH - score_w) // 2
    score_y = 160
    draw.text((score_x, score_y), score_str, font=f_score, fill=NEON_LIME)

    # "/100" suffix in dim white
    f_max = _font(60, weight="regular")
    suffix = "/100"
    # place to right of the score
    draw.text((score_x + score_w + 16, score_y + 220), suffix, font=f_max, fill=TEXT_DIM)

    # Tier label — strong, centered below
    f_tier_kicker = _font(20, weight="bold")
    kicker = "LEADER-SCORE"
    kicker_bbox = draw.textbbox((0, 0), kicker, font=f_tier_kicker)
    kicker_w = kicker_bbox[2] - kicker_bbox[0]
    draw.text(((WIDTH - kicker_w) // 2, score_y + score_h + 35), kicker, font=f_tier_kicker, fill=TEXT_MUTED)

    f_tier = _font(54, weight="bold")
    tier_bbox = draw.textbbox((0, 0), tier_label, font=f_tier)
    tier_w = tier_bbox[2] - tier_bbox[0]
    draw.text(((WIDTH - tier_w) // 2, score_y + score_h + 70), tier_label, font=f_tier, fill=TEXT_WHITE)

    # Bottom-right footer — discreet domain
    f_footer = _font(22, weight="regular")
    footer = "leaderos.de"
    footer_bbox = draw.textbbox((0, 0), footer, font=f_footer)
    footer_w = footer_bbox[2] - footer_bbox[0]
    draw.text((WIDTH - 60 - footer_w, HEIGHT - 60), footer, font=f_footer, fill=NEON_LIME)

    # Bottom-left tagline
    f_tagline = _font(18, weight="regular")
    draw.text((60, HEIGHT - 60), "KI Leadership · 30-Tage Sprint", font=f_tagline, fill=TEXT_DIM)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _render_default_card() -> bytes:
    """Generic OG card — used on / and /login pages."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_BLACK)
    draw = ImageDraw.Draw(img)

    # Gradient
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(ACCENT_GRADIENT_TOP[0] * (1 - t) + ACCENT_GRADIENT_BOTTOM[0] * t)
        g = int(ACCENT_GRADIENT_TOP[1] * (1 - t) + ACCENT_GRADIENT_BOTTOM[1] * t)
        b = int(ACCENT_GRADIENT_TOP[2] * (1 - t) + ACCENT_GRADIENT_BOTTOM[2] * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    f_brand = _font(32, weight="bold")
    draw.text((60, 50), "LEADER-OS", font=f_brand, fill=TEXT_WHITE)

    # Main headline — bold, multi-line, lime accent
    f_main = _font(86, weight="bold")
    draw.text((60, 200), "KI Leadership", font=f_main, fill=TEXT_WHITE)
    draw.text((60, 295), "in 30 Tagen.", font=f_main, fill=NEON_LIME)

    # Sub-headline
    f_sub = _font(32, weight="regular")
    draw.text((60, 410), "Werde KI-native Führungskraft —", font=f_sub, fill=TEXT_MUTED)
    draw.text((60, 450), "von Wlad Jachtchenko.", font=f_sub, fill=TEXT_MUTED)

    # Footer
    f_footer = _font(22, weight="regular")
    footer = "leaderos.de"
    footer_bbox = draw.textbbox((0, 0), footer, font=f_footer)
    footer_w = footer_bbox[2] - footer_bbox[0]
    draw.text((WIDTH - 60 - footer_w, HEIGHT - 60), footer, font=f_footer, fill=NEON_LIME)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ────────────────────────────────────────────────────────────────────────────
# Routes
# ────────────────────────────────────────────────────────────────────────────


def _png_response(data: bytes) -> Response:
    return Response(
        content=data,
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
            "Content-Disposition": "inline",
        },
    )


@router.get("/default")
async def og_default():
    """Default OG image for / and /login. Returns the generic brand card."""
    try:
        return _png_response(_render_default_card())
    except Exception as e:
        logger.exception("og default render failed: %s", e)
        return Response(status_code=500, content=b"og render failed")


@router.get("/leader-score/{user_id}")
async def og_leader_score(user_id: str):
    """Dynamic Leader-Score card for sharing on LinkedIn / X."""
    try:
        user = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0, "name": 1, "leadership_score": 1, "communication_score": 1, "eq_score": 1, "wladhub_scores": 1},
        )
        if not user:
            # Fallback to default card if user not found — never 404 a social crawler
            return _png_response(_render_default_card())

        # Prefer wladhub composite if available, otherwise average the 3 scores
        wladhub = user.get("wladhub_scores") or {}
        composite = wladhub.get("overall_score")
        if not composite:
            scores = [
                user.get("leadership_score") or 0,
                user.get("communication_score") or 0,
                user.get("eq_score") or 0,
            ]
            valid = [s for s in scores if s > 0]
            composite = round(sum(valid) / len(valid)) if valid else 0

        composite = max(0, min(100, int(composite)))
        tier_label = _score_to_tier(composite)
        name = (user.get("name") or "").strip() or None

        return _png_response(
            _render_leader_score_card(score=composite, tier_label=tier_label, user_name=name)
        )
    except Exception as e:
        logger.exception("og leader-score render failed for %s: %s", user_id, e)
        return _png_response(_render_default_card())


@router.get("/leader-score/preview/{score}")
async def og_leader_score_preview(score: int):
    """Preview endpoint for testing/marketing — generate a card for any score."""
    try:
        score = max(0, min(100, int(score)))
        return _png_response(
            _render_leader_score_card(score=score, tier_label=_score_to_tier(score))
        )
    except Exception as e:
        logger.exception("og preview render failed: %s", e)
        return Response(status_code=500, content=b"og render failed")
