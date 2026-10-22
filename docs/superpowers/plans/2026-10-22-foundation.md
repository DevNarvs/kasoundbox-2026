# Foundation Implementation Plan (draft before D-39)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status: draft.** Written before the week-1 go/no-go (D-39). Do not start it until D-39 says **go** and GitHub access works (O-07) ([roadmap][roadmap] §1.5, entry criteria). Every step that depends on a week-1 result carries a **[W1-…]** tag; before executing a tagged step, read that row of D-39 and of `docs/06-delivery/week1-results.md`, and follow them where they differ from this plan's default.

**Goal:** An empty but complete skeleton: the repository and CI, the whole database structure with its roles and guards, admin login with 2FA, the accounts screen, and the settings screen. It deploys to the test project with online booking closed (milestone M3, [roadmap][roadmap] §1.5, epics E1 to E4).

**Architecture:** One Next.js 16.4.2 app (public and admin route groups) on Vercel `sin1`, over Supabase Postgres reached through the transaction pooler as `app_rw`. Every rule and every write lives in `SECURITY DEFINER` functions in schema `app`. Better Auth 1.7.12 keeps its tables in schema `admin_auth`. The DAL checks the session first in every admin page, action and route, and each database function checks the actor again.

**Tech Stack:** Next.js 16.4.2, React 19.3.1, TypeScript strict, Tailwind and shadcn/ui, Zod 4, Drizzle ORM 0.45.4 and drizzle-kit, `pg` 8.23.1, Better Auth 1.7.12, `@node-rs/argon2` 2.2.2, `@sentry/nextjs`, `uqr`, `libphonenumber-js`, Supabase CLI, pgTAP, Vitest, Playwright, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-21-kasoundbox-design.md` (frozen). The owning docs carry the exact names and values, and this plan cites them by section rather than copying them:
- [data-model][data] owns tables, columns, constraints, enums, settings keys and grants;
- [api-specification][api] owns functions, signatures, result codes and the envelope;
- [security][sec] owns authentication and authorization controls;
- [architecture][arch] owns the stack, layout, pool and CI;
- the [test plan][tp] owns the TC cases.

---

## Global Constraints

**Versions** ([arch][arch] §2.1, [sec][sec] §4.10):
- `next` 16.4.2 (never below 16.4.1); `react` and `react-dom` 19.3.1; the lockfile resolves `sharp` ≥ 0.35.5.
- `better-auth` 1.7.12 (never below 1.7.7).
- `@node-rs/argon2` 2.2.2; `pg` 8.23.1; `pg-pool` 3.14.0; `@vercel/functions` 3.10.2; `drizzle-orm` 0.45.4; `drizzle-zod` 0.8.3; `zod` 4.5 or later, imported as `import * as z from 'zod'`.
- Every other dependency is pinned exactly at setup (`--save-exact`), installed with `npm ci`.
- The Node.js LTS line is pinned in `engines`, `.nvmrc` and the Docker base image ([arch][arch] open question 1).

**Pool** ([arch][arch] §6.2): `new Pool({ connectionString: DATABASE_URL, max: 1, min: 0, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 5_000, query_timeout: 10_000, ssl: { ca: SUPABASE_DB_CA, rejectUnauthorized: true } })`, then `attachDatabasePool(pool)`. The pool is cached on `globalThis` in development. `DATABASE_URL` has no `sslmode`.

**Connection rules:** no `postgres.js`, no named prepared statements, no session `SET`, no session advisory locks, no `LISTEN`, no temp tables. Every write is one `select app.<fn>(...)`. Drizzle's query builder is used for admin reads only.

**Role timeouts** ([data][data] §2.3):
- `app_rw`: `statement_timeout '5s'`, `lock_timeout '2s'`, `idle_in_transaction_session_timeout '10s'`.
- `app_backup`: `15min`, `30s` and `1min`, plus `default_transaction_read_only = on`.

**Database functions** ([api][api] §1.4, [sec][sec] §4.3):
- Each is `VOLATILE`, `SECURITY DEFINER`, owned by `app_owner` (NOLOGIN), with `SET search_path = ''` and every name schema-qualified.
- Each returns `jsonb` `{ ok, code, data | detail }` and reads the time with `app.now()` after its locks are held.
- `EXECUTE` is revoked from `PUBLIC`, both on existing functions and in the default privileges. Each entry point is granted to `app_rw` one by one; internal helpers are never granted to it.

**Table conventions** ([data][data] §4):
- Money is `integer` centavos in `_centavos` columns, `CHECK (… >= 0)`.
- A moment is `timestamptz`, a Manila day is `date`, a wall-clock time is `time`.
- Constraints are named `<table>_<what>_chk | _uq | _fk | _idx`.
- Editable rows carry `version integer NOT NULL DEFAULT 1`.

**Migrations** ([data][data] §10):
- `supabase/migrations` is the only folder.
- Tables, columns, enums, keys and indexes come from the Drizzle schema through `drizzle-kit generate` (never `push`).
- Roles, grants, CHECKs, functions, triggers, views, seed rows and cron schedules are hand-written, created with `npx supabase migration new <name>`.
- Order: extensions and roles → schemas → tables → constraints → functions, views, triggers → grants → seed rows → cron.
- Vault secrets never appear in a migration.

**App rules** ([api][api] §1, [arch][arch] §4, [sec][sec] §4.2, §4.9, §4.10):
- The first line of every admin page, exported admin action and admin route is `requireAdmin()` or `requireRole('superAdmin')`.
- Files in `lib/actions/admin/*` start with `import 'server-only'` and export only actions.
- Server Actions return `ActionResult<T>` ([api][api] §1.5); messages come from the code table, never from the database.
- Never: the Edge runtime, `images.remotePatterns`, `next/image` for SVG, `'use cache'` outside `lib/catalog.ts` (which does not exist yet), the `i18n` config, links built from `VERCEL_URL` or `Host`. `TZ` is never set.
- Times are shown with `Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila' })`.

**Tests** ([tp][tp] §1):
- Test first: each task writes its TC, watches it fail, then implements.
- File names carry the TC ID: `supabase/tests/tc_db_90_settings.sql`, `tests/unit/tc_ut_02_mobile.test.ts`, and Playwright titles that start with the TC ID.
- pgTAP files run in one transaction and roll back.
- Each test builds its own rows through `tests.fixture_basic()`. No test touches a real project.
- New cases continue the test plan's numbering: TC-DB-102 to TC-DB-110, TC-UT-20 to TC-UT-24, TC-SEC-58 and TC-SEC-59. The task that writes one adds its row to the [test plan][tp] in the same commit.

**Spike and docs:**
- No spike code is copied ([D-32][dl]); `spike/` stays untouched until week-1 Task 10 deletes it. Its ledger findings may inform choices; they are cited where used.
- A new rule or decision goes to the [decision log][dl] first; a changed name or contract updates [api][api] or [data][data] in the same commit ([roadmap][roadmap] §4, "Docs updated").

## Week-1 dependencies

Default = what this plan does, based on the docs and the local spike ledger (`.superpowers/sdd/2026-10-21-week1-spike/`). D-39 overrides any row.

| Tag | Fact (results-note row) | Default here | Tasks |
|---|---|---|---|
| W1-1a | Verified TLS to the pooler with `SUPABASE_DB_CA` | Pool `ssl: { ca, rejectUnauthorized: true }` | 11 |
| W1-1b | Role timeouts apply through port 6543 | Set on the roles in a migration; if D-39 says no, use the `SET LOCAL` fallback inside each function | 3 |
| W1-1e, W1-1f | `sin1`; the Manila date | `vercel.json` regions `sin1`; explicit `AT TIME ZONE 'Asia/Manila'` | 12, 18 |
| W1-3a | The argon2 binary loads on Vercel | `@node-rs/argon2`; fallback scrypt N = 2^17, r = 8, p = 1, maxmem 256 MiB | 13 |
| W1-3b | The client-IP header the client cannot spoof | `getClientIp()` reads only the header D-39 names | 11, 13 |
| W1-3c | Cookie flags | `__Secure-` prefix, HttpOnly, Secure, SameSite=Strict (passed locally) | 13 |
| W1-3e | No raw IP stored; `disableIpTracking` | `advanced.ipAddress.disableIpTracking: true`. It also disables Better Auth's built-in limiter, so login limits are the database counters (spike Task 4 finding) | 10, 13 |
| W1-3f | 2FA secret encrypted; backup codes encrypted only | `storeBackupCodes: 'encrypted'` | 4, 13 |
| W1-3g | Better Auth tables work in `admin_auth` | `pgSchema('admin_auth')` (passed locally); fallback [data][data] §2.1 | 4 |
| W1-3h | Env names Better Auth reads | `BETTER_AUTH_SECRETS` as `<version>:<secret>` (read by 1.7.12 locally) | 13 |
| W1-4a | `pg_cron`, `pg_net`, Vault, `pgcrypto` on Free | Created by the first migration | 3, 10 |
| W1-4h | The keep-alive counts as activity | `ksb_keep_alive` daily from day one | 10, 18 |
| W1-5c, W1-5d | Data API off; dashboard setting names | Turned off on the test project, if D-39 allows | 18 |
| W1-7b | Supabase's Postgres major | Local CLI images; the major is recorded in Task 3 | 3 |
| W1-9a | `updateTag` refreshes prerendered pages | Settings actions call `updateTag('settings')` | 16 |
| W1-9c | The standalone Docker image | BuildKit secret mount plus `process.loadEnvFile` (spike Task 9 finding) | 12 |
| W1-9d | drizzle-kit migration names accepted by the CLI | `migrations.prefix: 'supabase'` (accepted locally by CLI 2.121.0; it ignores `meta/`) | 3 |
| W1-9e | Sentry with Cache Components | `dataCollection` options (SDK 11 has no `sendDefaultPii`, spike Task 9) | 12 |

## Plan proposals that need a decision-log entry

These are choices this plan makes where the docs are silent. Each goes to the [decision log][dl] as **[P]** in the task that builds it, before the code.

- **P-F1. The test harness lives in `supabase/seed.sql`.** That file (local and CI only, never pushed to a real project) creates the `tests` schema: the clock marker, `tests.fixture_basic()` and the admin fixtures. It also creates `pgtap`, the local role passwords and the first IP key. The made-up development data comes from `select tests.fixture_basic()`, so pgTAP, the E2E seed and local development share one fixture. Updates [arch][arch] §10.3 and [tp][tp] §1.3.
- **P-F2. Better Auth moments as `timestamptz`.** The CLI writes `timestamp`; the generator script converts them, following [data][data] §4.
- **P-F3. Better Auth roles without permission statements.** Its access-control statements stay empty, because its admin endpoints are closed. The role matrix the code enforces is `lib/roles.ts`, which mirrors [roles][roles] §2 ([arch][arch] open question 7).
- **P-F4. Login failures count since the last successful login.** The values come from the `rate_limit_login` setting (5 failures, 15 minutes, 20 attempts per IP per hour; [data][data] §7), and a success clears the failures ([api][api] §5.7). The docs do not say over which window an account's failures add up ("the NFR-11 window", [api][api] §5.7). Proposal: one `login_account` row per account, counting from the first failure after the last success; the fifth failure sets `blocked_until` = now + `lockout_minutes`. A reset clears the lock ([sec][sec] §4.1). The daily key change at 00:16 Manila starts every count again, so a lock can end early once a day.
- **P-F5. The IP key rotation moves into Foundation.** `app.rotate_ip_key()` and `ksb_rotate_ip_key` move from E18 to Foundation, because the login limits need the key ([roadmap][roadmap] §9: the roadmap is updated in the same change).
- **P-F6. The pre-launch switch's checks are built later.** The `booking_not_open` checks and the public `noindex` (E4.3) are built with the functions and pages they live in (Core booking, TC-E2E-36). Foundation's only public page is a placeholder that is always `noindex`.
- **P-F7. Archiving covers delivery slots only, for now.** `app.archive_catalog_item` handles `delivery_slot` in Foundation; the `package` and `addon` branches come with E5.1.
- **P-F8. TLS is off only for the local database.** When `SUPABASE_DB_CA` is empty and `VERCEL` is not set, TLS is off (the local Docker database). On Vercel an empty CA throws at startup.
- **P-F9. The Drizzle schema is a folder.** `lib/db/schema/` (one file per domain, plus `index.ts`) replaces the single `lib/db/schema.ts` of [arch][arch] §9.
- **P-F10. How 2FA is moved.** `moveTwoFactor` checks the backup code with Better Auth's backup-code verify without creating a session, then disables and re-enables TOTP, then verifies the first new code. The exact 1.7.12 calls are confirmed in Task 14 against `node_modules/better-auth/dist/plugins/two-factor/`.
- **P-F11. Names for the security events.** [sec][sec] §4.11 lists the events, but the docs name only `auth.login` and the `account.*` actions. Proposal, all in category `security`:
  - `auth.login_failed` (the password step; the admin's id only when the email is an admin's, never the typed email), `auth.code_failed` (a TOTP or backup code), `auth.locked`. `app.login_result` writes them; `p_user_id` is passed only on the 2FA paths, so a failure with a user id is `auth.code_failed`.
  - `limit.tripped` (the bucket and the IP-HMAC, once per key and window), written by `app.rate_limit_hit`.
  - `auth.backup_code_used`, `auth.logout`, `auth.sessions_ended` (an admin ends their own other sessions) and `access.refused` (the action's or page's name, and the admin if known). A new `app.record_security_event(p_action text, p_user_id text, p_subject text) returns jsonb`, granted to `app_rw`, writes these four from an allow-list.
  - Requests with no session cookie are turned away by `proxy.ts` before the DAL, so they write nothing.
  - The job-route and proof-view events come with their phases. Updates [api][api] §3.8 and §5.7.

## Review Focus

1. **The test clock leaks into production.** If `SET LOCAL app.test_now` is honoured without the marker, deadlines and "today" can be forged. Pinned in Task 3 (`tc_db_103_clock_marker.sql`); TC-SEC-54 checks the real project in Task 18.
2. **Pesos versus centavos on A10.** The Super Admin types ₱1,000 for the deposit; it must be stored as `100000`, never `1000` or `100000000`. Pinned in Task 16 (`tc_ut_24_peso_input.test.ts`).
3. **The only Super Admin locked out.** Anyone who knows the email can lock the account (TM-34). The lock must end after 15 minutes, a reset must clear it, and break-glass must still work. Pinned in Tasks 13 and 15.
4. **A session that renews itself.** A session must end 24 hours after login, with no sliding renewal ([sec][sec] §4.1). Pinned in Task 13 (`tc_sec_58_session_lifetime.test.ts`).
5. **Setting values with the wrong JSON type.** For example `"60"` instead of `60`, `null` on a key that must be set, a fraction, or an unknown object field. Each is refused by `app.setting_value_is_valid` and named in the field error. Pinned in Tasks 5 and 16.

---

## File structure

```text
package.json  package-lock.json  .nvmrc  tsconfig.json  eslint.config.mjs  vitest.config.ts  playwright.config.ts
next.config.ts  vercel.json  drizzle.config.ts  .env.example  AGENTS.md  Dockerfile  .dockerignore  .gitleaks.toml
proxy.ts  instrumentation.ts  instrumentation-client.ts
app/(public)/layout.tsx  app/(public)/page.tsx  app/(public)/robots.ts
app/(admin)/admin/layout.tsx  page.tsx  login/  change-password/  setup-2fa/  move-2fa/  settings/  accounts/
app/api/auth/[...all]/route.ts  app/api/health/route.ts
lib/db/pool.ts  lib/db/schema/{enums,auth,catalog,reservations,money,ops,index}.ts  lib/db/functions.ts
lib/auth-options.ts  lib/auth.ts  lib/dal.ts  lib/roles.ts  lib/results.ts  lib/time.ts  lib/money.ts  lib/client-ip.ts
lib/validation/{fields,settings,accounts}.ts  lib/queries/admin/{settings,accounts}.ts
lib/actions/admin/{settings,slots,accounts,two-factor}.ts
components/ui/*  components/admin/*
supabase/config.toml  supabase/seed.sql  supabase/migrations/*  supabase/tests/*.sql
scripts/gen-auth-schema.ts  scripts/auth-cli.config.ts  scripts/check-version-floors.ts  scripts/build-with-env.mjs
scripts/seed-admins.ts  scripts/break-glass-reset-2fa.ts  scripts/e2e-seed.ts
tests/unit/*  tests/integration/*  tests/e2e/*  tests/fixtures/mobile-inputs.json  tests/lint-fixtures/*
.github/workflows/ci.yml  .github/dependabot.yml
```

---

### Task 1: Repository scaffold and lint boundaries

**Files:**
- Create: the Next.js app at the repository root, with `create-next-app@16.4.2`, TypeScript, Tailwind, ESLint, App Router and no `src/`.
- Create: `.nvmrc`, `eslint.config.mjs`, `vitest.config.ts`, `tests/lint-fixtures/{public-imports-admin.ts,edge-runtime.ts,remote-image.tsx,ok.ts}`, `tests/unit/tc_ut_20_lint_boundaries.test.ts`.

**Interfaces:**
- Produces npm scripts:
  - `lint` (`eslint .`), `typecheck` (`next typegen && tsc --noEmit`), `test:unit` (`vitest run tests/unit`), `test:int` (`vitest run tests/integration`);
  - `db:start`, `db:reset`, `test:db` (`supabase start`, `supabase db reset`, `supabase test db`);
  - `test:e2e` (`playwright test`).
- `tsconfig.json` and ESLint ignore `spike/`.

- [ ] **Step 1: Write the failing lint test** `tc_ut_20_lint_boundaries.test.ts` (TC-UT-20). It runs ESLint's Node API on each fixture and asserts:
  - an error with rule id `no-restricted-imports` on `public-imports-admin.ts` (a file under a public path importing `@/lib/actions/admin/x`);
  - an error on `edge-runtime.ts` (`export const runtime = 'edge'`);
  - an error on `remote-image.tsx` (`next/image` with an `http` `src`);
  - no message on `ok.ts`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/tc_ut_20_lint_boundaries.test.ts`. Expected: FAIL (no rules yet).
- [ ] **Step 3: Scaffold and add the rules.**
  1. Run create-next-app with the pinned version. Pin `next`, `react` and `react-dom` exactly, and add `engines.node` plus `.nvmrc` at the chosen LTS line.
  2. Add `no-restricted-imports` for `@/lib/actions/admin/*` in `app/(public)/**`, `lib/actions/public/**` and `components/public/**`.
  3. Add `no-restricted-syntax` for `runtime = 'edge'`.
  4. Add a rule refusing a non-relative `src` on `next/image`.
  5. Install Vitest pinned, with the `@/` alias.
- [ ] **Step 4: Run** the lint test, `npm run lint` and `npm run typecheck`. Expected: PASS, clean.
- [ ] **Step 5: Commit** `chore: scaffold app, toolchain pins, lint boundaries`.

### Task 2: CI pipeline and Dependabot

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `scripts/check-version-floors.ts`, `tests/unit/tc_sec_48_version_floors.test.ts`, `.gitleaks.toml`.

**Interfaces:**
- Produces `checkVersionFloors(lock: object): string[]`, which lists violations. Floors: `next` ≥ 16.4.1, `better-auth` ≥ 1.7.7, `sharp` ≥ 0.35.5 ([sec][sec] §4.10).
- The `ci.yml` jobs on every push: `lint`, `typecheck`, `unit`, `db` (`supabase start`, `supabase db reset`, `supabase test db`), `audit` (`npm audit --omit=dev --audit-level=high`), `floors`, `secrets` (gitleaks). Tasks 12 and 14 add `docker` and `e2e` for pull requests and `main`.

- [ ] **Step 1: Write the failing test** `tc_sec_48_version_floors.test.ts`. Fake lockfiles with `next` 16.4.0, `better-auth` 1.7.6 or `sharp` 0.35.4 each return one violation naming the package; the current lockfile returns `[]`.
- [ ] **Step 2: Run it.** Expected: FAIL (module missing).
- [ ] **Step 3: Implement `checkVersionFloors`** (read `package-lock.json` `packages[...].version`, semver compare) and `ci.yml`.
  - Use `ubuntu-24.04` and `permissions: contents: read`, with no `pull_request_target`.
  - Pin every action by commit SHA with the tag in a comment.
  - Run Node from `.nvmrc`, with `npm ci`.
  - Set `defaults.run.shell: bash`, so pipefail is on (spike Task 8 finding).
  - In `dependabot.yml`: `npm` and `github-actions`, security updates plus weekly grouped version updates.
- [ ] **Step 4: Run** the test (PASS), then push the branch. Expected: every CI job green. TC-SEC-41 (a planted secret) and TC-SEC-49 (a package with a known high advisory) are checked once by hand on a throwaway branch: the `secrets` and `audit` jobs fail.
- [ ] **Step 5: Commit** `ci: pipeline, version floors, secret scan, dependabot`.

### Task 3: Local database, roles, schemas, extensions, test harness, clock

**Files:**
- Create: `supabase/config.toml` (`supabase init`) and `drizzle.config.ts` (schema `./lib/db/schema/index.ts`, out `./supabase/migrations`, `dialect: 'postgresql'`, `schemaFilter: ['app','admin_auth']`, `migrations: { prefix: 'supabase' }`) **[W1-9d]**.
- Create: the migration `<ts>_extensions_roles.sql`.
- Create: `supabase/seed.sql` (P-F1), `supabase/tests/tc_db_102_roles.sql`, `supabase/tests/tc_db_103_clock_marker.sql`, `supabase/tests/tc_db_94_manila_today.sql`.
- Create: the migration `<ts>_clock.sql`.

**Interfaces:**
- Produces roles `app_owner` (NOLOGIN, granted to `postgres`), `app_rw` and `app_backup` (LOGIN, no password in migrations), with the timeouts above **[W1-1b]**.
- Produces extensions `pgcrypto` (schema `extensions`), `pg_cron`, `pg_net` and `supabase_vault` **[W1-4a]**.
- Produces `app.now() returns timestamptz` and `app.manila_today() returns date`.
- Produces, from the seed only, schema `tests` with the table `tests.clock_marker` and extension `pgtap`.

- [ ] **Step 1: Write the failing tests.**
  - `tc_db_102_roles.sql` (TC-DB-102):
    - `has_role` for the three roles;
    - `rolcanlogin` false for `app_owner`;
    - `pg_roles.rolconfig` of `app_rw` contains `statement_timeout=5s`, `lock_timeout=2s` and `idle_in_transaction_session_timeout=10s`;
    - `app_backup` has `default_transaction_read_only=on`, `statement_timeout=15min`, `lock_timeout=30s` and `idle_in_transaction_session_timeout=1min`.
  - `tc_db_103_clock_marker.sql` (TC-DB-103, Review Focus 1): with the marker, `set local app.test_now = '2026-12-19T15:59:59Z'` makes `app.now()` return that instant. After `drop table tests.clock_marker`, inside the test's transaction, the same `SET LOCAL` is ignored: `app.now()` is within one second of `clock_timestamp()`.
  - `tc_db_94_manila_today.sql` (step 1 of TC-DB-94): `app.manila_today()` is `2026-12-19` at `2026-12-19T15:59:59Z` and `2026-12-20` at `2026-12-19T16:00:00Z`.
- [ ] **Step 2: Run** `npm run db:reset && npm run test:db`. Expected: FAIL (roles and functions missing).
- [ ] **Step 3: Implement.**
  - The roles migration follows [data][data] §2.2 and §2.3, with `REVOKE ALL ON SCHEMA public FROM anon, authenticated` where Supabase grants it.
  - `seed.sql` (P-F1):
    - creates `pgtap` and the `tests` schema with `tests.clock_marker`;
    - sets the local passwords `alter role app_rw password 'app_rw_local'` and `app_backup … 'app_backup_local'`, local only.
  - `app.now()` returns `pg_catalog.current_setting('app.test_now', true)::timestamptz` only when `pg_catalog.to_regclass('tests.clock_marker') IS NOT NULL` and the setting is non-empty; otherwise `pg_catalog.clock_timestamp()`. It is `VOLATILE`, owner `app_owner`, `search_path ''`.
  - `app.manila_today()` follows [data][data] §8.
  - Record the local Postgres major (`show server_version`) in the commit message **[W1-7b]**.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Docs and commit.** Add P-F1 to the decision log, and update [arch][arch] §10.3 and [tp][tp] §1.3. Commit `db: roles, extensions, test clock, harness`.

### Task 4: Better Auth tables in `admin_auth`

**Files:**
- Create: `lib/auth-options.ts`, `scripts/auth-cli.config.ts`, `scripts/gen-auth-schema.ts`, `lib/db/schema/auth.ts` (generated), `lib/db/schema/index.ts`.
- Create: a generated migration and `<ts>_admin_auth_additions.sql`, plus `supabase/tests/tc_db_104_admin_auth_tables.sql`.

**Interfaces:**
- Produces `authPlugins`, an array of:
  - `admin({ defaultRole: 'admin', adminRoles: ['superAdmin'], ac, roles: { superAdmin, admin } })`, with empty statements (P-F3);
  - `twoFactor({ issuer: 'DJB Kasoundbox', backupCodeOptions: { storeBackupCodes: 'encrypted' } })` **[W1-3f]**.
- Produces `userAdditionalFields`:
  - `mustChangePassword` (boolean, default `true`, `input: false`);
  - `disabledAt` (date, optional, `input: false`).
- Produces the tables `admin_auth."user"`, `session`, `account`, `verification` and `two_factor`, with the admin plugin's `role`, `banned`, `ban_reason` and `ban_expires`, and `impersonated_by` on `session` **[W1-3g]**.
- Produces `user_role_chk`, `user_one_active_per_role_uq` (unique `(role) WHERE banned IS NOT TRUE`), `must_change_password` and `disabled_at` ([data][data] §5.19).

- [ ] **Step 1: Write the failing test** `tc_db_104_admin_auth_tables.sql` (TC-DB-104):
  - `has_table` for the five tables in `admin_auth`; `hasnt_table` for each in `public`;
  - `col_type_is` `timestamp with time zone` for every `*_at` and `expires_at` column (P-F2);
  - `col_default_is(… must_change_password, true)`;
  - inserting a user with `role = 'owner'` fails `23514`;
  - a second user with `role = 'admin'` and `banned` false fails `23505` (EC-75); with `banned = true` it succeeds;
  - `schema_owner_is('admin_auth','app_owner')` and `schema_owner_is('app','app_owner')`.
- [ ] **Step 2: Run** the database tests. Expected: FAIL.
- [ ] **Step 3: Implement.** `scripts/gen-auth-schema.ts` runs `npx auth@1.7.12 generate --config scripts/auth-cli.config.ts --adapter drizzle --dialect postgresql --output <tmp>` (the CLI cannot load a config importing `server-only`, spike Task 4). It then rewrites `pgTable(` to `adminAuth.table(` with `const adminAuth = pgSchema('admin_auth')`, adds `{ withTimezone: true }` to every timestamp, and drops `relations`. Then `npx drizzle-kit generate --name admin_auth`.
  - If the generated SQL creates the schemas, keep that, and set `ALTER SCHEMA app, admin_auth OWNER TO app_owner` plus `REVOKE ALL … FROM PUBLIC` in the additions migration, together with the CHECK and the index. Table ownership moves to `app_owner` there too.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Docs and commit.** P-F2 and P-F3 go to the decision log, and the column names go into [data][data] §5.19 (they replace its **[U]**). Commit `db: better auth tables in admin_auth`.

### Task 5: Enums, catalog, settings and the capacity lock

**Files:**
- Create: `lib/db/schema/{enums,catalog}.ts`, a generated migration, `<ts>_catalog_constraints.sql`, `<ts>_settings_validator.sql` and `<ts>_seed_rows.sql`.
- Create: `supabase/tests/{tc_db_95_catalog_constraints,tc_db_96_seed_rows,tc_db_105_setting_values}.sql`.
- Modify: `supabase/seed.sql`, where `tests.fixture_basic()` gains the catalog rows of [tp][tp] §1.3.

**Interfaces:**
- Produces every enum of [data][data] §3, in `app`.
- Produces the tables `app.resources`, `packages`, `addons`, `delivery_slots`, `settings` (with `version`) and `capacity_lock`, as [data][data] §5.1, §5.2 and §5.18 give them.
- Produces `app.set_updated_at()` (trigger) and `app.setting_value_is_valid(p_key text, p_value jsonb) returns boolean` (`IMMUTABLE`, one branch per key of [data][data] §7).
- Produces `app.setting(p_key text) returns jsonb`.
- Seed rows: one `capacity_lock` row (`id = 1`); one active room named `Room`; every key of [data][data] §7 at its default, or JSON `null` where it says "not set".

- [ ] **Step 1: Write the failing tests.**
  - `tc_db_95_catalog_constraints.sql` (the catalog part of TC-DB-95):
    - `delivery_slots_order_chk` refuses `ends_at <= starts_at`;
    - negative money is refused on `packages` and `addons`, and `0` is accepted ([D-35][dl]);
    - `resources_one_active_room_uq` refuses a second active room;
    - `resources_name_uq` is case-insensitive;
    - `resources_active_chk` holds;
    - a second `capacity_lock` row fails.
  - `tc_db_96_seed_rows.sql` (TC-DB-96 step 3, TC-DB-03 step 3): one lock row, one active room, every key present, and no "number of sets" key.
  - `tc_db_105_setting_values.sql` (TC-DB-105, Review Focus 5): for each key, one valid value passes and these fail: the wrong JSON type (`'"60"'` for `notice_period_minutes`), a fraction, an out-of-range number, an unknown key, an object missing a field (`onsite_hours` without `closes`), and `'true'` for `deposit_amount_centavos`. `null` passes only for the "not set" keys.
- [ ] **Step 2: Run** the database tests. Expected: FAIL.
- [ ] **Step 3: Implement** the Drizzle tables (with `version` where [data][data] §4 says), then `drizzle-kit generate --name catalog`. The hand-written CHECKs, the validator and `settings_value_chk`, `app.setting` and the seed rows follow. `set_updated_at` goes on every table that has `updated_at`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `db: enums, catalog, settings, capacity lock, seed rows`.

### Task 6: Reservations, blocks, claims, and the live-claim guard

**Files:**
- Create: `lib/db/schema/reservations.ts`, a generated migration, `<ts>_reservation_guards.sql` (CHECKs and triggers) and `<ts>_claim_views.sql`.
- Create: `supabase/tests/{tc_db_05_status_matrix,tc_db_09_guard,tc_db_50_status_guard,tc_db_95_reservation_constraints,tc_db_96_immutable}.sql`.
- Modify: `supabase/seed.sql`, adding fixture helpers `tests.make_reservation(p jsonb) returns uuid` and `tests.make_block(p jsonb) returns uuid`. They insert as `postgres`, with consistent fields.

**Interfaces:**
- Produces the tables `app.reservations`, `blocks`, `resource_claims` and `reservation_addons` ([data][data] §5.3 to §5.6), with the claim foreign keys `ON UPDATE CASCADE` and `resource_claims_one_live_uq` exactly as in [data][data] §5.4.
- Produces `app.holds_capacity(p_status app.reservation_status) returns boolean` (`IMMUTABLE`) and `app.take_capacity_lock() returns void`.
- Produces the views `app.reservation_resources` and `app.block_resources`, and the triggers `reservations_status_guard`, `reservations_immutable_guard` and `blocks_guard`.

- [ ] **Step 1: Write the failing tests.**
  - `tc_db_05_status_matrix.sql` (TC-DB-05): for each of the 7 statuses, and for a block that is active or removed, a second live claim on the same set and date raises `23505` exactly when `app.holds_capacity` is true (or the block is active). `pg_get_indexdef('app.resource_claims_one_live_uq'::regclass)` equals the expected text.
  - `tc_db_09_guard.sql` (TC-DB-09 steps 1 to 5):
    - both claim foreign keys have `confupdtype = 'c'`;
    - changing a claim's status copy, or claiming another date, fails `23503`;
    - a half-filled claim fails its CHECK;
    - a second live claim fails `23505`.
    - Step 6 waits for Core booking.
  - `tc_db_50_status_guard.sql` (TC-DB-50): a new row that is not `pending` is refused. Of the 42 ordered pairs, exactly these 11 succeed and the 31 others raise:
    - `pending` → `awaiting_deposit`, `confirmed`, `rejected`, `expired` or `cancelled`;
    - `awaiting_deposit` → `confirmed`, `expired` or `cancelled`;
    - `confirmed` → `cancelled` or `completed`;
    - `completed` → `cancelled`.
  - `tc_db_95_reservation_constraints.sql`: each reservation, claim and block CHECK in [data][data] §5.3 to §5.6 refuses one violating row. This includes `reservations_mobile_chk` and `reservations_service_start_date_chk` (TC-DB-94 step 4), a 500-character note accepted and 501 refused, and `reservations_qr_hash_chk`.
  - `tc_db_96_immutable.sql` (TC-DB-96 step 1): updating `reference_code`, `source`, `created_at` or `recreated_from` is refused.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement** in the order of [data][data] §10. No trigger goes on `resource_claims` or `reservation_addons` ([data][data] §6.6). `app.take_capacity_lock` is `SELECT 1 FROM app.capacity_lock WHERE id = 1 FOR UPDATE`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `db: reservations, blocks, claims, live-claim guard`.

### Task 7: Money, history and operations tables; the effective view

**Files:**
- Create: `lib/db/schema/{money,ops}.ts`, a generated migration, `<ts>_money_ops_guards.sql` and `<ts>_effective_view.sql`.
- Create: `supabase/tests/{tc_db_89_audit_append_only,tc_db_95_money_ops_constraints,tc_db_106_hold_is_overdue,tc_db_97_effective_view}.sql`.

**Interfaces:**
- Produces the tables `app.payments`, `ack_counters`, `payment_proofs`, `reservation_notes`, `audit_log`, `notifications_outbox`, `submission_keys`, `rate_limits`, `job_runs`, `job_leases`, `retention_runs` and `anonymized_bookings` ([data][data] §5.7 to §5.17).
- Produces the triggers `payments_guard` and `audit_log_append_only` (deletes only under `SET LOCAL app.retention_run = 'on'`).
- Produces `app.hold_is_overdue(status app.reservation_status, deadline timestamptz, expiry_paused boolean, service_start timestamptz, at timestamptz) returns boolean` (`IMMUTABLE`, [D-25][dl]), `app.effective_status(r app.reservations) returns text` and the view `app.reservation_effective` ([data][data] §5.20).

- [ ] **Step 1: Write the failing tests.**
  - `tc_db_89_audit_append_only.sql` (TC-DB-89): `UPDATE` and `DELETE` on `audit_log` are refused, as `postgres` and as `app_owner`; a `changed_fields` element with a value such as `'mobile=+639…'` fails its CHECK.
  - `tc_db_106_hold_is_overdue.sql` (TC-DB-106) gives the truth table of [api][api] §5.1:
    - `pending`, deadline = at, not paused → true;
    - deadline = at + 1 s → false;
    - paused, with service start > at → false;
    - paused, with service start = at → true;
    - `confirmed` → always false.
  - `tc_db_97_effective_view.sql` (the view part of TC-DB-97, plus TC-DB-94 step 2): an overdue hold shows `effective_status = 'expired'`; `is_urgent` is true for an event today at `2026-12-19T23:30Z`; the totals and balance due match [data][data] §5.20.
  - `tc_db_95_money_ops_constraints.sql`: the remaining CHECKs of §5.7 to §5.17.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `db: money, history, ops tables, effective view`.

### Task 8: Shared SQL helpers and the mobile normalizer

**Files:**
- Create: `<ts>_shared_helpers.sql`, `lib/validation/fields.ts` and `tests/fixtures/mobile-inputs.json`.
- Create: `supabase/tests/{tc_db_33_mobile,tc_db_107_helpers}.sql`, `tests/unit/{tc_ut_02_mobile,tc_ut_03_reference_code}.test.ts` and `tests/integration/tc_ut_02_mobile_sql_parity.test.ts`.

**Interfaces:**
- Produces these SQL helpers ([api][api] §5.2):
  - `app.normalize_mobile(text) returns text`;
  - `app.normalize_ref_code(text) returns text`;
  - `app.refuse(p_code text, p_detail jsonb)`, which raises `KS000`;
  - `app.write_audit(p_category app.audit_category, p_entity_type text, p_entity_id text, p_actor_kind app.actor_kind, p_actor_id text, p_action text, p_changed_fields text[], p_reason text, p_reservation_id uuid default null) returns bigint`;
  - `app.enqueue_email(p_type app.email_type, p_reservation_id uuid, p_audit_id bigint, p_recipient text, p_priority app.email_priority, p_payload jsonb, p_qr_link_ciphertext bytea default null) returns bigint`.
- Produces `mobileSchema` (libphonenumber-js full metadata, region PH, valid and of type mobile, then E.164, [D-34][dl]), `normalizeMobile(input: string): string | null` and `referenceCodeSchema`.

- [ ] **Step 1: Write the failing tests.**
  - `mobile-inputs.json` holds the BR-11 table and TC-DB-33's extra inputs, with the expected TypeScript and SQL results.
  - `tc_ut_02_mobile.test.ts` (TC-UT-02): every accepted input gives its E.164 value; `0812 345 6789`, `02 8123 4567` and `0917 123 456` are refused with `invalid_mobile`.
  - `tc_ut_02_mobile_sql_parity.test.ts`: for every input TypeScript accepts, `select app.normalize_mobile($1)` on the local database gives the same value.
  - `tc_db_33_mobile.sql` (TC-DB-33 steps 1 and 3).
  - `tc_ut_03_reference_code.test.ts` (TC-UT-03).
  - `tc_db_107_helpers.sql` (TC-DB-107):
    - `app.refuse('x', '{}')` raises SQLSTATE `KS000` with the message `x`;
    - `write_audit` with `changed_fields '{mobile}'` writes one row with no values;
    - `enqueue_email` with an empty recipient returns null and writes nothing;
    - two calls with the same unique key write one row.
- [ ] **Step 2: Run** the unit and database tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Install `libphonenumber-js` pinned. In `enqueue_email`, the outbox `unique_key` follows [data][data] §5.12.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `db: shared helpers; mobile and reference-code normalizers`.

### Task 9: Grants, RLS, and the actor check

**Files:**
- Create: `<ts>_grants_rls.sql`, `<ts>_assert_actor.sql` and `supabase/tests/{tc_sec_14_no_direct_writes,tc_sec_15_helpers_public,tc_sec_16_search_path,tc_db_108_rls,tc_sec_13_assert_actor}.sql`.
- Modify: `supabase/seed.sql`, adding `tests.make_admin(p_role text, p_opts jsonb default '{}') returns text`. Its options cover a disabled account, no 2FA and must-change. `tests.fixture_basic()` gains "Test Super Admin" and "Test Admin" with 2FA set up ([tp][tp] §1.3).

**Interfaces:**
- Grants per [data][data] §2.2:
  - `app_rw` has `SELECT` on the catalog tables, `settings`, `blocks`, `payments`, `payment_proofs`, `reservation_notes`, `audit_log`, `notifications_outbox`, `job_runs` and the views, but not on `reservations`;
  - `app_rw` has nothing on `capacity_lock`, `ack_counters`, `rate_limits`, `submission_keys`, `job_leases`, `retention_runs` or `anonymized_bookings`;
  - on `admin_auth`, `app_rw` has `SELECT, INSERT, UPDATE, DELETE`, except a column-level `UPDATE` that leaves out `user.role`;
  - `app_backup` has `SELECT` on every table and sequence in both schemas, with `ALTER DEFAULT PRIVILEGES` so new ones follow.
- RLS is enabled on every table of both schemas, with one policy `TO app_rw` per granted command and none for `anon` or `authenticated` ([data][data] §2.4).
- Produces `app.assert_actor(p_actor_id text, p_roles text[]) returns boolean`. It is true only if the user exists, is not banned, has `two_factor_enabled` true, has a role in `p_roles` and has `must_change_password` false.

- [ ] **Step 1: Write the failing tests.**
  - `tc_sec_14_no_direct_writes.sql` (TC-SEC-14): `set role app_rw`; `INSERT`, `UPDATE`, `DELETE` and `TRUNCATE` on every `app` table each raise `42501`.
  - `tc_sec_15_helpers_public.sql` (TC-SEC-15): `app_rw` cannot execute `app.now`, `app.write_audit`, `app.enqueue_email`, `app.take_capacity_lock`, `app.refuse` or `app.assert_actor`; `PUBLIC` holds `EXECUTE` on no `app` function (catalog query on `pg_proc.proacl`).
  - `tc_sec_16_search_path.sql` (TC-SEC-16): every `prosecdef` function in `app` has `proconfig` containing `search_path=""`.
  - `tc_db_108_rls.sql` (TC-DB-108):
    - `relrowsecurity` is true for every table in both schemas;
    - `anon` and `authenticated` select nothing;
    - `app_rw` cannot `UPDATE admin_auth."user" SET role`.
  - `tc_sec_13_assert_actor.sql` (the TC-SEC-13 helper part): it is false for the Admin when only `superAdmin` is allowed, for a disabled account, for an account without 2FA, for a must-change account and for an unknown id; true for the Super Admin.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `db: grants, RLS, actor check`.

### Task 10: Rate limits, IP key, keep-alive and health ping

**Files:**
- Create: `<ts>_rate_limits.sql`, `<ts>_jobs_foundation.sql` and `supabase/tests/{tc_db_109_rate_limits,tc_db_76_ip_key,tc_db_86_foundation_jobs,tc_sec_09_no_raw_ip_limits}.sql`.

**Interfaces:**
- Produces:
  - `app.ip_hmac(p_value text) returns bytea` (HMAC-SHA256 with Vault `ip_hmac_key` via `extensions.hmac`; refuses with `not_configured` when no key exists);
  - `app.rate_limit_hit(p_bucket app.rate_limit_bucket, p_key text, p_ip inet) returns boolean` ([api][api] §5.2), which writes `limit.tripped` (P-F11);
  - `app.rotate_ip_key() returns jsonb` (P-F5);
  - `app.keep_alive() returns jsonb` and `app.health_ping() returns timestamptz` (granted to `app_rw`).
- Cron: `ksb_rotate_ip_key '16 16 * * *'` and `ksb_keep_alive '35 16 * * *'` ([api][api] §6) **[W1-4a]**, **[W1-4h]**.

- [ ] **Step 1: Write the failing tests.**
  - `tc_db_109_rate_limits.sql` (TC-DB-109), with the clock fixed: 20 `login_ip` hits for one IP within an hour return true and the 21st false. An hour later the count starts again. The first refused hit in a window writes one `security` · `limit.tripped` entry; the next refused hit in the same window writes none.
  - `tc_sec_09_no_raw_ip_limits.sql` (the limiter part of TC-SEC-09): after hits from `203.0.113.7`, no column of `rate_limits` contains that text, and `subject_hmac` is 32 bytes.
  - `tc_db_76_ip_key.sql` (TC-DB-76, for the login buckets): after `app.rotate_ip_key()` the old key is gone and a hit from the same IP counts under a new HMAC; the raw test IP is in no table.
  - `tc_db_86_foundation_jobs.sql` (TC-DB-86 steps 1 and 3, for the two Foundation jobs): `cron.job` has both schedules with the exact cron texts; `app.keep_alive()` writes one `job_runs` row `ksb_keep_alive` with result `ok`. Step 2 waits for the jobs phase.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** The window and limit values are read from `app.setting('rate_limit_login')` and its siblings. `seed.sql` calls `app.rotate_ip_key()` once.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Docs and commit.** P-F5 and P-F11 go to the decision log, and the roadmap row moves from E18 to E1. Commit `db: rate limits, IP key rotation, keep-alive, health ping`.

### Task 11: TypeScript data layer

**Files:**
- Create: `lib/db/pool.ts`, `lib/db/functions.ts`, `lib/results.ts`, `lib/time.ts`, `lib/money.ts` and `lib/client-ip.ts`.
- Create: `tests/unit/{tc_ut_06_manila_format,tc_ut_07_admin_times,tc_ut_08_result_codes,tc_ut_16_client_ip,tc_ut_21_pool_tls}.test.ts`.

**Interfaces:**
- Produces `db` (Drizzle over the pool of Global Constraints) **[W1-1a]**, with P-F8 for TLS.
- Produces `callFn<T>(name: string, args: unknown[]): Promise<ActionResult<T>>`. It sends one `select app.<name>($1, …)`; maps `{ok, code, data, detail}` through `RESULT_MESSAGES`; maps the SQLSTATE policy of [api][api] §1.6; retries `40P01` and `40001` once.
- Produces `type ResultCode` and `RESULT_MESSAGES: Record<ResultCode, string>`, holding every code of [api][api] §1.7 with its draft message.
- Produces `formatManila(d: Date, style)` and `manilaWallTimeToUtc(s: string): string`, plus `pesosToCentavos(input: string): number | null` and `formatPesos(centavos: number): string`.
- Produces `getClientIp(h: Headers): string | null` **[W1-3b]**.

- [ ] **Step 1: Write the failing tests.**
  - TC-UT-06: with `process.env.TZ` set to each of UTC, Asia/Dubai, America/Los_Angeles and Asia/Manila in child processes, `2026-12-18T06:00:00Z` formats as Friday 18 December 2026, 2:00 PM.
  - TC-UT-07: `2026-12-23T12:00` becomes `2026-12-23T04:00:00Z`.
  - TC-UT-08: every code has a message; `23505` on the claim index becomes `sold_out` or `not_free`; `55P03` and `57014` become `busy`; `23514` becomes `invalid_input`; unknown errors become `internal_error`; a `40P01` is retried once, then `busy`.
  - TC-UT-16: only the D-39 header is read; spoofed `x-forwarded-for` and `x-real-ip` values do not change the result, unless D-39 names one of them.
  - `tc_ut_21_pool_tls`: with `VERCEL=1` and an empty CA, importing the pool throws; locally with no CA, `ssl` is false.
- [ ] **Step 2: Run** `npm run test:unit`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: data layer, result codes, Manila time, money, client IP`.

### Task 12: Health route, monitoring, configuration and Docker

**Files:**
- Create: `app/api/health/route.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts`, `vercel.json`, `.env.example`, `app/(public)/{layout,page,robots}.tsx|ts`, `Dockerfile`, `.dockerignore` and `scripts/build-with-env.mjs`.
- Create: `tests/integration/tc_ut_19_health.test.ts` and `tests/unit/{tc_ut_22_sentry_scrub,tc_sec_42_headers}.test.ts`.
- Modify: `ci.yml`, adding the `docker` job for pull requests and `main`.

**Interfaces:**
- Produces `GET /api/health` → `200 { ok: true, data: { region, db: 'ok', dbLatencyMs, time } }` or `503 { ok: false, code: 'db_unavailable', message: 'Database unreachable' }` with an `X-Region` header and `Cache-Control: no-store`, and a 3-second time limit ([api][api] §4.3).
- `vercel.json`: `{ "regions": ["sin1"] }` **[W1-1e]**.
- `next.config.ts`:
  - `cacheComponents: true`, `images: { unoptimized: true }`, and `output: 'standalone'` only when `NEXT_OUTPUT=standalone`;
  - headers on every page: `Content-Security-Policy` with `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'none'` and `form-action 'self'`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy: camera=()`;
  - `X-Robots-Tag: noindex` on `/admin/:path*` ([sec][sec] §4.9).
- Sentry: `Sentry.init` with `dataCollection` set to off for user info, cookies, headers, bodies, query params, database query data and stack variables, plus a `beforeSend` that deletes `request.cookies` and `request.headers` **[W1-9e]**.
- The public page is a placeholder with `robots: { index: false }` (P-F6). `robots.ts` disallows `/admin`.

- [ ] **Step 1: Write the failing tests.**
  - TC-UT-19, against the local database: 200 with region and latency; then 503 `db_unavailable` with an unreachable `DATABASE_URL`.
  - TC-SEC-42 (the header part): the config's headers contain each header above.
  - `tc_ut_22_sentry_scrub`: an event with cookies, headers and a body loses them.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** The Dockerfile follows [arch][arch] §11.2 and spike Task 9 **[W1-9c]**: a Debian-slim base at the `.nvmrc` line; `RUN --mount=type=secret,id=app_env node scripts/build-with-env.mjs /run/secrets/app_env`; non-root `USER node`; `node server.js`. The `docker` CI job builds with a CI-only env file pointing at the CI Supabase, runs the image, and expects 200 on `/` and `/api/health` (TC-NFR-06).
- [ ] **Step 4: Run** the tests and `docker build`/`docker run` locally. Expected: PASS; 200 on both addresses.
- [ ] **Step 5: Docs and commit.** P-F6 goes to the decision log. Commit `feat: health route, sentry, headers, docker`.

### Task 13: Better Auth server configuration and login limits

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...all]/route.ts` and `<ts>_login_functions.sql`.
- Create: `supabase/tests/{tc_sec_02_login_limits,tc_sec_46_login_events}.sql` and `tests/integration/{tc_sec_07_closed_endpoints,tc_sec_08_password_hash,tc_sec_09_no_raw_ip_sessions,tc_sec_58_session_lifetime,tc_sec_59_cookie_flags}.test.ts`.

**Interfaces:**
- Produces `auth = betterAuth({ … })` from `lib/auth.ts`:
  - `baseURL: SITE_URL`, `trustedOrigins: [SITE_URL]`, the Drizzle adapter over `db` with the `admin_auth` schema objects, `emailAndPassword` with `disableSignUp: true` and `minPasswordLength: 12`;
  - `password.hash` and `verify` with argon2id m=19456, t=2, p=1 **[W1-3a]**;
  - `session: { expiresIn: 86400, updateAge: 86400, cookieCache: { enabled: false } }`;
  - `advanced: { useSecureCookies: true, defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: 'strict' }, ipAddress: { disableIpTracking: true } }` **[W1-3c]**, **[W1-3e]**;
  - `rateLimit: { enabled: false }`, `telemetry: { enabled: false }`, `user.additionalFields: userAdditionalFields`, `plugins: authPlugins`;
  - secrets from `BETTER_AUTH_SECRETS` **[W1-3h]**.
- The route handler forwards only this allow-list; every other path returns 404 ([sec][sec] §4.1):

```ts
const ALLOWED = new Set([
  'POST /sign-in/email', 'POST /sign-out', 'GET /get-session',
  'POST /two-factor/enable', 'POST /two-factor/disable', 'POST /two-factor/verify-totp',
  'POST /two-factor/verify-backup-code', 'POST /change-password',
  'GET /list-sessions', 'POST /revoke-session', 'POST /revoke-other-sessions',
]);
```

- Produces `app.login_guard(p_email text, p_ip inet) returns jsonb`, with codes `ok`, `rate_limited` and `account_locked`.
- Produces `app.login_result(p_email text, p_ip inet, p_success boolean, p_user_id text) returns jsonb`, which writes `security` · `auth.login` on success, and `auth.login_failed`, `auth.code_failed` or `auth.locked` on failure (P-F4, P-F11) ([api][api] §5.7).
- Produces `app.record_account_event(p_user_id text, p_action text) returns jsonb`, whose allow-list is `account.2fa_enabled`.
- Produces `app.record_security_event(p_action text, p_user_id text, p_subject text) returns jsonb`, whose allow-list is `auth.backup_code_used`, `auth.logout`, `auth.sessions_ended` and `access.refused` (P-F11).
- Hooks (`hooks.before` and `hooks.after` with `createAuthMiddleware`):
  - on `/sign-in/email`, `/two-factor/verify-totp` and `/two-factor/verify-backup-code`, `before` calls `login_guard` and refuses with the mapped code, and forces `trustDevice` to false on the verify paths; `after` calls `login_result`;
  - when a verify call turns on 2FA, `after` calls `record_account_event`;
  - after a successful `/two-factor/verify-backup-code`, `/sign-out`, `/revoke-session` or `/revoke-other-sessions`, `after` calls `record_security_event` with `auth.backup_code_used`, `auth.logout` or `auth.sessions_ended`;
  - the pending user of the 2FA paths comes from the plugin's signed two-factor cookie, read the way 1.7.12's `verify-two-factor.mjs` does.

- [ ] **Step 1: Write the failing tests.**
  - `tc_sec_02_login_limits.sql` (TC-SEC-02, the pgTAP part, with the clock fixed):
    - five failed `login_result` calls lock the account, and `login_guard` then returns `account_locked`, still at +14 minutes;
    - at +16 minutes it returns `ok`;
    - a successful `login_result` clears the failures (P-F4);
    - 21 `login_guard` calls from one IP make the 21st `rate_limited`.
  - `tc_sec_46_login_events.sql` (the login part of TC-SEC-46, P-F11): each password failure writes `auth.login_failed`, and the fifth also `auth.locked`; a failure with a user id writes `auth.code_failed`; a failure for an email that matches no admin stores no email; `record_security_event` refuses an action outside its allow-list with `invalid_input`.
  - TC-SEC-07: sign-up, password reset email, delete user, change email and the admin plugin's ban, set-role, set-password and impersonate endpoints each return 404.
  - TC-SEC-08: a user created through `auth` has an `account.password` starting `$argon2id$v=19$m=19456,t=2,p=1$`. It runs in Vitest against the local database, because the hash is made in Node; the test plan's tool column for TC-SEC-08 changes from pgTAP in the same commit.
  - TC-SEC-09 (the session part): `session.ip_address` is empty after a login.
  - `tc_sec_58_session_lifetime` (Review Focus 4): with Better Auth's clock moved 23 hours, `get-session` keeps the original `expiresAt`; at 24 hours plus 1 s the session is refused.
  - `tc_sec_59_cookie_flags`: the session cookie is `__Secure-…session_token` with HttpOnly, Secure and SameSite=Strict.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests. Expected: PASS. If argon2 fails to load in the D-39 run, switch to the scrypt fallback and record it **[W1-3a]**.
- [ ] **Step 5: Docs and commit.** P-F4 goes to the decision log; the endpoint allow-list and the event names go into [api][api] §3.8 and §5.7. Commit `feat: better auth config, endpoint allow-list, login limits`.

### Task 14: DAL, proxy, admin shell, and login pages (A1, A2)

**Files:**
- Create: `lib/dal.ts`, `lib/roles.ts`, `proxy.ts`, `app/(admin)/admin/{layout,page}.tsx` and `app/(admin)/admin/{login,change-password,setup-2fa,move-2fa}/page.tsx`.
- Create: `lib/actions/admin/two-factor.ts`, `<ts>_password_and_2fa_events.sql`, `scripts/e2e-seed.ts` and `playwright.config.ts`.
- Create: `tests/unit/tc_ut_23_dal.test.ts`, `supabase/tests/{tc_db_100_must_change,tc_sec_57_2fa_moved}.sql` and `tests/e2e/{tc_sec_01_login,tc_sec_02_login_lock,tc_sec_03_2fa_counts,tc_sec_05_no_2fa,tc_sec_56_must_change,tc_sec_57_move_2fa,tc_sec_04_backup_once,tc_sec_42_return_to}.spec.ts`.
- Modify: `ci.yml`, adding the `e2e` job for pull requests and `main`.

**Interfaces:**
- Produces `verifySession()`, `requireAdmin(): Promise<{ adminId: string; role: Role; displayName: string }>` and `requireRole('superAdmin')`. The checks run in the order of [api][api] §1.2:
  1. session;
  2. not banned (otherwise the session is revoked);
  3. `mustChangePassword` false, otherwise `/admin/change-password`;
  4. `twoFactorEnabled`, otherwise `/admin/setup-2fa`;
  5. role.
- Pages redirect; actions return `not_authenticated` or `forbidden`. Each refusal calls `app.record_security_event('access.refused', …)` (P-F11).
- Produces `type Role = 'superAdmin' | 'admin'` and `ACTION_ROLES: Record<string, Role[]>` (the role table, from [roles][roles] §2), in `lib/roles.ts`.
- `proxy.ts` matches `['/admin/:path*']`, skips `/admin/login`, and only checks that the cookie exists ([arch][arch] §4.4).
- Produces `app.password_changed(p_user_id text) returns jsonb` and `app.record_2fa_moved(p_user_id text) returns jsonb`. The latter queues `admin_2fa_moved` to the Super Admin unless the user is the Super Admin.
- Produces the actions `moveTwoFactor({ password, backupCode })` and `confirmMovedTwoFactor({ code })` (P-F10).
- `/admin/login` accepts a `returnTo` value only as a relative path under `/admin`.

- [ ] **Step 1: Write the failing tests.**
  - `tc_ut_23_dal` (TC-UT-23): each failing step gives its redirect or code, in order (a banned and must-change account gets the disabled result first).
  - TC-DB-100.
  - `tc_sec_57_2fa_moved.sql` (the pgTAP part of TC-SEC-57): an Admin's move writes `security` · `account.2fa_moved` and one `admin_2fa_moved` outbox row to the Super Admin's email; the Super Admin's own move writes the entry and no row.
  - TC-SEC-01: the admin area opens only after the code, and no trust-device cookie is set.
  - TC-SEC-02 (the Playwright part, steps 1 to 3 through the login page): the messages do not say which part was wrong.
  - TC-SEC-03: three wrong passwords and two wrong TOTP codes lock the account, and a correct backup code is then refused.
  - TC-SEC-04, TC-SEC-05 (pages and actions), TC-SEC-56, and TC-SEC-57 (steps 1 to 3; the email is checked as the outbox row).
  - TC-SEC-42 (the return-address part): `returnTo=https://evil.example` lands on `/admin`.
  - Every spec runs in the four Playwright projects of [tp][tp] §1.4.
- [ ] **Step 2: Run** the unit, database and `test:e2e` tests (after `npm run db:reset` and `scripts/e2e-seed.ts`). Expected: FAIL.
- [ ] **Step 3: Implement** the pages after [ux][ux] §3.2.1:
  - the code step with "Use a backup code instead";
  - A2 in order: password change; the QR code (with `uqr`) and typed key; the first code; backup codes with Print and Download; and "I have stored my backup codes";
  - the generic messages of [ux][ux] §3.2.1;
  - the backup-code notice leading to `/admin/move-2fa`.
  - The change-password page calls `changePassword({ revokeOtherSessions: true })`, then the hook calls `app.password_changed`.
  - `scripts/e2e-seed.ts` runs `tests.fixture_basic()` and creates the two test accounts with known TOTP secrets, for the local database only.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Docs and commit.** P-F10 goes to the decision log, with the confirmed calls. Commit `feat: DAL, proxy, login, password change, 2FA setup and move`.

### Task 15: Admin accounts (A11), setup and break-glass scripts

**Files:**
- Create: `<ts>_account_functions.sql`, `lib/validation/accounts.ts`, `lib/actions/admin/accounts.ts`, `lib/queries/admin/accounts.ts` and `app/(admin)/admin/accounts/page.tsx`.
- Create: `scripts/seed-admins.ts` and `scripts/break-glass-reset-2fa.ts`.
- Create: `supabase/tests/{tc_db_91_accounts,tc_db_101_reenable,tc_sec_53_break_glass}.sql` and `tests/e2e/{tc_sec_06_ended_sessions,tc_e2e_30_accounts}.spec.ts`.

**Interfaces:**
- Produces these functions, each with the signature, checks, writes and codes of [api][api] §5.7:
  - `app.create_admin_account(p_actor_id text, p_name text, p_email text, p_password_hash text)`;
  - `app.disable_admin(p_actor_id text, p_target_user_id text)`;
  - `app.reenable_admin(p_actor_id text, p_target_user_id text, p_email text default null, p_password_hash text default null)`;
  - `app.reset_admin(p_actor_id text, p_target_user_id text, p_password_hash text)`, which also clears the target's login lock (Review Focus 3);
  - `app.sign_out_admin(p_actor_id text, p_target_user_id text, p_keep_session_id text)`;
  - `app.break_glass_reset_2fa(p_email text, p_password_hash text default null)`, not granted to `app_rw`.
- Disable sets `banned = true` and `disabled_at = app.now()`.
- Produces `listAdminAccounts()` in `lib/queries/admin/accounts.ts`, a read that starts with `requireRole('superAdmin')` ([api][api] §3.2).
- Produces the actions `createAdminAccount`, `disableAdminAccount`, `reenableAdminAccount`, `resetAdminAccount` and `signOutAdminAccount` ([api][api] §3.8), each starting with `requireRole('superAdmin')`. They hash with the same argon2id settings as `lib/auth.ts`, and generate first and reset passwords on the server (20 random characters, shown once).
- `seed-admins.ts` prompts for two emails, refuses if any admin exists, creates both accounts through the same hashing with `must_change_password` true, and writes `system`/`security` audit entries ([arch][arch] §10.4).

- [ ] **Step 1: Write the failing tests.**
  - TC-DB-91, steps 1 to 7.
  - TC-DB-101, steps 1, 2, 3 and 5.
  - A reset clears a lock: after five failures, `reset_admin`, then `login_guard` returns `ok`.
  - TC-SEC-53 (the local part): `app_rw` gets `42501`; `postgres` gets `ok`, with the 2FA rows removed, the sessions ended and one `system`/`security` entry.
  - TC-SEC-06: after each of sign-out, reset and disable, the Admin's next click is refused.
  - TC-E2E-30 (the account parts): a second Admin is refused, and the screen offers only the actions of [ux][ux] §3.2.10.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Use a transaction advisory lock (`pg_advisory_xact_lock`) in create and re-enable.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: admin accounts, setup and break-glass scripts`.

### Task 16: Settings and delivery slots (A10), including the pre-launch switch

**Files:**
- Create: `<ts>_settings_slots_functions.sql`, `lib/validation/settings.ts`, `lib/actions/admin/{settings,slots}.ts`, `lib/queries/admin/settings.ts` and `app/(admin)/admin/settings/page.tsx`.
- Create: `supabase/tests/{tc_db_90_settings,tc_sec_55_booking_switch,tc_db_110_slots}.sql`, `tests/unit/tc_ut_24_peso_input.test.ts` and `tests/e2e/tc_e2e_29_settings_slots.spec.ts`.

**Interfaces:**
- Produces these functions ([api][api] §5.6):
  - `app.update_setting(p_actor_id text, p_key text, p_value jsonb, p_expected_version int)`;
  - `app.create_delivery_slot(p_actor_id text, p_label text, p_start_time time, p_end_time time)`;
  - `app.update_delivery_slot(p_actor_id text, p_slot_id uuid, p_expected_version int, p_changes jsonb)`;
  - `app.archive_catalog_item(p_actor_id text, p_kind text, p_item_id uuid, p_expected_version int)`, delivery slots only (P-F7): `conflict` when a live reservation uses the slot ([BR-10][br]).
- Produces `getSettings()` in `lib/queries/admin/settings.ts`, a read ([api][api] §3.2), and the actions `updateSetting`, `createDeliverySlot`, `updateDeliverySlot` and `archiveCatalogItem` (slot). Each starts with `requireRole('superAdmin')`. They call `updateTag('settings')` on success **[W1-9a]**.
- Produces `settingFormSchemas: Record<SettingKey, z.ZodType>`. The `_centavos` keys are typed in pesos and converted with `pesosToCentavos`.
- The page follows [ux][ux] §3.2.9: the setting groups, the slots list, the pause as read-only text, the pre-launch switch with its confirmation, and "This does not change existing bookings." The sets-and-room part waits for E5.2.

- [ ] **Step 1: Write the failing tests.**
  - TC-DB-90.
  - TC-SEC-55.
  - `tc_db_110_slots` (TC-DB-110):
    - start not before end gives `invalid_input`;
    - an Admin actor gives `forbidden`;
    - an old version gives `stale_version`;
    - archiving a slot that a live `tests.make_reservation` uses gives `conflict` listing it, and archiving it twice gives `not_allowed`;
    - every success writes `settings` · `slot.created`, `slot.updated` or `slot.archived`.
  - `tc_ut_24_peso_input` (TC-UT-24, Review Focus 2): `"1,000"` gives `100000`, `"1000.50"` gives `100050`, `"1,000.505"` gives null, `"-1"` gives null.
  - The form schema for `notice_period_minutes` refuses `"sixty"` with a field error (Review Focus 5).
  - TC-E2E-29 (the settings and slot parts): the deposit typed as ₱1,000 shows as ₱1,000 after reload, and the Admin sees "Only the Super Admin can open this page."
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Docs and commit.** P-F7 goes to the decision log. Commit `feat: settings, delivery slots, pre-launch switch`.

### Task 17: The authorization sweep and security events

**Files:**
- Create: `tests/integration/{tc_sec_10_logged_out,tc_sec_11_super_only,tc_sec_12_role_table}.test.ts`, `supabase/tests/{tc_sec_13_every_function,tc_sec_46_security_events,tc_sec_45_audit_no_contact}.sql` and `tests/e2e/tc_sec_10_pages.spec.ts`.

**Interfaces:**
- Consumes `ACTION_ROLES` (Task 14) and every module in `lib/actions/admin/`.

- [ ] **Step 1: Write the tests.**
  - TC-SEC-12: the set of exported functions in `lib/actions/admin/**` equals the keys of `ACTION_ROLES`.
  - TC-SEC-10: every action called with no session returns `not_authenticated`, and every admin page redirects to `/admin/login`.
  - TC-SEC-11: every action whose roles are `['superAdmin']`, called as the Admin, returns `forbidden` and changes nothing; so do `getSettings` and `listAdminAccounts`.
  - TC-SEC-13: every admin function in `app` (catalog query: functions whose first argument is `p_actor_id`), called with the Admin for Super-Admin functions, a disabled account, an account without 2FA and an unknown id, returns `forbidden`.
  - TC-SEC-46 (the Foundation part): a successful login, a failed login, a lock, a refused admin request, and the same limit hit twice in one window each write one `security` entry. The job-route and proof-view steps wait for their phases.
  - TC-SEC-45: no `audit_log` row matches a mobile or email pattern.
- [ ] **Step 2: Run** them. Expected: anything earlier tasks missed fails. Fix it in the owning module, test first, until all pass.
- [ ] **Step 3: Commit** `test: authorization sweep and security events`.

### Task 18 [Developer]: Deploy to the test project and check M3

- [ ] **Step 1: Prepare the test project.**
  1. Create the Vercel and Supabase projects, or reuse the week-1 ones, reset for UAT ([D-28][dl]).
  2. Apply `supabase db push` through the session pooler.
  3. Set the role passwords with `\password`.
  4. Create the Vault secrets, then run `select app.rotate_ip_key();`.
  5. Set the Vercel variables of [arch][arch] §8.1 that Foundation reads: `SITE_URL`, `DATABASE_URL`, `SUPABASE_DB_CA`, `BETTER_AUTH_SECRETS` and `SENTRY_DSN`.
  6. Turn the Data API off if D-39 allows it **[W1-5c]**.
- [ ] **Step 2: Deploy and seed.** Merge to `main` with every CI job green. Run `scripts/seed-admins.ts` against the test project. Each admin logs in, changes the password, sets up 2FA and stores the backup codes.
- [ ] **Step 3: Check the M3 exit criteria** ([roadmap][roadmap] §1.5):
  - `/api/health` reports `sin1` **[W1-1e]**;
  - `ksb_keep_alive` has a `job_runs` row the next day **[W1-4h]**;
  - the Super Admin changes a setting and a delivery slot, and each writes an audit entry;
  - the manual checks TC-SEC-17, TC-SEC-18, TC-SEC-39, TC-SEC-52 and TC-SEC-54 pass;
  - `public_booking_open` is false.
- [ ] **Step 4: Update the docs.**
  - Roadmap §1.0: Foundation done, M3 reached.
  - Mark each **[P]** this plan settled as confirmed.
  - List what moved to later phases: TC-DB-09 step 6; TC-DB-86 step 2; TC-DB-91 step 8; TC-DB-101 step 4; TC-SEC-46's job-route and proof-view steps; TC-E2E-36; E4.3's checks; `archive_catalog_item` for packages and add-ons; the A10 sets-and-room section.
- [ ] **Step 5: Commit** `docs: foundation done (M3)`.

[arch]: ../../05-technical/architecture.md
[api]: ../../05-technical/api-specification.md
[data]: ../../05-technical/data-model.md
[sec]: ../../05-technical/security.md
[tp]: ../../06-delivery/test-plan.md
[roadmap]: ../../06-delivery/roadmap.md
[dl]: ../../00-project/decision-log.md
[roles]: ../../01-requirements/roles-and-permissions.md
[nfr]: ../../01-requirements/non-functional-requirements.md
[br]: ../../01-requirements/business-rules.md
[ux]: ../../04-design/ux-and-sitemap.md
