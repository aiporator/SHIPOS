# 🚀 LEADERSHIP OS — SHIP-CHECKLIST (Iter 74)

> Snapshot: `2026-02-07` · Status: **READY TO SHIP** ✅

---

## 1️⃣ Pricing Structure (NEU)

| Tier | Preis | Dauer | Highlights |
|------|-------|-------|------------|
| **Free** | €0 | Lifetime | Limited Sims, 14 Tage Challenge |
| **Leadership OS** | **€997 / Jahr** | 365 Tage | 12 Videokurse Drip · KI-Coach 24/7 · Audio-Mode · 30-Tage Money-Back |
| **Leadership OS** · 2× Rate | 2× 550€ = **1.100€** | 365 Tage | +103€ Aufschlag |
| **Leadership OS** · 12× Rate | 12× 99€ = **1.188€** | 365 Tage | +191€ Aufschlag |
| **Leadership OS PLUS** | **€4.447 / Jahr** | 365 Tage | Alles aus OS + 12× 1:1 Coaching mit Argumentorik-Coaches (Wert 3.588€) |
| **Leadership OS Enterprise** | Auf Anfrage | 365 Tage | B2B · Volume-Discount 10–50% (5/10/20/50/100/200 MA Schwellen) |

---

## 2️⃣ Stripe Setup

**Aktueller Status:** Test-Mode (`STRIPE_API_KEY=sk_test_emergent`) ✅

**Vor Live-Schaltung erforderlich:**
1. In Stripe Dashboard 4 Products + Prices anlegen:
   - `leadership_os` → 997€ EUR one-time
   - `leadership_os_2x` → 550€ EUR (Rate 1, Folge-Raten via Cron)
   - `leadership_os_12x` → 99€ EUR (Rate 1, Folge-Raten via Cron)
   - `leadership_os_plus` → 4447€ EUR one-time
2. Live-Key in `/app/backend/.env`: `STRIPE_API_KEY=sk_live_…`
3. Webhook-URL in Stripe registrieren: `https://leader-os.de/api/webhook/stripe`
4. Webhook-Signature speichern (für künftige Härtung)
5. Backend reload: `sudo supervisorctl restart backend`

**Cron-Jobs (täglich extern triggern):**
- `POST /api/cron/installments-due` → mailt fällige Folge-Raten an OS-Raten-Käufer
- `POST /api/cron/monthly-scorecard` → mailt monatlichen Leadership-Report an PLUS-User

---

## 3️⃣ Environment Variables (alle gesetzt ✅)

### Backend `/app/backend/.env`
```
MONGO_URL=***                        # Production MongoDB
DB_NAME=***                          # Database name
EMERGENT_LLM_KEY=***                 # GPT-5.2 + Whisper + Image Gen (Universal Key)
ELEVENLABS_API_KEY=***               # Voice cloning für Audio-Mode + Challengers
STRIPE_API_KEY=***                   # ⚠️ TEST-MODE — vor Launch auf Live umstellen
RESEND_API_KEY=***                   # Email Service
SENDER_EMAIL=reminders@leader-os.de  # Verified domain
SUPABASE_URL=***
SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_KEY=***
```

### Optional zu ergänzen
```
ENTERPRISE_LEAD_EMAIL=sales@leader-os.de   # Lead-Notifications (fällt sonst auf SENDER_EMAIL)
```

### Frontend `/app/frontend/.env`
```
REACT_APP_BACKEND_URL=https://leader-os.de
```

---

## 4️⃣ Integration Health

| Service | Status | Verwendung |
|---------|--------|-----------|
| **MongoDB** | ✅ RUNNING | Users, Sessions, Tier, Payments, Chat, Voice-Cache |
| **Stripe (Test)** | ✅ Working | Checkout, Webhooks, Installment Cron |
| **OpenAI GPT-5.2** | ✅ Working | WladBot Chat (Emergent LLM Key) |
| **OpenAI Whisper** | ✅ Working | Voice-Mode + Video-Mission Transkription |
| **ElevenLabs** | ✅ Working | Wlad Voice (Audio-Mode) + 8 Challenger Voices |
| **Resend Email** | ✅ Working | Welcome, Installment, Scorecard, Enterprise-Lead |
| **Supabase** | ✅ Working | WladHub bi-direktionaler Sync (`leadership_insights`) |
| **Calendly** | ✅ Embed | Coach-Booking auf `/coaching` |

---

## 5️⃣ Key API Endpoints

### Public
- `GET /api/payments/packages` — Liste aller buchbaren Pakete
- `GET /api/payments/tiers` — Komplette Feature-Matrix
- `POST /api/payments/enterprise/quote` — Live-Preisrechner (seats → total)
- `POST /api/payments/enterprise/lead` — Lead-Form mit Email-Notification

