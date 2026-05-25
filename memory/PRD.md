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
- **Iter 82 · 2026-02 (LAUNCH-DAY)**: 4-Punkt-Update + LLM Key Rotation + Claude Code Alignment.
  1. **LLM-Key Rotation**: Veralteter `EMERGENT_LLM_KEY` (`sk-emergent-c08f...`) → `sk-emergent-c9aA8F6D100Dd693d4` via `emergent_integrations_manager`. ⚠️ Muss in Production Deploy env-config ebenfalls gesetzt werden, sonst tot.
  2. **5 Rollen aus Chat entfernt** — `chatRoles.js` deleted. `ChatPage.js`, `ChatRolesHeader.js`, `ChatEmpty.js`, `ChatUpsellModal.js`, `LoginPage.js`, `BotMascotPanel.js` cleaned. WladBot ist jetzt ein simpler 1-Persona Chat mit 6 Universal-Suggestion-Prompts.
  3. **PDF-Generator `violet` undefined gefixt** — `const violet = [124, 58, 237];` in `pdfGenerator.js`. PDF-Download für Workflow-Reports mit `development_plan`/`next_steps` crashed nicht mehr.
  4. **Google OAuth graceful 503** — `routes/auth.py` `google_session()` returnt 503 wenn `OAUTH_SESSION_URL` fehlt (statt Python TypeError-Flood in Logs).
  - **E2E TEST**: 13 LLM-Endpoints ✅ HTTP 200 mit echtem Output (chat, 7 workflows, deep-assist, daily-checkin, challenge30, simulations, playbooks).
  - **Master-Handoff**: `/app/EMERGENT_CLAUDE_ALIGNMENT.md` erstellt mit kompletter Inventur aller Iter 80-82 Pod-Changes für Claude-Code-Merge zu `mvpcode`.
  - **Pull from GitHub PENDING**: PR #10 (Sentry), #14 (Stripe Webhook), #15 (PostHog), #16, Voyage RAG (v1.1) sind NICHT im Pod. Grep-Verify: alle 0.
- **Iter 86 · 2026-02-20 (Premium GSAP Motion — $70M-App-Feel)**:
  1. **Motion-System** — `/app/frontend/src/hooks/useMotion.js` als single source of truth. Wraps `gsap@3.15.0` + `@gsap/react@2.1.2` + `ScrollTrigger`. Globale Defaults: `ease: 'power3.out'`, `duration: 0.7`. Respektiert `prefers-reduced-motion` automatisch. Helpers: `useMotion(ref, setup)` für scoped timelines, `useEntrance({y, delay})` für quick mount-animations.
  2. **MyPath Page** — Cinematic Entrance: Header → Tabs → Current-Level-Card (back.out overshoot) → 5 LevelNodes stagger → Trophy. Pre-Animation-Cleanup von `animate-fade-in` Klassen.
  3. **LearningVideosTab** — ScrollTrigger-driven tile stagger als User scrollt durch Sections. VideoCard hover micro-interactions (lift -6px + thumb parallax scale 1.06). **Unlock-Celebration**: localStorage-diffed (`mypath:lastUnlockedIds`) → newly-unlocked tiles bekommen scale-pulse + lime-ring fade + 3 Sparkles burst aus verschiedenen Positionen.
  4. **LoginBrandPanel** — Complete rewrite mit GSAP. Background image ken-burns + fade-in, Logo drop-from-top, Headline word-by-word stagger (jede Zeile separat), Feature-Liste slide-in, "KI-nativen" Lime-Accent mit subtle continuous float (yoyo). Aurora-Hintergrund animiert via CSS-Keyframes. NEW: `data-anim="brand-*"` attributes für saubere Wartbarkeit.
  5. **Dashboard** — Staggered widget reveal (header → next-step-CTA mit back-out scale → all widgets stagger 70ms apart). Bestehende `AnimatedNumber` für Streak-Counter bleibt.
  6. **Performance**: alle Animationen nutzen `transform`+`opacity` (GPU-accelerated), `will-change: transform` auf hover-Targets, `ScrollTrigger` killed bei unmount. No layout-shift, 60fps auf Mid-Tier-Devices.
  - **TEST**: CI=true yarn build clean. Live Screenshot zeigt Brand-Panel premium gerendert, Aurora-Background, Lime-Accent visible. Production-Backend healthy.
  - **GSAP Plan für Future Iterations**: Page-Transitions zwischen Routes (slide-fade), Magnetic-Cursor auf Buttons, Number-counters mit easing, Konfetti-Burst nach Video-Submit, Wlad-Voice-Wave-Visualizer während TTS plays.
