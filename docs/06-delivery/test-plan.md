# Test Plan

> **Purpose:** How the DJB Kasoundbox reservation system is tested: the test levels and tools, the environments and test data, the CI gates, every test case (TC IDs), the traceability from each requirement to its tests, the week-1 spike checklist, the acceptance (UAT) checklist that both admins run, and the entry and exit criteria. This document owns the TC IDs and the traceability. ·
> **Audience:** Mainly the developer (Super Admin). "In plain words" and the UAT checklist (section 5) are written for the business owner (Admin) ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log][dl], [Project charter][charter], [Glossary][gl], [Roles and permissions][roles], [Business rules][br], [Functional requirements][fr], [Non-functional requirements][nfr], [Edge cases][ec], [Privacy and retention][priv], [Reservation lifecycle][lc], [Catalog and payments][cat]; the workflow docs [booking-and-submission][wf-book], [availability-and-conflicts][wf-avail], [lookup-and-review][wf-review], [changes-and-expiry][wf-change], [notifications-and-tracking][wf-notify], [administration][wf-admin]; [UX and sitemap][ux]; [Architecture][arch], [Data model][data], [API specification][api], [Security][sec]; written in parallel: [Roadmap][roadmap], [Deployment and operations][ops], [Staff guide][staff] ·
> **Derived from:** [business-rules][br] BR-01 to BR-12 (with BR-06a and BR-07a); [functional-requirements][fr] every FR-PUB, FR-ADM, FR-NTF, and FR-SYS acceptance criterion; [non-functional-requirements][nfr] NFR-01 to NFR-33; [edge-cases][ec] EC-01 to EC-85; [reservation-lifecycle][lc] §2, §3, §4.2 (rows 1 to 15), §5, §6, §7; [catalog-and-payments][cat] §2, §4, §5, §9; [privacy-and-retention][priv] §5.5, §5.6, §6; [api-specification][api] §1.7 (result codes), §2 to §6; [data-model][data] §5, §6.7, §8, §9; [security][sec] §3.2 (TM-01 to TM-41), §5 (security test checklist), §7; [architecture][arch] §11 (CI), §14.1 (week-1 items); the step tables of WF-01 to WF-10; background only: [spec v0.2][spec] §17 (frozen, never edited)

## In plain words

*For the business owner (Admin).*

- **What testing is for.** Before customers use the website, we check that it does exactly what the other documents say. The most important checks: no set or room is ever booked twice, money records are always right, deadlines end on time, and customers' personal data stays private.
- **Most checks run by themselves.** The developer writes small automatic checks. A computer runs them every time the code changes, and a change is not used until every check passes. You do not need to run these.
- **The week-1 test.** Before any feature is built, the developer tries the free services for real, in Singapore, for about a week: the database connection, two people booking at the same moment, login with the phone code, the timers, picture uploads, QR scanning on **your own phone and laptop**, a backup and a restore, and the free-plan limits. At the end, he decides "go" or "no go" (section 4).
- **Your checklist.** Near the end, you and the Super Admin go through about thirty real situations yourselves, on your own phones: a customer books, you approve, you record a deposit, a walk-in pays in cash, two people try to book the last set at once, and so on. Each one says what to do and what you should see. You tick a box when it works (section 5).
- **What "done" means.** The website opens to customers only when every automatic check passes, your checklist is ticked by both of you, and a restore from a backup has worked again (section 6).
- **When something is wrong.** Every problem gets a level, from 1 (serious, for example a double booking or a wrong payment record) to 4 (cosmetic). Level 1 and 2 problems are fixed before launch. Each fix comes with a new automatic check, so the same problem cannot come back unnoticed.

## How to read this document

