# Week-1 spike (throwaway)

Quick probes that settle the week-1 [U] facts on the **test** project (D-28). This folder is deleted after the go/no-go (D-32). Results go in `docs/06-delivery/week1-results.md`.

Plan: `docs/superpowers/plans/2026-10-21-week1-spike.md`.

Every probe prints `PASS <id> <detail>` or `FAIL <id> <detail>` and exits non-zero on any failure. A line that says `recorded:` is a measurement for the results note, not a verdict.

## 1. First-time setup, in this order

The build reads the database (the catalog page is prerendered from it), so the database must be ready before the first deploy.

1. **Accounts.** A test Supabase project in Southeast Asia (Singapore); a Vercel project whose root directory is `spike/` (`vercel.json` pins `sin1`); Resend; Sentry. Keep the GitHub repository private (O-06).
2. **Supabase dashboard.**
   1. Enable the extensions `pg_cron`, `pg_net`, `supabase_vault` (Vault), and `pgcrypto`. Migration 0003 stops if they are missing.
   2. Create the private bucket `payment-proofs`: file size limit 1 MB, allowed MIME types `image/jpeg, image/png, image/webp`.
   3. Download the database CA certificate (Database settings, SSL).
3. **`.env.local`.** Copy `.env.example` to `.env.local` and fill **both** parts. Never commit it. Then `npm ci`.
4. **Migrations, all at once** (as postgres, through the session pooler). The shell does not read `.env.local`, so export the two values first, in single quotes so a `$` in a password stays as it is:

   ```bash
   export SPIKE_SESSION_POOLER_URL='<from .env.local>'
   export PGSSLMODE=verify-full PGSSLROOTCERT=<path to the downloaded CA file>
   npx supabase db push --db-url "$SPIKE_SESSION_POOLER_URL"
   ```

   It applies 0001–0005 in order. `spike_tick` is created switched off (see section 3).
5. **Role passwords.** In the same shell, connect with `psql "$SPIKE_SESSION_POOLER_URL"` (TLS verified through `PGSSLMODE`) and run `\password app_rw`, then `\password app_backup`. `\password` keeps the password out of the logs and the shell history. Use the same passwords in `DATABASE_URL`, `SPIKE_DIRECT_DATABASE_URL`, and the backup secret.
6. **Sentry.** Create a cron monitor with a 5-minute schedule and a few minutes of margin, and copy its check-in URL (ending `?status=ok`).
7. **Vault secrets** (SQL editor, as postgres):

   ```sql
   select vault.create_secret('<SITE_URL>/api/spike/tick', 'tick_url');
   select vault.create_secret('<same value as CRON_SECRET>', 'job_route_secret');
   select vault.create_secret('<Sentry check-in URL>', 'sentry_checkin_url');
   ```

8. **Vercel.** Set every name in part 1 of `.env.example` for Production, and nothing from part 2. `SITE_URL` (and `tick_url`, and `SPIKE_BASE_URL` on your machine) must be the production alias: Deployment Protection blocks per-deployment URLs, and both the login's trusted origin and the QR host check use `SITE_URL`.
9. **Deploy:** `npx vercel deploy --prod`.
10. **Admin account.** Run `npx tsx --conditions=react-server --env-file=.env.local scripts/seed-admin.ts`. It prints the password once; put it in your password manager and in `SPIKE_ADMIN_PASSWORD`. Open `/admin/login`, sign in, set up the authenticator app, and put the key it shows in `SPIKE_TOTP_SECRET`. Keep the backup codes on paper.
11. **Backups.** Offline, run `age-keygen -o kasoundbox-backup.key` and keep the key off synced folders; its `age1…` line is the recipient. In GitHub set the secrets `BACKUP_DATABASE_URL` (`app_backup.<project-ref>` on the session pooler, port 5432, no `sslmode`) and `SUPABASE_DB_CA`, and the variable `BACKUP_AGE_RECIPIENT`. `.github/workflows/spike-backup.yml` must be on the default branch before it can be run by hand or on its schedule.