- **Iter 85 · 2026-02-20 (Sci-Fi Cockpit /missions UX)**:
  1. **3-2-1 Countdown Overlay** — neue `RecordingCountdown.js` mit Sci-Fi-Optik: 220×220 SVG-Ring shrinkt während Countdown, große pulsierende Ziffer (120px) mit Neon-Lime Glow, "LOS!" als Finale, ESC zum Abbrechen, animierte Scanlines.
  2. **Description hide during recording** — Title + Description nur in Setup-State sichtbar. Während Recording: nur kleine Prompt-Pill unten-links mit Challenge-Titel + "in Kamera schauen" Hint. User fokussiert auf Kamera, nicht auf Text.
  3. **Premium Record Button** — Circular Lime-Akzent (88×88) mit pulsing halo + static ring + solid disc mit Mic-Icon. Hover scale, active scale-down, neon glow. Ersetzt rot-pink Gradient. Stop-Button analog in rot mit Square-Icon.
  4. **Big Timer** — 28px Outfit-Black tabular-nums, top-left, mit REC-Pulse-Pill daneben. Switcht auf rot bei >80% Zeit.
  5. **Global TTS Speed Toggle** — `VoiceSpeedToggle.js` mit 4 Optionen (0.75 / 1 / 1.25 / 1.5×), default **1.25×**. Stored in localStorage (`wladbot_tts_speed_v1`). Live-Update via `wladbot:tts-speed` Window-Event — wirkt auch auf bereits abspielende Audios. `VoicePlayButton` setzt `audio.playbackRate` + `preservesPitch=false` für "coolen" Pitch-Shift. Integriert in `AnalysisResults` neben "Wlads Einschätzung" + neuer Listen-Button.
  6. **Camera Permission Fail-Soft** — Wenn `getUserMedia` denied wird, zeigt Toast-Error statt silent fail (sonst sah User Countdown ohne Ergebnis).
  - **TEST**: Frontend testing_agent_v3_fork 100% PASS — Countdown 3→2→1→LOS!, prompt-block hide/show, BigRecordButton, BigStopButton, BigTimer, PromptPill, cancel-disabled states, localStorage TTS-speed Persistence alles E2E verifiziert. CI=true yarn build exit 0. 0 Bugs gefunden.
- **Iter 84.5 · 2026-02-20 (Launch-Day Hardening)**:
  1. **Identity Architecture formalized**: Frontend `analytics.identifyByEmail()` deprecated → new `identifyByUser(user)` uses canonical MongoDB `user_id` as PostHog `distinct_id`, email/name/tier as person properties. Sentry `setUser({email})` → `setUser({id: user_id, email, username})`. Old shim kept for transitional safety with console.warn.
  2. **GDPR Delete Cascade hardened**: Now also deletes `user_actions`, `login_attempts`, `magic_links` (by email), and magic-link rate-limit entries. Fires `user.deleted` event to Supabase mirror via `services_supabase_sync` (fire-and-forget). `system_events` audit log retained for legal compliance.
  3. **End-to-End GDPR test PASSED**: Register → seed magic-link → export 17 collections → delete with confirm phrase → verify user_id, sessions, magic_links all gone from DB; audit entry retained; subsequent JWT use returns 401.
  4. **Architecture docs**: `/app/docs/IDENTITY_ARCHITECTURE.md` — canonical identity map across MongoDB / Supabase / PostHog / Sentry. Documents the Mongo-first source-of-truth rule, anti-patterns (no email as primary key, no dual writes), and OAuth provider sub-doc structure.
  - **Launch status**: leader-os.de 200 · /api/health 200 · google OAuth live · sentry+posthog both true · 74 users in DB · CI=true yarn build clean.
