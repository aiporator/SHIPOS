"""Test-User Cleanup — safely removes @wladbot.test seed accounts from any MongoDB.

Usage:
  # Preview (default — uses backend/.env MONGO_URL):
  python3 scripts/cleanup-test-users.py

  # Production (explicit URI, requires confirmation):
  MONGO_URL="mongodb+srv://<prod>" python3 scripts/cleanup-test-users.py --confirm-production

The script is intentionally chatty and idempotent. It will:
  1. Show every user it's about to delete (email + tier + created_at)
  2. Require explicit y/n confirmation
  3. Refuse to run against a URI containing "prod" or "atlas" without --confirm-production
"""
from __future__ import annotations

import argparse
import asyncio
import os
import re
import sys

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Allow `from backend...` if launched from /app, but fall back to env-only.
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE, "backend", ".env"))

TEST_EMAIL_PATTERN = re.compile(r"@wladbot\.test$", re.IGNORECASE)


async def cleanup(uri: str, db_name: str, dry_run: bool, force: bool) -> int:
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    print(f"\n▸ Connected to: {db_name} on {uri.split('@')[-1].split('/')[0]}")

    cursor = db.users.find({"email": {"$regex": "@wladbot\\.test$", "$options": "i"}},
                           {"_id": 0, "email": 1, "tier": 1, "created_at": 1, "user_id": 1})
    docs = await cursor.to_list(length=200)
    if not docs:
        print("✓ No @wladbot.test users found — nothing to do.\n")
        return 0

    print(f"\n▸ Found {len(docs)} test users to delete:")
    print(f"  {'EMAIL':<40} {'TIER':<14} {'CREATED':<25}")
    print(f"  {'-'*40} {'-'*14} {'-'*25}")
    for d in docs:
        print(f"  {d.get('email',''):<40} {(d.get('tier') or 'free'):<14} {str(d.get('created_at',''))[:24]}")

    if dry_run:
        print("\n(dry-run — no changes applied)\n")
        return 0

    if not force:
        ans = input(f"\n⚠ Delete these {len(docs)} users? Type 'DELETE' to confirm: ").strip()
        if ans != "DELETE":
            print("Aborted (input != DELETE).\n")
            return 1

    user_ids = [d["user_id"] for d in docs if d.get("user_id")]
    results = await asyncio.gather(
        db.users.delete_many({"email": {"$regex": "@wladbot\\.test$", "$options": "i"}}),
        db.user_sessions.delete_many({"user_id": {"$in": user_ids}}) if user_ids else _noop(),
        db.daily_checkins.delete_many({"user_id": {"$in": user_ids}}) if user_ids else _noop(),
        db.chat_sessions.delete_many({"user_id": {"$in": user_ids}}) if user_ids else _noop(),
        db.video_analyses.delete_many({"user_id": {"$in": user_ids}}) if user_ids else _noop(),
    )

    print("\n✓ Deletion summary:")
    print(f"  users.deleted:           {results[0].deleted_count}")
    print(f"  user_sessions.deleted:   {results[1].deleted_count}")
    print(f"  daily_checkins.deleted:  {results[2].deleted_count}")
    print(f"  chat_sessions.deleted:   {results[3].deleted_count}")
    print(f"  video_analyses.deleted:  {results[4].deleted_count}")
    print()
    return 0


class _NoopResult:
    deleted_count = 0


async def _noop():
    return _NoopResult()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="show what would be deleted, then exit")
    parser.add_argument("--force", action="store_true", help="skip interactive confirmation")
    parser.add_argument("--confirm-production", action="store_true",
                        help="required if MONGO_URL contains 'prod' or 'atlas' or 'mongodb+srv'")
    args = parser.parse_args()

    uri = os.environ.get("MONGO_URL", "")
    db_name = os.environ.get("DB_NAME", "")
    if not uri or not db_name:
        print("✗ MONGO_URL or DB_NAME missing in environment.", file=sys.stderr)
        sys.exit(1)

    looks_prod = bool(re.search(r"(prod|atlas|mongodb\+srv)", uri, re.IGNORECASE))
    if looks_prod and not args.confirm_production:
        print("\n✗ This URI looks like PRODUCTION:")
        print(f"  {uri.split('@')[-1].split('/')[0]}")
        print("\n  If you are SURE, re-run with: --confirm-production\n", file=sys.stderr)
        sys.exit(2)

    sys.exit(asyncio.run(cleanup(uri, db_name, args.dry_run, args.force)))


if __name__ == "__main__":
    main()