- **What this document owns.** Test cases (TC IDs), their traceability to the requirements, the week-1 checklist, the UAT checklist, test environments and test data, and the entry and exit criteria. Every rule, number, permission, deadline, and result code belongs to its owning document and is cited by its ID. Where a test needs a boundary value, it is given in brackets with its owner, for example "(1 hour, BR-06)".
- **Labels.** **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item in the [decision log][dl]. **[P] (new in this doc)** marks a test-design choice that no other document makes; each one is listed under [Open questions](#open-questions).
- **TC fields.** Every case has an ID, a title, a level (the tool it runs in), preconditions and data, short steps, the expected result, and what it covers. Result codes such as `sold_out` or `stale_version` are the codes of [api-specification][api] §1.7.
- **"Prov."** marks an expected result that follows a provisional contract in [api-specification][api] (a technical default chosen while a business question is still open). The question is named; if its answer differs, the test changes with it.
- **"If [P] accepted"** marks a test of a control that [security][sec] proposes as **[P] (new in that doc)**. It is needed only if the review accepts that control ([security][sec] §5, last paragraph).
- **What a test may not do.** A test never assumes a behavior that no document defines. Such behaviors are listed under [Open questions](#open-questions), with the test to add once they are answered.
- **Shorthand in the "Covers" column.**

| Shorthand | Meaning | Defined in |
|---|---|---|
| BR-xx | Business rule | [business-rules][br] |
| FR-PUB-xx, FR-ADM-xx, FR-NTF-xx, FR-SYS-xx | Functional requirement | [functional-requirements][fr] |
| NFR-xx | Non-functional requirement | [non-functional-requirements][nfr] |
| EC-xx | Edge case | [edge-cases][ec] |
| WF-xxy | Workflow sub-flow | the six [workflow docs](../03-workflows/overview.md) |
| TM-xx | Threat | [security][sec] §3.2 |
| LC rN | Row N of the transition table | [reservation-lifecycle][lc] §4.2 |
| LC §n | Section n of the lifecycle | [reservation-lifecycle][lc] |
| api §n, data §n, sec §n, arch §n | A section of the technical docs | [api-specification][api], [data-model][data], [security][sec], [architecture][arch] |

- **Time and money.** Every date and time is Manila time (Asia/Manila, NFR-19) unless it is marked `Z` (UTC). Amounts are in pesos (₱). Names, prices, stock, slot times, and on-site hours in the test data are made up ([O-02][dl], [O-03][dl]).

---

## 1. Strategy

### 1.1 Test levels and tools

| Level | ID prefix | Tool | What it proves | Runs in |
|---|---|---|---|---|
| **Database** | TC-DB | **pgTAP** through the **Supabase CLI** (`supabase test db`) | Every rule that lives in the database: capacity, holds, limits, the breaker, blocks, catalog refusals, every allowed and forbidden status change, payments and acknowledgment numbers, the outbox, the jobs, retention, grants, and constraints ([NFR-32][nfr], [arch][arch] §11.1). Rules are tested where they live | Local; CI on every push |
| **Unit** | TC-UT | **Vitest** | Code outside the database: validation schemas, mobile and reference-code normalization, price summaries, code and token formats, Manila time formatting, result-code mapping, email templates, the bearer check | Local; CI on every push |
| **End to end** | TC-E2E | **Playwright** against `next build && next start` and the local Supabase ([arch][arch] §11.1) | Full customer and admin journeys in a real browser, at phone and desktop sizes (1.4) | Local; CI on pull requests and `main` |
| **Security** | TC-SEC | pgTAP, Vitest, Playwright, CI jobs, and scripted or manual checks against the deployed projects | Every row of the [security][sec] §5 checklist and every threat TM-01 to TM-41 | Mostly CI; some before launch on the real projects |
| **Non-functional** | TC-NFR | Playwright with axe, scripts, CI jobs, and manual checks | Performance and usage, caching, accessibility, browsers, monitoring, backup and restore, portability, and the cost and vendor checks | CI, the week-1 projects, and before launch |
| **Week-1 spike** | TC-W1 | Scripts and manual steps on the real Vercel Hobby (`sin1`) and Supabase Free (Singapore) projects | Every **[U]** fact that the week-1 test must settle ([arch][arch] §14.1; [project-charter][charter] phase 4) | Once, before features are built; ends with go / no-go |
| **Acceptance** | TC-UAT | Both admins, on their own phones and laptop, with the checklist in section 5 | Real scenarios work for the people who run the business ([project-charter][charter] phase 6) | Before launch |

**How the levels share the work.** A rule is tested once at the level where it lives, then once through a journey. For example, the notice period (BR-06) has its boundary cases in TC-DB-14, and one refusal in the browser in TC-E2E-05. Journeys do not repeat every boundary.

**Test-driven.** Each feature is built test first: the TC is written, seen to fail, then the code is written ([roadmap][roadmap] sets the order of features). A test file names its TC ID, for example `supabase/tests/tc_db_10_last_set.sql` or a Playwright title starting `TC-E2E-01` **[P] (new in this doc)**.

### 1.2 Environments

| Environment | What it is | Used for | Data |
|---|---|---|---|
| **Local** | Supabase CLI in Docker (Postgres with `pg_cron`, `pg_net`, Vault, Storage) and the Next.js app ([arch][arch] §10) | Writing and running TC-DB, TC-UT, TC-E2E, and most TC-SEC | `supabase/seed.sql` for development; each test builds its own data (1.3) |
| **CI** | GitHub Actions on `ubuntu-24.04` with the Supabase CLI; `supabase db reset` applies every migration from zero ([arch][arch] §11.1) | Every automated level, on the gates in 1.6 | A fresh database for each run; no real data, no production secrets |
| **Preview deployments** | Vercel previews. They get no database and no email keys by default ([arch][arch] §8.2) | Only TC-SEC-39 (no production secret in a preview) and a static-page smoke check | None |
| **Week-1 projects** | The real Vercel Hobby project in `sin1` and the real Supabase Free project in Singapore, set up as for production (whether a separate staging project exists is [arch][arch] open question 9) | TC-W1 | Made-up data only, removed afterwards (see [Open questions](#open-questions), question 3) |
| **Pre-launch** | The production deployment before it opens to customers | TC-UAT, the manual TC-SEC and TC-NFR checks, the second restore test | Made-up customers only; how the database is reset before launch is open question 3 |
| **Production** | The live system | Smoke checks after each deploy (6.4). Never a place for destructive tests | Real customers |

**No test ever runs against production data**, and a restore test always restores into a fresh Postgres, never over the live database (TC-NFR-16).

### 1.3 Test data and seeds

**Fixture catalog.** Each pgTAP test builds the rows it needs inside its own transaction and rolls back, so tests never depend on each other or on the seed ([arch][arch] §10.3). A shared fixture function, `tests.fixture_basic()` **[P] (new in this doc)**, creates the made-up setup below. Playwright starts from `supabase db reset` plus an E2E seed script that loads the same fixture and two test admin accounts with known TOTP secrets **[P] (new in this doc)**. The E2E seed is never run against a real project.

| Item | Test value (made up) | Rule it feeds |
|---|---|---|
| Packages | Package A ₱3,000 (`300000` centavos); Package B ₱4,000 | [cat][cat] §1.1; prices: O-03 |
| Add-ons | Extra microphone ₱200, daily stock 4; Party lights ₱300, daily stock 4 | BR-03; [cat][cat] §1.2 |
| Delivery slots | Morning 10:00–14:00; Afternoon 14:00–18:00; Evening 18:00–22:00 | [cat][cat] §1.3; real times: O-02 |
| On-site hours | 10:00–23:00 (test value only) | BR-02; real hours: O-02 |
| Resources | Set 1, Set 2 (active), the Room; Set 3 is added only where a test needs it | BR-01, BR-02 |
| Settings | Every key at its default in [data-model][data] §7, with the deposit set to ₱1,000 (test value; real amount O-03), `business_info` and `deposit_instructions` filled with test text | Each owning rule |
| Admin accounts | "Test Super Admin" (role `superAdmin`) and "Test Admin" (role `admin`), both with 2FA set up; plus, where a test needs it, a disabled account and an account without 2FA | [roles][roles] §5 |

**Example people.** The same customers as in the other documents. Their mobile numbers and emails are made up; emails use the reserved domain `example.test`, so nothing can reach a real person.

| Person | Mobile (as typed → stored, BR-11) | Email | Typical role in the tests |
|---|---|---|---|
| **Ana** | `0917 123 4567` → `+639171234567` | `ana@example.test` | The running example: delivery on Thu 24 Dec 2026, Afternoon slot, Package A + 2 extra microphones (total ₱3,400, deposit ₱1,000); approval, proof, deposit, balance, Completed |
| **Ben** | `0918 234 5678` → `+639182345678` | none in some tests | On-site and delivery bookings; cancel with a partial refund (Sun 27 Dec 2026); customer without email |
| **Carla** | `0919 345 6789` → `+639193456789` | `carla@example.test` | Wins the race for the last set; on-site at 5:00 PM; walk-in at 7:00 PM; recreated request |
| **Dan** | `0920 456 7890` → `+639204567890` | `dan@example.test` | Loses the race; phone booking; deadline extension; proof not accepted; edit details |
| **Eva** | `0921 567 8901` → `+639215678901` | `eva@example.test` | Expiry by the job; hold limits (she plays "Lia" from the BR-07 example) |
| **Rosa** | `0922 678 9012` → `+639226789012` | `rosa@example.test` | Same-day room booking on Sat 19 Dec 2026 at 7:00 PM, with a deposit waiver |
| *Bulk numbers* | `0999 000 0001` to `0999 000 0009` | none | Many different numbers, for the breaker and rate-limit tests |

Reference codes and QR tokens are random, so tests use the values each call returns. `KSB-7Q2M-K9TX` appears only as the example in the documents.

### 1.4 Browsers, sizes, and outside services

- **Playwright projects [P] (new in this doc):** phone 360 × 800 in Chromium (the minimum width of NFR-16), phone 390 × 844 in WebKit, desktop 1280 × 800 in Chromium and in WebKit (NFR-18). Every TC-E2E runs in all four unless it says otherwise.
- **Email.** Locally and in CI the `EmailProvider` writes to the console or to a capturing fake, so tests read what would have been sent ([arch][arch] §10.5). Resend is used only in TC-W1-04 and in UAT, with the admins' own addresses.
- **Turnstile.** Cloudflare's published test keys (always pass, always fail) ([arch][arch] §10.5).
- **Storage.** The local Supabase Storage with a private bucket configured as in [arch][arch] §2.2.
- **Sentry.** Off locally; TC-SEC-44 and TC-NFR-13 use the real project before launch.

### 1.5 Time control and concurrency

**The clock [P] (new in this doc).** Most rules depend on "now": deadlines, the notice period, "today", the reminder moment, the breaker window, the year of an acknowledgment number, the retention periods. The functions read the time after their locks are held, through `clock_timestamp()` and `app.manila_today()` ([api][api] §1.4). Tests need to set that time. Proposal: every function reads the time through one helper, `app.now()`, which returns `clock_timestamp()`, except in a test database, where a test can set a fixed moment for its own transaction (for example `SET LOCAL app.test_now = '2026-12-24T16:15:00Z'`). The override works only when a test-only marker exists, which only the test setup creates; TC-SEC-54 checks that production has none. Pure predicates such as `app.hold_is_overdue(…, at)` already take the time as an argument ([data-model][data] §8) and are tested directly. This needs a decision in [api-specification][api] and [data-model][data] (open question 1). Playwright tests that need a past deadline move the stored deadline with a test-only SQL helper run as `postgres` on the local database, never through the app.

**Two sessions at once [P] (new in this doc).** The concurrency cases (TC-DB-10 to TC-DB-12, TC-DB-66, TC-DB-83, TC-DB-84, TC-DB-92) need two database sessions that overlap for certain. The harness opens a second session with `dblink` from inside pgTAP, or uses a small two-connection script; session A starts its call inside an open transaction so it holds the lock, session B calls and waits, then A commits. The harness checks the order of events, not timing. Which harness is used is open question 2. TC-W1-02 repeats the race against the deployed function with real parallel requests.

**Invariants after every database test.** A shared helper asserts the four invariants of [data-model][data] §6.7 at the end of each TC-DB case: no claim's status copy differs from its owner; no resource and date has two live claims; after overdue holds are expired, the index's live set equals the view's live set; every delivery claim is on a delivery set and every on-site claim on the room.

### 1.6 CI gates

The pipeline is defined in [architecture][arch] §11. This table says which TCs each gate runs and what it blocks.

| Gate | When | Runs | Blocks |
|---|---|---|---|
| Lint, including the import rules and the WASM checksum | Every push | — (and TC-SEC-12 coverage lint) | Merge |
| Typecheck (`tsc --noEmit`, strict) | Every push | — | Merge |
| Unit tests | Every push | TC-UT; the Vitest parts of TC-SEC | Merge |
| Database tests (`supabase start`, `supabase db reset`, `supabase test db`) | Every push | TC-DB; the pgTAP parts of TC-SEC | Merge |
| Dependency audit (`npm audit --omit=dev`) **[P]** in [arch][arch] | Every push | TC-SEC-49 | Merge |
| Version floors and secret scanner, if [P] accepted ([sec][sec] §4.7, §4.10) | Every push | TC-SEC-41, TC-SEC-48 | Merge |
| End to end, with the axe scan | Pull requests and `main` (**[P]** in [arch][arch]) | TC-E2E; the Playwright parts of TC-SEC and TC-NFR | Merge to `main` |
| Docker standalone build and smoke test | Pull requests and `main` (**[P]** in [arch][arch]) | TC-NFR-06 | Merge to `main` |

`main` changes only through pull requests with green checks, so every production deploy follows a passing run ([arch][arch] §11.1). A red gate is never bypassed; a flaky test is fixed or quarantined with a defect (6.4).

### 1.7 Conventions

- **IDs are never reused or renumbered.** A withdrawn case stays in its table, marked "Withdrawn", with the date and the reason.
- **One case can cover several requirements**, and one requirement is usually covered by several cases. The traceability tables (section 3) are the index.
- **A failing case is a defect** with a severity (6.3), linked to its TC ID.

---

## 2. Test case catalog