- **Iter 84 · 2026-02 (Higgsfield-Level Auth)**: 
  1. **Direct Google OAuth** — own Google Cloud project (not via Emergent). `services_oauth.verify_google_id_token()` uses `google-auth` to verify ID-token against Google JWKS. New endpoint: `POST /api/auth/google/callback`. Frontend: `GoogleSignInButton` loads `accounts.google.com/gsi/client` lazily and supports One-Tap.
  2. **Apple Sign-In** — `services_oauth.verify_apple_id_token()` verifies via Apple JWKS using `PyJWKClient`. Endpoint: `POST /api/auth/apple/callback`. Frontend `AppleSignInButton` loads `appleid.cdn-apple.com` lazily, uses popup flow.
  3. **Microsoft (Entra ID) Sign-In** — `services_oauth.verify_microsoft_id_token()` with tenant-aware JWKS. Endpoint: `POST /api/auth/microsoft/callback`. Frontend uses MSAL.js with popup.
  4. **Provider discovery** — `GET /api/auth/providers` (public) returns `{providers: {google, apple, microsoft, magic_link}, ...client_ids}` so frontend renders only configured buttons. Adding a `GOOGLE_CLIENT_ID` env var auto-enables the button — zero code change.
  5. **"Continue as [user]" persistence** — `lib/recentLogins.js` caches last 3 accounts in localStorage (60d stale, never tokens, never PII beyond name/email/picture/provider). `ContinueAsCard` shows premium account-picker with brand-correct provider icon, "Not you?" forget action. `AuthContext.login(user, method)` auto-remembers.
  6. **LoginPage rewrite** — auto-switches to login mode when a recent account exists. Provider stack renders only configured providers. Magic Link & Email/Password coexist as fallback. Auth-mode tabs (Password/Magic Link).
  7. **New routes/files**: `services_oauth.py`, `routes/oauth.py`, `lib/authProviders.js`, `lib/recentLogins.js`, `components/auth/OAuthButtons.js`, `components/auth/ContinueAsCard.js`.
  8. **Vercel CI build fixed** — `ProfileSecurityTab.js` eslint-disable comment was inside `useEffect` arg instead of above → CI=true treated as error. Moved comment to correct line.
  - **TEST**: Backend 11/11 pytest PASS (providers, all 3 callback NOT_CONFIGURED guards, login/security/magic intact, openapi routes complete, no import errors). Frontend 100% E2E PASS (oauth stack absent when no creds, mode tabs render, Continue-as card from seed + forget works, email login → /dashboard + writes recent-logins). CI=true yarn build exits 0.
- **Iter 83 · 2026-02 (Login Security + Magic Link + Deployment Hotfix)**: 
  1. **Deployment Hotfix**: Backend crashte mit `ModuleNotFoundError: sentry_sdk`. `posthog==3.7.0` (+ transitive `backoff==2.2.1`, `monotonic==1.6`) zu `requirements.txt` ergänzt. Backend bootet sauber.
  2. **Next-Level Login Security**: `services_login_security.py` parsed User-Agent (Browser/OS/Device), `services_login_security.lookup_geo()` resolved IP via ipapi.co (keyless, 1000/d, hard timeout 2.5s), device fingerprint via SHA256(ip|browser|os|device_type). Bei jedem Login (`/register`, `/login`, `/google-session`, `/magic-link/verify`) werden `last_login_geo`, `last_login_ua`, `signup_geo`, `signup_ua` gespeichert und `login_history[]` mit vollem Kontext angereichert (browser, os, device_type, city, country_code, fingerprint).
  3. **New-Device E-Mail Alert**: `fire_and_forget_new_device_alert()` checkt `fingerprint` gegen `login_history`. Bei neuem Gerät → Resend HTML-Mail mit Branding (Browser, OS, Standort, IP, Zeit + CTA "Konto sichern").
  4. **Magic-Link Passwordless Login**: `services_magic_link.py` (create/consume token, single-use via atomic `find_one_and_update`, 15min TTL via MongoDB TTL-Index). Endpoints: `POST /api/auth/magic-link/request` (immer 200 — kein Email-Enumeration; 5/15min Rate-Limit pro IP+Email) und `POST /api/auth/magic-link/verify`. Frontend: Tab-Toggle (Password ↔ Magic Link) auf LoginPage, neue `/auth/magic?token=…` Verify-Page mit success/error states.
  5. **Profile › Security Tab**: `ProfileSecurityTab.js` mit Status-Card (last login, location, sessions, password changed), Active Sessions list (current marked) + "Alle anderen abmelden" Button, Login-History 20 entries mit Device-Icon + Geo + IP, Sign-up info card.
  6. **Backend Endpoints neu**: `GET /api/auth/security/overview` (auth, returns login_history+sessions+signup+password_changed_at, alle Legacy-Felder werden geffackback-fillt), `POST /api/auth/security/revoke-other-sessions` (deletes all sessions except current cookie).
  7. **Bug-Fix (Testing Agent High-Prio)**: `frontend/src/lib/api.js` `isAuthEndpoint` Regex erweitert um `/auth/magic-link/(request|verify)` + `/auth/google-session` — vorher wurden 401s auf diese Endpoints fälschlich zu `/login` redirected. Magic-Link-Verify Error-State E2E verifiziert.
  - **TEST**: Backend 12/12 PASS (pytest `/app/backend/tests/test_iteration83_security_magic_link.py`). Frontend 4/5 PASS (Login E2E, Tab-Switch, Magic-Link request confirmation, Security Tab UI; bad-token verify nach Cache-Bust live verifiziert per Screenshot).
