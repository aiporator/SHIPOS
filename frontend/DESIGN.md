---
version: t1
name: Leader-OS — Vellum Specification
theme: light
description: |
  A factory-floor blueprint on warm vellum. A quiet, near-monochromatic
  stage where scale, spacing, and shape carry the brand — and a single
  disciplined lime accent marks every moment that matters. Whisper-light
  display headlines feel etched rather than shouted; imagery floats on the
  canvas as soft 80px portholes; navigation rides as a dark pill over the
  cream. The interface reads like a technical specification sheet for
  leadership itself: precise, confident, unadorned.
---

# Leader-OS — Vellum Specification

> Factory-floor blueprint on warm vellum. Industrial scale and whisper-light
> typography carry the brand; one lime accent does the pointing.

**Theme:** light · **Adapted from:** the T1 Energy industrial-spec language,
re-tuned for Leader-OS. **Predecessor:** the Athletic-Editorial (Nike/Futura)
direction lives in git history — this supersedes it for all marketing surfaces.

Leader-OS speaks the visual language of precision manufacturing applied to
leadership. A warm cream canvas. Charcoal type rendered whisper-light. Rounded
geometry that softens hard subject matter. The interface is **nearly colorless
by design** — every element earns its place through scale, spacing, and shape
rather than hue. The one exception is our signature: a single **lime accent**
(`--brand`), spent only on the period that ends a display lockup and the one
primary action per view. Spend it anywhere else and the discipline breaks.

---

## The one rule that defines everything

**Monochrome canvas, single lime point.** The page is vellum, the type is
carbon, the borders are carbon. Color appears exactly twice per view: the lime
**period** that closes the hero/section headline, and the lime **primary CTA
pill**. Everything else — secondary buttons, labels, metadata, dividers — is
carbon-on-vellum. The absence of color is the design; the one dab of lime is
the brand.

---

## Tokens — Colors

| Name | Value | HSL token | Role |
|------|-------|-----------|------|
| Vellum | `#f0efe9` | `--background: 51 19% 93%` | Page canvas, section backgrounds — the warm off-white that defines the entire surface |
| Paper White | `#ffffff` | `--card: 0 0% 100%` | Elevated cards, wells, input fills above the vellum |
| Carbon Warm | `#322d2a` | `--foreground: 23 9% 18%` | All text, borders, dark UI. **Never pure black.** |
| Onyx Depth | `#0f0e12` | `--surface-onyx` | Footer terminator, deepest elevation layer |
| Mercury | `#8b8b8b` | `--muted-foreground: 0 0% 55%` | Secondary text, disabled states, subtle layering |
| Brand Lime | `#bfff00` (fill) · `#6b8a00` (text on vellum) | `--brand` | **The signature accent.** Lime fill + carbon text for the primary CTA; the darker olive for the period/accent text so it stays WCAG-legible on vellum. |

> **Why two limes?** `#bfff00` is the punchy fill we put under dark text (the
> primary pill, the period on a dark surface). `#6b8a00` is the WCAG-AA olive we
> use for lime *text* on the pale vellum. Same brand, calibrated for contrast.

---

## Tokens — Typography

### Display — whisper weight
The single most distinctive choice. Display headlines use **weight 300** at a
large size, with line-height **1.0** so the block reads tight and architectural,
not shouted. The ultra-light weight makes leadership copy feel *etched* —
specification, not slogan. Closed with a lime period.

- **Family:** `Outfit` → `Inter` → system sans (geometric, instrument-like)
- **Weight:** 300 (display), 400 (body/labels/nav)
- **Display size:** clamp ~40px (mobile) → 96px (desktop); line-height 1.0
- **Tracking:** +0.01em universally — barely open, just enough that 300-weight never feels cramped

### Type scale

| Role | Size | Line height | Tracking | Weight |
|------|------|-------------|----------|--------|
| label | 12px | 1.3 | 0.12em (uppercase) | 400 |
| body-sm | 14px | 1.3 | 0.01em | 400 |
| body | 16px | 1.4 | 0.01em | 400 |
| subheading | 22px | 1.3 | 0.01em | 400 |
| heading | 32px | 1.2 | 0.01em | 300–400 |
| display | 52–96px | 1.0 | 0.01em | **300** |

Utility classes (in `index.css`): `.t1-display`, `.t1-label`.

---

## Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable.

Scale: 4 · 8 · 12 · 16 · 24 · 36 · 48 · 60 · 96 · 120 (px).

### Border radius

| Element | Value |
|---------|-------|
| image cards (portholes) | **80px** |
| pills / buttons (full) | 100px |
| nav | 16px |
| body / case card | 12px |
| small | 8px |

**Never below 8px.** The system is built on generous rounding; sharp corners
read as foreign.

### Layout

- **Page max-width:** 1200px (hero may break full-bleed)
- **Section gap:** 48px · **Card padding:** 22px · **Element gap:** 8px

---

## Components

