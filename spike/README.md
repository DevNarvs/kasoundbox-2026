# Week-1 spike (throwaway)

Quick probes that settle the week-1 [U] facts on the **test** project (D-28). This folder is deleted after the go/no-go (D-32). Results go in `docs/06-delivery/week1-results.md`.

Plan: `docs/superpowers/plans/2026-10-21-week1-spike.md`.

## Setup (developer machine)

1. Copy `.env.example` to `.env.local` and fill it with the **test** project's values. Never commit it.
2. `npm ci`
3. Deploy: `npx vercel deploy --prod` (the Vercel project's root directory is `spike/`).

## Probes

Every probe prints `PASS <id> <detail>` or `FAIL <id> <detail>` and exits non-zero on any failure.

| Probe | Command | Settles |
|---|---|---|
| Health and region | `SPIKE_BASE_URL=https://<test-app> npx tsx scripts/check-health.ts` | W1-1e, W1-1f |
| Pooler, TLS, timeouts, latency | `SPIKE_BASE_URL=… npx tsx scripts/check-db.ts` (after 15+ idle minutes: `COLD=1 … check-db.ts`) | W1-1a…W1-1d |

## Applying the spike migrations (developer)

```bash
supabase db push --db-url "$SPIKE_SESSION_POOLER_URL"   # as postgres, session pooler 5432
# then, once, as postgres (passwords from your password manager; never committed):
#   alter role app_rw password '…';  alter role app_backup password '…';
```

`DATABASE_URL` for the app is `app_rw.<project-ref>` on the transaction pooler (6543), with no `sslmode`.