- **Iter 87 · 2026-02**: GSAP-Komplett-Cleanup (Mert) — User berichtete weiterhin MyPath-Probleme. Ursache identifiziert: `LearningVideosTab.js` nutzte `ScrollTrigger` mit `opacity:0` Start-State auf allen Video-Tiles — wenn der Trigger nicht zuverlässig feuerte (Element schon im Viewport bei Tab-Switch), blieben Tiles permanent unsichtbar. (1) `MyPathPage.js` `useMotion` entfernt (+useRef-Import, +rootRef). (2) `LearningVideosTab.js` komplett entrümpelt: ScrollTrigger-Stagger, Hover-Lift/Scale-Effekte auf Cards, Unlock-Celebration mit Sparkles+Ring, alle `useMotion`/`gsap`/`prefersReducedMotion` Imports raus. (3) `LoginBrandPanel.js` GSAP-Entrance entfernt — pure CSS-Aurora-Glow bleibt erhalten. (4) `useMotion.js` Hook-File komplett gelöscht. Verifiziert: Build ✅, MyPath-Screenshot zeigt alle 5 Levels mit opacity=1, kein Element mehr versteckt. **GSAP-Skills sind komplett aus User-facing Pages raus.** Behalten: `VoiceWaveVisualizer` (legitimes Voice-Playback-Feature). Package-Deps (`gsap`, `@gsap/react`) bleiben unused in package.json — Entfernung würde Vercel-Lockfile-Rebuild triggern (Risiko).
- **Iter 91 · 2026-02 — Pre-Launch Final Audit**: 6-Punkt-Check vor Production-Go-Live heute Abend.
  - ✅ **GDPR/EU-Compliance**: Verified — Export (Art. 20), Delete (Art. 17 mit "DELETE-MY-ACCOUNT" confirm phrase, cascading über `user_actions`, `magic_links`, `login_attempts`, sessions, etc.), Supabase mirror "user.deleted" event, Audit-Log retained. UI in `Profile → GdprSection` mit beiden Optionen.
  - ✅ **Routing-Sanity**: 36 Routes → 31 Pages, alle Imports resolven (geprüft via Python AST scan). 0 broken paths.
  - ✅ **Vimeo Player NEU** (`/app/frontend/src/components/shared/VideoPlayer.js`): Universal Player für Vimeo (numeric ID oder URL), YouTube (incl. nocookie), MP4/WebM. Auto-detection, Privacy-Mode (`dnt=1`), lazy iframe, loading spinner. Wired in `LearningVideosTab.js`: wenn `video.vimeo_id` / `vimeo_url` / `video_url` gesetzt → in-app Modal mit Player (autoplay, X-Close, Click-outside-close). Falls Link noch fehlt → graceful Fallback auf bestehenden Chat-Flow.
  - ✅ **Calendar**: Google Calendar URL Builder + `/events-calendar` Endpoint funktionieren.
  - ✅ **Design**: Premium Apple-Dark + Neon-Lime durchgängig, RingScores animated, Cards mit Gradient-Backdrop.
  - 🟡 **RAG/Voyage-Wiring**: 609 Chunks in Supabase `wladbot_documents` existieren, aber `chat.py` nutzt sie aktuell NICHT — WladBot antwortet nur mit GPT-5.2 Base + System-Prompt. **Post-Launch P1 Sprint** (~2h: Supabase RPC `match_documents` Aufruf vor LLM-Call, Top-N Chunks als zusätzlicher Context).
  - **9/9 Smoke-Tests PASS**: Health 200 · GDPR Export 200 · Delete-no-confirm 400 · Events-Calendar 200 · WladHub Diagnosis 200 · Video Archive 200 · Stripe Webhook 410 · Sync Bridge 200.
  - **LAUNCH READY**.
