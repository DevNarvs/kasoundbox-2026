#!/usr/bin/env bash
# W1-7d: restore an encrypted nightly dump into a fresh Postgres container of the same major version,
# then compare row counts and checksums with the values the workflow logged at dump time.
# Usage: scripts/restore-check.sh <db-YYYYMMDD.dump.age> <age-key-file>
# Expects db-YYYYMMDD.meta (from the same artifact) next to the dump.
set -euo pipefail

dump_age=${1:?usage: restore-check.sh <dump.age> <age-key-file>}
key=${2:?usage: restore-check.sh <dump.age> <age-key-file>}
meta="${dump_age%.dump.age}.meta"
[ -f "$meta" ] || { echo "FAIL W1-7d missing $meta"; exit 1; }
major=$(sed -n 's/^server_major=//p' "$meta")
tables=$(sed -n 's/^count\.\(.*\)=.*/\1/p' "$meta")

work=$(mktemp -d)
name="spike-restore-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT

started=$(date +%s)
age -d -i "$key" -o "$work/db.dump" "$dump_age" || { echo "FAIL W1-7d cannot decrypt with $key"; exit 1; }
chmod 644 "$work/db.dump"
docker run -d --name "$name" -e POSTGRES_PASSWORD="$(openssl rand -hex 16)" -v "$work:/work:ro" "postgres:$major" >/dev/null
for _ in $(seq 1 60); do docker exec "$name" pg_isready -U postgres -q 2>/dev/null && break; sleep 1; done
sleep 2 # the image restarts the server once after its first init
for _ in $(seq 1 60); do docker exec "$name" pg_isready -U postgres -q 2>/dev/null && break; sleep 1; done
docker exec "$name" pg_restore -U postgres -d postgres --no-owner --no-privileges --exit-on-error /work/db.dump \
  || { echo "FAIL W1-7d pg_restore failed"; exit 1; }

fail=0
summary=()
for t in $tables; do
  want_count=$(sed -n "s/^count\.$t=//p" "$meta")
  want_sum=$(sed -n "s/^md5\.$t=//p" "$meta")
  got_count=$(docker exec "$name" psql -U postgres -Atc "select count(*) from $t")
  got_sum=$(docker exec "$name" psql -U postgres -Atc "select coalesce(md5(string_agg(x::text, '|' order by x::text collate \"C\")), '') from $t x")
  if [ "$want_count" != "$got_count" ]; then echo "FAIL W1-7d $t $want_count $got_count"; fail=1; fi
  if [ "$want_sum" != "$got_sum" ]; then echo "FAIL W1-7d $t checksum $want_sum $got_sum"; fail=1; fi
  summary+=("$t=$got_count")
done
[ "$fail" -eq 0 ] || exit 1
echo "PASS W1-7d restored into postgres:$major in $(( $(date +%s) - started ))s; ${summary[*]}; checksums match"
