# Leader-OS — `aiporator/SHIPOS`

Source of truth for the **Leader-OS** product surface. Two front-ends share a
single Supabase project; this repo holds the schema reference, runbook,
dashboard catalog, integration spec, and Claude Code wiring. **No application
code lives here** — frontend code lives in the repo below.

| Surface          | URL              | Purpose                                                  |
| ---------------- | ---------------- | -------------------------------------------------------- |
| **leader-check** | leader-check.de  | Anonymous diagnostic funnel (KI / Rhetoric / EQ)         |
| **leader-os**    | leader-os.de     | Authenticated coaching app + ai-strategist + wladbot RAG |

**Frontend repo:** [`aiporator/vibe-coding-platform`](https://github.com/aiporator/vibe-coding-platform)
— single Next.js app, host-based rewrites route each domain to its own folder.

**Supabase project ref:** `srujvjjncrszhaaxepxf` (region `eu-north-1`, Postgres 17).

## Cross-platform identity

Both surfaces write to the same Postgres tables. The dedup key is
`public.users.email_lower` (UNIQUE).

```
┌────────────────────┐                 ┌────────────────────┐
│  leader-check.de   │                 │   leader-os.de     │
│  (anonymous)       │                 │   (Supabase Auth)  │
└─────────┬──────────┘                 └─────────┬──────────┘
          │ upsert_incomplete_attempt   handle_new_auth_user
          ▼                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              public.users   (email_lower UNIQUE)             │
│   meta_tags text[]  ←  ['leader-check','leader-os','admin']  │
│   source_platform   ←  first touch only                      │
└──────────────────────────────────────────────────────────────┘
```

For analytics, **always use `meta_tags`** (ever-touched) unless you specifically
want first-touch attribution via `source_platform`.

## Documentation

| Doc                          | What it covers                                      |
| ---------------------------- | --------------------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)             | Briefing for Claude Code working in this repo       |
| [`docs/SCHEMA.md`](./docs/SCHEMA.md)     | Table reference                                      |
| [`docs/DASHBOARD.md`](./docs/DASHBOARD.md) | Studio dashboard views                              |
| [`docs/RUNBOOK.md`](./docs/RUNBOOK.md)   | Deploy, secrets, common ops                          |
| [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md) | Frontend wiring spec: Supabase + PostHog EU + Sentry |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | Schema migration history                             |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Working rules for schema changes, advisors, reviews  |
| [`SECURITY.md`](./SECURITY.md)         | Vulnerability reporting                              |

## Working rules (short form — see `CONTRIBUTING.md` for full)

1. Schema changes go through `apply_migration` via the Supabase MCP. No raw SQL.
2. Run `get_advisors` after every DDL. One known WARN is intentional
   (`upsert_incomplete_attempt` callable by `anon`).
3. All views must be `security_invoker = true`.
4. Trigger functions must `revoke all from public, anon, authenticated` and grant
   only `service_role`.
5. Every write that creates/links a user uses `email_lower` as the dedup key.

## Repository scope

This repo deliberately contains **no frontend code, no Edge Function source**,
and no Vercel build target.

- Frontend code: [`aiporator/vibe-coding-platform`](https://github.com/aiporator/vibe-coding-platform).
  Wiring spec for it lives at [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md).
- Edge Functions: deploy from the bundle described in `docs/RUNBOOK.md`.
- Vercel deploys: two projects (`leader-check`, `leader-os`) point at the
  frontend repo above, one domain each.
