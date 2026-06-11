# Branch Cleanup — proposal, not executed

> 68 remote branches → unübersichtlich, aber **kein Launch-Blocker**.
> Vercel deployt nur den Production-Branch (`mvpcode`), egal wie viele
> Branches im Repo liegen. Diese Liste ist eine Putz-Empfehlung für
> nach dem Launch, NICHT für heute Nacht.

## Behalten (5 Branches)

| Branch                              | Grund                                              |
|-------------------------------------|----------------------------------------------------|
| `mvpcode`                           | Production                                         |
| `backup/mvpcode-pre-emergent-2026-05-17` | Last-known-good vor Emergent-Migration        |
| `claude/add-vimeo-links-9cL3u`      | Aktive Nike-DNA-Arbeit, PR #66 offen               |
| `data/wlad-corpus-v3-fill-gaps`     | RAG-Corpus, falls Re-Indexing nötig                |
| `chore/ci-hardening`                | Falls noch Pending-CI-Fixes drauf liegen — prüfen  |

## Löschkandidaten — Iter-Branches (8)

Alle `emergent-iter-*` und `iter-*-emergent` sind alte Iterationen von
Emergent's Auto-Save. Sind alle in `mvpcode` gemergt oder verworfen.

```
emergent-iter-92.13
emergent-iter-92.18
emergent-iter-92.21
emergent-iter-92.23.5
emergent-iter-92.24-contextfeature
iter-80-emergent
iter-82-emergent
iter-83-emergent
iter92-emergent
merge/emergent-iter-92.13
```

## Löschkandidaten — alte `claude/*` Spike-Branches (≈18)

`claude/*`-Branches sind temporäre Agent-Worktrees. Wenn der Commit in
`mvpcode` ist → weg damit.

```
claude/add-supabase-mcp-server-wVHPR
claude/auth-race-fixes
claude/check-status-indicators-MlDyM
claude/cleanup-ci-workflow-QiBAS
claude/csp-allowlist-fix
claude/fix-xss-report-generator-9vIjG
claude/framer-mcp-relay-Ot1Oh
claude/godmode-followup
claude/godmode-launch-prep
claude/install-supabase-cli-Z8CF9
claude/integrate-sentry-mcp-BV4Ev
claude/launch-day-prep
claude/legal-and-consent
claude/mcp-server-integration-WWmJL
claude/rename-default-branch-KQrTc
claude/security-hardening-tonight
claude/setup-posthog-eu-Oy6Ly
```

## Löschkandidaten — gemergte feat/fix (≈30)

Vor dem Löschen prüfen: `git log --oneline mvpcode..<branch>` sollte
leer sein.

```
docs/app-architecture
docs/branching-convention
docs/system-overview
feat/design-skills
feat/enterprise-diagnosis-emails
feat/enterprise-emails
feat/folder-surfaces
feat/framework-mastery-quality-audit
feat/hybrid-rag-fusion
feat/landing-circle-rename
feat/landing-cleanup-real-photos
feat/landing-client-ready
feat/landing-fixes-typography-svg
feat/landing-page-direction-a
feat/landing-real-corner-copy
feat/output-style-knowledge-transfer
feat/premium-polish-phase3
feat/revolut-premium-design-upgrade
feat/stripe-admin-fn
feat/taste-skill-mypath
feat/taste-skill-sprint
feature/folder-context-wingman
fix/duplicate-imports
fix/lockfile-guard-always-run
fix/lockfile-sync
fix/rag-context-budget
fix/rag-everywhere
fix/rag-simulations
fix/sexier-framework-correct-name
fix/stripe-onetime-no-customer
fix/vercel-build-complete
fix/vercel-build-final
fix/vercel-lockfile-emergency
fix/video-upload-size-limit
fix/voice-prompt-framework-citation
railway/fix-deploy-1d4120
```

## Wie ausführen (POST-LAUNCH, nicht heute)

```bash
# Pro Branch prüfen ob gemergt:
git log --oneline mvpcode..<branch>   # leer = sicher zu löschen

# Bulk-Delete remote:
git push origin --delete <branch1> <branch2> ...

# Lokal clean:
git remote prune origin
```

**Niemals löschen ohne den `git log mvpcode..<branch>`-Check** — auf
einigen Branches könnten noch unmergte Experimente sein die du
brauchen willst.