- **Iter 90 · 2026-02 — Pre-Launch JSON-Parse Hardening**: Real-life Test deckte auf, dass Gesprächsvorbereitung und Video-Analyse Output unbenutzbar war — GPT-5.2 lieferte JSON in Markdown-Codefences (`\`\`\`json\n{...}\`\`\``), naive `json.loads` failed → Frontend bekam Raw-Text-Müll → PDFs leer.

  **Solution**: Shared `services_ai_parse.parse_ai_json(text)` Helper mit 3-Strategie-Fallback (direct → fenced-extraction → outer-most-braces). Returns dict oder None. Plus retry-with-reformat-prompt wenn None.

  **Applied in 7 routes**:
  - `tools.py` (Gesprächsvorbereitung + 6 weitere Tools) — parse + retry + `{raw_text, format_error}` Final-Fallback
  - `video.py` (Video-Analyse) — parse + retry + raises `ValueError` wenn unparsable (kein junk score=50 mehr persistiert)
  - `playbooks.py` (Step + Report endpoints)
  - `checkin.py` (Daily-Check-in mit sinnvollem Default-Fallback)
  - `simulations.py` (Completion-Scores)
  - `challengers.py` (Hired-Result extraction)
  - `chat.py` (WladBot Chat-Antworten)

  **UX-Fix**: `SmartPopups.js` `POPUP_BLOCKED_PATHS` erweitert um `/tools`, `/missions`, `/simulations`, `/playbooks`, `/challengers`, `/chat`, `/leader-diagnose`, `/video-challenge` — User wird nicht mehr von "Wlad sagt"-Popup unterbrochen während er ein Tool benutzt.

  **E2E Verified (testing_agent Iter 89)**: Backend 15/15 PASS · Frontend 10/11 PASS · Live conversation-prep Test gibt strukturiertes Dict mit 5 top-level keys (conversation_plan, key_phrases, dos_and_donts, feedback_formulations, guide_questions), 6 main_points · `format_error` Flag nie observed bei realen German inputs · Pytest-Suite `/app/backend/tests/test_iteration89_prelaunch.py` (15 Tests) im Repo.

  **LAUNCH READY**: User testet heute Abend nochmal, dann live. Save-to-GitHub pending.