### Pill Navigation
Floats as a dark **Carbon Warm** pill over the vellum — 16px radius, ~24px
horizontal / 14px vertical padding, white 14px/400 links separated by 24px, no
shadow. The tonal contrast alone lifts it off the canvas. Logo `Leader·OS`
sits left with the lime middot. The one primary action (14-day trial) is a
**lime pill** inside the bar; secondary (diagnose) is a ghost carbon-outline pill.

### Display Headline
`.t1-display` — Outfit/Inter **300**, large, line-height 1.0, carbon, closed
with a lime period (`<span class="text-brand">.</span>`). One per view.

### Section Label
A **4px solid square** (carbon) precedes uppercase 12px/400 label text,
tracking 0.12em, carbon. The square is the signature dial-indicator — it
replaces the bullet, the dot, and every lucide icon. Class: `.t1-label`.

### Primary Button (the lime exception)
Lime fill `#bfff00`, carbon text, 100px radius (full pill), ~16px/22px padding,
no border, no shadow. The single highest-weight element on the page. One per view.

### Ghost Button
Transparent fill, 1px carbon border, carbon text, 100px radius, matched padding.
The secondary half of the pair — identical geometry, differs only in fill.

### Image Porthole
Full-bleed image, **80px radius**, no caption, no border, no shadow. Rectangular
photos become soft portholes into the work. The most dramatic radius on the site.
Class: `.t1-porthole`.

### Diagnostic Block (Growth-Loop capture)
The in-article/inline intent-capture card keeps its function but adopts T1 skin:
vellum-tinted card on paper, carbon 2px border, `.t1-label` eyebrow, whisper-
light prompt with a lime question-mark, quick-select carbon-outline pills, and
the one lime CTA pill. See `InlineDiagnostic.jsx` + `docs/GROWTH_LOOP.md`.

### Footer
**Onyx Depth** `#0f0e12` full-width — the only full-bleed dark surface, the
page's definitive terminator. White 14px/400.

---

## Do's and Don'ts

### Do
- Use weight **300** for every display headline — the whisper weight is the signature; never replace it with 700/900 bold.
- Close each display lockup with a single **lime period**. That + the primary pill are the only color on the view.
- Set **80px** radius on every image container and **100px** on every pill/button.
- Use **Carbon Warm `#322d2a`** for all text and borders — never pure black.
- Prefix section labels with the **4px carbon square** — no icons, no dots, no emoji.
- Keep section gaps at **48px** and card padding at **22px** — the specification-sheet rhythm.
- Layer surfaces tonally: vellum → paper → carbon → onyx. Hierarchy comes from tone and space, **not shadow**.

### Don't
- Don't introduce a second accent color, gradients, or decorative hues. The 1% colorfulness (lime) is the whole identity.
- Don't use pure black `#000000` for text/bg/borders — warm it to carbon `#322d2a` or cool it to onyx `#0f0e12`.
- Don't apply box-shadows to cards, buttons, or nav — flat tonal layering only.
- Don't go below 8px radius on any container.
- Don't use bold/semibold weights for display headlines.
- Don't add lucide icons or illustrations to labels/body — the carbon square and typography carry all signaling. (A single arrow on the primary CTA is the allowed exception.)
- Don't break the full-bleed porthole pattern with frames, borders, or padding around photographs.
- Don't spend the lime on more than one element per view. Two limes per screen, maximum: the period and the primary action.

---

## Surfaces & Elevation

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Vellum Canvas | `#f0efe9` | Base background, most sections |
| 1 | Paper White | `#ffffff` | Elevated cards, wells |
| 2 | Carbon Warm | `#322d2a` | Nav pill, ghost-button borders, dark cards |
| 3 | Onyx Depth | `#0f0e12` | Footer terminator |

**Deliberately shadowless.** All hierarchy is tonal layering + generous space.
Flat, precise, instrument-like — never skeuomorphic.

---

## Imagery

Full-bleed documentary — Wlad on stage, real coaching rooms, the product itself
— presented without duotone or color treatment, cropped to fill with **80px
radius**. No stock lifestyle, no abstract gradients, no illustration. Product/UI
renders sit as isolated objects on the vellum with no background treatment. The
imagery is the only source of visual richness in an otherwise austere interface.

---

## Implementation

- **Scope:** the vellum theme is applied via `.theme-t1` on the landing root
  (`LandingPage.js`). It remaps the HSL semantic tokens to vellum/carbon so the
  whole main page sits on the warm canvas; the app/dashboard are untouched.
- **Tokens & utilities:** `src/index.css` — `.theme-t1` token block, plus
  `.t1-display`, `.t1-label`, `.t1-porthole`, `.t1-pill`, `.t1-pill-ghost`.
- **Fonts:** Outfit + Inter loaded at weight **300** (and 400) for the whisper
  display + body.
- **Rollout order:** Nav + Hero first (the flagship first impression), then the
  remaining landing sections section-by-section, then journal/article shells.

## Signature choices (the three that define it)
1. **Weight-300 display** — whisper-light headlines that feel etched.
2. **The 4px carbon square** before every section label — a machined dial-indicator that replaces bullets and icons.
3. **80px image portholes** on the otherwise flat, technical canvas.

Together: industrial and gentle, precise and breathable — with one lime point
of brand.
