# Tuesday-Launch — Production Readiness Checklist

> **Target:** Dienstag, erste 100 User · vier Domains live · Stripe in Production.
> **Stand:** 2026-06-18 · ein Branch zum Merge offen (`claude/wlad-images`).

## 1. Branch-Struktur — der Pfad zur Production

### Wie der Code von hier nach Live kommt

```
[ Claude Code dev / Cursor / lokales Repo ]
              ↓
              push origin claude/<branch>
              ↓
[ PR auf GitHub ]  ──→  base: mvpcode (immer)
              ↓
              squash-merge nach Review
              ↓
[ mvpcode (Production-Branch) ]
              ↓
              Vercel auto-deploy
              ↓
   leader-os.de  +  leader-check.de   ← Marketing-Landings live
```

**Regeln:**
- `mvpcode` ist **THE single source of truth** für Vercel
- Direkt-Pushes auf `mvpcode` blockieren (siehe `docs/DEV_TASKS_BRANCHES.md`
  Task 2 — Branch Protection)
- Feature-Branches nach Squash-Merge **automatisch löschen** (Repo
  Settings → "Automatically delete head branches")
- App-Code (leaderos.de, leadercheck.de) liegt im **Emergent-Workspace**,
  NICHT in diesem Repo. Änderungen dort = Emergent-Dashboard

### Aktueller Branch-Stand

| Branch | Status | Action |
|---|---|---|
| `mvpcode` | Production-Head 1a2a9ac | ✓ stable, nichts tun |
| `claude/wlad-images` | 7 commits ahead, ready to merge | **Mergen** — siehe Step 3 unten |
| Restliche 80 Branches | Stale | Putzen via `docs/DEV_TASKS_BRANCHES.md` |

### Was auf `claude/wlad-images` drauf ist und live geht

1. **Wlad-Bilder** in §01 + §02 (Higgsfield-generated)
2. **Video-Thumbnail** mit Wlad am Schreibtisch (statt schwacher hf-04)
3. **QR-Codes** für leadercheck.de (`/qr/leadercheck.svg` + `.png`)
4. **WladBot Overview Doc**
5. **Launch-Email-Template** (`launch_announcement_email`)
6. **Domain-Topology Klärung** in Code-Kommentaren + Visible-Copy
7. **Branch-Cleanup Doku** für Dev

---

## 2. Was auf welcher Domain läuft — Final Check

| Domain | Hosting | Inhalt | Code-Quelle |
|---|---|---|---|
| `leader-os.de` | Vercel | Marketing-Landing (Nike-DNA, Hero, Pricing, FAQ) | shipos `mvpcode` |
| `leader-check.de` | Vercel | Diagnostic Landing (light Nike) | shipos `mvpcode` |
| `leaderos.de` | Emergent | App: Login + Dashboard + WladBot + Coaching | Emergent Workspace |
| `leadercheck.de` | Emergent | App: 5-Min-Diagnose + Score | Emergent Workspace |

### Was du auf Emergent-Apps verifizieren musst (bis Dienstag)

Da der Emergent-Code in einem getrennten Workspace lebt, hier die
**read-only-Checks** die du im Browser machst:

- [ ] **`leaderos.de`** lädt und zeigt Login-Page
- [ ] Login via Google/Apple/Microsoft funktioniert (Supabase Auth)
- [ ] `/dashboard` nach Login erreichbar
- [ ] WladBot-Chat antwortet auf erste Test-Frage in < 5 Sek
- [ ] `/api/health` → 200 OK
- [ ] CORS akzeptiert Aufrufe von `leader-os.de` (via Browser-DevTools
      Network-Tab → eine Vercel-Page CORS-Request)

- [ ] **`leadercheck.de`** lädt und zeigt 5-Min-Quiz
- [ ] Quiz durchgespielt → Score sichtbar
- [ ] Email-Eingabe persistiert (in Supabase `incomplete_attempts`)
- [ ] Nach Quiz → Redirect/CTA zu `leaderos.de/login` für Sprint

