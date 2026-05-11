# WladBot / LeaderOS PRD

## Product
100M ARR AI Leadership OS. WLADHUB-branded (Neon Lime #BFFF00). Stripe + PDF + Gamification + Events + Supabase Sync + Email Reminders + **3-Tier System** matching wladhub.com.

## Stack
React + Tailwind + Shadcn/UI | FastAPI + MongoDB | GPT-5.2 + Whisper + Stripe + Resend (Emergent)

## Tier System (Iter 57)
| Tier | Price | Duration | Video-Analyse | 1:1 Calls | AI Coach |
|------|------|----------|---------------|-----------|----------|
| Free | €0 | Lifetime | ❌ | 0 | ❌ |
| **Starter** (Video Lessons) | €199 einmalig | Lifetime | ❌ | 0 | ❌ |
| **Standard** (Leadership System) | €997/Jahr | 365 Tage | ❌ | 0 | ✅ |
| **Accelerator** 👑 | **€6.970** oder **12× €580,83** | 730 Tage | ✅ EXCLUSIVE | 6× | ✅ |

## Deployed Features
- [x] WLADHUB Brand Design (Neon Lime, Dark+Light)
- [x] Enterprise Auth (JWT+Cookie, Refresh, Security Headers)
- [x] 50 Credits + soft_pause at 10
- [x] 300 deep AI/Leadership quiz questions (30-Day Challenge) — Free vs Paid gating
- [x] Video Analysis (Whisper+GPT-5.2) + 5-page PDF reports — **now Accelerator-only gated**
- [x] My Path Gamification (5 Levels + certificates)
- [x] Events & Execution Hub (Calendar Integration, Focus Time System)
- [x] In-App Event Reminders
- [x] WladHub Supabase Sync (bi-directional)
- [x] Personalized 3-Layer Scores (KI/Rhetorik/EQ)
- [x] XP System with labels
- [x] iPhone-style BotMascot, AI News Briefing, Smart Popups
- [x] **[Iter 56] Challengers freie Reflexion** — pre-canned Chips entfernt, offenes Textfeld + Voice
- [x] **[Iter 56] Daily Check-in Voice Capturing** — Whisper-Transkription mit prominenter Mic-CTA
- [x] **[Iter 56] Immersive "AI Agents" Loading States** — 7 Flow-Presets
- [x] **[Iter 56] Rich XP Level Card** mit Beschreibungs-Label
- [x] **[Iter 56] Resend Email Service** — LIVE mit `reminders@leader-os.de`
- [x] **[Iter 56.1] PaywallModal Compact** + Kontrast-Fixes (lime-on-white)
- [x] **[Iter 57] 3-Tier-System** — Free / Starter €199 / Standard €997 / Accelerator €6.970
- [x] **[Iter 57] Accelerator 12×-Installment** — via Stripe Checkout Rate 1/12, sofortiger Zugang, monatliche Reminder-Emails
- [x] **[Iter 57] TierBadge** in Sidebar + Dashboard-Header
- [x] **[Iter 57] TierContext** — globale Feature-Matrix (hasFeature, isAccelerator, etc.)
- [x] **[Iter 57] Video-Analyse Gating** — HTTP 402 für Non-Accelerator auf Backend
- [x] **[Iter 72] Audio-Mode (Voice Conversation)** — Hands-free ChatGPT/Claude-Style Voice-Modus mit Wlad-Voice (ElevenLabs), Whisper-Transkription, VAD-Silence-Detection, Auto-Loop, Safari-Fallback. Toggle via Headphones-Button im Chat.
- [x] **[Iter 57] TierLockOverlay** — Fullscreen Upgrade-CTA auf gelockten Seiten
- [x] **[Iter 57] Tier Welcome Email Sequences** — starter/standard/accelerator Templates via Resend
- [x] **[Iter 57] Installment Cron** — `/api/cron/installments-due` scannt fällige Raten, verschickt HTML-Emails mit 1-Klick-Zahllink
- [x] **[Iter 58] Community Feed** — Facebook-style Feed + Top Leaders Leaderboard + Community-Puls widget (`/api/community/feed`, `/api/admin/community/leaderboard`)
- [x] **[Iter 58] Admin Panel** — Gated Admin page (403 für Non-Admin)
- [x] **[Iter 58] Deep-Assist Workflow** — `/api/tools/deep-assist` liefert strukturiertes JSON (Argumentation + Tipps + Action Plan); Modal auf ToolsPage
- [x] **[Iter 58] WladBot Multi-Format Upload** — PDF + DOCX + TXT + Images via `/api/chat/upload-document` (pypdf, python-docx, lxml)
- [x] **[Iter 58] MyPath Lernvideos-Tab** — saubere Trennung Fortschritt vs. Lernvideos. 10 Kurse: 6 Starter (Lifetime) + 4 Accelerator-exklusive Masterclasses. `GET /api/my-path/videos` liefert Tier-gated Katalog.
- [x] **[Iter 59] Group Coaching Upsell** — 2 neue Packages (€49/mo + €299/Jahr) + UI auf PaymentSuccessPage als Post-Purchase-Upsell. Stripe Checkout integriert, Addons speichern via `users.addons.<package_id>`.
- [x] **[Iter 59] Monthly Leadership Scorecard** — `/api/cron/monthly-scorecard` (Accelerator-only). Sendet monatliche Email mit XP-Delta, Challenge-Tage-Delta, 3-Layer-Bars, Top-Insight + Next-Focus. Idempotent via `email_log` + `scorecard_history`.
- [x] **[Iter 59] Code Review Refactors** — `admin_overview()` in 5 helpers gesplittet, `get_three_layer_score()` in 3 helpers, WladHubCard (191 Z) in 5 Sub-Komponenten, EventReminder (139 Z) in 3 Sub-Parts, Challenge30Page nested ternaries in 5 Helper-Funktionen extrahiert. Type Hints für server.py + seed_test_users.py.
- [x] **[Iter 65 · 2026-02] Component Split Sprint** — 3 große Pages refaktoriert, +16 neue fokussierte Sub-Komponenten:
  - `CommunityPage.js` **361 → 153 Z** → `components/community/` (CommunityCompose, CommunityFilters, CommunityPost, CommunityLeaderboard, communityConstants)
  - `PlaybooksPage.js` **398 → 196 Z** → `components/playbooks/` (PlaybookListCard, PlaybookChatMessage, PlaybookChatView, PlaybookReport)
  - `ChatPage.js` **443 → 192 Z** → `components/chat/` (chatRoles, ChatMessage, ChatRolesHeader, ChatEmpty, ChatUpsellModal, ChatInputBar, ChatInlineUpsell) + `buildFullMessage` helper extrahiert
  - Zero Regressions: alle data-testids erhalten, Frontend-Test 100% PASS (iteration_65.json)
- [x] **[Iter 66 · 2026-02] httpOnly Cookie Auth Migration** — XSS-Schutz durch vollständige Umstellung von localStorage-Bearer-Tokens auf pure httpOnly-Cookie-basierte Sessions:
  - Frontend: `localStorage.wladbot_token` ENTFERNT (war XSS-anfällig), Axios `withCredentials:true` sendet httpOnly Cookie automatisch, KEIN `Authorization: Bearer` Header mehr auf `/api/*` Requests
  - Backend: unverändert (setzte bereits HttpOnly+Secure+SameSite=lax Cookie seit Iter 52). JWT-Token im Response-Body für externe API-Consumer beibehalten, aber Frontend liest ihn nicht mehr.
  - `api.js` vereinfacht (70 Z): 401 → `/auth/refresh` once, dann Redirect zu /login wenn fehlgeschlagen
  - `AuthContext.login(userData)` ohne Token-Param; `checkAuth()` ruft nur `/auth/me`
  - Verifiziert: curl + Playwright E2E — 0 Authorization-Header auf 40+ API-Calls, session_token Cookie httpOnly=true (`iteration_66.json`)

## Key API Endpoints (Iter 57-58)
- `GET /api/payments/packages` — 5 packages (starter, standard, accelerator, accelerator_installment, enterprise)
- `GET /api/payments/tiers` — Full tier matrix with features
- `GET /api/user/tier` — Resolved user tier info (auth required)
- `POST /api/payments/installment/next` — Create checkout for next installment
- `POST /api/cron/installments-due` — Scan+email due installments (call daily)
- `POST /api/video-challenges/{id}/analyze` — 402 if tier != accelerator
- `GET /api/my-path/videos` — (Iter 58) Lernvideo-Katalog mit Tier-Gating (10 Kurse, unlock-flags per tier)
- `GET /api/community/feed` · `POST /api/community/posts` — Community Feed CRUD
- `GET /api/admin/community/leaderboard` — Top Leaders nach XP (Login nötig)
- `POST /api/tools/deep-assist` — Body `{situation, goal}` → `{argumentation, tips, action_plan}`
- `POST /api/chat/upload-document` — Multipart `file`-Feld für PDF/DOCX/TXT

## Post-Launch Backlog
- P0: ElevenLabs Voice-Cloning für 8 Challenger-Bots (blocked on user's API key)
- P1: External cron scheduler (daily /cron/installments-due + /cron/event-reminders 15min + monthly /cron/monthly-scorecard 1st of month)
- P1: Monthly credit refill cron for Standard tier (resets to 500 credits)
- P2: Auto-downgrade to Free after 30-day grace period
- P2: Smart Credits Engine (AI suggests where credits yield most value)
- P3: Weekly Leadership Nudge email (Monday morning personalized)
- P3: Tier Analytics Dashboard (MRR, Retention by tier)
- P3: Real photos of Wlad Jachtchenko on PDF certificates
- P3: Stripe Subscription migration (replace installment cron with native Stripe billing)
- P1: localStorage → HttpOnly Cookie auth migration (~~deferred~~ ✅ DONE Iter 66)
- P2: React Hook Deps pass (reviewed Iter 66 — **FALSE POSITIVES**: `api`/`logger` sind stabile Module-Imports, `setState` ist React-garantiert stabil; gehören nicht in dep arrays. Kein echter Bug.)
- P3: Real photos of Wlad Jachtchenko on PDF certificates

## Testing
- **Iter 79**: Supabase ↔ Mongo bidirectional sync layer. (a) Generated `INBOUND_SYNC_SECRET` (64 chars urlsafe), placeholder env vars `SUPABASE_OUTBOUND_SECRET` + `SUPABASE_USER_MIRROR_URL`. (b) Outbound: `services_supabase_sync.py` mirrors `user.created`/`user.updated` events to Supabase Edge Function (fire-and-forget, 3 retries, idempotent via `event_id`, hooked into `/api/auth/register` + Google OAuth). (c) Inbound: `routes/sync.py` exposes `POST /api/internal/sync/subscription-updated` + `/user-created` + `GET /health`. Timing-safe `compare_digest` shared-secret check. Idempotency via unique `sync_events.event_id` index. Plan→Tier mapping (`leadership_os→standard`, `leadership_os_plus→accelerator`, etc.). Full curl smoke 8/8 + pytest 5/5 PASS. Brief at `/app/SUPABASE_SYNC_INTEGRATION.md`. Report: integration brief.
- **Iter 77 (FINAL_PRE_SHIP)**: Login-Page Production-Polish. (1) QuickLoginList hinter Env-Gate `REACT_APP_SHOW_QUICK_LOGIN === 'true'` — Preview-Only, in Production unsichtbar (Security-Leak verhindert). (2) AuthForm komplett überarbeitet: htmlFor/id-Pairing für a11y, autoComplete-Attribute (`email`/`new-password`/`current-password`/`name`), inputMode/autoCapitalize/autoCorrect für Mobile-Keyboards, minLength=6 auf Password, Loader2-Spinner statt "..." mit aria-busy, aria-label auf Password-Toggle. Backend 10/10 pytest ✅, Frontend 35/35 Review-Items ✅. Report: `/app/test_reports/iteration_77.json`. **READY TO SHIP**.
- **Iter 76**: Sidebar-Cleanup (Empfehlungen/Downloads/Enterprise raus aus main nav, Routen bleiben), LayerCard-Clipping-Fix (Boardroom-Rhetorik wird nicht mehr abgeschnitten, `min-w-0` + `break-words` + `hyphens-auto`), neuer Profile→Konto-Tab mit Passwort-Change-Form + 3 Quick-Links zu Enterprise/Empfehlungen/Downloads. Backend `POST /api/auth/password/change` mit Current-Password-Verify, Min-Length, Same-as-Current-Rejection und gezielter Invalidation aller ANDEREN Sessions. Backend 6/6 pytest ✅, Frontend 14/14 ✅. Report: `/app/test_reports/iteration_76.json`.
- **Iter 74**: 3-Tier-Pricing-Restructure + PDF-Downloads-Center. Backend `services_tier.py` TIER_CONFIG komplett neu, `payments.py` PACKAGES neu (`leadership_os` €997, `leadership_os_2x` 2×550€, `leadership_os_12x` 12×99€, `leadership_os_plus` €4.447). Neue Endpoints `/api/payments/enterprise/quote` + `/lead`. Frontend 3-Card `TierPricingGrid` + neue Modals + `/downloads` Page mit echtem PDF-Export (jsPDF + html2canvas). SmartPopups deaktiviert auf high-intent Routes. Backend 17/17 pytest ✅. Report: `/app/test_reports/iteration_74.json`.
- **Iter 73**: Godmode-Refactor des Audio-Mode — `VoiceModeOverlay` (368 Z., Complexity 89) gesplittet in `useVoiceMode` Hook + `VoiceOrb` + `VoiceControls` + 75-Z. Composer. Backend `voice_conversation` (118 Z., Complexity 18) gesplittet in `_ensure_voice_session`, `_persist_voice_turn`, `_cap_reply_length`, `_synthesize_or_cached` Helpers. **Zero Regressionen**: Backend 4/4 pytest ✅, Frontend Playwright 100% ✅ (alle 5 Testids visible, Close restores Chat, Chat-Send-Regression grün). Credit wird nun erst NACH erfolgreicher Transkription abgezogen (kein Burn mehr bei leerem Audio). Safari-MIME-Fallback (mp4/webm/ogg) + Max-3-Empty-Retry-Cap. Report: `/app/test_reports/iteration_73.json`.
- **Iter 72**: Audio-Mode (ChatGPT/Claude-Style Voice Conversation) — Backend `POST /api/voice/conversation` (Whisper STT → GPT-5.2 short conversational reply → ElevenLabs Wlad voice TTS, persists to chat_messages, credit-deducted only on valid transcript). Frontend `VoiceModeOverlay.js` fullscreen orb mit VAD silence detection (1.4s), auto-loop, pause/mute/close. Toggle via Headphones button im `ChatInputBar`. Backend 4/4 pytest PASS, Frontend E2E 100%. Report: `/app/test_reports/iteration_72.json`.
- **Iter 69**: Auth-Health-Monitoring-Widget — neuer `/api/admin/auth-health` Endpoint + AdminPage Widget mit 60s Auto-Refresh, Live-Daten verifiziert (45 Regs/24h, 90.7% Success-Rate, Top-Offender-Detection).
- **Iter 68**: Enterprise Deploy-Ready + Auth Hardening — Case-insensitive Email-Uniqueness (MongoDB Unique-Index), Race-Safe Register (DuplicateKeyError → 400), Brute-Force 10 fails/15 min → 429, Pydantic Email-Validation mit test_environment=True, parseAuthError für UX, Prod-Indexes (users.xp, chat_messages, activity_log). Curl 5/5 tier accounts ✅, Playwright Re-Login cycle ✅, deployment_agent DEPLOYABLE ✅.
- **Iter 67**: Code-Quality Sprint — 14/14 neue Backend-Regression-Tests + Frontend E2E + 5-Page Regression, 0 Auth-Leaks, alle critical testids erhalten. Siehe `/app/test_reports/iteration_67.json`.
- Iter 66: httpOnly Cookie Auth Migration — 100% PASS
- Iter 65: Frontend 100% PASS — Component-Split Regression (3 Pages)
- Iter 64: Frontend 6/6 · Backend 17/17 PASS
- Iter 60: Frontend 8/8 · Backend 10/12 → 2 Bugs gefixt (community_post activity_log + LEVEL_META)
- Iter 59: 14/14 backend pytest PASS · 100% frontend regression
- Iter 58: Frontend 9/9 · Backend 8/11 (Spec-Naming-Mismatches)
