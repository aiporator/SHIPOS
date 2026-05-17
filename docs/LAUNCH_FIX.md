# Launch-day fix sequence

State on 2026-05-17: `www.leader-os.de` and `www.leader-check.de` were
returning 404 because the Vercel project's Production Deployment was built
from a docs-only Claude branch (`claude/install-supabase-cli-Z8CF9`) with no
frontend code. Production must serve from `mvpcode`.

This doc is the explicit click sequence to recover, plus the GitHub
branch-hygiene cleanup. Do these in order.

---

## 1. Fix the live 404 (Vercel UI · 60 seconds)

1. Open Vercel → project **`shipos-vuml`** (or whatever it's named — the one
   with `www.leader-os.de` + `www.leader-check.de` attached).
2. **Settings → Git → Production Branch** → set to **`mvpcode`**. Save.
3. **Deployments** tab → filter `Branch: mvpcode` → find the latest
   successful deployment → click the `…` menu → **Promote to Production**.
4. Confirm. Both domains should serve the React app within ~30 seconds.

If no successful `mvpcode` deployment exists yet, push any commit to
`mvpcode` (e.g. merge this branch) and wait for the auto-deploy.

---

## 2. Set the default branch on GitHub (GitHub UI · 30 seconds)

The repo's default branch is currently `claude/install-supabase-cli-Z8CF9`,
a stale Claude branch. Move it to `mvpcode`.

1. GitHub → `aiporator/shipos` → **Settings → Branches**.
2. Under **Default branch**, click the swap icon.
3. Select **`mvpcode`** → Update → confirm.

After this, `git clone` defaults to `mvpcode`, PRs target `mvpcode`, and
Vercel's webhook respects the production branch you set in step 1.

---

## 3. Branch hygiene — delete dead branches (GitHub UI)

Keep:

- `mvpcode` — production source of truth
- `backup/mvpcode-pre-emergent-2026-05-17` — pre-Emergent snapshot, archive
- `claude/godmode-launch-prep` — this branch (until merged)
- `dependabot/*` — auto-maintained by Dependabot

Delete (all are stale Claude branches with no value once `mvpcode` is default):

- `claude/install-supabase-cli-Z8CF9`
- `claude/integrate-sentry-mcp-BV4Ev`
- `claude/setup-posthog-eu-Oy6Ly` (the docs-only-universe branch; its
  useful files have been merged into `mvpcode` by this PR)
- `claude/add-supabase-mcp-server-wVHPR`
- `claude/check-status-indicators-MlDyM`
- `claude/cleanup-ci-workflow-QiBAS`
- `claude/fix-xss-report-generator-9vIjG`
- `claude/framer-mcp-relay-Ot1Oh`
- `claude/mcp-server-integration-WWmJL`
- `claude/rename-default-branch-KQrTc`
- `claude/security-hardening-tonight` (re-extract any unmerged work first)

GitHub UI: **Branches → All branches → trash icon** next to each.

Before deleting `claude/security-hardening-tonight`, diff it against
`mvpcode`:

```bash
git diff origin/mvpcode...origin/claude/security-hardening-tonight -- backend frontend
```

If it has unmerged Sentry / CSP / Dependabot work, cherry-pick into
`mvpcode` first.

---

## 4. Verify production after the fix

After the Vercel promote completes:

```
# www subdomains should now serve the React app, not 404
curl -sI https://www.leader-os.de | head -5
curl -sI https://www.leader-check.de | head -5
```

In a browser:

- `https://www.leader-os.de` loads the login page
- `https://www.leader-check.de` loads the funnel landing
- DevTools → Network → PostHog calls hit `eu.i.posthog.com`
- After login: `posthog.identify` fires with `email_lower`

---

## 5. Sentry — activate when ready

`@sentry/react` is installed and init code is in place but **dormant** until
`REACT_APP_SENTRY_DSN` is set. To turn it on:

1. Create a project in Sentry EU (`sentry.io`, region `de`).
2. Copy the DSN → Vercel env vars on both project scopes:
   - `REACT_APP_SENTRY_DSN=https://...@o....ingest.de.sentry.io/...`
   - `REACT_APP_SENTRY_ENV=production`
3. Redeploy. First error event will appear in Sentry within seconds.
