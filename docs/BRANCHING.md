# Branching & naming convention

The bar: a newcomer should understand any branch or PR from its name alone, and
the branch list should read like a changelog — not an archaeology dig. Boring,
consistent, predictable.

## Branch names

```
<type>/<short-kebab-summary>
```

`<type>` is one of a small, fixed set:

| type        | use for                                              | example                          |
| ----------- | ---------------------------------------------------- | -------------------------------- |
| `feat`      | new user-facing capability                           | `feat/hybrid-rag-fusion`         |
| `fix`       | bug fix                                              | `fix/stripe-onetime-no-customer` |
| `docs`      | documentation only                                   | `docs/branching-convention`      |
| `chore`     | tooling, deps, CI, no product change                 | `chore/ruff-mypy-ci`             |
| `refactor`  | behaviour-preserving restructuring                   | `refactor/rag-services-split`    |

Rules:
- **kebab-case**, lower-case, no spaces; 2–5 words. The summary names the
  *outcome*, not the file (`fix/voice-rag-grounding`, not `fix/voice-tts-py`).
- **One concern per branch** → one PR → one reviewable diff.
- Branch off `mvpcode`; keep it short-lived. Long-running branches drift and
  become the merge-pain we keep paying for.
- No personal/agent prefixes (`claude/…`, initials). The work is the work.

## PR titles

Conventional-commit style, matching the branch type:

```
feat(rag): hybrid retrieval — vector + German full-text, fused by RRF
fix(stripe): activate one-time payments when Stripe skips the Customer
```

`type(scope): imperative summary`. Scope is the subsystem (`rag`, `stripe`,
`folders`, `quality`, `ci`). This is what the squash-merge commit on `mvpcode`
becomes, so it reads as a clean history.

## Lifecycle

1. Branch from `mvpcode`.
2. Open a PR early; let CI run (constants-drift, lockfile-guard, backend syntax,
   frontend build).
3. Squash-merge into `mvpcode`.
4. **Delete the head branch on merge.**
   → Repo **Settings → General → "Automatically delete head branches"**. Turn it
   on once; every future merged branch self-cleans. This is the single highest-
   leverage cleanup action.

## Protected & special branches

| branch                              | meaning                                            | keep? |
| ----------------------------------- | -------------------------------------------------- | ----- |
| `mvpcode`                           | production source of truth                         | ✅ protected |
| `backup/mvpcode-pre-emergent-*`     | pre-migration safety snapshot                      | ✅ archive |
| `emergent-iter-*`, `iter-*-emergent`| Emergent pod snapshots (full-tree, old base)       | ✅ archive — restore-from, never merge whole |

Pod snapshots are **archive insurance**, not merge candidates: they carry an old
base and would delete current work (legal pages, CI guards, stripe-webhook). The
correct pattern is the surgical cherry-pick we used for the folder feature and
the RAG fixes — lift the one changed file onto a fresh branch off `mvpcode`.

## One-time cleanup (current repo)

GitHub's web UI can't bulk-delete, and this environment's git proxy blocks
`push --delete`, so this is a manual pass in **Branches → (trash icon)**.

**Safe to delete now** — fully contained in `mvpcode` (verified `git rev-list
mvpcode..<branch>` = 0), not an open PR, not an archive:

```
chore/ci-hardening
claude/csp-allowlist-fix
claude/godmode-followup
claude/godmode-launch-prep
claude/launch-day-prep
claude/security-hardening-tonight
docs/system-overview
feat/enterprise-diagnosis-emails
feat/enterprise-emails
fix/lockfile-guard-always-run
fix/rag-context-budget
fix/video-upload-size-limit
fix/voice-prompt-framework-citation
feature/folder-context-wingman   # merged via #49
```

**Triage (stale experiments, likely delete after a glance)** — these have
commits not in `mvpcode`; confirm nothing unmerged is worth keeping, then delete:

```
claude/add-supabase-mcp-server-wVHPR   claude/add-vimeo-links-9cL3u
claude/auth-race-fixes                 claude/check-status-indicators-MlDyM
claude/cleanup-ci-workflow-QiBAS       claude/framer-mcp-relay-Ot1Oh
claude/install-supabase-cli-Z8CF9      claude/integrate-sentry-mcp-BV4Ev
claude/legal-and-consent               claude/mcp-server-integration-WWmJL
claude/rename-default-branch-KQrTc     claude/setup-posthog-eu-Oy6Ly
docs/app-architecture                  feat/design-skills
feat/stripe-admin-fn                   feat/taste-skill-mypath
feat/taste-skill-sprint                fix/duplicate-imports
fix/lockfile-sync                      fix/rag-everywhere
fix/rag-simulations                    fix/vercel-build-complete
fix/vercel-build-final                 fix/vercel-lockfile-emergency
railway/fix-deploy-1d4120
```

**Keep**: `mvpcode`, `backup/mvpcode-pre-emergent-2026-05-17`, all
`emergent-iter-*` / `iter-*-emergent` / `merge/emergent-iter-*`, and any branch
with an open PR.

After this pass + the auto-delete toggle, the branch list stays at roughly
`mvpcode` + a handful of in-flight `feat|fix|docs/*` + the archive snapshots.
