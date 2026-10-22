# Week-1 Spike Results

> **Purpose:** The record of the week-1 test: each unverified [U] fact, its pass criteria, and what actually happened on the test project ·
> **Audience:** The developer (Super Admin); the go / no-go summary is for the business owner (Admin) too ·
> **Status:** In progress — filled in during the week-1 test ·
> **Last updated:** 2026-10-22 ·
> **Depends on:** [Test plan](test-plan.md) §4, [Architecture](../05-technical/architecture.md) §14.1, [Roadmap](roadmap.md) §1.4 ·
> **Derived from:** the [week-1 spike plan](../superpowers/plans/2026-10-21-week1-spike.md)

## In plain words

Before building the real system, we test the risky technical parts on a separate test project (D-28). Each row below is one thing we are not yet sure of. When the week is done, every row has a result, and the go / no-go decision is recorded in the [decision log](../00-project/decision-log.md) (D-31). The test code itself is thrown away (D-32); this note is kept.

## Test project

| What | Value |
|---|---|
| Supabase project (Singapore) | kasoundbox-test |
| Postgres major version | *(fill in when the project is created)* |
| Vercel project (`sin1`) | kasoundbox-test |
| Test run dates | *(fill in)* |

## Results

Pass criteria are copied word for word from [test plan](test-plan.md) §4. `W1-1e` and `W1-1f` are extra checks added by the spike plan.

