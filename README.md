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
frontend/       Create React App — builds for BOTH surfaces
backend/        FastAPI — auth, payments, chat, RAG, email funnel, cron
supabase/       Edge functions + SQL migrations (deployed via Supabase CLI)
docs/
├── gtm/        Go-to-market: canon, content, funnels, ads, SEO, channels
├── app/        Architecture: system, schema, identity, RAG, dashboards
├── ops/        Run the app: runbooks, deploy, cron, alerts, access
├── sql/        Loose SQL helpers (reference, not migrations)
├── archive/    Historical one-offs (launch days, Emergent migration)
└── CHANGELOG.md  Schema migration history (stable path — PR template)
scripts/        Sitemap generation etc.
deploy/         Backend Dockerfile + fly.toml
tests/          Test scripts
.github/        CI + cron workflows, issue/PR templates
.claude/        Claude Code skills
vercel.json     CRA build → frontend/build, /api/* rewrite
```

**Start here:** [`docs/README.md`](./docs/README.md) — the index over
all of it, split by GTM vs. app work.

**Supabase project ref:** `srujvjjncrszhaaxepxf` (region `eu-north-1`).
The MCP server is wired in `.mcp.json`.

## Production branch

**`mvpcode`** is production. Both Vercel projects auto-deploy from it
on every push.

## Launch / deploy

- **First-time Vercel setup** (or rebuilding from scratch):
  see [`docs/archive/LAUNCH_TOMORROW.md`](./docs/archive/LAUNCH_TOMORROW.md)
- **Required env vars per Vercel project:** none.
  All env vars in [`frontend/.env.example`](./frontend/.env.example) are
  optional and only activate observability (PostHog / Sentry) — the
  app builds and runs without them.

## Cross-platform identity

Both surfaces write to the same Postgres tables. The dedup key is
`public.users.email_lower` (UNIQUE). PostHog `identify()` / `alias()`
use the same lowercased email so a person stays the same across the
funnel (`leader-check.de`) and the authed app (`leader-os.de`).

See `CLAUDE.md` for the full contract, `docs/app/SCHEMA.md` for the
database shape, and `docs/ops/INTEGRATIONS.md` for the frontend wiring.

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

| Doc                                                      | What it covers                                |
| -------------------------------------------------------- | --------------------------------------------- |
| [`docs/README.md`](./docs/README.md)                     | **Master index** — GTM · App · Ops · Archive  |
| [`CLAUDE.md`](./CLAUDE.md)                               | Briefing for Claude Code sessions             |
| [`ONBOARDING.md`](./ONBOARDING.md)                       | Full-system ramp for new people               |
| [`docs/gtm/WLAD_CANON.md`](./docs/gtm/WLAD_CANON.md)     | Verified facts canon — every claim checks here |
| [`docs/gtm/WEBINAR_FUNNEL.md`](./docs/gtm/WEBINAR_FUNNEL.md) | Ascension funnel map + honesty rules      |
| [`docs/app/SCHEMA.md`](./docs/app/SCHEMA.md)             | Postgres tables, triggers, RPCs               |
| [`docs/app/DASHBOARD.md`](./docs/app/DASHBOARD.md)       | Supabase Studio dashboard views               |
| [`docs/ops/RUNBOOK.md`](./docs/ops/RUNBOOK.md)           | Deploy, secrets, common ops                   |
| [`docs/ops/INTEGRATIONS.md`](./docs/ops/INTEGRATIONS.md) | PostHog EU + Sentry + Supabase wiring         |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)               | Schema migration history                      |