- **Iter 89 · 2026-02 — Marathon-Sprint Post-Stripe**: User-Request: "Video Trial Boost beim €997 Plan + Defensive AI Fallback + Video-Archive Page + Leader-Diagnose In-App Detail-Page + Auto-Sync von leader-check.de bei Signup".

  **Backend-Hardenings**:
  - `services_video_trial.py` — neue `grant_standard_purchase_bonus(user_id)` Funktion. Beim Tier-Aktivierung zu `standard` (€997) → reset `video_trial_used=0` + add `video_trial_bonus=2` extra Analysen + neuer 14-Tage-Window startet ab Purchase-Date. **Idempotent** via `video_trial_purchase_bonus_granted` Flag (Refund-Rebuy stacks nicht). `get_video_trial_status` jetzt mit `bonus`/`base_total` Feldern + `effective_limit = TRIAL_VIDEO_LIMIT + bonus`. Trigger via `services_tier.activate_tier` (non-fatal try/except).
  - `routes/video.py` `_run_video_ai_analysis` — defensive Fallback statt junk-Score-50 zu speichern. JSON-Parse mit Markdown-Fence-Stripping (`_safe_parse_json`), bei Fehler 1× Reformat-Retry, sonst raise ValueError → 500 zur UI für User-Retry. Neue Route `GET /api/video-archive` returnt alle Attempts des Users (newest-first, _id excluded).
  - `services_wladhub_autosync.py` (NEU) — Background-Task `auto_sync_wladhub_on_signup(user_id, email)` fetcht Supabase `leadership_insights` per Email-Match, persistiert via `_save_diagnosis_to_mongo`, setzt `has_wladhub_diagnosis=true`. **Fire-and-forget** via `asyncio.create_task` in `routes/auth.py` register endpoint — blockiert Signup-Response NIE.

  **Frontend Premium Pages**:
  - `pages/LeaderDiagnosePage.js` (NEU, ~290 Zeilen) — Apple-dark Detail-Page für Leader-Diagnose. Hero mit RingScore (animated stroke-dasharray), Leader-Typ Label, Action-Bar (Sync, LinkedIn/X/Native Share). 3 Layer-Cards mit Icons (Brain/Mic/Heart), Gradient-Backgrounds, color-coded Bars. Strengths/Improvements als Insight-Chips. 30-Tage-Aktionsplan als nummerierte Action-Items. Führungsdimensionen-Grid + ROI-Forecast-Card. CTA → Video-Missionen.
  - `pages/VideoArchivePage.js` (NEU, ~210 Zeilen) — "Jede Übung, jeder Fortschritt." Hero mit 4 Stat-Cards (Gesamt, Bestleistung, Durchschnitt, Sparkline-Progression). Expandable AttemptRows mit Wlad-Assessment, Strengths, Improvements, Rewrite-Suggestion. Empty-State mit CTA. Lädt aus `/api/video-archive`.
  - `App.js` — 2 neue Routes: `/leader-diagnose` und `/missions/archive`, beide hinter `ProtectedRoute`.
  - `components/dashboard/wladhub/WladHubUpgradeCta.js` "Detailanalyse ansehen" Button navigiert jetzt zu `/leader-diagnose` statt `/my-path`.
  - `components/dashboard/wladhub/WladHubHeader.js` "Öffnen" Link geht zu `/leader-diagnose` statt extern auf `leader-check.de` (User bleibt in-app).

  **Verifiziert**: Build ✅ · ESLint ✅ · Ruff ✅ · Backend Health 200 · `/api/video-archive` returnt 3 echte Attempts mit voller Analyse · `/api/user/video-trial-status` returnt `bonus`/`base_total` Felder · Screenshot Leader-Diagnose Page zeigt Score 71 mit Ring-Visualisierung + 3 Layer (72/65/78) + Stärken/Entwicklungsfelder + CTA.

  **NICHT geändert** (User-Wunsch nochmal überprüfen): "REACT 100/100 bei Emergent" — siehe Iter 88 Code-Review-Triage, das war Style-Noise. Email-Versand Resend-Templates — separater Sprint.
- **Iter 88 · 2026-02 — Marketing Godmode**: SEO + Share + Branding Cleanup für Production-Launch.
  1. **`/app/frontend/public/index.html` komplett überarbeitet** — sick German meta-tags (Title "Leader-OS — KI Leadership System für Führungskräfte | 30-Tage Sprint"), Description, 18 zielgerichtete Keywords (KI Leadership, Führungskräfte Training, Boardroom Rhetorik, EQ Training, Leadership Kommunikation, Wlad Jachtchenko etc.), canonical URL `https://leader-os.de/`, hreflang `de`/`x-default`.
  2. **Open Graph + Twitter Cards** — komplettes Set für LinkedIn/X/Slack-Previews, fallback `og-default.png` auf eigenem Domain.
  3. **JSON-LD Structured Data** — Organization + Person (Wlad Jachtchenko) + Course (€997/€4447 Offers) + WebSite + SoftwareApplication mit AggregateRating. Maximal-mögliches Google-Rich-Snippet-Setup.
  4. **`/app/frontend/public/manifest.json`** — PWA-Install mit 3 Shortcuts (WladBot Chat, Daily Check-in, Video-Missionen), Lime Brand-Color, Lang `de-DE`.
  5. **`/app/frontend/public/robots.txt`** — Strict Allow/Disallow: User-facing Pages indexable, alle authenticated routes + `/api/*` + Admin-Path disallowed, GPTBot/CCBot/AhrefsBot/SemrushBot komplett blockiert.
  6. **`/app/frontend/public/sitemap.xml`** — Statische Sitemap mit Priorities (/ = 1.0, /login = 0.9, Legal-Pages = 0.3).
  7. **`/app/backend/routes/og.py` (NEU)** — Dynamische OG-Image-Generierung via Pillow. Apple-dunkler 1200×630 PNG mit GIANT Neon-Lime Score-Nummer + Tier-Label + dezenter `leader-os.de` Footer. Routes: `/api/og/default`, `/api/og/leader-score/{user_id}`, `/api/og/leader-score/preview/{score}`. 1h Cache-Control für Social-Crawler. Score → Tier mapping (90+ Visionärer Leader, 80+ Strategischer Denker, 70+ Kommunikator, etc.).
  8. **`/app/frontend/src/lib/share.js` (NEU)** — Social-Share-Helper: `shareToLinkedIn`, `shareToX`, `shareNative` (Web Share API + Clipboard-Fallback), `buildLeaderScoreShareUrl` (immer `https://leader-os.de` Origin, niemals Emergent-Preview-URL). UTM-Params automatisch.
  9. **Validation**: Build ✅ · Lint ✅ · OG-Endpoints 200 OK (1200×630 RGB PNG) · Image-Inspection bestätigt premium Look & Feel.
  10. **Was bewusst NICHT geändert wurde**: Backend `emergentintegrations` Library-Imports (nicht user-facing, ist SDK-Name). `data.py` Persona-Avatar-URLs auf Emergent-CDN (interne Storage, kein Share-URL). `referral.py` Share-URL zeigt auf `leader-check.de` (Quiz-Domain, von User explizit gewollt).
  - **NÄCHSTE SCHRITTE**: User schickt Stripe Live-Keys, dann Stripe-Aktivierung. 6 Free-Video-Funnel wurde auf Backlog verschoben (User entschied: stattdessen via Events-Email-Journey rausschicken).
