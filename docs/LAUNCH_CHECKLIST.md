# Launch checklist — Leader-OS

Single tracked list for going live. Database work is done; this file
tracks the remaining human-only steps. Source of truth for *how* each
step works is `docs/RUNBOOK.md` — this file just tracks *status*.

Project ref: `srujvjjncrszhaaxepxf` · Region: `eu-north-1`

## Status legend

- [ ] not started
- [~] in progress
- [x] done

---

## Phase 1 — Backend deploy (you, on your Mac)

These need `supabase login` (interactive, browser) and the
`ship-os-FINAL.zip` source bundle. MCP cannot do these.

- [ ] `supabase login` complete
- [ ] `supabase link --project-ref srujvjjncrszhaaxepxf`
- [ ] Copy `edge_functions/_shared` + each `edge_functions/<name>` into
      `supabase/functions/`
- [ ] Set `ANTHROPIC_API_KEY` via `supabase secrets set`
- [ ] Set `VOYAGE_API_KEY` via `supabase secrets set`
- [ ] Deploy `ingest-leader-check` (`--no-verify-jwt`)
- [ ] Deploy `ingest-leader-os` (`--no-verify-jwt`)
- [ ] Deploy `ai-strategist`
- [ ] Deploy `wladbot-chat`

## Phase 2 — Secrets & Auth (Studio)

- [ ] Vault: store `service_role_key` (required for `trigger_strategist()`)
- [ ] Auth: enable Leaked Password Protection (HaveIBeenPwned)
- [ ] (Optional) pg_cron schedule for `trigger_strategist(7|30)`

## Phase 3 — Front-end (separate repos + Vercel)

- [ ] leader-check.de repo: confirmed deployable
- [ ] leader-os.de repo: confirmed deployable
- [ ] Vercel: `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] Vercel: `NEXT_PUBLIC_SUPABASE_ANON_KEY` set

## Phase 4 — End-to-end smoke (in a browser, not just SQL)

- [ ] Anonymous visitor → leader-check funnel → `upsert_incomplete_attempt`
      writes a row
- [ ] Complete an assessment → `link_check_completion` runs → user appears
      in `v_user_360`
- [ ] Supabase Auth signup on leader-os → `handle_new_auth_user` links by
      `email_lower`, tags `'leader-os'`
- [ ] `trigger_strategist(7)` returns a `pg_net` request ID; delivery
      confirmed in `net._http_response`
- [ ] `wladbot-chat` returns a RAG answer
- [ ] `dashboard_summary(7)` renders in the actual app frontend

## Phase 5 — Pre-launch verification

- [ ] `get_advisors(type='security')` — only the one known WARN
      (`upsert_incomplete_attempt` anon-callable)
- [ ] `get_advisors(type='performance')` — quiet
- [ ] Duplicate-email check returns 0 rows
- [ ] Soft launch to small group; watch `v_dashboard_health`

---

## Notes

- Re-run `get_advisors` after *any* DDL change (CLAUDE.md rule).
- Don't `drop ... cascade` anything with live traffic — see RUNBOOK rollback.