## 2. Probes

Run them from `spike/`. They read `.env.local` (including `SPIKE_BASE_URL`).

| Probe | Command | Settles |
|---|---|---|
| Health, region, Manila date | `npx tsx --env-file=.env.local scripts/check-health.ts` | W1-1e, W1-1f |
| Pooler, TLS, timeouts, latency | `npx tsx --env-file=.env.local scripts/check-db.ts` | W1-1a…W1-1d |
| Cold start | `COLD=1 npx tsx --env-file=.env.local scripts/check-db.ts` (see section 3) | W1-1d-cold |
| Simultaneous bookings | `npx tsx --env-file=.env.local scripts/race.ts` (about 70 s) | W1-2a, W1-2b |
| Admin login, cookies, client IP | `npx tsx --env-file=.env.local scripts/check-auth.ts` | W1-3a…W1-3h |
| Timers, email, keep-alive | `npx tsx --env-file=.env.local scripts/check-jobs.ts` (about 70 s) | W1-4a…W1-4h |
| Signed upload | `npx tsx --env-file=.env.local scripts/check-upload.ts`, then with the Data API off: `SPIKE_DATA_API=off npx tsx --env-file=.env.local scripts/check-upload.ts` | W1-5a…W1-5c |
| Load | `npx tsx --env-file=.env.local scripts/load.ts` (about 70 s) | W1-8a |
| Restore | `scripts/restore-check.sh db-YYYYMMDD.dump.age kasoundbox-backup.key` (needs Docker and `age`) | W1-7d |

## 3. The week, and the traffic it causes

- **Cold start first (W1-1d-cold).** Run it when nothing has reached the site or the database for 15+ minutes: no probes, no browser tabs, and `spike_tick` off. It passes only if the instance started for that request. Its detail shows the time seen from your machine, cold and then warm.
- **W1-1f** checks today's Manila date and also converts a fixed instant (16:30 UTC on 22 Oct, which is already 23 Oct in Manila), so it can be run at any hour.
- **`spike_tick`** (pg_cron → pg_net → the tick route) is off by default, because a call every minute would keep everything warm. To watch that path once, turn it on for about 10 minutes, then off again:

  ```sql
  select cron.alter_job((select jobid from cron.job where jobname = 'spike_tick'), active := true);
  -- 10 minutes later:
  select cron.alter_job((select jobid from cron.job where jobname = 'spike_tick'), active := false);
  ```

  The tick rows then show `source = 'pg_cron'` in `app.job_runs`.
- **After 24 hours**, run `check-jobs.ts` (W1-4a-ontime needs the full 24 hours). **After 7 days**, run it again and note whether Supabase sent a pause warning (W1-4h). Also note which outside traffic reached the project that week: the daily Vercel Cron, the nightly backup, and any probe runs. That is the production-like traffic the keep-alive is judged with.

## 4. Notes per item

**Item 1.** `DATABASE_URL` must be port 6543 as `app_rw`, with no `sslmode`; W1-1c-pooler checks this. W1-1c-direct passes only on a network error (the direct host cannot be reached from `sin1`), and records whether the host has IPv6 and IPv4 addresses.

**Item 2 (race).** Each round must show `concurrent=yes`: two bookings waited on each other in the database. If every round says `instances=1 concurrent=no`, Vercel served all 20 requests from one instance, one after another; record that, and the database-level race is left to the two-connection test harness (D-33). W1-2b and W1-8a only record the pooler's server connections. The verdict on client leaks is the dashboard's pooler **client** chart: screenshot it before and after the race and the load run.

**Item 3 (login).** W1-3a and W1-3e need a working sign-in on the deployment (W1-3c). W1-3b spoofs all three IP headers and names the one to trust.

