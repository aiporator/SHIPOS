# Launch cleanup — current state and what's left

Production went live on 2026-05-17 after PR #13 merged into `mvpcode`.
Vercel deployment `dpl_6mG22ig…` is READY and serving the CRA app on all four
domains: `leader-os.de`, `www.leader-os.de`, `leader-check.de`,
`www.leader-check.de`.

Live security advisor: **0 errors, 3 WARN (none launch-blocking)** — see §6.

This doc tracks the items still open after the launch.

---

## 1. ~~Fix the live 404~~ ✅ DONE

Done by PR #13. Vercel Production Branch is `mvpcode`, deployment promoted
automatically on merge.

---

## 2. Set the default branch on GitHub (UI · 30 sec) — OPEN

The repo's default branch is still `claude/install-supabase-cli-Z8CF9`
(a stale Claude branch). Move it to `mvpcode`.

1. GitHub → `aiporator/shipos` → **Settings → Branches**.
2. Under **Default branch**, click the swap icon.
3. Select **`mvpcode`** → Update → confirm.

After this, `git clone` defaults to `mvpcode` and PRs target `mvpcode` by
default.

---

## 3. Branch hygiene (UI · 2 min) — OPEN

Diff-audited 2026-05-17. Branches sorted by what they actually contain.

### KEEP

- `mvpcode` — production source of truth
- `backup/mvpcode-pre-emergent-2026-05-17` — pre-Emergent snapshot, archive
- `dependabot/*` — auto-maintained
- `claude/godmode-followup` — this PR's branch (delete after merge)

### DELETE — safe (zero content diff vs `mvpcode`)

These 9 branches all live in the "docs-only universe" (separate history
that has been merged into `mvpcode` via PR #13). `git diff` against
`mvpcode` shows **zero file differences**:

- `claude/install-supabase-cli-Z8CF9`
- `claude/integrate-sentry-mcp-BV4Ev`
- `claude/setup-posthog-eu-Oy6Ly`
- `claude/add-supabase-mcp-server-wVHPR`
- `claude/cleanup-ci-workflow-QiBAS`
- `claude/fix-xss-report-generator-9vIjG`
- `claude/framer-mcp-relay-Ot1Oh`
- `claude/mcp-server-integration-WWmJL`
- `claude/rename-default-branch-KQrTc`

GitHub UI: **Branches → All branches → trash icon** next to each.

### RESCUE FIRST — has unmerged work

#### `claude/check-status-indicators-MlDyM` — 17 files, +842/-23 lines

Name is misleading; this branch contains the original launch-readiness work.
Some commits made it into mvpcode via PR #8, but this branch is still ahead
on:

- `scripts/deploy-backend.sh` (the backend sync script — **needed** for
  pushing FastAPI to Emergent)
- `frontend/.env.production` (production env template)
- Updates to `.github/workflows/ci.yml`, `cron.yml`
- Updates to `vercel.json`, `SHIP_CHECKLIST.md`, `docs/GO_LIVE.md`

```bash
git checkout -b rescue/deploy-backend-script origin/claude/check-status-indicators-MlDyM -- scripts/deploy-backend.sh
# inspect, then cherry-pick the rest piece by piece
```

#### `claude/security-hardening-tonight` — 8 files, +141/-6 lines

Contains genuinely useful follow-ups:

- `.github/dependabot.yml` — Dependabot config (not yet in mvpcode)
- `backend/routes/payments.py` — Stripe webhook native signature validation
- `backend/server.py` — Sentry backend init (matches our frontend Sentry)
- `vercel.json` — CSP report-only header

Each is a discrete improvement. Cherry-pick what survives review:

```bash
git log origin/mvpcode..origin/claude/security-hardening-tonight
git show <commit-sha>   # inspect each
```

Two commits:
- `ccc7313` — Stripe webhook signature validation
- `e64b6d9` — Sentry backend init, CSP report-only, Dependabot, cron auto-issue

---

## 4. Smoke-test production (browser · 5 min) — OPEN

From this sandboxed session, outbound HTTP to `*.leader-os.de` is blocked
by network policy (curl returns 403, WebFetch returns 403). The smoke test
has to happen from a real browser:

- [ ] `https://www.leader-os.de` loads the login page (no 404, no CRA "Cannot GET /")
- [ ] `https://www.leader-check.de` loads the funnel landing
- [ ] DevTools → Network → PostHog requests hit `eu.i.posthog.com` (NOT `us.`)
- [ ] After login: `posthog.alias` + `posthog.identify` fire with the
      lowercased email
- [ ] Console: no Sentry init errors (Sentry stays dormant without DSN, which is fine)
- [ ] `/api/health` returns 200 (proves backend proxy works)

If `/api/health` returns anything other than 200, the backend is stale —
run `scripts/deploy-backend.sh` after rescuing it from
`claude/check-status-indicators-MlDyM` (see §3).

---

## 5. Sentry — activate when ready (10 min) — OPEN

`@sentry/react` is installed and init code is in place but **dormant** until
`REACT_APP_SENTRY_DSN` is set. To turn it on:

1. Create a project in Sentry EU (`sentry.io`, region `de`).
2. Copy the DSN → Vercel env vars (production scope):
   - `REACT_APP_SENTRY_DSN=https://...@o....ingest.de.sentry.io/...`
   - `REACT_APP_SENTRY_ENV=production`
3. Redeploy (any commit to `mvpcode` or use Vercel "Redeploy" button).

First error event appears in Sentry within seconds. No code change needed.

Backend Sentry init exists on `claude/security-hardening-tonight` (see §3).

---

## 6. Open security advisor items — REVIEWED

After the `lock_ops_dashboard_views_to_service_role` migration
(2026-05-17 19:58 UTC), advisor errors went from 2 → 0. Three WARN-level
items remain. All have been reviewed:

| # | Item | Verdict |
|---|---|---|
| 1 | `upsert_incomplete_attempt` callable by `anon` | **Keep as-is.** Funnel capture on leader-check.de needs an anonymous write path. |
| 2 | `is_admin()` callable by `authenticated` | **Keep as-is.** Returns boolean only, no privilege-escalation surface. The function checks `auth.uid()` against `users.meta_tags` ANY('admin') — a non-admin caller just gets `false`. SECURITY DEFINER is needed so it can read `users` regardless of RLS. |
| 3 | Leaked password protection disabled | **One-toggle fix.** Supabase Dashboard → Auth → Password Settings → enable HaveIBeenPwned check. |

Migration `20260517195842_lock_ops_dashboard_views_to_service_role.sql` is
checked into `supabase/migrations/` to keep the repo in sync with the live
DB. Future `supabase db pull` / `db push` won't re-grant `anon` on those views.

---

## TL;DR — your remaining clicks

1. GitHub → Settings → Branches → default = `mvpcode`
2. GitHub → Branches → delete the 9 safe-to-delete branches in §3
3. Browser → smoke-test the 6 checks in §4
4. Cherry-pick `scripts/deploy-backend.sh` from `claude/check-status-indicators-MlDyM`
5. (When ready) paste a Sentry DSN into Vercel
6. Supabase Dashboard → enable leaked-password protection
