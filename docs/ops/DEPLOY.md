# 🚀 LeaderOS · Deploy Manifest

> Iter 92.13 · Stand 26.02.26 · Ziel: Stripe LIVE auf `leader-os.de`

## TL;DR — 5 Schritte zum Go-Live

| # | Schritt | Zeit | Wer |
|---|---------|------|-----|
| 1 | Stripe Live-Key auf Vercel ENV setzen | 2 min | Mert |
| 2 | Stripe Webhook bei Stripe registrieren | 3 min | Mert |
| 3 | Webhook-Signing-Secret nach Vercel pushen | 1 min | Mert |
| 4 | Vercel Re-Deploy triggern | 30 sec | Mert |
| 5 | Live-Smoke-Test (1€ Charge + Refund) | 5 min | Mert |

**Total: ~12 Minuten.**

---

## Schritt 1 · Stripe Live-Key auf Vercel

1. Öffne https://dashboard.stripe.com/apikeys
2. **Mode-Toggle oben rechts auf „Live mode"** (orange Sandbox-Badge muss weg sein)
3. Unter „Standard keys" → **Secret key** → Klick „Reveal live key"
4. Kopiere `sk_live_…`
5. Öffne dein Vercel-Projekt → Settings → Environment Variables
6. Lege an / update:
   ```
   STRIPE_API_KEY = sk_live_…
   ```
   Scope: **Production** (NICHT Preview, sonst leakt's in PR-Previews mit echten Charges)
7. Speichern, NICHT redeployen — wir machen das in Schritt 4 nach dem Webhook-Setup

---

## Schritt 2 · Stripe Webhook registrieren

1. Stripe Dashboard → Developers → **Webhooks** → „Add endpoint"
2. **Endpoint URL:**
   ```
   https://leader-os.de/api/webhook/stripe
   ```
3. **Description:** `LeaderOS Production Webhook`
4. **Events to send** — wähle exakt diese 4:
   - `checkout.session.completed` ← der wichtigste (Tier-Aktivierung)
   - `checkout.session.async_payment_succeeded` ← SEPA / Klarna nachträglich
   - `checkout.session.async_payment_failed` ← Refund-Trigger / Status-Update
   - `payment_intent.payment_failed` ← Failed-Email versenden
5. Klick „Add endpoint"
6. Auf der entstandenen Endpoint-Detail-Seite: **„Signing secret"** → „Reveal" → kopiere `whsec_…`

---

## Schritt 3 · Webhook-Secret auf Vercel

In Vercel Env Variables:
```
STRIPE_WEBHOOK_SECRET = whsec_…
```
Scope: **Production**

---

## Schritt 4 · Re-Deploy

In Vercel → Deployments → letzte Production Deployment → „… (more)" → **Redeploy**
ODER push einen leeren commit:
```bash
git commit --allow-empty -m "chore: switch stripe to live" && git push origin main
```

---

## Schritt 5 · Live-Smoke-Test (gegen Production)

### 5a · Backend health check
```bash
curl https://leader-os.de/api/payments/stripe-mode
```
Erwartete Antwort:
```json
{
  "configured": true,
  "mode": "live",
  "live": true,
  "warning": null,
  "key_prefix": "sk_live_…"
}
```
→ `live: true` = ✅ go.

### 5b · UI-Verification
1. Login als admin (`mertzafermutlu@gmail.com`)
2. Dashboard → der gelbe **STRIPE TEST MODE Banner muss WEG sein**
3. Öffne `/coaching` → klick „Leadership OS holen" → Stripe-Checkout
4. Stripe-Checkout Seite zeigt **keinen** orangen „Test mode" Banner mehr

### 5c · Real Card Test (1€ Charge + Refund)
1. Erstelle in Stripe-Dashboard ein temporäres €1-Coupon für deine eigene Test-Karte
2. ODER nimm das günstigste Paket (`Leadership OS` €997), zahl mit deiner Karte
3. Stripe → Payments → finde die Charge → **„Refund payment"** sofort
4. In Mongo verify:
   ```bash
   # Via Mongo Atlas / Compass
   db.payment_transactions.findOne({ session_id: "cs_live_..." })
   # status sollte "complete" sein, tier sollte aktiviert
   ```
5. Email-Receipt check: Resend → Logs → Confirmation-Email gegangen?

### 5d · Webhook-Health check
Stripe Dashboard → Webhooks → leader-os.de endpoint:
- **Status:** Healthy (grünes Häkchen)
- **Recent deliveries:** alle 200-OK
- Falls 401/403: dein `STRIPE_WEBHOOK_SECRET` matched nicht → Schritt 3 reparieren

---

## Post-Launch · Monitoring (24h)

### Sentry — Backend Error Spike?
- Erwartung: 0 neue `StripeError` events
- Falls payment_intent failed: das ist normal (failed cards), das fängt der `payment_intent.payment_failed` webhook ab

### PostHog — Conversion Events
- `payment_completed` events sollten anfangen zu fließen
- `package_id` distribution: Leadership OS (€997) vs. Ratenkauf vs. PLUS (€4.797)

### Resend — Email Delivery
- `stripe_receipt_email` send rate
- Bounce/Complaint rate < 1%

---

## Rollback Procedure (falls etwas explodiert)

1. Vercel Env Variables → `STRIPE_API_KEY` zurück auf alten Wert (oder löschen)
2. Vercel → Deployments → letzten **funktionierenden** Deploy → „Promote to Production"
3. Stripe Dashboard → Webhooks → den Live-Endpoint pausieren (NICHT löschen, du verlierst die Event-Historie)

---

## Required ENVs Checklist (vollständig)

Vergleiche mit `/app/.env.production.template`. Pflicht für Live-Mode:

### Backend (Vercel "Production" scope)
- [ ] `MONGO_URL` — Atlas connection string (M10+)
- [ ] `DB_NAME` — `leaderos_production`
- [ ] `STRIPE_API_KEY` — `sk_live_…` ← **DAS WICHTIGE**
- [ ] `STRIPE_WEBHOOK_SECRET` — `whsec_…` ← **DAS ZWEITE WICHTIGE**
- [ ] `EMERGENT_LLM_KEY` — Universal Key
- [ ] `VOYAGE_API_KEY` — RAG embeddings
- [ ] `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_KEY`
- [ ] `INBOUND_SYNC_SECRET` / `SUPABASE_OUTBOUND_SECRET` — match Supabase Edge Function
- [ ] `RESEND_API_KEY` / `SENDER_EMAIL`
- [ ] `ELEVENLABS_API_KEY`
- [ ] `JWT_SECRET` — fresh `openssl rand -hex 64`
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- [ ] `SENTRY_DSN` — Backend
- [ ] `POSTHOG_API_KEY` / `POSTHOG_HOST`
- [ ] `CORS_ORIGINS=https://leader-os.de,https://www.leader-os.de` (kein Wildcard!)
- [ ] `CRON_AUTH_SECRET`

### Frontend (Vercel Frontend project envs)
- [ ] `REACT_APP_BACKEND_URL=https://leader-os.de`
- [ ] `REACT_APP_SENTRY_DSN`
- [ ] `REACT_APP_POSTHOG_KEY`
- [ ] `REACT_APP_ONBOARDING_VIMEO_ID=1197728183`

### Auch zu konfigurieren
- [ ] Vimeo Privacy → "Anywhere" für ID `1197728183`
- [ ] Cloudflare Rate-Limit Rule (100 req/min/IP für `/api/*`)
- [ ] DNS: `leader-os.de` → Vercel A/CNAME
- [ ] DNS: `reminders.leader-os.de` Resend-MX/SPF/DKIM (für Email-Deliverability)

---

## Kritische Sicherheits-Reminder

1. **Niemals** `STRIPE_API_KEY` (live) in PR-Previews leaken → Scope strict auf "Production"
2. **Niemals** `JWT_SECRET` zwischen Dev und Production sharen → fresh generate für Prod
3. **CORS_ORIGINS** Wildcard `*` ist in Production ein No-Go (Session Hijacking)
4. **Webhook-Endpoint nur HTTPS** akzeptiert Stripe-Signatur-Verifikation
5. **Test-Karte 4242 4242 4242 4242** funktioniert NICHT in Live-Mode — du brauchst eine echte Karte
6. **Refund-Window:** Stripe lässt Refund nur in den ersten 180 Tagen zu

---

## Support-Kontakte

- **Stripe Support:** Dashboard → Help (chat, 24/7 für active accounts)
- **Vercel Support:** vercel.com/help (Email für Pro/Enterprise)
- **Resend Status:** status.resend.com
- **Supabase Status:** status.supabase.com
