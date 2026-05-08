# Runbook — Leader-OS

Project ref: `srujvjjncrszhaaxepxf` · Region: `eu-north-1`

## First 1000 users — readiness checklist

| Item                                                         | Status |
| ------------------------------------------------------------ | ------ |
| `users.email_lower` UNIQUE — cross-platform dedup             | ✅ already in place |
| `meta_tags` auto-maintained from sessions/auth signups        | ✅ migration `cross_platform_unification_and_scale_prep` |
| Composite indexes on hot dashboard query paths                | ✅ migration `cross_platform_unification_and_scale_prep` |
| Dashboard views with `security_invoker = true`                | ✅ migrations `leader_os_dashboard_views*` and `cross_platform_views` |
| Trigger functions revoked from `anon` / `authenticated`       | ✅ migration `harden_trigger_function_grants` |
| `upsert_incomplete_attempt` revoked from `authenticated`      | ✅ — anon-only as intended |
| Edge functions deployed (`ingest-leader-check`, `ingest-leader-os`, `ai-strategist`, `wladbot-chat`) | ⚠️ pending — see below |
| Vault secret `service_role_key` set (for `trigger_strategist`) | ⚠️ verify in Studio → Settings → Vault |
| `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY` set as edge fn secrets | ⚠️ pending |

## Edge function deploy

Deploys must run on a machine with `supabase login` complete (interactive,
needs a browser) and the source bundle present. From the project root:

```bash
supabase login                      # one-time, opens browser
supabase link --project-ref srujvjjncrszhaaxepxf
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set VOYAGE_API_KEY=pa-...

# Public ingest endpoints (no JWT — guarded by edge fn auth)
supabase functions deploy ingest-leader-check --no-verify-jwt
supabase functions deploy ingest-leader-os    --no-verify-jwt
# Authenticated endpoints (JWT verified)
supabase functions deploy ai-strategist
supabase functions deploy wladbot-chat
```

The edge function source lives in `supabase/functions/<name>/`. The bundle was
provided as `ship-os-FINAL.zip`; copy `edge_functions/_shared` and each
`edge_functions/<name>` into `supabase/functions/` before deploying.

## Common ops

### Inspect users and their platform journey

```sql
select platform_segment, count(*)
from v_user_360
group by 1;
```

### Manually grant admin

```sql
select grant_admin('user@example.com');
```

### Force a fresh strategist run

```sql
select trigger_strategist(7);   -- 7-day plays
select trigger_strategist(30);  -- 30-day plays
```

Returns a `pg_net` request ID; check delivery with `select * from net._http_response order by id desc limit 5`.

### Dashboard JSON for the app frontend

```sql
select dashboard_summary(7);
```

### Backfill `meta_tags` after a manual data import

The `users_seed_meta_tags` BEFORE INSERT trigger handles this automatically for
new rows. For bulk updates of existing rows:

```sql
select record_platform_touch(id, source_platform)
from users where source_platform is not null;
```

### Find duplicate-email risk

Should always return zero rows (UNIQUE on `email_lower`):

```sql
select email_lower, count(*) from users group by 1 having count(*) > 1;
```

## Security advisor — known noise

```bash
# In a Claude Code session with Supabase MCP:
get_advisors(type='security')
```

One **WARN** is intentional and documented:

- `upsert_incomplete_attempt` — callable by `anon`. The leader-check landing
  page calls this from anonymous browsers to save funnel progress. Keeping it
  anon-callable is required; we already revoked the `authenticated` grant.

Anything else flagged should be investigated. After every DDL change, re-run
`get_advisors`.

## Performance advisor

```bash
get_advisors(type='performance')
```

Expected to be quiet at < 1k rows. Re-check at 100, 500, 1000 users; common
flags would be missing indexes on FKs (we already added composites for the
hot paths) or unused indexes after schema churn.

## Rollback

Migrations are recorded by name. To undo a specific migration, write a new
migration that reverses it:

```bash
# Don't drop a migration entry — write a new one that reverses its effects.
apply_migration(name='revert_<original_name>', query='...')
```

Never `drop ... cascade` views or tables with active app traffic. Use
`alter view ... rename to v_dashboard_xxx_deprecated` and point traffic away
first.