**Item 4 (timers and email).**
- Use two inboxes you can read for `SPIKE_EMAIL_TO` and `SPIKE_EMAIL_TO_2`.
- If Resend refuses the second recipient of W1-4d (its test sender may only send to the account's own address), verify a domain for `EMAIL_FROM` and run it again, or record W1-4d as blocked.
- Then check both inboxes, and how the Resend dashboard counted the two-recipient email.
- **Sentry alert:** pause the heartbeat for 15 minutes with `select cron.alter_job((select jobid from cron.job where jobname = 'spike_heartbeat'), active := false);`, confirm the alert, then set `active := true` again.

**Item 5 (signed upload).**
- Run the probe with the Data API on, then turn the Data API off in the dashboard and run it with `SPIKE_DATA_API=off`.
- W1-5b reuses the token of a refused upload: "accepted" means a link can be reused while it is valid.
- W1-5d: write down the exact dashboard names of the API exposure settings (exposed schemas, the Data API switch, "automatically expose new tables").

**Item 6 (QR, developer and Admin).** `npm run build` copies the scanner's WASM into `public/zxing/` and checks its checksum.
1. Open `/spike/qr-sheet` on the laptop, and print it too.
2. W1-6a: on the Admin's phone and on the laptop, open `/admin/scan` and scan all 5 codes, from a screen and from paper. The page stops after one code, so reload it between codes. Pass = 5/5 on each device.
3. W1-6a-shot and W1-6a-denied: refuse the camera permission, reload `/admin/scan`, upload a screenshot of a code, and check that the token shows.
4. W1-6b: sign in on the phone at `/admin/login`, then open a code with the phone's own camera app. Record which message `/r/…` shows.

**Item 7 (backup).**
- Run the `spike-backup` workflow by hand. Its log shows W1-7a and W1-7b.
- W1-7c: check GitHub's docs for a `timezone` key on `schedule`. The cron is written in UTC either way.
- Download the artifact (it holds `db-YYYYMMDD.dump.age` and `db-YYYYMMDD.meta`) and run `restore-check.sh`.
- Don't book anything while the workflow runs: the counts are taken just before the dump.

**Items 8 and 9.**
- W1-8a: run `load.ts`, then screenshot the Vercel usage page. Every Hobby allotment must be far below its limit.
- W1-8b: take the backup run time × 30, plus the CI estimate, and compare it with the private-repo Actions allowance.
- W1-9a: signed in, open `/spike/catalog`, change the price, then open the page again in a new tab. The new price must show at once.
- W1-9b:
  1. Open `/spike/form` and type a draft.
  2. Redeploy **without the build cache** (Vercel: Redeploy, untick "Use existing Build Cache").
  3. Submit from the old tab. The reload prompt must show, and the draft must still be there after the reload.

  With the build cache, Next keeps its Server Actions key (`.next/cache/.rscinfo`, 14 days), so unchanged actions keep working across deploys.
- W1-9c:
  - Build with `docker build --secret id=spike_env,src=.env.local -t kasoundbox-spike .`
  - Run with `docker run --rm -p 3000:3000 --env-file <part-1 file without the CA> -e SUPABASE_DB_CA="$(cat <ca file>)" kasoundbox-spike`. Docker env files cannot hold the multi-line CA, so it is passed separately.
  - Check `http://localhost:3000/` and `/api/health`.
- W1-9d:
  1. Run `npx drizzle-kit generate --config w1-9d/drizzle.config.ts --name w19d_probe`.
  2. Copy the file into a scratch folder's `supabase/migrations`.
  3. Run `npx supabase migration list --db-url "$SPIKE_SESSION_POOLER_URL"` there. It only lists; never push it.
- W1-9e: open `/spike/sentry?mode=cached&stamp=1` and `/spike/sentry?mode=live&stamp=2`. Both errors must show in Sentry. Note whether the live one arrives twice.
- W1-9f: in Vercel Firewall, try one rate-limit rule that covers both `/api/spike/book` and `/api/spike/db`. Record whether one rule can match both paths.