| Check ID | Item | [U] fact | Pass criteria | Result | Evidence | Fix / fallback | Owning doc updated |
|---|---|---|---|---|---|---|---|
| W1-1a | 1. `sin1` ↔ pooler | Verified TLS with the Supabase CA works against the pooler | Connects with `rejectUnauthorized: true` and the CA; a wrong CA fails |  |  | No-go until solved; TLS is never turned off without a decision in the decision log |  |
| W1-1b | 1. `sin1` ↔ pooler | Role timeouts set on `app_rw` apply through the shared pooler | Through port 6543: `57014` after the statement timeout, `55P03` after the lock timeout, `25P03` after the idle timeout |  |  | Set them with `SET LOCAL` inside each function and run again |  |
| W1-1c | 1. `sin1` ↔ pooler | The pooler accepts a SCRAM role with no `VALID UNTIL`; the direct host is unreachable from Vercel | Pooler login works; the IPv6 direct host fails, as expected |  |  | Fix the role; record |  |
| W1-1d | 1. `sin1` ↔ pooler | Latency from `sin1` to the database | Numbers recorded (p50, p95); the speed target, the p95 plus a safety margin, is set at go / no-go (D-31) |  |  | — |  |
| W1-1e | 1. `sin1` ↔ pooler | Functions run in `sin1` (Singapore) | `/api/health` reports `region` = `sin1` |  |  | Fix `vercel.json` regions; no-go until it runs in `sin1` |  |
| W1-1f | 1. `sin1` ↔ pooler | The database's "today" is the Manila date | `/api/health` `manilaToday` equals today's date in Asia/Manila |  |  | Fix the SQL time-zone conversion |  |
| W1-2a | 2. Booking under load | Exactly one success from parallel requests on the deployed function | 5 runs × 20 requests: exactly 1 `ok` per run, the rest `sold_out`; no "prepared statement" errors, no idle-in-transaction sessions, no lock timeouts |  |  | No-go: fix the driver or pool settings ([arch][arch] §6.2) and run again |  |
| W1-2b | 2. Booking under load | The pooler's client count stays stable | No growth after the runs |  |  | Lower the pool settings; record |  |
| W1-3a | 3. Login on Vercel | The `@node-rs/argon2` binary loads in Vercel's Node.js runtime | Login works; the stored hash is argon2id |  |  | Switch to the scrypt fallback of [sec][sec] §4.1; record |  |
| W1-3b | 3. Login on Vercel | Which client-IP header Vercel sets and the client cannot override | One header found that a spoofed value cannot change |  |  | Per-IP limits stay loose and the per-account and per-code limits carry the load; decision recorded |  |
| W1-3c | 3. Login on Vercel | The cookie flags | `HttpOnly`, `Secure`, `SameSite=Strict`, `__Secure-` prefix |  |  | Fix the configuration |  |
| W1-3d | 3. Login on Vercel | Logged-out admin actions are refused on Vercel | Refused |  |  | No-go |  |
| W1-3e | 3. Login on Vercel | Whether Better Auth's limiter or session rows store raw IPs; how the session hook behaves | No raw IP in any row after the hook |  |  | Turn the built-in limiter off and use the database counters ([arch][arch] open question 16) |  |
| W1-3f | 3. Login on Vercel | The TOTP secret is stored encrypted; whether hashed backup codes are possible | The secret is not readable in the row; the backup-code answer recorded |  |  | Record; [sec][sec] open question 5 decides |  |
| W1-3g | 3. Login on Vercel | Better Auth's tables work in their own schema (`admin_auth`); its column names in 1.7 | Tables in `admin_auth`; column names recorded |  |  | Use the fallback of [data][data] §2.1 |  |
| W1-3h | 3. Login on Vercel | The environment variable names Better Auth 1.7.12 reads | Names confirmed |  |  | Record the right names |  |
| W1-4a | 4. Timers and email | `pg_cron`, `pg_net`, Vault, and `pgcrypto` exist on Supabase Free | All enable; the every-minute jobs run on time for 24 hours |  |  | No-go; the timer design is decided again |  |
| W1-4b | 4. Timers and email | `pg_net`'s default timeout, and whether a timeout stops the Vercel function it called | Recorded; the explicit timeout is honoured |  |  | Record; adjust the timeout |  |
| W1-4c | 4. Timers and email | Resend honours the idempotency key, and for how long | The same key twice within a minute sends one email |  |  | The outbox's own unique key still holds; record |  |
| W1-4d | 4. Timers and email | How Resend counts the admin emails, one per admin recipient | Recorded |  |  | Record |  |
| W1-4e | 4. Timers and email | `after()` runs after the reply on Vercel | The email leaves after the response returns |  |  | The tick sends it instead; record |  |
| W1-4f | 4. Timers and email | Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; may fire late or twice | The header arrives; a second call does nothing twice |  |  | Call the daily route from `pg_net` instead; record |  |
| W1-4g | 4. Timers and email | The Sentry check-in and cron monitor work on the free plan | Check-ins arrive; stopping them raises an alert |  |  | Alert from the daily route only; record |  |
| W1-4h | 4. Timers and email | The keep-alive counts as activity | No pause warning from Supabase |  |  | Outside traffic covers it ([arch][arch] §14); record |  |
| W1-5a | 5. Signed upload | Bucket size and type limits are enforced on hosted signed uploads | A 1.1 MB file and an SVG are refused by Storage, or caught by the server check |  |  | Either way the server check stays; record |  |
| W1-5b | 5. Signed upload | A signed upload link can be reused while it is valid | Recorded; the app's slot states still give single use |  |  | Record |  |
| W1-5c | 5. Signed upload | Storage keeps working with the Data API turned off | Upload works with the Data API off; it is then left off |  |  | Keep it on with the posture of [data][data] §2.4 |  |
| W1-5d | 5. Signed upload | The dashboard setting names for exposure | Recorded |  |  | Record |  |
| W1-6a | 6. QR scanning | The self-hosted WASM scanner works on the owner's real phone and laptop over HTTPS | 5 of 5 codes read on each device; the screenshot fallback works |  |  | No-go for the scan page until fixed; search by code still works |  |
| W1-6b | 6. QR scanning | A QR link opened from the phone's camera app carries the SameSite=Strict cookie | The logged-in admin sees the reservation |  |  | Admins open QR codes from the scan page; record, and tell the [staff guide][staff] |  |
| W1-7a | 7. Backup and restore | `pg_dump` through the session pooler with the read-only role; a PGDG client that matches the server | The dump completes and is encrypted |  |  | No-go until fixed |  |
| W1-7b | 7. Backup and restore | Supabase's Postgres major version | Recorded; the guard tests (TC-DB-05, TC-DB-09) pass on it |  |  | Record |  |
| W1-7c | 7. Backup and restore | Whether GitHub's `schedule` takes a time zone | Recorded; the cron written accordingly |  |  | Write it in UTC |  |
| W1-7d | 7. Backup and restore | A restore into a fresh Postgres works | TC-NFR-16 passes |  |  | No-go |  |
| W1-8a | 8. Usage | The Hobby allotments, and real usage against them | Usage after the load run is far below every allotment |  |  | Reduce usage first; a paid plan is a new decision ([nfr][nfr] NFR-01) |  |
| W1-8b | 8. Usage | The GitHub Actions minutes allowance for a private repository | The estimated monthly minutes fit |  |  | Run fewer jobs on each push ([arch][arch] §11.1); record |  |
| W1-9a | Also checked in week 1 | `updateTag` also refreshes prerendered page shells on Vercel | The packages page shows a price change at once |  |  | Refresh by path; record |  |
| W1-9b | Also checked in week 1 | No skew protection: an open tab calling an old Server Action gets the reload prompt | The prompt appears; the draft survives |  |  | No-go for the form until fixed |  |
| W1-9c | Also checked in week 1 | The standalone Docker image runs against the real project | A page and `/api/health` answer |  |  | Fix before launch |  |
| W1-9d | Also checked in week 1 | drizzle-kit writes Supabase-style migration names | Names accepted by the Supabase CLI |  |  | Rename by script; record |  |
| W1-9e | Also checked in week 1 | Sentry works with Next.js 16.4 Cache Components | Errors reach Sentry from cached and live pages |  |  | Record; adjust the setup |  |
| W1-9f | Also checked in week 1 | One Vercel Firewall rule can cover several paths | Recorded |  |  | The database limits stay the main control |  |

[arch]: ../05-technical/architecture.md
[data]: ../05-technical/data-model.md
[nfr]: ../01-requirements/non-functional-requirements.md
[sec]: ../05-technical/security.md
[staff]: ../07-operations/staff-guide.md
