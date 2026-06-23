# Friday-Launch · Auth-Fix · Magic-Link + Google OAuth

Both auth paths (magic-link email + Google OAuth) are fully wired in
the code · the recurring failures are **configuration on the Emergent
backend**, not bugs. This doc is the minimum diagnostic + fix path.

The two app-tier hosts that need auth:

| Host             | Surface                              |
| ---------------- | ------------------------------------ |
| `leaderos.de`    | Main app (signup · login · magic)    |
| `leadercheck.de` | Diagnose app (anonymous → upsell)    |

The Vercel hyphen hosts (`leader-os.de` · `leader-check.de`) are
**marketing only** · they have no `/api/auth/*` surface.

---

## 1 · Smoke-test from your local machine (90 sec)

Run these three curls. They give you a clear yes/no for every
configuration knob involved.

```bash
# 1a · is the backend reachable on leaderos.de?
curl -sS https://leaderos.de/api/auth/providers | jq

# Expected response:
# {
#   "providers": {
#     "google": true,           ← MUST be true
#     "apple": false,
#     "microsoft": false,
#     "magic_link": true
#   },
#   "google_client_id": "482961656741-…apps.googleusercontent.com",
#                                                ↑ NEW Leader-OS Production ID
#   "apple_service_id": "",
#   "microsoft_client_id": "",
#   "microsoft_tenant": "common"
# }
```

If `google: false` → step 3 (env var missing on Emergent).
If `google_client_id` is the old `448733563313-…` → step 3 (env var stale).

```bash
# 1b · does the magic-link request endpoint accept input?
curl -sS -X POST https://leaderos.de/api/auth/magic-link/request \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-real-test-account@example.com"}' | jq

# Expected: 200 with the generic "Falls die E-Mail existiert…" message.
# (Always 200 by design · prevents email enumeration.)
```

Then **check your inbox**. If no mail arrives within 60 s → step 2
(Resend / SENDER_EMAIL misconfigured) or step 4 (user doesn't exist
in the DB).

```bash
# 1c · does the OAuth callback verify a token? (force a deliberate fail)
curl -sS -X POST https://leaderos.de/api/auth/google/callback \
  -H 'Content-Type: application/json' \
  -d '{"credential":"obviously-not-a-real-token"}' | jq

# Expected: 401 with "Google sign-in failed: …" — proves the route
# is mounted and the verifier is running. If 500 → GOOGLE_CLIENT_ID
# missing on the backend.
```

---

## 2 · Magic-link not arriving · checklist

Order matters · stop at the first hit.

1. **`RESEND_API_KEY` set on Emergent backend?**
   Without it, `services_email.is_enabled()` returns `False` and
   `services_magic_link.send_magic_link_email` logs
   `RESEND_API_KEY not set — skipping email to …` and returns
   `False`. The request endpoint still returns 200 (by design) so
   the only signal is the log.
   → fix in **Emergent → Project → Settings → Env Vars**.

2. **`SENDER_EMAIL` set + the domain verified in Resend?**
   Default fallback is `onboarding@resend.dev` which works but lands
   in spam. Target value: `wlad@leaderos.de`. The domain must be
   verified in Resend (DKIM + SPF + Return-Path · all three must be
   green in the Resend dashboard) or Resend silently 422s and we log
   the body. If you didn't verify the domain, set
   `SENDER_EMAIL=onboarding@resend.dev` to unblock the launch and
   migrate the domain after Friday.

3. **`FRONTEND_BASE_URL` set per-project?**
   - leaderos backend → `https://leaderos.de`
   - leadercheck backend → `https://leadercheck.de`

   Without it, `services_magic_link._frontend_base()` falls back to
   `https://leaderos.de`, which is fine for the leaderos project but
   wrong for the leadercheck project. The magic-link URL takes the
   shape `{FRONTEND_BASE_URL}/auth/magic?token=…` · if it lands on a
   marketing landing (Vercel hyphen-host), the `/auth/magic` route
   does not exist and the user sees a 404.

