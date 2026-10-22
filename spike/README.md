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
| Admin login, cookies, client IP | `SPIKE_BASE_URL=… npx tsx --env-file=.env.local scripts/check-auth.ts` (after the admin login steps below) | W1-3a…W1-3h |
| Simultaneous bookings | `SPIKE_BASE_URL=… npx tsx --env-file=.env.local scripts/race.ts` (needs `SPIKE_SESSION_POOLER_URL` and `SUPABASE_DB_CA`; takes about 70 s) | W1-2a, W1-2b |

## Applying the spike migrations (developer)

```bash
supabase db push --db-url "$SPIKE_SESSION_POOLER_URL"   # as postgres, session pooler 5432
# then, once, as postgres (passwords from your password manager; never committed):
#   alter role app_rw password '…';  alter role app_backup password '…';
```

`DATABASE_URL` for the app is `app_rw.<project-ref>` on the transaction pooler (6543), with no `sslmode`.

## Admin login (item 3, developer)

1. Apply `0002_admin_auth.sql` as above.
2. On Vercel, set `BETTER_AUTH_SECRETS` to `1:` followed by `openssl rand -base64 32`, and `SITE_URL` to the deployed address, for the build too (the build loads the auth module). Deploy.
3. Create the admin: put `SPIKE_ADMIN_EMAIL` in `.env.local`, then run `npx tsx --conditions=react-server --env-file=.env.local scripts/seed-admin.ts`. It prints the password once; store it in your password manager and in `SPIKE_ADMIN_PASSWORD` in `.env.local`.
4. Open `/admin/login`, sign in, and set up the authenticator app. Put the key shown there in `SPIKE_TOTP_SECRET` in `.env.local`. Keep the backup codes on paper.
5. Run `check-auth.ts`.