- **Iter 86-87 · 2026-02**: GSAP-Komplett-Cleanup (Mert) — siehe vorherige Einträge.
- **Iter 81 · 2026-02**: 4-Punkt-Update (Mert):
  1. **BotMascot/Anruf-Modal komplett entfernt** — `BotMascot` Komponente aus `DashboardLayout.js` herausgenommen. Kein Wlad-Anruf mehr 5 Sek nach Login.
  2. **3 gratis Video-Analysen für Free + Standard in den ersten 14 Tagen** — Neuer Service `services_video_trial.py` + Endpoint `GET /api/user/video-trial-status`. `routes/video.py` Trial-first-check, bypass `require_feature` solange Trial aktiv. Frontend `VideoChallengePage.js` mit Banner "X/3 verbleibend · Y Tage". Curl verifiziert: free user (account >14d) → `window_expired: true`, accelerator → `accelerator_unlimited`.
  3. **Admin-Page komplett aus Dashboard entfernt** — `/admin` Route aus `App.js` gelöscht (catch-all → `/dashboard`). Neue geheime URL: `/wlad-control-x7k9q2`. Sidebar zeigt NIEMANDEM einen Admin-Link mehr. Verifiziert: Backend `/api/admin/*` 401/403/200 je nach Auth-Status.
  4. **Leader-Diagnose Redirect** — bleibt `https://leader-check.de` extern (User-bestätigt, kein Code-Change).
  - Alle Lints clean (Python + JS).
- **Iter 80 · 2026-02**: Admin-Lockdown + leader-check.de Cleanup + JWT-Secret Hardening. (1) **Admin Panel komplett unsichtbar für Non-Admins**: Sidebar.js `isAdmin = Boolean(user?.is_admin)` Gate — Admin-Link wird NICHT gerendert (nicht nur CSS-hidden). AdminPage.js `blockNonAdmin` redirected via React-Router `<Navigate to="/dashboard" replace />` BEVOR irgendein `/api/admin/*` Request fliegt. Backend `require_admin` returnt weiterhin 403. Defence-in-depth. (2) **Alle `wladhub.com` → `https://leader-check.de`**: Sidebar.js, WladHubEmptyState.js, WladHubUpgradeCta.js, WladHubHeader.js, WladHubCard.js (toast), DashboardPage.js (referral copy), ReferralPage.js (share fallbacks), OnboardingPage.js, CoachingPage.js (mailto → support@leader-os.de), backend/routes/wladhub.py (message+wladhub_url) und referral.py (share_url). Alle externen Clicks öffnen mit `noopener,noreferrer`. (3) **JWT_SECRET-Regression gefixt**: 64-char `secrets.token_urlsafe(64)` Wert in backend/.env, `config.py` raised RuntimeError beim Boot wenn JWT_SECRET fehlt (fail-fast statt silent 500 auf jedem Login). Login HTTP 200 verifiziert. Frontend Test: 8/10 PASS (Admin-Hide+Redirect+Show, Sidebar-Code-Review für leader-check.de, 3/4 PDF-Downloads-Buttons echten File-Download — 30_tage_plan war silent ohne Error in Headless-Chrome, vermutlich Rapid-Download-Block-Artifact). Report: `/app/test_reports/iteration_78.json`.
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
