# Branch Cleanup — verifizierte Listen

> Stand 2026-06-11, 03:00 UTC. Total **68 remote Branches**. Audit per
> `git rev-list --count origin/mvpcode..origin/<branch>`.

## 1. Behalten (4 Branches)

| Branch | Grund |
|--------|-------|
| `mvpcode` | Production |
| `backup/mvpcode-pre-emergent-2026-05-17` | Last-known-good Backup |
| `claude/add-vimeo-links-9cL3u` | Aktive Nike-DNA-Arbeit, PR #66 offen |
| `data/wlad-corpus-v3-fill-gaps` | RAG-Corpus-Versionierung |

## 2. SOFORT LÖSCHEN — 19 Branches, alle Commits in mvpcode

Diese sind verifiziert leer gegen mvpcode (0 commits ahead). Sicher
weg, kein Datenverlust.

**Pfad:** https://github.com/aiporator/SHIPOS/branches

Auf der Seite findest du jeden Branch unten in der Liste, rechts gibt
es einen 🗑-Button. Oder du nutzt das Search-Feld und tickst die
Checkboxen ab.

```
chore/ci-hardening
claude/csp-allowlist-fix
claude/godmode-followup
claude/godmode-launch-prep
claude/launch-day-prep
claude/security-hardening-tonight
docs/system-overview
emergent-iter-92.13
feat/enterprise-diagnosis-emails
feat/enterprise-emails
feature/folder-context-wingman
fix/lockfile-guard-always-run
fix/rag-context-budget
fix/video-upload-size-limit
fix/voice-prompt-framework-citation
iter-80-emergent
iter-82-emergent
iter-83-emergent
merge/emergent-iter-92.13
```

## 3. ÜBERPRÜFEN — 44 Branches mit "ahead" Commits

Diese haben theoretisch noch unmergte Commits, aber bei vielen wurden
sie via Squash-Merge in `mvpcode` aufgenommen — der Originalcommit
existiert noch, ist aber inhaltlich drin. Typischer Fall: alle "1
ahead" Branches.

### Wahrscheinlich gemergt (Squash-Merge, "1 ahead") — 18 Branches

Pro Branch im GitHub-UI prüfen: gibt es einen gemergten PR? Wenn ja —
löschen. UI zeigt das oft direkt mit "Merged" Badge.

```
docs/app-architecture                       [1 ahead]
feat/design-skills                          [1 ahead]
feat/framework-mastery-quality-audit        [1 ahead]
feat/landing-circle-rename                  [1 ahead]
feat/landing-cleanup-real-photos            [1 ahead]
feat/landing-client-ready                   [1 ahead]
feat/landing-real-corner-copy               [1 ahead]
feat/output-style-knowledge-transfer        [1 ahead]
feat/premium-polish-phase3                  [1 ahead]
fix/duplicate-imports                       [1 ahead]
fix/lockfile-sync                           [1 ahead]
fix/rag-everywhere                          [1 ahead]
fix/vercel-build-complete                   [1 ahead]
fix/vercel-build-final                      [1 ahead]
fix/vercel-lockfile-emergency               [1 ahead]
iter92-emergent                             [1 ahead]
```

### Größere Branches — investigieren bevor löschen (26 Branches)

`docs/branching-convention` und `claude/legal-and-consent` haben nur
2 ahead — schau ob's wertvoll war. Der Rest sind alte Iterationen.

```
claude/add-supabase-mcp-server-wVHPR        [9 ahead]
claude/auth-race-fixes                      [19 ahead]
claude/check-status-indicators-MlDyM        [11 ahead]
claude/cleanup-ci-workflow-QiBAS            [9 ahead]
claude/fix-xss-report-generator-9vIjG       [8 ahead]
claude/framer-mcp-relay-Ot1Oh               [9 ahead]
claude/install-supabase-cli-Z8CF9           [13 ahead]
claude/integrate-sentry-mcp-BV4Ev           [9 ahead]
claude/legal-and-consent                    [2 ahead]
claude/mcp-server-integration-WWmJL         [9 ahead]
claude/rename-default-branch-KQrTc          [10 ahead]
claude/setup-posthog-eu-Oy6Ly               [10 ahead]
docs/branching-convention                   [2 ahead]
emergent-iter-92.18                         [9 ahead]
emergent-iter-92.21                         [12 ahead]
emergent-iter-92.23.5                       [22 ahead]
emergent-iter-92.24-contextfeature          [38 ahead]
feat/folder-surfaces                        [2 ahead]
feat/hybrid-rag-fusion                      [3 ahead]
feat/landing-fixes-typography-svg           [2 ahead]
feat/landing-page-direction-a               [2 ahead]
feat/revolut-premium-design-upgrade         [2 ahead]
feat/stripe-admin-fn                        [3 ahead]
feat/taste-skill-mypath                     [2 ahead]
feat/taste-skill-sprint                     [3 ahead]
fix/rag-simulations                         [2 ahead]
fix/sexier-framework-correct-name           [3 ahead]
fix/stripe-onetime-no-customer              [2 ahead]
railway/fix-deploy-1d4120                   [14 ahead]
```

**Faustregel:** Wenn der Branch ein gemergter PR hat → löschen. Wenn
nicht und der Name nichts wertvolles andeutet → auch löschen. Die
alten `emergent-iter-*` und `iter*-emergent` sind alle obsolet
(Emergent-Auto-Save aus Pre-shipos-Zeit).

## Empfohlene Reihenfolge

1. **Heute Abend / morgen früh:** alle 19 aus Sektion 2 in einem Rutsch
2. **Diese Woche:** die 18 "1 ahead" durchschauen, ~15 davon werden
   sich als gemergt herausstellen
3. **Nächste Woche:** großer Pass durch Sektion 3 — mit dem Ziel auf
   **<10 lebende Branches** zu kommen

## Ziel-State

| | Heute | Nach Cleanup |
|---|---|---|
| Total Branches | 68 | ≈8 |
| Active (rebased weekly) | ? | 1–3 (current work) |
| Long-lived (protected) | 1 (`mvpcode`) | 2 (`mvpcode`, `backup/*`) |
