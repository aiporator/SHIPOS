# LeaderOS

> **New here? Read [`ONBOARDING.md`](./ONBOARDING.md) first.** It's the
> single map of the whole system — domains, data stores, local setup,
> deploy flow, and where everything lives. This README is the topology
> deep-dive; the onboarding doc is the ramp.

Single repo, **two production domains, two Vercel projects, one React
app**. Host-based routing inside `frontend/` decides which surface to
render at runtime.

## Topology

```
                  GoDaddy DNS (A → 76.76.21.21)
                              │
                              ▼
                  Vercel routes by Host header
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
  Vercel project: leader-os         Vercel project: leader-check
    Domains:                          Domains:
      leader-os.de                      leader-check.de
      www.leader-os.de                  www.leader-check.de
    Production branch: mvpcode        Production branch: mvpcode
    Root: ./   Framework: CRA         Root: ./   Framework: CRA
            └─────────────────┬─────────────────┘
                              ▼
                  Both build `frontend/` from same repo
                  Same code, different runtime host →
                  isLeaderCheckHost() switches the routes
                              │
                              ▼
                  /api/* → Emergent backend (vercel.json rewrite)
```

| Surface          | URL              | Audience                                         |
| ---------------- | ---------------- | ------------------------------------------------ |
| **leader-os**    | leader-os.de     | Authenticated coaching app + Landing             |
| **leader-check** | leader-check.de  | Anonymous diagnostic funnel (KI / Rhetoric / EQ) |

## Repo layout

```
frontend/    Create React App — builds for BOTH surfaces
backend/     FastAPI — currently hosted on Emergent
docs/        Schema, runbook, launch playbook
.github/     CI + cron workflows
.claude/     Claude Code skills
vercel.json  CRA build → frontend/build, /api/* → emergent rewrite
```

**Supabase project ref:** `srujvjjncrszhaaxepxf` (region `eu-north-1`).
The MCP server is wired in `.mcp.json`.

## Production branch

**`mvpcode`** is production. Both Vercel projects auto-deploy from it
on every push.

## Launch / deploy

- **First-time Vercel setup** (or rebuilding from scratch):
  see [`docs/LAUNCH_TOMORROW.md`](./docs/LAUNCH_TOMORROW.md)
- **Required env vars per Vercel project:** none.
  All env vars in [`frontend/.env.example`](./frontend/.env.example) are
  optional and only activate observability (PostHog / Sentry) — the
  app builds and runs without them.

## Cross-platform identity

Both surfaces write to the same Postgres tables. The dedup key is
`public.users.email_lower` (UNIQUE). PostHog `identify()` / `alias()`
use the same lowercased email so a person stays the same across the
funnel (`leader-check.de`) and the authed app (`leader-os.de`).

See `CLAUDE.md` for the full contract, `docs/SCHEMA.md` for the
database shape, and `docs/INTEGRATIONS.md` for the frontend wiring.

## Quick start (local dev)

```bash
# Backend (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (CRA)
cd frontend
yarn install
yarn start         # http://localhost:3000 → proxies /api/* to :8001
```

Copy `frontend/.env.example` to `frontend/.env.local` for local dev.

## Documentation

| Doc                                              | What it covers                                |
| ------------------------------------------------ | --------------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)                       | Briefing for Claude Code sessions             |
| [`docs/LAUNCH_TOMORROW.md`](./docs/LAUNCH_TOMORROW.md) | Step-by-step Vercel dual-project setup   |
| [`docs/SCHEMA.md`](./docs/SCHEMA.md)             | Postgres tables, triggers, RPCs               |
| [`docs/DASHBOARD.md`](./docs/DASHBOARD.md)       | Supabase Studio dashboard views               |
| [`docs/RUNBOOK.md`](./docs/RUNBOOK.md)           | Deploy, secrets, common ops                   |
| [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md) | PostHog EU + Sentry + Supabase wiring         |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)       | Schema migration history                      |
| [`docs/BRANCH_CLEANUP.md`](./docs/BRANCH_CLEANUP.md) | Branch audit (proposal, not executed)     |
