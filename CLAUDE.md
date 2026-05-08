# Leader-OS — Claude Code briefing

This repo is the source of truth for the **Leader-OS** product surface, which
spans two front-ends backed by a single Supabase project:

| Surface          | URL (prod)       | Purpose                                        |
| ---------------- | ---------------- | ---------------------------------------------- |
| **leader-check** | leader-check.de  | Anonymous diagnostic funnel (KI / Rhetoric / EQ assessment) |
| **leader-os**    | leader-os.de     | Authenticated coaching app + ai-strategist + wladbot RAG    |

**Supabase project ref:** `srujvjjncrszhaaxepxf` (region `eu-north-1`, Postgres 17).

The Supabase MCP server is wired in `.mcp.json`, scoped to the project ref above.

---

## How the two platforms share state

Both surfaces write to the same Postgres tables. The cross-platform identity
key is **`public.users.email_lower`** (UNIQUE), generated from `email`.

```
┌────────────────────┐                 ┌────────────────────┐
│  leader-check.de   │                 │   leader-os.de     │
│  (anonymous)       │                 │   (Supabase Auth)  │
└─────────┬──────────┘                 └─────────┬──────────┘
          │ progress saved              auth.users insert
          │ via upsert_                 fires
          │ incomplete_attempt          handle_new_auth_user
          ▼                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              public.users   (email_lower UNIQUE)             │
│   meta_tags text[]  ←  ['leader-check','leader-os','admin']  │
│   source_platform   ←  first touch only                      │
└──────────────────────────────────────────────────────────────┘
          │                                       │
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│ leadership_insights  │              │  sessions            │
│ (KI / Rhetoric / EQ) │              │  (platform-tagged)   │
└──────────────────────┘              └──────────────────────┘
```

Two columns matter for cross-platform reasoning:

- **`source_platform`** — `'leader-check' | 'leader-os' | 'manual'`. **First touch only.**
- **`meta_tags text[]`** — every platform a user has *ever* touched, plus role
  tags (`'admin'`, etc.). Maintained automatically:
  - `users` BEFORE INSERT trigger seeds the source_platform tag.
  - `sessions` AFTER INSERT trigger appends the session's platform tag.
  - `handle_new_auth_user` (auth.users trigger) adds `'leader-os'` on Supabase Auth signup.
  - `link_check_completion(...)` adds `'leader-check'` when a check is finished.
  - `record_platform_touch(user_id, platform)` is the idempotent helper for ad-hoc updates.

For analytics, **always use `meta_tags`** ("ever touched X"), not
`source_platform`, unless you specifically want first-touch attribution.

---

## Where to look

| What you want                          | Where                                                    |
| -------------------------------------- | -------------------------------------------------------- |
| Schema reference                       | `docs/SCHEMA.md`                                         |
| Dashboard views (in Supabase Studio)   | `docs/DASHBOARD.md`                                      |
| Operational runbook (deploy, secrets)  | `docs/RUNBOOK.md`                                        |
| Postgres best practices skill          | `.claude/skills/supabase-postgres-best-practices/`       |
| Supabase MCP usage skill               | `.claude/skills/supabase/`                               |

---

## Working rules

1. **Schema changes go through `apply_migration`** via the Supabase MCP, not raw SQL.
   Migrations are auto-named and recorded in the project's migration history.
2. **Run `get_advisors` after every DDL change.** One known intentional warning is
   `upsert_incomplete_attempt` being callable by `anon` (the leader-check landing
   needs it). Anything else — investigate.
3. **All views must be `security_invoker = true`** (Postgres default is DEFINER for
   views, which Supabase flags as ERROR).
4. **All trigger functions must `revoke all from public, anon, authenticated`**
   and grant only `service_role`. They run via the trigger machinery, not REST.
5. **Don't bypass `email_lower`.** Every write that creates/links a user must use
   it as the dedup key, or you'll create cross-platform doubles.