4. **Does the user actually exist?**
   By design `create_token()` returns `None` for unknown emails (no
   email enumeration). Test with an account you've signed up first
   via the signup flow. Otherwise the API returns 200 but no email
   was queued.

5. **TTL collision?**
   The magic-link table has a TTL index. If indexes failed to create
   at startup (look for `magic_links index creation failed` in logs)
   nothing breaks at request-time but cleanup never happens. Not
   blocking · safe to ignore for Friday.

---

## 3 · Google OAuth not working · checklist

1. **`GOOGLE_CLIENT_ID` on the Emergent backend matches the active
   Google Cloud OAuth client.**
   The frontend renders the Google button only if
   `/api/auth/providers` reports `google: true`, and verification
   happens against the same env var (`backend/services_oauth.py:31`).
   Any mismatch between the env var on the backend and the OAuth
   client in Google Cloud Console = silent 401 on `/google/callback`.

   The new "Leader-OS Production" client is `482961656741-…`.
   The old client is `448733563313-…`. If the smoke-test in step 1a
   shows the old ID, redeploy the Emergent project with the new env
   value (Emergent does NOT hot-reload env changes · you must
   trigger a deploy).

2. **The OAuth client's Authorized JavaScript origins include
   leaderos.de.**
   - https://leaderos.de
   - https://www.leaderos.de
   - https://leadercheck.de
   - https://www.leadercheck.de
   - https://leader-os.de
   - https://leader-check.de
   - http://localhost:3000

   If `leaderos.de` is missing, Google blocks `accounts.google.com`
   from issuing the credential on that origin · the One-Tap popup
   either never appears or instantly closes. Symptom: no XHR to
   `/api/auth/google/callback` in the network tab.

3. **Authorized redirect URIs · leave empty.**
   We use the ID-token flow (One-Tap · popup fallback), not the
   classic redirect flow. Any value here is ignored but harmless.

4. **Client secret is NOT needed.**
   Do not set `GOOGLE_CLIENT_SECRET` on Emergent · we verify the ID
   token's signature against Google's public JWKS
   (`backend/services_oauth.py:34-69`). Setting the secret has no
   effect.

5. **Hard-refresh the browser.**
   Browsers cache the GIS bundle aggressively. After any change,
   open the login page in a fresh Incognito window to verify · stale
   sessionStorage from a previous client-id attempt is a known
   gotcha.

---

## 4 · Emergent env-var matrix (final state for Friday)

Set these on **each** Emergent project (leaderos + leadercheck both
run the same backend image).

```
# Auth · same on both projects
JWT_SECRET=<existing 64+ char value · don't rotate during launch week>
GOOGLE_CLIENT_ID=482961656741-…apps.googleusercontent.com

# Email · same on both projects
RESEND_API_KEY=re_…
SENDER_EMAIL=wlad@leaderos.de        # if domain verified
# SENDER_EMAIL=onboarding@resend.dev # fallback if not

# Per-project · the only env var that differs
FRONTEND_BASE_URL=https://leaderos.de       # ← leaderos project
# FRONTEND_BASE_URL=https://leadercheck.de  # ← leadercheck project
```

After saving env vars · **redeploy** (Emergent doesn't hot-reload
process env).

---

## 5 · One-glance sanity check after redeploy

```bash
# Should return: providers.google = true + the NEW client_id
curl -sS https://leaderos.de/api/auth/providers | jq '.providers.google, .google_client_id'

# Should return: providers.google = true + the NEW client_id
curl -sS https://leadercheck.de/api/auth/providers | jq '.providers.google, .google_client_id'
```

If both print `true` and the new `482961656741-…` ID, the auth
stack is configured · the rest is just verifying in the browser:

1. Open `https://leaderos.de/login` in an Incognito window.
2. Click "Mit Google fortfahren" → expect One-Tap or popup → success.
3. Click "1-Klick-Link senden" with a real account → expect mail
   within 30 s → click link → expect redirect to `/dashboard`.

If both work, Friday is green.