### Authenticated
- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/refresh` (HttpOnly-Cookies)
- `GET /api/user/tier` — Aktueller Tier des Users mit Features + Installment-Info
- `POST /api/payments/checkout` — Stripe-Session für ein Paket erzeugen
- `POST /api/payments/installment/next` — Folge-Rate triggern
- `POST /api/chat` · `POST /api/voice/conversation` (NEU Audio-Mode)
- `POST /api/video/upload` (Mission-Aufnahme + Whisper + GPT-Analyse)

### Admin
- `POST /api/cron/installments-due` (täglich)
- `POST /api/cron/monthly-scorecard` (monatlich, 1.)
- `GET /api/admin/auth-health` (Auth-Monitoring-Widget)

---

## 6️⃣ DB Collections (production)

| Collection | Schlüssel-Felder | TTL/Index |
|-----------|------------------|-----------|
| `users` | `user_id`, `email` (case-insensitive unique), `tier`, `xp` | Index on email + xp |
| `user_sessions` | `session_token`, `expires_at` | TTL 7 Tage |
| `payment_transactions` | `session_id`, `package_id`, `payment_status` | – |
| `installment_plans` | `user_id`, `plan_id`, `installments_paid`, `next_due_date` | – |
| `enterprise_leads` | `lead_id`, `company`, `seats`, `quote` | – |
| `chat_messages` · `chat_sessions` | `session_id`, `mode` | – |
| `voice_cache` | `cache_key` (hash), `audio_b64` | – |
| `video_drip_schedule` | `user_id`, `tier`, `total_courses` | NEU Iter 74 |

---

## 7️⃣ Frontend Routes

```
/login · /onboarding · /dashboard · /chat · /tools · /simulations
/missions · /challengers · /tasks · /playbooks · /events · /my-path
/community · /admin · /coaching (NEU 3-Tier) · /downloads (NEU PDF-Center)
/payment-success · /referral · /profile · /enterprise · /30-tage-challenge
```

---

## 8️⃣ Known Gotchas

- **Audio-Mode** braucht echtes Mikrofon — Headless-Tests können nur UI-Rendering verifizieren.
- **PDF-Generation** läuft browser-side (jsPDF + html2canvas) — bei großen Reports kann es 2–4 Sekunden dauern. Fallback auf HTML-Download bei Fehler ist eingebaut.
- **Stripe-Webhook** ist optional — Aktivierung erfolgt automatisch beim Polling von `/api/payments/checkout/status/{session_id}`. Für robustere Production sollte echter Webhook in Stripe registriert werden.
- **SmartPopups** sind seit Iter 74 auf `/coaching`, `/payment-success`, `/downloads`, `/onboarding` deaktiviert (kein Conversion-Block).
- **Legacy Tiers**: `starter` ist deprecated. Alte User mit `tier="starter"` werden via `_normalize_tier_name()` auf `free` gemappt.

---

## 9️⃣ Files of Reference (Iter 74)

### Backend
- `/app/backend/services_tier.py` (TIER_CONFIG, calc_enterprise_quote, activate_tier mit installment_plan_id)
- `/app/backend/routes/payments.py` (PACKAGES + LEGACY_PACKAGES, /enterprise/quote, /enterprise/lead, EnterpriseLead Model mit Email-Validation)
- `/app/backend/routes/voice_tts.py` (Audio-Mode Endpoint)

### Frontend
- `/app/frontend/src/components/coaching/TierPricingGrid.js` (3 Karten)
- `/app/frontend/src/components/coaching/LeadershipOSInstallmentModal.js` (2× und 12× Pläne)
- `/app/frontend/src/components/coaching/EnterpriseQuoteModal.js` (Live-Calculator + Lead-Form)
- `/app/frontend/src/pages/DownloadsPage.js` (4 PDF-Resources)
- `/app/frontend/src/lib/reportGenerator.js` (jsPDF + html2canvas)
- `/app/frontend/src/components/shared/SmartPopups.js` (Path-Blocking)
- `/app/frontend/src/components/layout/Sidebar.js` (neuer Downloads-Link)
- `/app/frontend/src/App.js` (`/downloads` Route)

---

## 🏁 Pre-Launch Checklist

- [ ] Stripe-Account auf Live umstellen (Live-Key + 4 Products + Webhook)
- [ ] `ENTERPRISE_LEAD_EMAIL` in Backend `.env` setzen (Sales-Inbox)
- [ ] Externer Cron-Job für `/api/cron/installments-due` (täglich 09:00)
- [ ] Externer Cron-Job für `/api/cron/monthly-scorecard` (1. des Monats)
- [ ] DNS auf `leader-os.de` verifizieren (bereits aktiv)
- [ ] Test-User-Daten vor Launch wegräumen (`db.users.deleteMany({email: /@wladbot.test$/})`)
- [ ] Audio-Mode auf Mobile (Chrome iOS / Android) verifizieren
- [ ] Stripe-Webhook-Empfang einmal mit echtem Test-Payment durchspielen
- [ ] Optional: Sentry/PostHog für Error-Tracking + Conversion-Funnel

**Du kannst die App jetzt produktiv ausspielen.** 🚀
