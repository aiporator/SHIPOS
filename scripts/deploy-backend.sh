#!/usr/bin/env bash
# Pull latest mvpcode from GitHub and restart the FastAPI backend on Emergent.
# Run this from the repo root inside the Emergent shell whenever a backend
# change has been merged on GitHub.
#
# Usage:  bash scripts/deploy-backend.sh [--branch <name>]
#
# Exit codes:
#   0  deploy succeeded and /api/health returned 200
#   1  uncommitted changes on Emergent (refuses to clobber)
#   2  git pull failed
#   3  pip install failed
#   4  supervisor restart failed
#   5  /api/health did not return 200 after restart

set -euo pipefail

BRANCH="${BRANCH:-mvpcode}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8001/api/health}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2 ;;
    --health) HEALTH_URL="$2"; shift 2 ;;
    *) echo "unknown flag: $1" >&2; exit 64 ;;
  esac
done

echo ">> branch:     $BRANCH"
echo ">> health URL: $HEALTH_URL"

# 1. Refuse to deploy on top of uncommitted edits — they'd be either lost
#    (if `git pull` succeeds with no conflicts) or block the pull entirely.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: uncommitted changes present on Emergent. Either commit & push" >&2
  echo "       them, or stash, before deploying. See \`git status\`." >&2
  exit 1
fi

# 2. Fetch + fast-forward. No merge commits on the deploy host.
echo ">> git fetch + ff-only pull"
git fetch origin "$BRANCH"
if ! git checkout "$BRANCH"; then
  echo "ERROR: could not checkout $BRANCH" >&2
  exit 2
fi
if ! git pull --ff-only origin "$BRANCH"; then
  echo "ERROR: fast-forward pull failed (Emergent has commits not in origin?)" >&2
  exit 2
fi

OLD_SHA=$(git rev-parse --short HEAD@{1} 2>/dev/null || echo "?")
NEW_SHA=$(git rev-parse --short HEAD)
echo ">> $OLD_SHA -> $NEW_SHA"

# 3. Only reinstall deps if requirements.txt actually changed.
if git diff --name-only "HEAD@{1}" HEAD 2>/dev/null | grep -q '^backend/requirements.txt$'; then
  echo ">> requirements.txt changed; pip install"
  if ! pip install -r backend/requirements.txt; then
    echo "ERROR: pip install failed" >&2
    exit 3
  fi
else
  echo ">> requirements.txt unchanged; skipping pip install"
fi

# 4. Restart backend via supervisor.
echo ">> supervisorctl restart backend"
if ! sudo supervisorctl restart backend; then
  echo "ERROR: supervisor restart failed" >&2
  exit 4
fi

# 5. Wait for /api/health to come back up.
echo ">> waiting for /api/health"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS --max-time 2 "$HEALTH_URL" >/dev/null 2>&1; then
    echo ">> healthy after ${i}s"
    echo ">> DONE   $OLD_SHA -> $NEW_SHA"
    exit 0
  fi
  sleep 1
done

echo "ERROR: /api/health did not return 200 within 10s. Tail the log:" >&2
echo "       sudo tail -n 200 /var/log/supervisor/backend.err.log" >&2
exit 5