---

## 3. PR Merge + Deploy (heute)

1. **PR auf** `https://github.com/aiporator/SHIPOS/compare/mvpcode...claude/wlad-images`
2. Base ist **`mvpcode`** (sicherstellen oben links)
3. ☑ "Merge without waiting for requirements" (Bypass — siehe `docs/VERCEL_PREVIEW_ISSUE.md`)
4. **Squash and merge** → Commit-Message kurz lassen
5. Branch löschen wenn GitHub fragt → ja
6. Vercel Production-Deploy läuft (~90 Sek)
7. Verifiziere: `https://leader-os.de/qr/leadercheck.png` lädt → live

---

## 4. Stripe Cutover auf Live-Mode (kritisch für Dienstag)

### Aktuelle Live-Code-Lage

| Element | Wo | Status |
|---|---|---|
| Stripe-SDK | `backend/lib/stripe_checkout.py` | ✓ Native SDK + Emergent-Fallback-Shim |
| Server-side Pakete | `backend/routes/payments.py` `PACKAGES` dict | ✓ Definiert, **aber Preis-Drift! siehe unten** |
| Webhook-Endpoint | `POST /api/webhook/stripe` mit Signatur-Validierung | ✓ Code OK |
| Env-Vars | `STRIPE_API_KEY=sk_test_emergent` | ❌ Noch im Test-Mode |

### Preis-Drift — fertig synchronisiert ✓

**Backend war auf 4 447 €, Landing zeigt 4 797 €.** Backend nachgezogen
auf den kommunizierten Landing-Preis. Geändert:

- `backend/routes/payments.py` PACKAGES `leadership_os_plus` → 4 797 €
- `backend/services_tier.py` `accelerator.price_eur` → 4 797 €
- `backend/tests/test_iteration74_pricing.py` Assertion → 4 797 €
- `frontend/src/components/coaching/TierPricingGrid.js` price → 4 797

Alle Stellen jetzt deckungsgleich. Stripe-Live-Produkt unter Dashboard
muss auch 4 797 € sein (nicht 4 447).

| Tier | Landing | Backend | Stripe Live (todo) |
|---|---|---|---|
| Sprint | 997 € | 997 € ✓ | **anlegen: prod_sprint_997** |
| Plus-Plus | 4 797 € | 4 797 € ✓ | **anlegen: prod_plus_4797** |
| Plus-Plus 3× Rate | 1 599 € × 3 | 99 € × 12 (alt) + 550 € × 2 (alt) | **Raten-Plan aktualisieren** |

### Stripe Dashboard — Manual Setup (15 Min am Dienstag morgen)

In https://dashboard.stripe.com (Live-Mode oben rechts umschalten):

1. **Products → New Product** anlegen für jeden Pricing-Tier:
   - "Leader-OS Sprint" → Price: 997 € one-time
   - "Leader-OS Plus-Plus" → Price: 4 797 € one-time
   - "Leader-OS Plus-Plus · 3× Rate" → Price: 1 599 € (recurring? oder 3
     one-time-Sessions per Pricing-Manager)
2. Product-IDs notieren (`prod_...`)
3. **Webhooks → Add endpoint**:
   - URL: `https://leaderos.de/api/webhook/stripe`
   - Events: `checkout.session.completed`, `invoice.paid`,
     `invoice.payment_failed`, `customer.subscription.deleted`
   - Webhook-Secret notieren (`whsec_...`)
4. **Developers → API Keys**: Live-Mode-Secret-Key kopieren (`sk_live_...`)

### Env-Vars setzen — IN EMERGENT (nicht in Vercel)

Stripe läuft auf der App-Seite, also im Emergent-Workspace:

