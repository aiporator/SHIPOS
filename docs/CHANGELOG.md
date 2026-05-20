# Changelog

All notable Supabase + repo changes for Leader-OS, in the order applied.
Migrations are recorded by name in the Supabase project's migration history.

## Database migrations

| # | Migration                                          | Effect                                                                              |
|---|----------------------------------------------------|-------------------------------------------------------------------------------------|
| 1 | `leader_os_dashboard_views`                        | Created 12 `v_dashboard_*` views for Supabase Studio.                               |
| 2 | `leader_os_dashboard_views_security_invoker`       | Switched all 12 views to `security_invoker = true` (cleared 12 advisor ERRORs).     |
| 3 | `cross_platform_unification_and_scale_prep`        | `record_platform_touch`, `link_check_completion`, `users` BEFORE INSERT seed trigger, `sessions` AFTER INSERT trigger, 8 composite indexes, revoked `upsert_incomplete_attempt` from `authenticated`. Backfilled `meta_tags` for existing rows. |
| 4 | `cross_platform_views`                             | Added `v_user_360`, `v_dashboard_cross_platform`, `v_dashboard_platform_journey`, `v_dashboard_user_360_recent`, `v_dashboard_health`. |
| 5 | `harden_trigger_function_grants`                   | Revoked `public/anon/authenticated` execute on 4 trigger functions; granted only `service_role`. |
| 6 | `tighten_anon_rpc_grants`                          | Revoked anon execute on `match_wladbot_documents`, `match_wladbot_with_neighbors`, `user_context`. |
| 7 | `video_catalog_tables`                             | `courses`, `episodes` (with generated `vimeo_url`), `user_course_unlocks`, `user_episode_progress`. Added `users.current_tier`. Subscription trigger maps `pricing_plans.tier` → course access tier and unlocks first month immediately. |
| 8 | `video_catalog_rls`                                | RLS: public `courses`, episode visibility gated by `is_preview OR unlocked`, owner-only progress writes. |
| 9 | `video_views_and_rpcs`                             | `v_course_catalog` (anon), `v_my_path` (per-user unlock + progress), `rpc_record_episode_progress`, `rpc_attach_vimeo` (admin-gated). |
| 10| `video_drip_and_metrics`                           | `apply_monthly_drip()` + pg_cron `video_drip_daily` (03:17 UTC). Added 4 video columns to `daily_metric_snapshots`. |
| 11| `video_catalog_seed`                               | Seeded 10 courses + 72 episodes matching `/my-path` UI (6 Leader-OS + 4 PLUS Accelerator). Vimeo IDs intentionally NULL — attach via `rpc_attach_vimeo`. |
| 12| `video_pin_search_paths`                           | `SET search_path = public` on `fn_course_tier_for_plan`, `greatest_tier`, `tg_videos_touch_updated_at`, `fn_user_owns`. |
| 13| `add_emergent_mongo_bridge_trigger`                | Realtime sync trigger `trg_notify_emergent_on_subscription_change` on `subscriptions`. Uses Vault secrets `EMERGENT_INBOUND_SECRET` + `EMERGENT_API_BASE` via `private.get_secret()`. POSTs to `leader-os.de/api/internal/sync/subscription-updated` via pg_net. Eliminates the 15-min queue lag for tier sync. Both forward (active) and reverse (canceled) verified end-to-end. |
| 14| `email_journey_engine_schema`                      | `email_journeys`, `email_journey_steps`, `user_journey_state` tables. Engagement signals `last_seen_at` / `last_episode_started_at` / `last_email_engagement_at` on `users`. Helper `fn_user_hours_since_engagement(uid)`. RLS owner-read on user_journey_state. |
| 15| `email_journey_signals_and_advancer`               | Signal triggers (sessions → last_seen_at, user_episode_progress → last_episode_started_at, email_events → last_email_engagement_at). `fn_enroll_in_journey(uid, code, ctx)`. Subscription trigger `subscriptions_enroll_journey` routes leader_os_yearly* → `leader_os_onboarding` journey, leadership_os_plus_yearly → `plus_onboarding`, canceled → `winback`. `advance_email_journeys()` cron `*/15 * * * *` queues template into `email_sends` and advances state. Backward-pressure steps skip if `fn_user_hours_since_engagement < threshold`. |
| 16| `leader_os_onboarding_templates_and_journey_v2`    | 4 new DE templates (`purchase_welcome_leader_os`, `onboarding_day_1`, `inactivity_day_7`, `inactivity_day_14`) + `leader_os_onboarding` 7-step journey (T+0, +1d, +3d, +7d gated, +14d, +21d gated, +30d). |
| 17| `fix_advance_email_journeys_v3`                    | Fix ambiguous column reference in `advance_email_journeys()` (OUT params shadowed `step_order` column). |
| 18| `drop_legacy_welcome_add_plus_journey`             | Detached `subscriptions_send_welcome_email` legacy trigger (journey owns welcomes now). 3 new DE templates (`purchase_welcome_plus`, `plus_onboarding_day_1`, `plus_coaching_invite_day_3`). `plus_onboarding` 7-step journey with Accelerator emphasis + Calendly CTA for first 1:1 coaching slot. |

