-- Applied 2026-05-17 via Supabase MCP after the Vercel production fix
-- went green. The advisor was flagging two ERROR-level findings:
--   * dash_rag and dash_activity_feed views were created as SECURITY DEFINER
--     (Postgres default) — Supabase advisor flags this as ERROR
--   * both views had been granted SELECT to `anon` and `authenticated`, so
--     anyone with the publishable anon key could pull the full ops feed
--
-- This migration is the single source of truth for the lock-down. Re-running
-- it is idempotent (revoke + alter view are both safe to repeat).
--
-- Project: srujvjjncrszhaaxepxf (eu-north-1, Postgres 17)
-- Recorded in Supabase migration history as version 20260517195842.

revoke all on public.dash_rag from anon, authenticated;
revoke all on public.dash_activity_feed from anon, authenticated;

alter view public.dash_rag           set (security_invoker = true);
alter view public.dash_activity_feed set (security_invoker = true);
