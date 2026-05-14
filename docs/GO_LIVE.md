# GO-LIVE Runbook — Leadership OS

> Single source of truth for tomorrow's launch.
> Architecture for v1: **Vercel** hosts the React frontend, **Emergent**
> hosts the FastAPI backend at `leader-os.de`, **MongoDB** is the system
> of record. Supabase stays as the WladHub sync sidecar it already is —
> the full Postgres migration is parked in `docs/SUPABASE_MIGRATION.md`.

---

## 0. Status snapshot before T-0

| Check | State | Evidence |
|---|---|---|
| Frontend builds on Vercel | ✅ verified | `dpl_HQd42CLjTY9QrVNwkKcGaN5WcC6U`, 89s, "Compiled successfully", `main.831fabaa.js` 429.3 kB |
| Backend tests pre-ship | ✅ 10/10 | `test_reports/iteration_77.json` |
| Frontend smoke tests | ✅ 35/35 | iter 77 — login, dashboard, chat, coaching, downloads, profile |
| Integrations (Mongo / GPT / ElevenLabs / Resend / Supabase / Calendly) | ✅ working | `SHIP_CHECKLIST.md` §4 |
| Stripe **Live** | ❌ test mode | Cutover step below |
| CI on PR #8 | ✅ all green | Vercel + GH Actions |
| Cron triggers | ✅ automated | `.github/workflows/cron.yml` |

---

## 1. Pre-launch sequence (~30 min the night before)

### 1a. Vercel — Production environment variables

Vercel dashboard → `shipos-vuml` → Settings → Environment Variables.
Scope: **Production** (uncheck Preview/Development).

```
REACT_APP_BACKEND_URL = https://leader-os.de
GENERATE_SOURCEMAP    = false
```

**Do not set** `REACT_APP_SHOW_QUICK_LOGIN`. If it's already there from a
preview-config copy, delete it on Production scope.

### 1b. Vercel — Disable Deployment Protection on Production

Settings → Deployment Protection → **Vercel Authentication: Off** for
Production. (Leave it on for Preview if you want preview URLs gated.)

### 1c. Vercel — Attach the production domain

Settings → Domains → add `leader-os.de` (or your chosen apex/subdomain).
DNS already points to the current host — switch the A/CNAME record per
Vercel's instructions. Plan a short DNS-propagation window (≤ 15 min in
practice with low TTLs).

> ⚠️ The backend ALSO answers at `leader-os.de` today. If you point the
> apex at Vercel, the backend needs to move to a separate host or
> sub-domain. Two clean options:
>
> 1. **Frontend on apex, backend on `api.leader-os.de`** — update
>    `frontend/vercel.json` rewrite destination + Emergent's domain
>    config. Cleanest.
> 2. **Frontend on `app.leader-os.de`, backend stays on apex** — no
>    backend changes. Marketing site can stay on apex too.
>
> Option 2 is the safer pre-launch move.

### 1d. Stripe — Live cutover

In Stripe Dashboard:
1. Switch to **Live** mode.
2. Create 4 products with these IDs (must match `routes/payments.py`
   PACKAGES dict):
   - `leadership_os` — €997 EUR, one-time
   - `leadership_os_2x` — €550 EUR (first installment; cron handles the
     second)
   - `leadership_os_12x` — €99 EUR (first installment; cron handles 11
     more)
   - `leadership_os_plus` — €4 447 EUR, one-time
3. Register webhook → `https://leader-os.de/api/payments/webhook/stripe`
   (or the new sub-domain if you went with option 1 above).
4. Copy the **live secret key** and **webhook signing secret**.

In Emergent → backend `.env`:
```
STRIPE_API_KEY=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…        # if your StripeCheckout lib uses it
ENTERPRISE_LEAD_EMAIL=sales@leader-os.de
```
Then `sudo supervisorctl restart backend`.

### 1e. (Optional but recommended) Lock down the cron endpoints

```bash
openssl rand -hex 32   # generate
```
- Backend `.env`: `CRON_SHARED_SECRET=<the value>` → restart backend.
- GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
  - Name: `CRON_SHARED_SECRET`, value: same string.

The `.github/workflows/cron.yml` already forwards the header when the
secret is set; if it's unset, behaviour is unchanged.

### 1f. Test-user purge (do **after** Stripe is in Live mode)

```bash
mongosh "$MONGO_URL" --eval "use $DB_NAME; db.users.deleteMany({email: /@wladbot\.test$/}); db.user_sessions.deleteMany({user_id: {\$nin: db.users.distinct('user_id')}});"
```

### 1g. Merge PR #8

```
gh pr merge 8 --squash      # or via the GitHub UI
```
This is what makes Vercel build the production target.

---

## 2. Go-live smoke test (T-0, ~15 min)

Open the production URL (the new domain) and walk through:

1. **Anonymous landing** loads, no console errors, no QuickLogin panel.
2. **Register** a fresh real-email account → arrives on `/dashboard`,
   no `test123` in `localStorage`.
3. **Login** with that account → `/dashboard`. Cookie is `HttpOnly` +
   `Secure` (DevTools → Application → Cookies).
4. **Buy** `leadership_os` with a real card → Stripe success page →
   tier shows `leadership_os` on `/profile`.
5. **Webhook** event lands at `/api/payments/webhook/stripe` (visible
   in Stripe → Developers → Events).
6. **Chat** sends a message → GPT response → no errors.
7. **Audio Mode** opens, mic permission granted, get a voice reply.
8. **Coaching** page shows €997 / €4 447 cards; Calendly opens.
9. **Downloads** page renders 4 PDF buttons; download works.
10. **Mobile** (iPhone or Android, real device): repeat #1, #2, #3, #7.

If any of these fail → revert PR #8 (`gh pr revert <merge sha>`) and
keep the previous Emergent deploy live while you fix.

---

## 3. Manual triggers you may want to test once

```bash
# verify the cron path end-to-end
gh workflow run cron-jobs --field job=installments-due
gh workflow run cron-jobs --field job=monthly-scorecard
# both should 200; check Resend dashboard for any test emails
```

---

## 4. Day-1 monitoring

For 24h after launch, watch:

- **Stripe → Events** for any `payment_intent.failed` or `dispute.*`.
- **Resend → Emails** for bounces.
- **Emergent backend logs** — tail `/var/log/supervisor/backend.err.log`
  for 4xx/5xx spikes.
- **MongoDB → `users`** count over time (sanity check sign-ups).
- **Browser console** on the production URL — no red, no CORS, no 404
  on `/api/*`.

---

## 5. Known gotchas to brief the team on

- **`REACT_APP_SHOW_QUICK_LOGIN`** is a foot-gun: if it ever lands on
  Production env it leaks test credentials publicly. Add it to your
  team's deploy-review checklist.
- **Audio Mode** requires a real microphone — headless monitoring
  can only verify UI, not voice.
- **PDF generation** runs client-side via jspdf + html2canvas; large
  reports can take 2-4 s. HTML fallback is wired.
- **Stripe webhook** is optional for happy-path because the success
  page polls `/api/payments/checkout/status/{session_id}`. The
  webhook is the safety net for closed-browser cases — register it
  before launch.
- **SmartPopups** are off on `/coaching`, `/payment-success`,
  `/downloads`, `/onboarding` (Iter 74).

---

## 6. What's parked for post-launch

See `docs/SUPABASE_MIGRATION.md` for the Mongo → Postgres roadmap.
Bundle-splitting (lazy routes, ~200 kB potential win) and a strict CSP
are also parked — neither is blocking launch.