After migration 18 the security advisor reports five WARNs and two INFOs, all intentional:

1. `upsert_incomplete_attempt` callable by `anon` — leader-check landing page.
2. `is_admin` callable by `authenticated` — used by RLS policies.
3. `rpc_record_episode_progress` callable by `authenticated` — that's the point.
4. `rpc_attach_vimeo` callable by `authenticated` — gated by `is_admin()` inside.
5. `Leaked Password Protection Disabled` — Studio toggle, not DDL.
6. INFO: `email_journeys` RLS-enabled, no policy — config table, service_role only.
7. INFO: `email_journey_steps` RLS-enabled, no policy — config table, service_role only.

## Repo changes

| Commit | What |
|--------|------|
| `Add Supabase MCP server config`        | `.mcp.json` for project-scoped Supabase MCP. |
| `Add Supabase agent skills`             | `.claude/skills/supabase`, `.claude/skills/supabase-postgres-best-practices`, `skills-lock.json`. |
| `Add Leader-OS docs (CLAUDE.md, ...)`   | `CLAUDE.md`, `docs/SCHEMA.md`, `docs/DASHBOARD.md`, `docs/RUNBOOK.md`. |
| `Enable Vercel Claude Code plugin`      | `.claude/settings.json` enabling `vercel@claude-plugins-official`. |
| `docs: pre-launch readiness + CHANGELOG` | This file + RUNBOOK status update. |

## Verified end-to-end

- `dashboard_summary(7)` returns the expected JSON shape (KPIs + funnel + layers + plays + cohorts + daily).
- All 17 dashboard views execute and return rows.
- `meta_tags` triggers fire correctly (synthetic test in transaction, rolled back):
  1. `users` BEFORE INSERT seeds `source_platform` → `meta_tags`.
  2. `sessions` AFTER INSERT appends session's `platform` → user's `meta_tags`.
  3. `record_platform_touch` is idempotent on repeat calls.
- Schema integrity: 0 orphaned children, 0 duplicate emails, 0 users with `source_platform` not in `meta_tags`, 0 completed-check users without insights.
- All FKs have backing indexes; all functions have `SET search_path`; RLS enabled on every public table.

## What still requires you

- **Vault**: store `service_role_key` so `trigger_strategist()` works.
- **Edge functions**: deploy 4 of them with `supabase functions deploy` (commands in `docs/RUNBOOK.md`).
- **Auth**: enable HaveIBeenPwned leaked-password protection.
- **Vercel**: confirm `NEXT_PUBLIC_SUPABASE_URL` / anon key are set.