```
STRIPE_API_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Emergent → Backend → Environment Variables → Save → Restart Service.

### Test-Käufe vor Launch (am Dienstag mittag)

- [ ] Live-Karte → 1 × Sprint kaufen → Webhook in Stripe-Dashboard
      sichtbar → User in Supabase `users` Tabelle hat `tier = 'standard'`
- [ ] Refund via Stripe-Dashboard → Webhook fires → User tier zurück
- [ ] Test-Käufe in eigene Excel/Notion-Liste eintragen für Buchhaltung

---

## 5. 100-User-Limit — soft launch

Damit es bei den ersten 100 User-Signups nicht crasht:

- [ ] **Resend-Limit prüfen**: 100/Tag im Free-Tier, sonst Plan upgraden
      (https://resend.com/settings/usage)
- [ ] **Supabase-Limit**: Free-Plan hat 50 000 monthly active users → safe
- [ ] **Stripe-Tax**: Falls aktiviert, B2B-Käufe brauchen Tax-ID-Felder
      im Checkout-Flow → vorher testen
- [ ] **WladBot-Cost-Watch**: Claude-Haiku-API-Limit prüfen
      (`ANTHROPIC_API_KEY`). Bei 100 Usern × 20 Messages × ~2K Tokens
      ≈ 4 M Tokens/Tag → Anthropic-Tier 1 sollte reichen (Tier 2 = $40K-Cap)
- [ ] **Soft-Cap auf Plus-Plus**: Wenn nur 100 User in Class 0001, dann
      Mentoring-Waitlist-Counter "AKTUELL · 4 OFFENE PLÄTZE" konsistent
      kommunizieren

---

## 6. Smoke-Tests am Dienstag morgen (45 Min vor Launch)

In dieser Reihenfolge im echten Browser, nicht curl:

```
□  https://leader-os.de/                  → Landing lädt, alle Bilder
□  https://leader-os.de/qr/leadercheck.png → QR scannbar, geht zu app
□  https://leader-check.de/               → Light-Nike Landing lädt
□  https://leadercheck.de/                → Quiz-App startet
   → Quiz durchlaufen → Score sichtbar
   → Email-Eingabe → Erfolg
   → Redirect zu leaderos.de/login

□  https://leaderos.de/login              → Login-Form sichtbar
   → Google-Login → Dashboard lädt
   → /chat → WladBot antwortet
   → /api/health → JSON ok

□  Stripe Test-Kauf (1 €)
   → Checkout-Session
   → Card-Eingabe (echte Live-Karte)
   → Webhook in Stripe-Dashboard
   → User tier upgraded
   → Welcome-Email kam an

□  Mobile-Test (iPhone Safari + Android Chrome)
   → leader-os.de scrollbar, keine horizontalen Overflows
   → Video oben spielt autoplay (muted)
   → "Diagnose starten" Button tappt sauber zu leadercheck.de
```

---

## 7. Wenn was crasht — Rollback in < 5 Min

| Symptom | Was tun |
|---|---|
| `leader-os.de` zeigt Weiß-Screen | Vercel → Deployments → letzten READY-Deploy → "Promote to Production" |
| `leaderos.de` Login bricht | Emergent → Logs prüfen, ggf. zu letztem Pod-State zurückrollen |
| Stripe-Checkout 500 | Webhook-Secret fehlt oder falsch → Env-Var nochmal setzen |
| WladBot 401 | Anthropic-API-Key verbraucht oder rate-limited → Top-Up |
| `leadercheck.de` 403 | Emergent-Custom-Domain noch nicht verifiziert → DNS-Check |

---

## 8. Was du jetzt sofort machen kannst (10 Min)

- [ ] PR `claude/wlad-images` mergen (Bypass) → live deployen
- [ ] Im Stripe-Dashboard schon mal Live-Mode-Products anlegen, **Plus-Plus
      auf 4 797 € setzen** (matched Landing)
- [ ] Branch-Cleanup-Doku an Dev geben:
      `docs/DEV_TASKS_BRANCHES.md`

Den Backend-Preis (4 447 → 4 797) fixe ich gerade im nächsten Push.
