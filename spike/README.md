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
| Timers, email, keep-alive | `npx tsx --env-file=.env.local scripts/check-jobs.ts` (after the jobs steps below; takes about 70 s) | W1-4a…W1-4h |
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

## Timers, email, keep-alive (item 4, developer)

1. In the dashboard, enable `pg_cron`, `pg_net`, `supabase_vault` (Vault), and `pgcrypto`.
2. Create the Vault secrets (SQL editor, as postgres): `select vault.create_secret('<SITE_URL>/api/spike/tick', 'tick_url');`, then `job_route_secret` (the same value as `CRON_SECRET`) and `sentry_checkin_url` (the Sentry cron monitor's check-in address, ending `?status=ok`).
3. Apply `0003_jobs.sql`. On Vercel set `CRON_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` (leave `SPIKE_RESEND_URL` unset), then deploy; `vercel.json` adds the daily cron at 02:00 Manila.
4. In `.env.local` set `CRON_SECRET`, `SPIKE_EMAIL_TO`, and `SPIKE_EMAIL_TO_2` (two inboxes you can read).
5. After 24 hours, run `check-jobs.ts`. Check both inboxes, and the Resend dashboard for how the two-recipient email was counted.
6. Sentry alert: pause the heartbeat for 15 minutes with `select cron.alter_job((select jobid from cron.job where jobname = 'spike_heartbeat'), active := false);`, confirm the alert, then set `active := true` again.
7. After 7 days, run `check-jobs.ts` again and note whether Supabase sent a pause warning. Other week-1 traffic also reached the project, so this does not isolate the in-database keep-alive.
