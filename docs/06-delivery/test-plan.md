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

**Two sessions at once [P] (new in this doc).** The concurrency cases (TC-DB-10 to TC-DB-13, TC-DB-66, TC-DB-83, TC-DB-84, TC-DB-92) need two database sessions that overlap for certain. The harness opens a second session with `dblink` from inside pgTAP, or uses a small two-connection script; session A starts its call inside an open transaction so it holds the lock, session B calls and waits, then A commits. The harness checks the order of events, not timing. Which harness is used is open question 2. TC-W1-02 repeats the race against the deployed function with real parallel requests.

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

### 2.1 Database tests (TC-DB, pgTAP)

Every case in this section runs in pgTAP through the Supabase CLI, in its own transaction, with the clock set as in 1.5, and ends with the invariant checks of 1.5. "Two sessions" means the concurrency harness of 1.5. Function names are those of [api-specification][api] §5; table and constraint names are those of [data-model][data] §5.

#### 2.1.1 Capacity and claims

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-01 | One set per delivery booking per date | pgTAP | Fixture; Set 1 and Set 2 active; clock Wed 16 Dec 2026 10:00 | 1. Ana books delivery for 24 Dec, Afternoon. 2. Ben books delivery for 24 Dec, Evening. 3. Carla books delivery for 24 Dec, Morning. 4. Carla books delivery for 25 Dec. | 1 and 2 `ok`, each on a different set picked by the system (lowest name first, api §5.2 [P]). 3 `sold_out`; nothing of Carla's is saved. 4 `ok`: the set is free again the next day. Different slots never share a set's day. | BR-01, BR-04, FR-PUB-06, NFR-20, EC-03, LC r1, WF-01C, WF-05B |
| TC-DB-02 | Delivery and on-site are separate; one room per date | pgTAP | State of TC-DB-01 (delivery full on 24 Dec) | 1. Calendar for 24 Dec, both service types. 2. Carla books on-site, 24 Dec, arrival 17:00. 3. Dan books on-site, 24 Dec, arrival 19:00. 4. Dan books on-site, 26 Dec. | 1 delivery `full`, on-site `available`. 2 `ok`, on the Room. 3 `sold_out`. 4 `ok`. | BR-01, BR-02, BR-09, FR-PUB-03 |
| TC-DB-03 | The delivery pool is the list of active sets | pgTAP | Delivery full on 24 Dec with Set 1 and Set 2 | 1. Super Admin adds Set 3 (`app.create_resource`). 2. Carla books delivery for 24 Dec. 3. List the settings keys. | 1 `ok`. 2 `ok`, on Set 3. 3 No "number of sets" key exists ([data][data] §7). | BR-01, FR-ADM-27, WF-08E |
| TC-DB-04 | Add-on stock: exactly at the limit, and one over | pgTAP | Extra microphone daily stock 4 (BR-03) | 1. Ana: delivery, 24 Dec, 2 microphones. 2. Ben: on-site, 24 Dec, 3 microphones. 3. Ben: on-site, 24 Dec, 2 microphones. 4. Carla: delivery, 24 Dec, 1 microphone. 5. Super Admin blocks the whole of 26 Dec, then `app.check_addon_stock` for 4 microphones on 26 Dec. | 1 `ok`. 2 `addon_short` (2 + 3 is more than 4), the detail names the add-on, nothing saved. 3 `ok`: 2 + 2 equals the stock exactly. 4 `addon_short`: delivery and on-site share one count. 5 No shortage: a whole-date block claims no add-on stock. | BR-03, BR-08, EC-05, FR-PUB-04, FR-PUB-06, WF-05B |
| TC-DB-05 | Which claims are live: the status matrix | pgTAP | One set; one claim per status | For each of the 7 reservation statuses, and for a block that is `active` and `removed`: hold Set 1 on 24 Dec, then add a second live claim on the same set and date. Compare `app.holds_capacity` with the index predicate (`pg_get_indexdef`). | The second claim fails with `23505` exactly when the first owner is Pending Confirmation, Awaiting Deposit, Confirmed, or an active block; it succeeds for Completed, Rejected, Cancelled, Expired, and a removed block. The helper and the index list the same statuses. | BR-04, BR-08, NFR-20, data §6.7 |
| TC-DB-06 | Final statuses and block removal free the capacity at once | pgTAP | One set; Ana holds it on 24 Dec | In separate runs, move Ana to Rejected, Cancelled, Expired (job), and Completed (job on 25 Dec); in a fifth run an active block on Set 1 is removed. After each, read the claim and the calendar, and (except after Completed) let Carla book Set 1 for 24 Dec. | The claim stops being live in the same statement (the foreign-key cascade, data §6.2); the calendar shows `available`; Carla `ok`. | BR-04, BR-08, FR-ADM-08, FR-ADM-18, FR-ADM-25, FR-SYS-01, FR-SYS-04 |
| TC-DB-07 | An overdue hold stops counting at once | pgTAP | One set; Ana sent her request Sat 12 Dec 2026 09:00 for Thu 24 Dec (deadline Tue 15 Dec 09:00, the BR-05 example); no job runs | At 08:59:59 and at 09:00:00 on 15 Dec: 1. calendar for 24 Dec; 2. Ana's status view; 3. the admin view. Then at 09:00:00: 4. Carla books delivery for 24 Dec. | 08:59:59: `full`, Pending Confirmation. 09:00:00 (the deadline is reached: `deadline <= now`, api §5.1): `available`; the status view and the admin view show Expired before any job has run. 4 `ok`, on Set 1: in the same call Ana is recorded Expired first, with audit `reservation.expired`, actor `system`, and one `expired` email. | BR-05, BR-04, EC-22, EC-48, FR-PUB-03, FR-PUB-11, FR-ADM-02, FR-ADM-03, LC r9, WF-05A, WF-05D |
| TC-DB-08 | A paused hold keeps counting until the service start | pgTAP | One set; Ana Awaiting Deposit, deadline Fri 18 Dec 14:00, service start Thu 24 Dec 14:00; proof recorded at 13:50 | 1. Fri 18 Dec 14:01: calendar for 24 Dec; Carla books delivery for 24 Dec. 2. Thu 24 Dec 14:00: calendar. | 1 `full`; Carla `sold_out`; Ana still Awaiting Deposit (expiry paused, BR-12). 2 Ana counts as expired (api §5.1 part (b) [P]; [wf-avail][wf-avail] open question 3). | BR-05, BR-12, EC-27, EC-31, WF-05D |
| TC-DB-09 | The live-claim guard itself | pgTAP | Fixture | 1. Catalog check: both claim foreign keys have `confupdtype = 'c'`; the text of `resource_claims_one_live_uq` is as expected. 2. As `postgres`, change a claim's status copy. 3. Insert a claim on a date other than its owner's. 4. Insert a half-filled claim (an id without its status). 5. Insert a second live claim directly. 6. Replace `app.claim_resource` with a test double that returns a set already claimed, then call `app.book_reservation` and `app.reschedule_reservation`. | 1 As expected. 2 and 3 fail with `23503`. 4 fails its CHECK. 5 fails with `23505`. 6 `sold_out` and `not_free`, nothing saved (api §1.6). | NFR-20, BR-01, BR-02, BR-08, data §6.2, §6.7 |
| TC-DB-10 | Two customers, the last set, the same instant | pgTAP, two sessions | Only Set 1 free on 24 Dec; Carla and Dan; clock Wed 16 Dec 15:00 | Session A (Carla) calls `app.book_reservation` inside an open transaction; session B (Dan) calls and waits on the capacity lock; A commits; B returns. Repeat with B first. | Carla `ok`; Dan `sold_out`, with no reservation, claim, key, audit entry, or email for him; exactly one `admin_new_request`. The repeat gives the mirror result. | BR-01, NFR-20, EC-03, EC-04, FR-PUB-06, WF-05C |
| TC-DB-11 | A block racing a booking for the same set | pgTAP, two sessions | Only Set 1 free on 24 Dec | Run 1: session A (Admin) runs `app.create_blocks` for Set 1 on 24 Dec and holds its transaction; session B (Carla) books delivery for 24 Dec; A commits. Run 2: Carla first, then the block. | Exactly one succeeds each time. Run 1: the block `ok`, Carla `sold_out`. Run 2: Carla `ok`, the block `conflict` listing her reservation. Never two live claims. | EC-17, EC-18, BR-04, BR-08, NFR-20, WF-05B, WF-08H |
| TC-DB-12 | Races around a deadline | pgTAP, two sessions | One set. Run 1: Ana's hold on 24 Dec is overdue but not yet recorded. Run 2: Dan is Pending with a deadline of 10:00:00 | Run 1: Carla and Ben book 24 Dec at the same instant. Run 2: the Admin approves Dan at 09:59:59 while the expiry job runs at 10:00:00, in both orders. | Run 1: one `ok`, one `sold_out`; Ana is recorded Expired exactly once (one audit entry, one `expired` email). Run 2: never both. If approve gets the row first, Dan is Awaiting Deposit and the job skips him; if the job gets it first, Dan is Expired and approve returns `not_allowed`. | BR-05, EC-22, EC-23, NFR-20, NFR-21, data §6.7 |
| TC-DB-13 | A long lock wait returns "busy" | pgTAP, two sessions | — | Session A holds the capacity lock longer than the `app_rw` lock timeout (2 s, data §2.3); session B books. | B `busy`; nothing saved for B; A unaffected. | NFR-21, TM-33, api §1.6 |

#### 2.1.2 Notice, the urgent flag, and staff-created bookings

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-14 | Notice-period boundaries | pgTAP | Rosa; on-site on Sat 19 Dec 2026, arrival 19:00; delivery in the Evening slot (18:00) | 1. On-site submits at 17:45, 18:00:00, 18:00:01, and 18:20. 2. Delivery submits at 16:30 and 17:15. 3. An on-site arrival at 09:00 (before the fixture's opening). 4. Super Admin sets the notice period to 90 minutes; Rosa submits on-site at 17:45. | 1 17:45 `ok`; 18:00:00 `ok` (exactly 1 hour, BR-06); 18:00:01 and 18:20 `too_soon`. 2 16:30 `ok`; 17:15 `too_soon`. 3 `outside_onsite_hours`. 4 `too_soon`: the new setting applies to the next submission. The moment that counts is the function's clock at Submit. | BR-06, EC-06, FR-PUB-04, FR-ADM-28, WF-01C |
| TC-DB-15 | "Urgent" means the event date is today in Manila | pgTAP | One reservation per source: online, phone, walk-in, Facebook | 1. Event date today; read `is_urgent`. 2. Event date tomorrow. 3. Clock 2026-12-23T16:30Z (Thu 24 Dec 00:30 Manila): an online request for 24 Dec, 14:00. 4. Reschedule a 26 Dec hold to today. | 1 Urgent for every source. 2 Not urgent. 3 Accepted and urgent, although the UTC date is still 23 Dec (the NFR-19 example). 4 Urgent after the reschedule (the computed flag, data §5.20 [P]). | BR-06a, NFR-19, EC-42, EC-49, EC-82, FR-ADM-02 |
| TC-DB-16 | Staff bookings skip notice, hold limits, and the breaker, never capacity | pgTAP | Eva has 2 open online holds; online booking is paused (TC-DB-22); clock Sun 27 Dec 16:00 | 1. Admin creates a walk-in for Eva: on-site, 27 Dec, 19:00. 2. A phone booking for Eva: delivery, 28 Dec. 3. Both sets held on 29 Dec; a phone booking for delivery on 29 Dec. 4. A phone booking with 5 microphones. | 1 `ok`: Pending Confirmation, source `walk_in`, urgent; `request_received` only, no `admin_new_request`. 2 `ok`; neither is counted by BR-07. 3 `not_free`. 4 `addon_short`. | BR-06a, BR-07, BR-07a, EC-45, FR-ADM-24, FR-NTF-01, FR-NTF-13, LC r2, WF-04G |
| TC-DB-17 | When a staff booking must finish in one step | pgTAP | Clock Sun 20 Dec 2026 18:40 | Create staff on-site bookings for 20 Dec with arrival 18:30 (already passed), 19:00, 19:40, and 21:00; each once without and once with one-step fields. | 18:30 and 19:00: without `one_step_required`; with `ok`. 19:40 (exactly the notice period, which meets it, BR-06; Q5b) and 21:00: without `ok` (Pending Confirmation); with `one_step_not_allowed`. | BR-06a, BR-06, EC-41, FR-ADM-24, api §3.6 |
| TC-DB-18 | One-step booking with a deposit | pgTAP | Carla walks in Sun 20 Dec 18:40 for the Room at 19:00; deposit setting ₱1,000 | 1. One-step deposit, cash, ₱1,000. 2. The same with ₱900. 3. E-wallet without a reference number. | 1 `ok`: Confirmed, deadline null, urgent, a deposit with the next ACK number and `verified_at`; audit `reservation.created_by_staff` and `payment.deposit_recorded`; emails `request_received` and `confirmed` (Prov., FR §7 question 1); no admin email. 2 `amount_mismatch`. 3 `invalid_ewallet_ref`. Nothing saved in 2 and 3. | BR-06a, EC-41, FR-ADM-24, FR-ADM-11, FR-NTF-07, LC r2, LC r6, WF-04G |
| TC-DB-19 | One-step booking with a waiver | pgTAP | Clock Sun 20 Dec 18:40 | 1. One-step waiver without a reason. 2. With the reason "regular customer". 3. Later, record a ₱1,000 deposit on booking 2. 4. Record a second deposit on it. | 1 `reason_required`. 2 `ok`: Confirmed, waived, no payment row, the reason in the audit entry. 3 `ok`: an acknowledgment is issued, the status stays Confirmed, no `confirmed` email (EC-44). 4 `deposit_exists` (EC-35). | BR-06a, EC-35, EC-41, EC-44, FR-ADM-13, FR-ADM-24, LC §6.4 |

#### 2.1.3 Hold limits and the breaker

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-20 | Hold limit per date, in any mobile format | pgTAP | Eva (the "Lia" of the BR-07 example); clock Mon 14 Dec 2026 | 1. An online request for Sat 19 Dec with `0921 567 8901`. 2. Another for 19 Dec with `+63 921 567 8901`. | 1 `ok`. 2 `hold_limit_date`. The result holds no reference code, QR, or id of the first request (TM-26; if [P] accepted, sec §4.4). | BR-07, BR-11, EC-09, TM-26, WF-01C |
| TC-DB-21 | Hold limit in total, and what counts | pgTAP | Eva holds 19 Dec (TC-DB-20) | 1. A request for Sat 26 Dec. 2. One for Thu 31 Dec. 3. The 19 Dec booking is approved and its deposit recorded; request 31 Dec again. 4. Move the clock past the 26 Dec hold's deadline (no job run); request Sat 2 Jan 2027. 5. A staff booking for Eva. 6. Give Eva one Rejected, Cancelled, Expired, and Completed reservation each; request again. | 1 `ok` (2 open). 2 `hold_limit_total`. 3 `ok`: Confirmed no longer counts. 4 `ok`: an overdue hold stops counting at once (EC-10). 5 Not counted and not limited. 6 None of them counts. | BR-07, BR-05, BR-06a, EC-10 |
| TC-DB-22 | The breaker trips on the 7th online request within 60 minutes | pgTAP | Bulk numbers; Sat 19 Dec 2026 | 1. Six online requests at 14:00, 14:08, 14:16, 14:24, 14:32, and 14:40. 2. A seventh at 14:45. 3. An eighth at 14:50. 4. A staff booking at 14:50. 5. A separate run where the first of the six is at 13:44 (61 minutes before 14:45). | 1 All `ok`. 2 `breaker_tripped`, with no reservation saved; the trip itself is kept: `online_paused_until` 15:45 (60 minutes, BR-07a), audit `settings`·`online_booking.paused` with actor `system`, and both admins receive exactly one `admin_online_paused` email (one outbox row per admin, api §5.9). 3 `paused`, no second email. 4 `ok` (BR-06a). 5 The seventh is `ok`: only the last 60 minutes count (exact boundary: Q5c). | BR-07a, BR-06a, EC-14, EC-15, FR-NTF-15, FR-ADM-02, TM-31, WF-01C |
| TC-DB-23 | The pause ends by itself, or early | pgTAP | Paused until 15:45 (TC-DB-22) | 1. At 15:45, an online request. 2. A new trip; the Admin calls `app.resume_online_booking`. 3. The same call again. 4. `app.update_setting` on `online_paused_until`. | 1 `ok`, with no admin action. 2 `ok`: `online_paused_until` null; audit `settings`·`online_booking.resumed_early`; the next online request is accepted. 3 `not_paused`, nothing written. 4 `not_allowed`. | BR-07a, FR-ADM-28, FR-ADM-29, WF-08G |

#### 2.1.4 Blocks

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-24 | Set and room blocks, one per date | pgTAP | Set 1 and Set 2 | 1. The Admin blocks Set 2 for 21 to 23 Dec, reason "repair". 2. The same without a reason. 3. Ana and Ben book delivery for 22 Dec. 4. The Admin blocks the Room on 22 Dec. 5. Calendar for 22 Dec. | 1 `ok`: three blocks, one audit entry each. 2 `reason_required`. 3 Ana `ok`, Ben `sold_out`. 4 `ok`. 5 Delivery `full`, on-site `full`. | BR-08, BR-09, FR-ADM-25, WF-08H |
| TC-DB-25 | A block is refused when its target is taken | pgTAP | Ana Pending on Set 1 for 24 Dec | 1. Block Set 1 on 24 Dec. 2. Block Set 2 on 24 Dec, twice. 3. Cancel Ana; block Set 1 on 24 Dec. 4. Ben holds Set 1 on 25 Dec; block Set 1 for 23 to 25 Dec. 5. An overdue hold on Set 2 for 26 Dec; block Set 2 on 26 Dec. | 1 `conflict` naming Ana's reservation. 2 First `ok`, second `conflict` naming that block. 3 `ok`. 4 `conflict` listing every clash, and no block created (Prov., whole range or nothing; EC §15 question 1). 5 The overdue hold is recorded Expired first, then `ok` (api §5.6 [P]). | BR-08, BR-05, EC-18, FR-ADM-25, WF-08H |
| TC-DB-26 | Whole-date blocks belong to the Super Admin | pgTAP | No bookings on 25 Dec; one booking on 26 Dec | 1. The Admin creates a whole-date block on 25 Dec. 2. The Super Admin does. 3. Calendar, claims, and microphone stock for 25 Dec. 4. The Super Admin blocks the whole of 26 Dec. | 1 `forbidden`. 2 `ok`: one claim on each active set and on the Room. 3 Delivery and on-site `full`; no add-on units claimed. 4 `conflict` naming the booking. | BR-08, EC-19, EC-74, FR-ADM-25 |
| TC-DB-27 | Removing a block | pgTAP | Set 2 blocked on 23 Dec; a whole-date block on 25 Dec | 1. The Admin removes the 23 Dec block without a reason. 2. With the reason "repaired". 3. Again. 4. The Admin removes the whole-date block. 5. As `postgres`, set a removed block back to `active`; change a block's date. | 1 `reason_required`. 2 `ok`: `removed`, with who, when, and the reason; Set 2 bookable on 23 Dec at once. 3 `already_removed`. 4 `forbidden`. 5 Refused by the block guard: the only change is active to removed. | BR-08, LC §7, FR-ADM-25, WF-08I |

#### 2.1.5 The calendar

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-28 | The calendar shows only Available or Full | pgTAP | Fixture; clock Sat 19 Dec 2026 | 1. `app.availability_calendar` for both types over the booking window. 2. At 16:30 and 17:15 with one set free today. 3. On-site today at 21:30 and at 22:15, with the Room free (the fixture's hours end at 23:00). 4. Submit for today − 1, today + 180, and today + 181. 5. While online booking is paused. 6. A date with every microphone booked and a set free. | 1 Each date has only `available` or `full`: no counts, names, or other data. 2 16:30 `available` (the 18:00 slot is 1 h 30 min away); 17:15 `full` (EC-07). 3 21:30 `available`; 22:15 `full`. 4 Today − 1 and today + 181 `outside_window`; today + 180 accepted (reading of "through", Q5a); so 31 Jul 2027 is not offered. 5 `onlinePaused` true; the labels are still returned (api §2.1). 6 `available`: add-on stock never changes the label (BR-09; checked at Submit, TC-DB-04). | BR-09, BR-03, BR-06, EC-05, EC-07, EC-08, FR-PUB-03, NFR-15, WF-05A |

#### 2.1.6 Catalog and settings changes

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-29 | Lowering an add-on's daily stock | pgTAP | Microphones: stock 4, 3 booked on 24 Dec by live reservations. Party lights: stock 4, 3 booked on Sat 2 Jan 2027 (the BR-10 example) | 1. Lower microphones to 2. 2. To 3. 3. Raise to 4, book 4 on 26 Dec, lower to 3. 4. Let the 24 Dec and 26 Dec holds become overdue; lower to 2. 5. Raise to 6. 6. Lower party lights to 2, then to 3. | 1 `conflict` listing the 24 Dec reservations. 2 `ok`. 3 `conflict` listing 26 Dec. 4 `ok` if no live, non-overdue claims exceed 2. 5 `ok`: raising never clashes. 6 `conflict`, then `ok`. Audit `addon.stock_changed`. | BR-10, BR-03, BR-05, EC-57, FR-ADM-26, WF-08B |
| TC-DB-30 | Archiving an item that live reservations use | pgTAP | Ana Pending with Package A, microphones, and the Afternoon slot | 1. Archive Package A, the microphones, and (Super Admin) the Afternoon slot. 2. The Admin archives a slot. 3. Cancel Ana; archive Package A. 4. `app.public_catalog()`. 5. Submit with Package A; with an archived slot. 6. Ana's cancelled reservation. 7. Archive Package A again. | 1 `conflict` for each, listing Ana. 2 `forbidden`. 3 `ok`; the row stays (never deleted). 4 Package A not listed. 5 `item_unavailable`; `slot_inactive`. 6 Still shows Package A at ₱3,000. 7 `not_allowed`. | BR-10, EC-58, FR-ADM-26, FR-ADM-28, FR-PUB-02, NFR-22, WF-08C, WF-08D |
| TC-DB-31 | Deactivating a set or the room | pgTAP | Set 3 has a Confirmed booking on Sat 2 Jan 2027 (the BR-10 example); clock Mon 21 Dec 2026 | 1. The Super Admin deactivates Set 3. 2. The Admin tries. 3. Cancel the booking; add an active block on Set 3 for 5 Jan; deactivate. 4. Remove the block; deactivate. 5. Create a second active Room. 6. Rename Set 1 while it holds a claim. | 1 `conflict` listing the booking. 2 `forbidden`. 3 `conflict` listing the block. 4 `ok`: Set 3 inactive, not deleted; delivery capacity drops by one. 5 `not_allowed` (one room, BR-02). 6 `ok`; the claim stays on the same set. | BR-10, BR-01, BR-02, EC-59, FR-ADM-27, WF-08E |
| TC-DB-32 | Price and setting changes never move existing reservations | pgTAP | Ana submitted with Package A at ₱3,000 and a ₱1,000 deposit; Ben's request of Sat 26 Dec 2026, approved | 1. The Admin raises Package A to ₱3,500. 2. On Mon 28 Dec the Super Admin raises the deposit to ₱1,500. 3. Change the Afternoon slot to 13:00–17:00, the on-site hours, and the 72-hour and 24-hour settings. 4. Record Ben's deposit with ₱1,500, then ₱1,000. 5. A new submission. | 1 to 3 No existing reservation changes: Ana keeps ₱3,000 and ₱1,000, her service start 14:00, and her stored deadline. 4 `amount_mismatch`, then `ok`. 5 Locks ₱3,500 and ₱1,500. | EC-55, EC-56, BR-10, FR-ADM-26, FR-ADM-28, FR-PUB-06, LC §3.1, §3.2, cat §2.2, WF-08F |

#### 2.1.7 Mobile numbers

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-33 | Mobile normalization in the database | pgTAP | The shared file of mobile inputs (also used by TC-UT-02) | 1. `app.normalize_mobile` on each input. 2. Submit, look up, edit details, create a staff booking, and process an erasure with an invalid number. 3. As `postgres`, insert a reservation with a number not in the standard form. | 1 `0917 123 4567`, `917-123-4567`, `63 917 123 4567`, and `+63 917 123 4567` give `+639171234567`; `02 8123 4567`, `0917 123 456`, and `12345` give null. 2 `invalid_mobile` from each. 3 Fails `reservations_mobile_chk`. | BR-11, EC-11, FR-PUB-05, FR-PUB-10, FR-ADM-10, FR-ADM-24 |

#### 2.1.8 Deposit proofs

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-34 | A proof uploaded before the deadline pauses expiry | pgTAP | Ana Awaiting Deposit, due Fri 18 Dec 14:00 | 1. At 13:50: `app.issue_proof_upload_slot` for a 600 KB JPG; store the object; `app.record_proof_upload`. 2. At 14:00: run the expiry job. 3. Read the "proofs to verify" set. | 1 `ok`: `expiry_paused` true; a proof row with the object's stored time; version + 1; audit `proof.uploaded` with actor `customer`; one `admin_proof_uploaded` email. 2 Ana stays Awaiting Deposit and keeps her set. 3 Lists Ana, with her service start. | BR-12, EC-27, FR-PUB-12, FR-NTF-14, FR-ADM-02, LC §5, WF-07E |
| TC-DB-35 | Upload refusals and limits | pgTAP | Ana Awaiting Deposit, due 14:00 | Each step in its own run, so the slot rate limit does not carry over: 1. A slot for a 1.2 MB file; for `image/svg+xml`. 2. A slot while Pending; while Confirmed. 3. A slot after the deadline (not paused). 4. A slot issued at 13:59 whose object is stored at 14:00:01. 5. A slot while a proof waits for review. 6. Two proofs recorded (the first rejected); a third slot. 7. Four slot requests within one hour. 8. Confirm a slot whose file never arrived. 9. Confirm the same slot twice. | 1 `upload_invalid_file` (FR-PUB-12 types and size). 2 `not_allowed`. 3 `overdue` (EC-32). 4 `overdue`: the stored time counts (api §5.3 [P]). 5 `proof_pending` (Prov., api §2.7). 6 `upload_limit` (2 per reservation, ever, FR-PUB-12). 7 The fourth `rate_limited` (3 per reservation per hour, NFR-11). 8 `upload_missing`. 9 The second returns the first result. | FR-PUB-12, NFR-11, NFR-14, BR-12, EC-30, EC-32, TM-13, TM-14 |
| TC-DB-36 | Verifying a proof after the deadline | pgTAP | State of TC-DB-34; clock Fri 18 Dec 16:30 | 1. The Admin calls `app.verify_proof` with ₱900. 2. With ₱1,000, e-wallet, reference `1234567890`. 3. Verify the same proof again. 4. In a separate run, verify at the service start (Thu 24 Dec 14:00). | 1 `amount_mismatch`. 2 `ok`: Confirmed, deadline null, `expiry_paused` false, a deposit with an ACK number and `verified_at`, the proof `verified` with who and when, two audit entries (`proof.verified`, `payment.deposit_recorded`), a `confirmed` email. 3 `stale_version` (the proof already has a review). 4 `overdue`. | BR-12, EC-27, EC-34, FR-ADM-11, FR-ADM-12, FR-NTF-07, LC r6, WF-04E |
| TC-DB-37 | Rejecting a proof | pgTAP | Ana Awaiting Deposit, due Fri 18 Dec 14:00; proof recorded at 13:30 | 1. At 13:45, reject without a reason. 2. At 13:45, reject with "reference number unreadable". 3. At 13:50 a second upload; at 16:30 reject it with "amount does not match". | 1 `reason_required`. 2 `ok`: still Awaiting Deposit, the original 14:00 deadline applies again, `expiry_paused` false, a `proof_not_accepted` email with the reason; a second upload is allowed (EC-29). 3 `ok`: the deadline has passed, so Ana is Expired at once (LC r10c [P]): claims released, QR invalid, audit `proof.rejected` and `reservation.expired` with actor `admin`, emails `proof_not_accepted` and `expired`. | BR-12, EC-28, EC-29, FR-ADM-12, FR-NTF-06, FR-NTF-12, LC r10, WF-04E |
| TC-DB-38 | A proof still unreviewed at the service start | pgTAP | Delivery Sat 19 Dec 2026, Evening slot (18:00); approved 13:00 (deadline 18:00); proof at 17:30 (EC-31) | Run the expiry job at 17:59 and at 18:00. | 17:59: still Awaiting Deposit (paused). 18:00: Expired (LC r10b), actor `system`, `expired` email; the set is free. | BR-12, EC-31, FR-ADM-12, FR-SYS-01, LC r10, WF-04E |

#### 2.1.9 Allowed status changes (lifecycle rows 1 to 15)

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-39 | Row 1: an online request is saved | pgTAP | Ana; clock Wed 16 Dec 2026 10:00 | 1. Ana submits: delivery, 24 Dec, Afternoon, Package A, 2 microphones. 2. Separately, Dan submits on Mon 21 Dec 10:00 for Tue 22 Dec, Afternoon (EC-20). 3. Ana's submission key again, same data. | 1 `ok`: Pending Confirmation, source `online`, service start 24 Dec 14:00, deadline Sat 19 Dec 10:00 (72 h, LC §3.2), not urgent; package ₱3,000, 2 × ₱200, deposit ₱1,000, total ₱3,400 locked; a reference code matching FR-PUB-08; a 32-byte QR hash; a set claim and 2 microphones; the key's hash stored; audit `reservation.submitted` with actor `customer`; `request_received` and `admin_new_request`. 2 Deadline = the service start, Tue 22 Dec 14:00. 3 `duplicate` with the same reference code; nothing new (EC-01). | LC r1, LC §3.1, §3.2, BR-04, FR-PUB-06, FR-PUB-08, FR-NTF-01, FR-NTF-13, EC-01, EC-20, D-12, WF-01C, WF-02 |
| TC-DB-40 | Row 2: a normal staff-created booking | pgTAP | Dan phones on Mon 21 Dec 2026 for a delivery on Sat 2 Jan 2027 | 1. The Admin creates it (source `phone`, Dan's email given). 2. Approve it. 3. Send the same submission key again. | 1 `ok`: Pending Confirmation, deadline as in row 1, `created_by` the Admin, prices locked now; `request_received` only; audit actor `admin`. 2 `ok`: Awaiting Deposit. 3 `duplicate` (api §1.8 [P]). | LC r2, BR-06a, FR-ADM-24, FR-NTF-01, WF-04G |
| TC-DB-41 | Row 3: recreate an expired request | pgTAP | Carla's on-site request for Sat 2 Jan 2027, 17:00, expired; its locked deposit ₱1,000; the deposit setting now ₱1,500; clock Wed 30 Dec 2026 09:00 | 1. The Admin recreates it. 2. Recreates the same original again. 3. Separate runs: the Room taken that day; microphones short; the original's service start passed; Package A archived; Carla has 2 open online holds. 4. Recreate a Pending reservation. 5. Recreate an overdue hold not yet recorded. | 1 `ok`: a new Pending reservation with a new reference code and QR, deadline Sat 2 Jan 09:00 (72 h, before the 17:00 start), current prices, deposit ₱1,500, `recreated_from` set; the original stays Expired; `request_received`; audit `reservation.recreated` on the new row. 2 `not_free`: the first recreate holds the Room. 3 `not_free`; `addon_short`; `service_start_passed` (Prov., EC §15 question 2); `item_unavailable` (Prov.); `ok` with 2 open holds (no hold-limit check, BR-07). 4 `not_allowed`. 5 The original is recorded Expired, then recreated (api §5.4 [P]). | LC r3, LC §6.9, BR-07, EC-52, FR-ADM-21, FR-NTF-01, WF-06G |
| TC-DB-42 | Row 4: approve | pgTAP | Ana Pending (sent Wed 16 Dec 10:00), flagged "needs info" | 1. The Admin approves on Thu 17 Dec 14:00. 2. Separately, a request for Thu 24 Dec, Morning (10:00), approved Wed 23 Dec 16:00 (EC-21). 3. Rosa's same-day request approved Sat 19 Dec 17:40. | 1 `ok`: Awaiting Deposit, deadline Fri 18 Dec 14:00 (24 h), `approved_at` set, needs info cleared, claims kept, `approved` email, audit `reservation.approved`. 2 Deadline Thu 24 Dec 10:00 (capped at the service start). 3 Deadline 19:00. | LC r4, LC §3.2, EC-21, FR-ADM-08, FR-NTF-03, WF-04A |
| TC-DB-43 | Rows 5 and 7: the same-day deposit waiver | pgTAP | Rosa Pending for the Room, Sat 19 Dec 2026 19:00; an Awaiting Deposit booking for today whose proof is under review past its deadline; a booking for Sun 20 Dec | 1. At 17:40, waive Rosa without a reason. 2. With "regular customer, pays in full on arrival". 3. Waive the paused Awaiting Deposit booking. 4. Waive the 20 Dec booking on 19 Dec; then at 2026-12-19T23:30Z (Sun 20 Dec 07:30 Manila). 5. Waive an overdue, unpaused hold for today. | 1 `reason_required`. 2 `ok`: Confirmed, deadline null, waived, no payment, a `confirmed` email without an acknowledgment link, the reason in the audit entry. 3 `ok`: paused before the service start is not overdue (LC r7). 4 `not_today` on 19 Dec; `ok` at 07:30 Manila on 20 Dec, though UTC is still 19 Dec (EC-82). 5 `overdue`. | LC r5, LC r7, LC §6.4, EC-42, EC-43, EC-82, FR-ADM-13, FR-NTF-07, NFR-19, WF-04F |
| TC-DB-44 | Row 6: record a deposit | pgTAP | Ana Awaiting Deposit, due Fri 18 Dec 14:00; no acknowledgment yet this year | 1. At 11:00, record ₱600. 2. ₱1,000 e-wallet with no reference; cash with a reference. 3. ₱1,000 e-wallet, reference `1234567890`. 4. Record another deposit on Ana. 5. In a separate run, record at 14:00:00 (deadline reached, not paused). | 1 `amount_mismatch` (EC-34). 2 `invalid_ewallet_ref`. 3 `ok`: Confirmed, deadline null, a deposit with `ACK-2026-0001`, received by the Admin, `verified_at` set; `confirmed` email; audit `payment.deposit_recorded`. 4 `not_allowed`: a Confirmed booking takes a deposit only after a waiver (api §5.5). 5 `overdue` (EC-23). | LC r6, BR-12, EC-23, EC-34, FR-ADM-11, FR-NTF-07, cat §4.3, WF-04D |
| TC-DB-45 | Row 8: reject | pgTAP | Ana Pending, flagged "needs info" | 1. Reject without a reason. 2. With "outside our service area". 3. Resolve her QR token. 4. Reject an overdue Pending request. | 1 `reason_required`. 2 `ok`: Rejected, the reason saved, claims released, needs info cleared, closure date set, `rejected` email with the reason, audit with the reason. 3 Not valid. 4 `overdue`. | LC r8, BR-04, EC-13, FR-ADM-08, FR-NTF-09, FR-PUB-08, WF-04B |
| TC-DB-46 | Rows 9 and 10a: the expiry job | pgTAP | Eva Awaiting Deposit, due Tue 22 Dec 2026 10:00, nothing recorded (the FR-SYS-01 example); Dan Pending, sent Wed 16 Dec 10:00, flagged "needs info" at 11:00 (EC-24) | 1. Run `app.expire_overdue_holds()` on 22 Dec at 09:59 and at 10:00; on Sat 19 Dec at 10:00. 2. Run it twice in a row. 3. Start two runs at once. | 1 Eva Expired at 10:00, not at 09:59. Dan Expired on Sat 19 Dec at 10:00 with needs info cleared (the flag does not pause the clock, D-13). Each: claims released, QR invalid, closure date set, audit actor `system`, one `expired` email, a `job_runs` row with the count. 2 The second run changes nothing and queues nothing (EC-68). 3 The second waits on the job's lock; nothing is done twice. | LC r9, LC r10, BR-05, EC-24, EC-68, EC-77, FR-SYS-01, FR-SYS-09, FR-SYS-10, FR-NTF-12, WF-06F |
| TC-DB-47 | Rows 11, 12, and 13: cancel | pgTAP | A Pending; an Awaiting Deposit; an Awaiting Deposit with a proof under review past its deadline; Ben Confirmed with an active ₱1,000 deposit for Sun 27 Dec 2026; a Confirmed booking with a waiver and no payment; clock Tue 22 Dec | 1. Cancel each without a reason. 2. Cancel the Pending and the Awaiting with a reason. 3. Cancel the paused Awaiting. 4. Cancel Ben with "family emergency" and no refund decision; then with "partial, ₱500". In separate runs: "partial, ₱1,200"; "partial, ₱0". 5. Cancel the waived booking with no refund decision. 6. Cancel an overdue, unpaused hold. | 1 `reason_required`. 2 `ok`: Cancelled, claims released, needs info cleared (Pending), QR invalid, `cancelled` email. 3 `ok`: paused before the service start is not overdue. 4 `refund_decision_required`; then `ok` with the decision, who decided, and when; ₱1,200 and ₱0 give `invalid_input` (more than 0 and at most what was paid, api §5.4 [P]). 5 `ok` (Prov., LC §9 question 2). 6 `overdue`. | LC r11, LC r12, LC r13, LC §6.6, BR-04, EC-39, FR-ADM-18, FR-NTF-10, WF-06A |
| TC-DB-48 | Row 14: Completed after Manila midnight | pgTAP | Ana Confirmed for Thu 24 Dec 2026 (deposit paid); Ben Confirmed for Fri 25 Dec; one Pending and one Awaiting Deposit reservation | 1. Run `app.complete_finished_events()` at 2026-12-24T15:59Z (24 Dec 23:59 Manila). 2. At 2026-12-24T16:15Z (Fri 25 Dec 00:15 Manila). 3. Again. 4. Record Ana's ₱2,400 balance on Sat 26 Dec. | 1 Nothing changes. 2 Ana Completed: claims released, QR invalid, closure date Fri 25 Dec 2026, audit actor `system`, no email; Ben, the Pending, and the Awaiting untouched. 3 Nothing changes. 4 `ok`, with an acknowledgment; the closure date moves to 26 Dec (the latest payment, priv §6.1). | LC r14, LC §6.8, BR-04, EC-38, FR-SYS-04, FR-ADM-14, FR-PUB-08, NFR-19, WF-06H |
| TC-DB-49 | Row 15: event not held | pgTAP | Ana Completed (TC-DB-48) | 1. Mark not held without a reason; without a refund decision. 2. With a reason and the decision "none". 3. Mark a Confirmed booking not held. 4. Mark Ana again. | 1 `reason_required`; `refund_decision_required`. 2 `ok`: Cancelled, reason and decision with who and when, no claim change, audit `reservation.event_not_held`, no email (Prov., FR §7 question 7), closure date recomputed from this change (Prov., priv §11 question 10). 3 `not_allowed`. 4 `not_allowed`: Cancelled is final. | LC r15, LC §6.7, EC-51, FR-ADM-20, WF-06I |

#### 2.1.10 Forbidden status changes

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-50 | The status guard refuses every forbidden change | pgTAP | One reservation per status | 1. Insert a reservation with each status other than Pending. 2. For every ordered pair of the 7 statuses (42 pairs), `UPDATE … SET status` as `postgres`, with the other fields made consistent. | 1 Refused: a new row must be Pending. 2 The 11 arrows of LC §2 succeed; the 31 forbidden pairs listed below raise an error. | LC §2, EC-53, NFR-21, data §5.3 |
| TC-DB-51 | Each action refuses the statuses it does not allow | pgTAP | One reservation per stored status, not overdue, with the flags each action needs | Call every action function on every status, as each role; compare with `app.allowed_actions`. | The results of the action matrix below; `app.allowed_actions` returns exactly the allowed cells for each role. | EC-53, FR-ADM-04, FR-ADM-07, LC §4.1, §5, api §5.4, §5.5, §5.8 |
| TC-DB-52 | The jobs touch only their own statuses | pgTAP | One reservation per status, with past deadlines and past event dates where the constraints allow | Run the expiry job and the Completed job. | Expiry changes only overdue Pending and Awaiting Deposit holds (and paused ones at their service start); Completed changes only Confirmed bookings whose event date is before today. Confirmed never becomes Expired; holds never become Completed; final statuses never change. | LC §1.1, §6.8, FR-SYS-01, FR-SYS-04 |
| TC-DB-53 | Every action treats an overdue hold as expired | pgTAP | Ana Pending and Dan Awaiting Deposit, both overdue and not paused, not yet recorded | 1. Call approve, reject, flag and clear needs info, waive, record deposit, extend, edit details, reschedule, cancel, and reissue QR on each. 2. Repeat with Dan's expiry paused before his service start. 3. Add an internal note and set a legal hold on Ana. | 1 Every call `overdue`, nothing written. 2 Not overdue: each call runs its own checks. 3 `ok`: these accept an overdue hold (api §5.4). | BR-05, EC-22, EC-23, EC-26, FR-ADM-07, LC §3.3, api §5.1 |

**The 31 forbidden status changes** (TC-DB-50 at the database guard; TC-DB-51 and TC-DB-52 through the functions and jobs). The 11 allowed arrows are rows 4 to 15 of LC §4.2.

| From | Forbidden targets | How the functions and jobs are tried | Expected |
|---|---|---|---|
| Pending Confirmation | Completed | The Completed job | Untouched |
| Awaiting Deposit | Pending Confirmation, Completed, Rejected | Reject; a proof rejection before the deadline; the Completed job | `not_allowed`; stays Awaiting Deposit; untouched |
| Confirmed | Pending Confirmation, Awaiting Deposit, Rejected, Expired | Approve; reject; reject proof; extend; a void of its deposit; a reschedule; the expiry job | `not_allowed`; a void and a reschedule keep it Confirmed; the job ignores it |
| Completed | Pending Confirmation, Awaiting Deposit, Confirmed, Rejected, Expired | Approve; waive; record deposit; reject; cancel; recreate; both jobs | `not_allowed` (only "event not held" leaves Completed, TC-DB-49); untouched by jobs |
| Rejected | All 6 others | Approve; waive; record deposit; cancel; reschedule; event not held; recreate; both jobs | `not_allowed`; untouched |
| Cancelled | All 6 others | The same, plus event not held and record refund | `not_allowed`; a refund keeps it Cancelled; untouched |
| Expired | All 6 others | Approve (the EC-53 example); record deposit; waive; extend; cancel; reschedule; event not held; recreate | `not_allowed`; recreate makes a **new** reservation and the original stays Expired (TC-DB-41) |

**The action matrix** (TC-DB-51). Cells give the result on a stored status that is not overdue. "ok" means the action's own checks then run. "—" means `not_allowed`.

| Action | Pending | Awaiting Deposit | Confirmed | Completed | Rejected | Cancelled | Expired |
|---|---|---|---|---|---|---|---|
| Approve, reject, flag needs info | ok | — | — | — | — | — | — |
| Clear needs info | ok if flagged, else — | — | — | — | — | — | — |
| Same-day waiver | ok (today only) | ok (today only) | — | — | — | — | — |
| Record deposit | — | ok | ok only after a waiver (api §5.5) | — | — | — | — |
| Verify or reject a proof | — | ok if a proof awaits review | — | — | — | — | — |
| Record balance | — | — | ok | ok | — | — | — |
| Record refund paid | — | — | — | — | — | ok after a partial or full decision (Prov.) | — |
| Edit details, reschedule, cancel | ok | ok | ok | — | — | — | — |
| Extend a deadline | ok | ok | — | — | — | — | — |
| Event not held | — | — | — | ok | — | — | — |
| Recreate | — | — | — | — | — | — | ok |
| Reissue QR (admin or customer) | ok | ok | ok | — (Prov.) | — (Prov.) | — (Prov.) | — (Prov.) |
| Void a payment, add an internal note | ok | ok | ok | ok | ok | ok | ok |
| Legal hold, erasure (Super Admin only; the Admin gets `forbidden`) | ok | ok | ok | ok | ok | ok | ok |

#### 2.1.11 Actions that keep the status

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-54 | Needs info | pgTAP | Ana Pending, sent Wed 16 Dec 10:00 | 1. Flag without a message. 2. At 11:00, flag with "Please send a nearby landmark." 3. "Info received". 4. Clear again. 5. Flag an Awaiting Deposit booking. | 1 `reason_required`. 2 `ok`: flag and message set, still Pending, deadline still Sat 19 Dec 10:00 (D-13), `needs_info` email, audit. 3 `ok`: flag cleared, no email, audit. 4 `not_allowed`. 5 `not_allowed`. | LC §6.1, D-13, FR-ADM-09, FR-NTF-02, WF-04C |
| TC-DB-55 | Edit details | pgTAP | Ana Pending, typed `0917 123 4576` by mistake; Package A ₱3,000 + 2 × ₱200 (₱3,400); party lights now ₱300. Dan Confirmed with Package A + 1 microphone (₱3,200) while Package A now costs ₱3,500 | 1. Correct Ana's mobile to `0917 123 4567` without a reason; then with "customer called: typo in mobile number". 2. Add 1 party light to Ana. 3. Book all party lights on 24 Dec; add 1 more to Ana. 4. Add 1 party light to Dan. 5. Try to change Ana's date through edit details. 6. An edit with no real change. 7. Edit a Completed booking. 8. Look Ana up with the old and the new number. | 1 `reason_required`; then `ok`, with the audit entry naming `mobile` and never the numbers. 2 `ok`: total ₱3,700, deposit unchanged, `reservation_updated` email. 3 `addon_short`; nothing changes (EC-47). 4 `ok`: total ₱3,500 (kept lines keep ₱3,000 and ₱200; the new line takes ₱300). 5 `invalid_input` (a reschedule is needed). 6 `invalid_input`. 7 `not_allowed`. 8 The old number `not_found`; the new number `ok` (EC-46). | LC §6.2, BR-03, BR-11, EC-46, EC-47, cat §2.3, FR-ADM-10, FR-NTF-08, FR-PUB-10, WF-06E |
| TC-DB-56 | Extend a deadline | pgTAP | Dan approved Mon 21 Dec 2026 10:00 (due Tue 22 Dec 10:00); delivery Thu 24 Dec 14:00 | 1. Extend to Wed 23 Dec 12:00 without a reason; then with "paying at the office Wednesday morning". 2. Extend to Thu 24 Dec 15:00. 3. Extend to exactly Thu 24 Dec 14:00. 4. Extend to a time not later than the current deadline. 5. Extend a Confirmed booking. 6. Extend after the deadline passed (not paused). | 1 `reason_required`; then `ok`: `deadline_extended` email, audit with the reason. 2 `after_service_start`. 3 `ok`: the deadline may equal the service start (LC §3.2). 4 `not_later` (api §3.5 [P]). 5 `not_allowed`. 6 `overdue` (EC-26). | LC §6.3, EC-25, EC-26, FR-ADM-16, FR-NTF-05, WF-06D |
| TC-DB-57 | Reschedule | pgTAP | Ana Confirmed for Thu 24 Dec; both sets held on Sat 26 Dec; a request sent Mon 14 Dec 09:00 (deadline Thu 17 Dec 09:00); a request sent Wed 16 Dec 10:00 for 24 Dec (deadline Sat 19 Dec 10:00) | 1. Reschedule Ana to 26 Dec. 2. Free a set on 26 Dec; reschedule Ana again. 3. On Tue 15 Dec, move the 14 Dec request to the Evening slot that same day. 4. Move the 16 Dec request to Sun 27 Dec. 5. To a date where microphones are short. 6. To an archived slot. 7. To a date that looked full only because of an overdue hold. 8. Reschedule a Rejected reservation. | 1 `not_free`; Ana unchanged: date, set, and add-ons (EC-48). 2 `ok`: new service start, old claims released, new claims, the same reference code, QR, and prices; Confirmed keeps no deadline; `rescheduled` email. 3 Deadline Tue 15 Dec 18:00, and urgent (EC-49). 4 Deadline stays Sat 19 Dec 10:00. 5 `addon_short`. 6 `slot_inactive`. 7 The overdue hold is recorded Expired, then `ok`. 8 `not_allowed`. | LC §6.5, BR-01, BR-03, BR-05, BR-06a, EC-48, EC-49, FR-ADM-17, FR-NTF-11, WF-06C |
| TC-DB-58 | Record a balance | pgTAP | Ana Confirmed (total ₱3,400, ₱1,000 deposit paid) | 1. Record ₱2,400 in cash on Thu 24 Dec. 2. Record a balance on a Completed booking. 3. On an Awaiting Deposit booking; on a Cancelled one. 4. E-wallet without a reference. | 1 `ok`: kind balance, the next ACK number (shared counter), status unchanged, no email, balance due ₱0. 2 `ok`; the closure date recomputed (EC-38, EC-40). 3 `not_allowed`. 4 `invalid_ewallet_ref`. | FR-ADM-14, EC-38, cat §4.4, LC §5, WF-06K |
| TC-DB-59 | Void a payment | pgTAP | A ₱1,000 deposit recorded on the wrong booking, `ACK-2026-0007` | 1. Void without a reason. 2. Void with "recorded on wrong booking". 3. Void it again. 4. Record the next deposit or balance anywhere. 5. As `postgres`, change a payment's amount; delete a payment. 6. Void a balance record and a refund record. 7. Read the balance due. | 1 `reason_required`. 2 `ok`: the row stays, with reason, who, and when; status unchanged; no email. 3 `already_void`. 4 `ACK-2026-0008`: 0007 is never reused. 5 Refused by `payments_guard`. 6 `ok` (D-24). 7 Voided payments are left out. | FR-ADM-15, EC-33, D-24, cat §4.6, NFR-22, WF-06J |
| TC-DB-60 | Record a refund paid | pgTAP | Ben Cancelled Tue 22 Dec 2026 with "partial, ₱500" | 1. Record ₱500 in cash on Wed 23 Dec. 2. In a separate run, record it on Mon 4 Jan 2027. 3. On a Cancelled booking whose decision is "none"; on a Confirmed booking. 4. E-wallet without a reference. | 1 `ok`: kind refund, no ACK number, paid by the Admin; closure date 23 Dec 2026. 2 Closure date 4 Jan 2027; ledger end 31 Dec 2033 (EC-40, priv §6.3 example B). 3 `not_allowed` (Prov., api §3.4). 4 `invalid_ewallet_ref`. | FR-ADM-19, EC-39, EC-40, cat §4.5, priv §6.1, WF-06B |
| TC-DB-61 | Reissue the QR code | pgTAP | Ana Pending with token T1 | 1. Customer reissue (`app.reissue_qr('customer', …)`). 2. Resolve T1 and the new T2. 3. An admin reissue with an old version. 4. Reissue on a Cancelled booking; on an overdue hold. | 1 `ok`: T2 returned once, only its hash stored, reference code unchanged, audit `qr.reissued` with actor `customer`, no email. 2 T1 not valid; T2 valid. 3 `stale_version`. 4 `not_allowed` (Prov., api §5.3); `overdue`. | FR-PUB-13, FR-ADM-22, FR-PUB-08, EC-62, NFR-13, WF-03D, WF-07D |
| TC-DB-62 | Internal notes | pgTAP | Reservations in every status | 1. Each admin adds a note in each status, including an overdue hold. 2. Read the status view and the data of every email and document. | 1 `ok`: author and time; audit `note.added`, never the text. 2 Notes never appear. | FR-ADM-05, WF-03E |
| TC-DB-63 | Legal hold | pgTAP | Ben Cancelled | 1. The Admin sets a legal hold. 2. The Super Admin, without a reason; then with "demand letter received 30 Nov 2028". 3. Set it again. 4. Clear it without a reason; then with one. | 1 `forbidden`. 2 `reason_required`; then `ok`: flag, reason, time, and admin; audit. 3 `not_allowed`. 4 `reason_required` ([P], priv §5.6); then `ok`. | FR-ADM-31, priv §5.6, EC-83, WF-10C |
| TC-DB-64 | An erasure request | pgTAP | Ana Completed with two payments and a queued customer email; Ben under legal hold | 1. The Admin calls the erasure. 2. The Super Admin, with Ana's code and a wrong mobile. 3. With her code and `+63 917 123 4567`. 4. Again. 5. Look Ana up. 6. Erasure on Ben. | 1 `forbidden`. 2 `verification_failed`. 3 `ok`: name, mobile, email, street, and landmarks null; `contact_blanked_at` set; payments untouched; the queued email `skipped` with an empty recipient (api §5.4 [P]); audit with field names only. 4 `not_allowed`. 5 `not_found`. 6 `legal_hold`; nothing erased. | FR-ADM-31, priv §5.5, EC-84, WF-10D |

#### 2.1.12 Payments, acknowledgments, and prices

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-65 | Acknowledgment numbers | pgTAP | Empty counters | 1. In 2026, record a deposit, a balance, a refund, and another deposit. 2. Set the 2026 counter to 9999; record one more. 3. Void a payment; record another. | 1 `ACK-2026-0001`, `ACK-2026-0002`, no number for the refund, `ACK-2026-0003`: deposits and balances share one counter. 2 `ACK-2026-10000`, never cut down. 3 The voided number stays retired; the next one follows the counter. | cat §5.1, §5.2, EC-33, EC-36, data §5.7, §5.8 |
| TC-DB-66 | Acknowledgment numbers under concurrency | pgTAP, two sessions | Two Awaiting Deposit bookings | 1. Both admins record deposits at the same instant (session A holds its transaction). 2. Twenty balance recordings in parallel. | 1 Two different, consecutive numbers; neither call fails. 2 Twenty distinct numbers with no gaps; `payments_ack_uq` never fires. | EC-36, cat §5.2, NFR-21 |
| TC-DB-67 | The year of an acknowledgment is the Manila year | pgTAP | The 2026 counter at 14 | 1. Record a payment at 2026-12-31T15:59:59Z (31 Dec 23:59:59 Manila). 2. At 2026-12-31T16:30:00Z (Fri 1 Jan 2027 00:30 Manila). | 1 `ACK-2026-0015`. 2 `ACK-2027-0001`; the 2027 counter row is created on first use. | EC-37, NFR-19, cat §5.2 |
| TC-DB-68 | Prices come from the catalog, never from the browser | pgTAP | Fixture | 1. Submit with extra price fields in `p_booking` (package ₱1, deposit ₱0). 2. Read total, deposit, and balance due before and after a deposit, a balance, and a void of the balance. | 1 The fields are ignored or refused (`invalid_input`); the saved snapshot is ₱3,000, 2 × ₱200, and a ₱1,000 deposit. 2 Total ₱3,400 (package + each unit price × quantity); balance due ₱3,400, then ₱2,400, then ₱0, then ₱2,400 again after the void. | cat §2.1, §2.2, NFR-21, D-12, D-24, TM-09 |

#### 2.1.13 Closure date and retention

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-69 | The closure date | pgTAP | Examples A, B, and C of priv §6.3 | 1. Ana: Completed Fri 25 Dec 2026, last payment 24 Dec. 2. Ben: Cancelled Tue 22 Dec, refund paid Wed 23 Dec; then the same with the refund paid Mon 4 Jan 2027. 3. Carla: sent Mon 7 Dec 09:00, deadline Thu 10 Dec 09:00, recorded by the job at 09:00:30. 4. Any open reservation. | 1 25 Dec 2026. 2 23 Dec 2026; then 4 Jan 2027. 3 10 Dec 2026; `final_status_at` is the deadline moment, not the job's (data §5.3 [P]). 4 Null: no period has started. | priv §6.1, §6.3, EC-40, FR-ADM-14, FR-ADM-19, data §5.3 |
| TC-DB-70 | Contact data blanked at closure + 2 years | pgTAP | Ana, closure Fri 25 Dec 2026, with a customer note, an internal note, venue street and landmarks, and a queued email | Run `app.run_retention()` for the Manila dates 24 Dec 2028 and 25 Dec 2028 (each at 00:20 Manila, the day before in UTC). | 24 Dec: nothing blanked. 25 Dec: name, mobile, email, customer note, internal note body, street, and landmarks null; `contact_blanked_at` set; the outbox recipient null; barangay, city, and payments kept; counts in `retention_runs`. | priv §6.2, §6.3, FR-SYS-05, FR-ADM-05, NFR-15, NFR-19, WF-10E |
| TC-DB-71 | Proof images deleted on schedule | pgTAP + local Storage | Ana's proof verified Fri 18 Dec 2026 11:00; Dan's proof never verified, his reservation Expired Tue 22 Dec 2026 16:30 | 1. Retention runs for 25, 26, 29, and 30 Dec. 2. The tick deletes the files marked due. | 1 Ana's proof is marked due in the 26 Dec run (7 days ended 25 Dec 11:00), not on 25 Dec; Dan's in the 30 Dec run, not on 29 Dec. 2 Each file is removed through the Storage API; the proof row stays with `file_deleted_at`; the deletion is counted. | priv §6.2, §6.3, D-21, EC-85, FR-SYS-05, FR-PUB-12, TM-25, WF-10E |
| TC-DB-72 | The retention job skips reservations under legal hold | pgTAP | EC-83: closure Fri 15 Jan 2027, blanking due Mon 15 Jan 2029, a hold set Wed 3 Jan 2029, with a proof file due and booking audit entries. Ben: blanking due Sat 23 Dec 2028, hold set Thu 30 Nov 2028, cleared Thu 15 Mar 2029 | 1. Run retention for 15 Jan 2029. 2. Run it for 1 Jan 2034 with the hold still set. 3. Ben: runs for 23 Dec 2028 and for 16 Mar 2029. | 1 Nothing blanked, no file deleted, no audit entry removed; `legal_hold_skipped` counts it. 2 No reduction to statistics. 3 23 Dec: skipped. 16 Mar: Ben's contact data blanked, since the 2 years have passed. | priv §5.6, EC-83, FR-SYS-05, FR-ADM-31, WF-10C, WF-10E |
| TC-DB-73 | Ledger end | pgTAP | Ana, closure year 2026, with payments and booking audit entries | Run retention for 31 Dec 2032 and for Sat 1 Jan 2033 (Manila; the second run is at 2032-12-31T16:20Z). | 31 Dec: nothing reduced. 1 Jan 2033: one `anonymized_bookings` row with only month and year, package, amounts, and city; the booking audit entries added to the monthly per-action counts, then deleted; the reservation and its rows deleted in the order of data §9; no reference code, date, or id copied. | priv §6.1, §6.2, FR-SYS-05, NFR-19, data §5.17, §9 |
| TC-DB-74 | Short-lived data and security entries | pgTAP | Rate-limit counters 23 h and 25 h old; submission keys 71 h and 73 h old; security audit entries 11 and 13 months old; an expired upload slot | Run retention. | The 25 h counters, the 73 h keys, and the 13-month entries are deleted; the others are kept; the expired slot and its file are removed (api §5.9 [P]). | priv §6.2, FR-SYS-05, FR-PUB-06, NFR-11 |
| TC-DB-75 | The retention run log and its settings | pgTAP | Mixed data | 1. Run retention; read `retention_runs` and `job_runs`. 2. Set the contact period to 3 years; run again. 3. An open reservation. 4. Two runs at once. | 1 Counts only; a scan finds no name, mobile, or email pattern. 2 The next run uses 3 years. 3 Untouched. 4 The second does nothing (try-lock). | FR-SYS-05, FR-SYS-09, FR-SYS-10, priv §6.4, NFR-15 |
| TC-DB-76 | The IP key rotates every day | pgTAP | A counter keyed with today's key; a known test IP | 1. `app.rotate_ip_key()`. 2. Count a hit from the same IP. 3. Search every table for the raw test IP. | 1 A new key; the old one is gone. 2 Counted under a new HMAC. 3 Not found anywhere. | FR-SYS-06, NFR-11, NFR-13, priv §3.2, TM-29 |

#### 2.1.14 The email outbox

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-77 | Emails are saved with the change | pgTAP | Ana with an email; Ben without | 1. Approve Ana. 2. Approve Ben. 3. A refused action (an old version). 4. A new online request. | 1 One `approved` row with customer priority, in the same transaction. 2 No customer row; nothing fails. 3 No outbox row and no audit entry. 4 One `admin_new_request` row per admin (api §5.9; data §5.12). | FR-NTF-16, FR-NTF-21, FR-NTF-13, FR-ADM-07, EC-12, WF-07A, WF-07B, WF-07F |
| TC-DB-78 | No duplicate emails | pgTAP | Ana Awaiting Deposit, deadline D | 1. Queue the same type, reservation, and audit entry twice. 2. Queue the reminder for D twice. 3. Extend to D2; run the reminder job when due. | 1 One row (`ON CONFLICT DO NOTHING`). 2 One row (reservation + `reminder` + D). 3 A new reminder row for D2; D never gets two. | FR-NTF-17, FR-SYS-02, EC-68, WF-07C |
| TC-DB-79 | Deposit reminder timing | pgTAP | Ana approved Thu 17 Dec 14:00, due Fri 18 Dec 14:00; lead time 6 h (FR-NTF-04). Rosa approved Sat 19 Dec 17:40, due 19:00. Ben Awaiting Deposit without an email | 1. Run the reminder job on 18 Dec at 07:59 and at 08:00. 2. A separate run where the first job run is at 13:00. 3. Rosa: runs at 17:41 and 18:30. 4. Ben, at his moment. | 1 Nothing at 07:59; queued at 08:00. 2 Queued: its deadline is still ahead (api §5.9). 3 Never queued: the moment (13:00) had passed at approval (EC-70). 4 Nothing (no address). | FR-NTF-04, FR-SYS-02, FR-NTF-21, EC-70, WF-07C |
| TC-DB-80 | Stale emails are skipped at send time | pgTAP | Ana's reminder due Fri 18 Dec 08:00 | 1. Record her deposit at 07:30; claim at 08:00. 2. Reminders for a Cancelled and an Expired booking; one whose deadline changed after queuing. 3. `needs_info` after the flag was cleared; `approved` after a cancel; `admin_new_request` after approval; `admin_proof_uploaded` after review; any customer email after an erasure. 4. A `rejected` email. | 1 `skipped`, not failed (EC-69). 2 `skipped`. 3 `skipped` (the per-type rules of api §5.9 [P]). 4 Never stale: sent. | FR-NTF-19, FR-NTF-04, EC-69, WF-07A |
| TC-DB-81 | Retries and failed emails | pgTAP | Queued rows | Record these outcomes: a network error, a 429, a 503, then more retries until the limit; a 400; a success. | Retries with growing waits (api §4.1 [P]) up to the attempts setting (5 [P]), then `failed`; the 400 `failed` at once, with no retry; the success `sent` with the time and provider id; the encrypted QR link (`qr_link_ciphertext`) erased at any final state (api §1.13, §5.9). The reservation change stands in every case. | FR-NTF-18, EC-66, NFR-33, WF-07A |
| TC-DB-82 | Caps, customer emails first, and the admin reserve | pgTAP | Caps 100 a day and 3,000 a month [U]; admin reserve 90 (FR-NTF-20); clock Sat 19 Dec 2026 20:00 | Separate runs: 1. 89 sent today; claim one admin and one customer row. 2. 90 sent. 3. 100 sent; claim a customer row. 4. 3,000 sent this month. 5. Clock 2026-12-19T16:00Z (Sun 20 Dec 00:00 Manila) after run 2; claim again. | 1 Both claimed. 2 The customer row claimed; the admin row held until the next Manila day. 3 Held until the next day; the health summary shows the warning. 4 Held until the first day of next month [P]. 5 The day count restarts at Manila midnight; the held admin row is claimed. | FR-NTF-20, FR-ADM-33, EC-67, NFR-19, NFR-33, TM-35, WF-07A |
| TC-DB-83 | Two senders never send one email twice | pgTAP, two sessions | 5 queued rows (2 admin, 3 customer) | 1. Two claims at once (the `after()` sender and the tick). 2. One claim. | 1 No row is claimed by both (`SKIP LOCKED` and the claim lease). 2 Customer rows first, then the oldest. | FR-NTF-17, FR-NTF-20, arch §7.2, WF-07A |

#### 2.1.15 Jobs

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-84 | Two runs of a job never overlap | pgTAP, two sessions | — | 1. `app.try_start_job('tick', interval '2 minutes')` twice. 2. Again after the lease expires. 3. Two runs of each SQL job at once. | 1 The second `job_running`. 2 `ok`. 3 The second waits or returns at once; work is never done twice. | FR-SYS-09, EC-78, TM-04, arch §7.2 |
| TC-DB-85 | Job run records and the heartbeat | pgTAP | Fresh and stale `job_runs` rows | 1. Run each job; read its row. 2. `app.check_heartbeat()` with the expiry job last run 6 minutes ago; with a daily job 27 hours ago. 3. `app.send_heartbeat()` when everything is fresh, and when one job is stale. | 1 Name, start, finish, result, counts. 2 Lists the stale job (limits: api §5.9 [P]). 3 Checks in only when everything is fresh. | FR-SYS-08, FR-SYS-10, NFR-24, EC-77 |
| TC-DB-86 | The timers, the tick call, and the keep-alive | pgTAP | — | 1. Read `cron.job`. 2. `app.request_tick()` with no due rows; with one. 3. `app.keep_alive()`. | 1 Each job of api §6 with its UTC schedule; the daily jobs from `15 16 * * *` (00:15 Manila) to `35 16 * * *` (00:35), staggered as in api §6. 2 No `pg_net` call; then one call, with the bearer from Vault and an explicit timeout. 3 A `job_runs` row. | FR-SYS-01 to FR-SYS-07, NFR-06, NFR-07, NFR-19, EC-79 |
| TC-DB-87 | The health summary | pgTAP | Failed and queued rows, job runs, sent counts | Call `app.health_summary`. | The last run and result of the expiry, retention, and email jobs; failed and queued counts and the latest failed rows (type, time, error, never the recipient); cap use per Manila day and month; storage use of the proof bucket. | FR-ADM-33, NFR-26, FR-NTF-18, FR-NTF-20 |

#### 2.1.16 Audit log, settings, accounts, and versions

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-88 | Every action writes one complete audit entry | pgTAP | One successful and one refused call of every action function | Read `audit_log` after each. | Each success writes its entry in the same transaction: time, category (api §3.1), entity, `reservation_id`, actor kind and id, action, the changed field **names**, and the reason where one is required. A refusal writes none. | FR-ADM-32, FR-ADM-07, NFR-25, LC §4.1, TM-18, WF-10A |
| TC-DB-89 | The audit log only grows | pgTAP | Existing entries | 1. As `app_rw`, and as `app_owner` outside the retention job: update an entry; delete one. 2. Insert an entry with a value in `changed_fields`. | 1 Refused (grants and trigger); only `app.run_retention()` deletes. 2 Refused by the CHECK: names only. | FR-ADM-32, NFR-22, NFR-25, TM-18, TM-21 |
| TC-DB-90 | Settings | pgTAP | — | 1. The Admin updates a booking-rule setting. 2. The Super Admin updates an unknown key; an invalid value; with an old version; a valid value. 3. Read the audit entry. | 1 `forbidden`. 2 `not_allowed`; `invalid_input`; `stale_version`; `ok`. 3 Category `settings`; the changed field is the key, never the value. | FR-ADM-28, EC-74, WF-08F |
| TC-DB-91 | Admin accounts | pgTAP | A Super Admin and an active Admin | 1. Create a second Admin. 2. Disable the Admin; create a new one. 3. The Super Admin disables himself. 4. Reset the Admin. 5. Sign out the Admin. 6. The Admin calls any account function. 7. The break-glass function as `app_rw`; as `postgres`. | 1 `admin_exists` (EC-75). 2 `ok`, the disabled account's sessions deleted; `ok`. 3 `self_action`. 4 New password hash, 2FA removed, sessions deleted. 5 Sessions deleted. 6 `forbidden`. 7 Permission denied; `ok`, with one audit entry, actor `system` and category `security` (api §3.8; sec §4.1). Each change writes an `account` entry. | FR-ADM-30, EC-71, EC-75, EC-76, WF-09E, WF-09F, WF-09G |
| TC-DB-92 | Two admins at once | pgTAP, two sessions | Ana Pending at version 3 | 1. The Admin approves with version 3; the Super Admin then rejects with version 3. 2. Both call at the same instant with version 3 (approve and reject). 3. The Super Admin refreshes and cancels with version 4. | 1 Approve `ok` (version 4); reject `stale_version` (the version is checked before the status, api §1.9), with no audit entry and no email (EC-16). 2 Exactly one succeeds; the other `stale_version`. 3 `ok`. | FR-ADM-07, EC-16, NFR-21, WF-05E |
| TC-DB-93 | Customer and system changes also raise the version | pgTAP | Ana Awaiting Deposit at version 5 | 1. Ana uploads a proof. 2. The Admin records the deposit with version 5. | 1 Version 6. 2 `stale_version` (api §1.9 [P]); after a refresh, verifying works. | FR-ADM-07, EC-16, api §1.9 |

#### 2.1.17 Time zone, constraints, and read views

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-DB-94 | Manila dates around midnight | pgTAP | — | 1. `app.manila_today()` at 2026-12-19T15:59:59Z and at 2026-12-19T16:00:00Z. 2. At 2026-12-19T23:30Z (Sun 20 Dec 07:30 Manila), read the urgent flag of a 20 Dec booking. 3. Build the service start for 24 Dec at 14:00. 4. Insert a reservation whose service start falls on another Manila date than its event date. | 1 19 Dec, then 20 Dec. 2 Urgent (EC-82). 3 2026-12-24T06:00:00Z. 4 Fails `reservations_service_start_date_chk`. | NFR-19, EC-82, BR-06a, LC §3.1, data §8 |
| TC-DB-95 | The database constraints | pgTAP | One violating row per constraint | Insert or update each, as `postgres`. | Each named CHECK, unique index, and guard of data §5 refuses its violation: the reference-code pattern; slot or arrival; a deadline only on holds and never after the service start; expiry paused only on Awaiting Deposit; needs info only on Pending with a message; the decision reason; the waiver; the refund decision; final status and closure date; legal hold; mobile; venue; email; a 500-character customer note accepted and 501 refused (FR-PUB-05); money ≥ 0; a 32-byte QR hash; the payment, block, claim, slot (end after start), setting, and audit CHECKs. | NFR-21, NFR-22, FR-PUB-05, FR-PUB-08, BR-11, data §5 |
| TC-DB-96 | Fixed fields and a clean schema | pgTAP | — | 1. Change a reservation's `reference_code`, `source`, `created_at`, `recreated_from`. 2. `supabase db reset` from zero. 3. Read the seed rows. | 1 Refused by the immutable guard. 2 Every migration applies. 3 One `capacity_lock` row, every settings key, one Room. | NFR-32, data §5.3, §10 |
| TC-DB-97 | The admin read views | pgTAP | Reservations in every state | Read the reservations view `app.reservation_effective` (data §5.20) and the dashboard queries. | `effective_status` (Expired for an overdue hold), `is_urgent`, `has_unreviewed_proof`, totals and balance due. Dashboard: Pending requests with urgent ones first; proofs to verify; Confirmed bookings from today, soonest first (first 50 [P]); holds due within 24 hours [P]; the pause time. | FR-ADM-02, FR-ADM-03, FR-ADM-04, BR-05, BR-06a, api §3.2 |

### 2.2 Unit tests (TC-UT, Vitest)

TC-UT-17 to TC-UT-19 test the three route handlers with Vitest against the local database, with the email provider and Sentry replaced by fakes.

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-UT-01 | The shared field schemas | Vitest | The schemas of api §1.3 | Feed each schema valid, boundary, and invalid values. | For example: a 500-character `customerNote` passes and 501 fails; `addons` with a repeated id or a quantity of 0 fails; `slotId` is required for delivery and absent for on-site, and `arrivalTime` the other way round; delivery needs barangay and city; an empty `reason` fails; `ewalletRef` is required for e-wallet and empty for cash; a refund decision "none" has amount 0 and "partial" or "full" more than 0; `2026-02-30` fails. `fieldErrors` are keyed by the field path. | FR-PUB-04, FR-PUB-05, FR-ADM-07, NFR-21 |
| TC-UT-02 | The mobile normalizer | Vitest | The shared file of mobile inputs (TC-DB-33) | Run the TypeScript normalizer on every input; compare with the expected values and with the SQL results that TC-DB-33 writes out [P]. | The BR-11 table holds; spaces and dashes are ignored; TypeScript and SQL agree on every input. | BR-11, EC-11, EC-64 |
| TC-UT-03 | Reference-code input | Vitest | — | Normalize `ksb 7q2m k9tx`, `KSB7Q2MK9TX`, `ksb-7q2m-k9tx`; codes with 0, 1, I, L, or O; codes of the wrong length. | The first three give `KSB-7Q2M-K9TX`; the rest are invalid. | FR-PUB-08, FR-PUB-10, EC-64 |
| TC-UT-04 | Code and token formats | Vitest, and pgTAP for the SQL generators | 100,000 generated codes and tokens. The reference-code generator runs in the database (api §5.2); the QR token of a new request is made on the server (api §1.13), and a reissued one by `app.new_qr_token` (api §5.2) | Check format, alphabet, uniqueness, and the spread of each character (chi-square); decode each token; build the QR address. | Every code matches `KSB-XXXX-XXXX` over the 31 characters of FR-PUB-08, with no visible bias; each token is 20 random bytes in 27 base64url characters with a 32-byte SHA-256; the QR address is `SITE_URL` + `/r/` + token, never built from `VERCEL_URL` or the Host header. | FR-PUB-08, NFR-13, TM-08, sec §4.5.1, §4.7 |
| TC-UT-05 | The price summary | Vitest | Fixture prices | Build the summary for Ana, for a booking without add-ons, and for 20 fixture baskets compared with `app.price_items` [P]. | ₱3,000 + 2 × ₱200 = ₱3,400; the ₱1,000 deposit shown apart; no delivery fee (D-11); equal to the database every time. | FR-PUB-06, cat §2.1, D-11 |
| TC-UT-06 | Manila time on every device | Vitest | Process time zone set to UTC, Asia/Dubai, America/Los_Angeles, and Asia/Manila | Format 2026-12-18T06:00:00Z and 2026-12-31T16:30:00Z. | The same Manila result in every case: Friday 18 December 2026, 2:00 PM; 1 January 2027 (layout owned by [ux][ux] §5.3). | NFR-19, FR-PUB-11, EC-82 |
| TC-UT-07 | Admin-typed times and event dates | Vitest | — | Convert `2026-12-23T12:00` (Manila wall time) to UTC; pass event dates through the data layer. | `2026-12-23T04:00:00Z`; event dates stay `YYYY-MM-DD` strings and never become a JavaScript `Date` (data §8). | NFR-19, FR-ADM-16, api §1.10 |
| TC-UT-08 | Result codes and database errors | Vitest | api §1.5 to §1.7 | 1. Look up the message of every result code. 2. Map each SQLSTATE of the policy table. 3. Simulate a `40P01`. | 1 Every code has a message; placeholders are filled from `detail`; no text comes from the database. 2 `23505` on the claim index gives `sold_out` (public) or `not_free` (admin); `55P03` and `57014` give `busy`; `22xxx`, `23502`, `23514` give `invalid_input`; anything else `internal_error`; no raw database text ever reaches a page. 3 Retried once, then `busy`. | NFR-21, NFR-23, api §1.5 to §1.7 |
| TC-UT-09 | The bearer check | Vitest | — | Compare the right secret, a wrong one of the same length, one of another length, and none. | Only the right secret passes; both values are hashed with SHA-256 and compared with `timingSafeEqual`; another length never throws. | FR-SYS-09, EC-78, TM-04 |
| TC-UT-10 | Email send outcomes | Vitest | Fake provider responses | Classify: accepted, network error, timeout, 429, 500, 503, 400, 422. | `sent`; `retry` for a network error, a timeout, 429, and 5xx; `failed` for the other 4xx; the waits of api §4.1. | FR-NTF-18, EC-66 |
| TC-UT-11 | Email and document templates | Vitest | Every email type (FR-NTF-01 to FR-NTF-15) and every document, with HTML and a script in the name and the note | Render each. | Each shows its required content (the FR-NTF tables), the reference code, Manila times, and pesos; never internal notes or another customer's data; customer text is escaped; no "Official Receipt", "OR No.", "Invoice", TIN, "BIR", or VAT wording; every acknowledgment carries the fixed statement of priv §7.1 word for word. | FR-NTF-01 to FR-NTF-15, FR-PUB-14, priv §7.1, cat §5.3, TM-16 |
| TC-UT-12 | Prepared messages for customers without email | Vitest | Each customer email type, for a reservation without an email | Build the prepared message. | Plain text, with the same information the email would carry ([P] in FR-NTF-21). | FR-NTF-21, EC-12, WF-07F |
| TC-UT-13 | The balance prefill and the balance due | Vitest | Ana; a voided payment | Compute the prefill and the balance due shown. | Prefill ₱2,400 (total minus the deposit, FR-ADM-14); voided payments are left out. After a waiver: open (Q6). | FR-ADM-14, cat §2.1, §4.4 |
| TC-UT-14 | The form's own checks | Vitest | Public settings: notice period, on-site hours, booking window | Check an arrival at 09:00, a start 30 minutes away, and a date 181 days away. | Each refused in the browser with a clear message before Submit; the database checks again (TC-DB-14, TC-DB-28). | FR-PUB-04, BR-06, BR-09, api §2.2 |
| TC-UT-15 | The QR code with its text | Vitest | A token and a reference code | Draw the QR code. | An inline SVG made by `uqr` on the server, with its text alternative, and the reference code shown as text next to it (NFR-17 item 6). | FR-PUB-07, FR-PUB-08, NFR-17 |
| TC-UT-16 | One client-IP helper | Vitest | Requests with the platform's header and with spoofed headers | Call `getClientIp()`; scan the imports. | Reads only the trusted header (which one is [U]: TC-W1-03); every limit, Better Auth, and Turnstile use this one helper. | NFR-11, TM-05, sec §4.4 |
| TC-UT-17 | The daily backup route | Vitest + local database | An overdue hold, a queued email, a stale `job_runs` row | 1. `GET /api/jobs/daily` with the secret. 2. Call it again. | 1 The hold is recorded Expired; the email is sent through the fake; the stale job is reported to the Sentry fake; a `job_runs` row `daily` with counts. 2 Nothing is done twice. | FR-SYS-08, EC-77, NFR-24, WF-06F |
| TC-UT-18 | The tick route | Vitest + local database | Queued emails of both priorities; a proof file due for deletion | 1. `POST /api/jobs/tick` with the secret. 2. A second call while the first holds its lease. | 1 Rows claimed, customer emails first; each outcome recorded; the file deleted through Storage; counts returned; a `job_runs` row. 2 409 `job_running`. | FR-SYS-03, FR-SYS-05, FR-NTF-16 to FR-NTF-20, WF-07A |
| TC-UT-19 | The health check address | Vitest + local database | — | `GET /api/health`; then with the database stopped. | 200 with the region, `db: ok`, and the latency, `Cache-Control: no-store`, and no personal data; then 503 `db_unavailable`. | FR-SYS-11, NFR-02, NFR-04 |

### 2.3 End-to-end tests (TC-E2E, Playwright)

Each case runs in the four projects of 1.4 unless it says otherwise, against the local database reset before the run.

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-E2E-01 | A customer books on a phone and sees the QR code | Playwright | Fixture; Ana | Home → packages → calendar (delivery) → 24 Dec → form (Package A, 2 microphones, Afternoon) → details → review → agree → Submit. | The home page names both services and links to every public page; the packages page shows active items with prices and the free-delivery wording (O-04 text once set); the type and date are filled in; the review shows the breakdown, ₱3,400, and ₱1,000; the privacy summary links to the notice; Submit works only after agreeing; the confirmation shows the reference code as text, the QR code, "Not yet confirmed", and the next steps, and nothing says approved or paid. At 360 px: no sideways scrolling, done within a few minutes. | FR-PUB-01 to FR-PUB-08, NFR-16, charter §2 (criteria 1 and 3), WF-01A, WF-01B, WF-01C, WF-02 |
| TC-E2E-02 | Double click, retry, and a second tab | Playwright | Ana's draft | 1. Double-click Submit. 2. Cut the network after Submit; retry. 3. Submit the same draft from a second tab. | One reservation; the same reference code each time. A repeat shows no QR code but links to the status page (Prov., api §1.8). The second tab sends the same key because the key is kept in `localStorage` (api §1.8; sec §4.4). | EC-01, FR-PUB-06, NFR-12, WF-01C |
| TC-E2E-03 | A new version goes live while the form is open | Playwright | Ana's draft open; the app rebuilt with new action ids [P] | Submit after the rebuild; reload; submit. | The page asks the customer to reload; the draft and the key survive; one reservation only. | EC-02, FR-PUB-06, NFR-04, arch §13 |
| TC-E2E-04 | Taken while filling in the form | Playwright, two browsers | One set free on 24 Dec; 3 of 4 microphones booked that day | 1. Carla takes the last set while Dan fills in the form; Dan submits. 2. Dan asks for 2 microphones that day. | 1 "Just taken" ([ux][ux] §7.2); everything typed is kept; nearby Available dates are suggested. 2 A clear message naming the add-on; data kept; the calendar had shown Available (EC-05). | EC-03, EC-04, EC-05, BR-09, FR-PUB-06, WF-05C |
| TC-E2E-05 | Refusals on the public form | Playwright | Fixture; deadlines and times set through stored data | Try: an arrival 30 minutes away; a second request for the same date with the number typed `+63 …`; a third open request; while paused; `12345` as the mobile; a date beyond the window; today after the last start time; an arrival outside on-site hours; a 501-character note. | Each is refused with its message, next to the field or at the top, and the data is kept: too soon; a hold limit, with no existing reference shown; the paused banner on the form and the calendar; "Enter a Philippine mobile number…" next to the field; the date cannot be picked; today shows Full; outside the hours; the note stops at 500 characters. | BR-06, BR-07, BR-07a, BR-09, BR-11, EC-06 to EC-11, EC-15, FR-PUB-03 to FR-PUB-06, NFR-17 |
| TC-E2E-06 | Booking without an email | Playwright | Ben, no email | Ben books; the Admin approves; the Admin opens Ben's reservation. | The booking works; no customer email is produced; Ben follows it on the status page; the admin page shows the prepared message with the deposit instructions and deadline, and a Copy button. | FR-NTF-21, FR-PUB-05, EC-12, WF-07F |
| TC-E2E-07 | The status page | Playwright | Ana in each status; browser time zone Asia/Dubai | 1. Look up with `ksb 7q2m k9tx` and `+63 917 123 4567`. 2. A wrong mobile; a wrong code. 3. Visit in each status. 4. An overdue hold before any job runs. | 1 Opens. 2 The same generic message, no data ([ux][ux] §7.2 "Failed lookup"). 3 The FR-PUB-11 fields for that status, with the deadline in Manila time, the instructions and upload control while Awaiting Deposit, the needs-info message, the reason and refund decision, the document links, and the new-QR button; never the name, mobile, or address. 4 Expired at once. | FR-PUB-10, FR-PUB-11, FR-PUB-14, BR-05, EC-22, EC-64, EC-65, NFR-15, NFR-19, WF-07D |
| TC-E2E-08 | A proof upload, verified by the Admin | Playwright | Ana Awaiting Deposit; a 900 KB JPG with GPS data | 1. Ana uploads on the status page. 2. The Admin opens "proofs to verify", views the image, and verifies with ₱1,000, e-wallet, `1234567890`. 3. Ana refreshes. | 1 "Proof received… not confirmed yet"; the stored file has no EXIF or GPS data. 2 The image opens through a short-lived link; the booking becomes Confirmed; the proof leaves the list. 3 Confirmed, with a link to the acknowledgment. | FR-PUB-12, FR-PUB-14, FR-ADM-11, FR-ADM-12, BR-12, NFR-14, EC-27, WF-04E, WF-07E |
| TC-E2E-09 | A proof rejected, a second upload, a third refused | Playwright | Ana Awaiting Deposit, deadline still ahead | Ana uploads; the Admin rejects with a reason; Ana uploads again; the Admin rejects; Ana tries a third time. | The reason is shown and emailed; the second upload works; the third is refused with a clear message (2 per reservation, ever, FR-PUB-12). | FR-PUB-12, FR-ADM-12, FR-NTF-06, EC-29, EC-30 |
| TC-E2E-10 | The Admin logs in with 2FA, approves, records the deposit and the balance | Playwright | Test Admin; Ana Pending | Log in with the password and a TOTP code; open Ana from the dashboard; approve (the venue is shown); record ₱1,000 in cash; print the Deposit Acknowledgment; on 24 Dec, record the ₱2,400 balance and print it; log out. | The admin area opens only after the code; approve shows Awaiting Deposit and the Manila deadline; the deposit makes it Confirmed; both acknowledgments are printable pages with the cat §5.3 fields and the fixed statement; the payment form has no field for payer names or account numbers; the status page links to both; after logout, `/admin` redirects to the login page. | FR-ADM-01, FR-ADM-08, FR-ADM-11, FR-ADM-14, FR-ADM-23, FR-PUB-14, NFR-09, WF-04A, WF-04D, WF-06K, WF-09A |
| TC-E2E-11 | Staff-created bookings | Playwright | Test Admin | 1. Dan by phone, delivery on Sat 2 Jan 2027. 2. Carla walks in at 18:40 for 19:00 and pays ₱1,000 cash. 3. A walk-in with a waiver and a reason. | 1 Pending; no admin email; the QR code shown once on the admin screen. 2 Confirmed at once, urgent, with a printable acknowledgment. 3 Confirmed, waived. The admin form has no Turnstile or honeypot. | FR-ADM-23, FR-ADM-24, BR-06a, EC-41, WF-04G |
| TC-E2E-12 | Create and remove a block | Playwright | The Admin; Set 2 | Block Set 2 for 21 to 23 Dec, reason "repair"; check the calendar; remove the 23 Dec block with "repaired"; try a whole-date block. | Three blocks listed by date; the calendar reflects them at once; the removal frees 23 Dec at once; the whole-date block is not offered to the Admin, and a direct call is refused. | FR-ADM-25, BR-08, BR-09, EC-19, WF-08H, WF-08I |
| TC-E2E-13 | Reschedule | Playwright | Ana Confirmed for 24 Dec; 26 Dec full; 27 Dec free | Reschedule to 26 Dec; then to 27 Dec. | 26 Dec refused, the booking unchanged; 27 Dec saved with the same reference code and prices; the `rescheduled` email produced; the status page shows the new date. | FR-ADM-17, FR-NTF-11, EC-48, WF-06C |
| TC-E2E-14 | Cancel with a refund, then record the refund | Playwright | Ben Confirmed with a ₱1,000 deposit | Cancel without a refund decision; then with "family emergency" and "partial, ₱500"; open Ben's QR link; record a ₱500 cash refund. | The first is refused; then Cancelled; the status page shows the reason and the decision; the QR link says "no longer valid"; the refund shows in the ledger, with no acknowledgment. | FR-ADM-18, FR-ADM-19, FR-PUB-11, EC-39, EC-60, WF-06A, WF-06B |
| TC-E2E-15 | Recreate an expired request | Playwright | Carla Expired; the Room free that day | Recreate; follow the links between the two pages. | A new Pending reservation with a new reference code; each page links to the other; the original still shows Expired. | FR-ADM-21, EC-52, WF-06G |
| TC-E2E-16 | Scanning at the office, with the screenshot fallback | Playwright, with a fake camera stream | Ana Awaiting Deposit; her QR code as an image; a revoked QR code | 1. Scan with the fake camera. 2. Upload a screenshot instead. 3. Scan the revoked code. 4. Type the reference code in the search. | 1 and 2 Open Ana's page (the screenshot is decoded in the browser, sec §4.5.6 [P]). 3 "Not found or no longer valid". 4 Opens. | FR-ADM-03, FR-ADM-06, EC-60, EC-63, WF-03A |
| TC-E2E-17 | The QR link page | Playwright | Valid, revoked, unknown, and final-status tokens | Open each while logged out; open the valid one as a logged-in admin. | Logged out, valid: "present this at our office", no booking data. As an admin: the reservation opens. Every invalid case: the same "not found / no longer valid" page, HTTP 404. | FR-PUB-08, FR-PUB-09, EC-60, EC-61, WF-03B |
| TC-E2E-18 | A new QR code | Playwright | Ana with QR code T1 | 1. Get a new QR code on the status page. 2. Open T1. 3. The Admin reissues from the reservation page. | 1 Shown on screen; the reference code is unchanged. 2 "No longer valid". 3 A new QR code shown once on the admin screen; the previous one stops working. | FR-PUB-13, FR-ADM-22, EC-62, WF-03D, WF-07D |
| TC-E2E-19 | The dashboard | Playwright | A same-day request, a normal request, an uploaded proof, Confirmed bookings, a hold due in 3 hours, a breaker pause | Open the dashboard; press "Resume online booking"; leave the page open for 2 minutes. | The same-day request first and marked "Urgent" in words; proofs to verify with their service starts; upcoming events, soonest first; the deadline alert; the paused banner, which Resume clears; no background requests while the page stays open. | FR-ADM-02, FR-ADM-29, BR-06a, EC-42, NFR-03, NFR-17, WF-04F, WF-08G |
| TC-E2E-20 | The reservation list and search | Playwright | 30 reservations | Filter by status, type, and date range; search `0917-123-4567`, `ksb7q2mk9tx`, and "ana". | The right rows each time; overdue holds shown as Expired. | FR-ADM-03, BR-11, EC-64, WF-03C |
| TC-E2E-21 | Reservation details and the allowed actions | Playwright | Reservations in each status; both roles | Open each as the Admin and as the Super Admin. | Every field of FR-ADM-04; the history; payments with void details; proofs; only the actions that the status and role allow (the Admin never sees "Set legal hold"); a reservation whose contact data was blanked shows blanks. | FR-ADM-04, FR-ADM-05, FR-ADM-32, WF-03C |
| TC-E2E-22 | Needs info | Playwright | Ana Pending | Flag with a message; check the status page; press "Info received". | The message on the status page and in the email; the deadline shown is unchanged; the flag cleared. | FR-ADM-09, FR-NTF-02, FR-PUB-11, WF-04C |
| TC-E2E-23 | Edit details and a corrected mobile | Playwright | Ana with a mistyped mobile | Correct the mobile with a reason; add a party light; look up with the old and the new number. | Saved; the total updated; the old number fails, the new one works. | FR-ADM-10, EC-46, EC-47, WF-06E |
| TC-E2E-24 | Extend a deadline | Playwright | Dan Awaiting Deposit | Extend past the service start; then to Wed 23 Dec 12:00 with a reason. | The first is refused, naming the service start; then the new deadline shows on the reservation and the status page in Manila time; the email is produced. | FR-ADM-16, FR-NTF-05, EC-25, WF-06D |
| TC-E2E-25 | The same-day waiver | Playwright | Rosa Pending for today; another booking for tomorrow | Open both. | "Waive deposit" is offered only on Rosa's; it needs a reason; then Confirmed; "Record a deposit" is still offered. | FR-ADM-13, EC-43, WF-04F |
| TC-E2E-26 | Void a payment | Playwright | A payment on the wrong booking | Void it with a reason; record the correct one. | Marked void with reason, admin, and time; the next acknowledgment skips the voided number; the status page's balance leaves the void out. | FR-ADM-15, EC-33, WF-06J |
| TC-E2E-27 | Event not held | Playwright | Ana Completed | Mark not held with a reason and "none". | Cancelled; the status page shows the reason and the decision. | FR-ADM-20, EC-51, WF-06I |
| TC-E2E-28 | Catalog management | Playwright | The Admin | Add a package; change Package A's price; open the public packages page; lower the microphone stock below a booked day; archive an add-on in use. | The packages page shows the change after the edit (the cache refreshed after the commit); the stock change and the archive are refused, with the clashing reservations listed. | FR-ADM-26, FR-PUB-02, BR-10, EC-57, EC-58, NFR-03, WF-08A, WF-08B, WF-08C |
| TC-E2E-29 | Sets, the room, slots, and settings | Playwright | Both roles | As the Super Admin: add Set 3, rename it, add and archive a slot, change the deposit. As the Admin: open the same screens and call the same actions directly. | The Super Admin's changes are saved, with clashes listed where they occur; the Admin is offered none of them and a direct call is refused; `online_paused_until` is never editable. | FR-ADM-27, FR-ADM-28, EC-59, EC-74, WF-08D, WF-08E, WF-08F |
| TC-E2E-30 | Accounts and the privacy tools | Playwright | The Super Admin; an active Admin | Create a second Admin; disable, reset, and sign out the Admin; set a legal hold; process an erasure. | The second Admin is refused; after each account action the Admin's next request is refused; the hold flag shows; the erased fields show blank. | FR-ADM-30, FR-ADM-31, EC-75, EC-84, WF-09F, WF-09G, WF-10C, WF-10D |
| TC-E2E-31 | The audit log and a history | Playwright | A day of actions | Filter by category and date; open a reservation's history. | Each entry shows the Manila time, category, subject, actor and name, action, field names, and reason; there is no way to edit or delete. | FR-ADM-32, NFR-25, WF-10B |
| TC-E2E-32 | The health panel | Playwright | A failed email, a held email, job runs | Open the health panel as either admin. | Last runs and results, failed and queued emails, cap use with the "held until tomorrow" warning, storage use. | FR-ADM-33, FR-NTF-18, FR-NTF-20, NFR-26 |
| TC-E2E-33 | The other public pages | Playwright | Test business info and privacy contact | Open the home, privacy, and contact pages; look for any cancel or reschedule action on the public site. | The privacy notice exists and the form links to it; the contact page shows the business info and says that cancelling and changing are done by message or call, quoting the reference code; the public site offers no cancel or reschedule action; no personal data on these pages. | FR-PUB-01, FR-PUB-15, FR-PUB-16, EC-50 |
| TC-E2E-34 | Each event sends its emails | Playwright, with the capturing email fake | Ana with an email | Run every trigger of FR-NTF-01 to FR-NTF-15. | Exactly the emails of WF-07B for each event, with their required content, to the right recipients; no admin new-request email for staff bookings. | FR-NTF-01 to FR-NTF-15, WF-07B |
| TC-E2E-35 | The email service is down | Playwright | The email fake answers 503 | The Admin approves Ana; later the fake recovers; in another run it keeps failing. | Ana's status page shows Awaiting Deposit at once; the email goes out when the service is back; a lasting failure shows on the health panel. | FR-NTF-16, FR-NTF-18, EC-66, NFR-33, WF-07A |

### 2.4 Security tests (TC-SEC)

TC-SEC-01 to TC-SEC-49 follow the rows of the [security][sec] §5 checklist in order (the mapping is in 3.6). TC-SEC-50 to TC-SEC-54 cover the threats that the checklist does not name. "If [P] accepted" marks a test of a control proposed in [security][sec]; it is dropped, with a note, if the review rejects that control.

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-SEC-01 | Login needs the password and a TOTP code | Playwright | Test Admin | Log in with the password only; then with the code; jump to `/admin` after the password step; send the "trust this device" option. | The admin area opens only after the code; no device is remembered (if [P] accepted). | NFR-09, FR-ADM-01, TM-01, TM-02 |
| TC-SEC-02 | The account lock and the per-IP login limit | Playwright + pgTAP | NFR-11: 5 failures lock an account for 15 minutes; 20 attempts per IP per hour | 1. Five wrong passwords, then the right one. 2. Try again 14 and 16 minutes after the lock. 3. 21 attempts from one IP over different emails. | 1 Locked: the right password is refused (`account_locked`). 2 Still locked at 14; open at 16. 3 The 21st `rate_limited`. The messages do not say which part was wrong (if [P] accepted). | NFR-09, NFR-11, EC-72, TM-01, TM-34 |
| TC-SEC-03 | Wrong 2FA and backup codes count toward the lock | Playwright | — | Three wrong passwords and two wrong TOTP codes; then a correct backup code. | Locked; the correct backup code is refused while locked. If [P] accepted. | TM-01 |
| TC-SEC-04 | A backup code works once | Playwright | The Admin with backup codes | Log in with code X; log out; use X again. | The second use is refused. | EC-71, TM-02, WF-09D |
| TC-SEC-05 | A session without 2FA opens only the setup page | Playwright + Vitest | A new account without 2FA | Log in with the password; open every admin page; call every admin action and route. | Only the 2FA setup page opens; everything else `not_authenticated`. | FR-ADM-01, NFR-09, TM-37, WF-09B |
| TC-SEC-06 | Ended sessions stop at once | Playwright | The Admin logged in on two browsers | In separate runs the Super Admin signs out, resets, and disables the Admin; the Admin clicks again. | Each time the next request is refused (no session cookie cache). | NFR-09, FR-ADM-30, EC-71, EC-76, TM-03, TM-37, WF-09G |
| TC-SEC-07 | Closed Better Auth endpoints | Vitest | — | Call sign-up, password-reset email, account deletion, email change, and the admin plugin's ban, set-role, set-password, and impersonate endpoints. | "Not found" for each. If [P] accepted. | TM-36 |
| TC-SEC-08 | How passwords are stored | pgTAP | A created account | Read the stored hash. | An argon2id hash with the parameters of sec §4.1 [P], or the scrypt fallback if TC-W1-03 needs it; never the password. | NFR-09, TM-22 |
| TC-SEC-09 | No raw IP addresses | pgTAP | After logins, lookups, and submissions from a known test IP | Search the session, limiter, rate-limit, and audit rows. | The raw IP is nowhere. If [P] accepted ([U] behaviour checked in TC-W1-03). | NFR-11, NFR-13, priv §3.2, TM-29 |
| TC-SEC-10 | Every admin page, action, and route refuses a logged-out caller | Vitest + Playwright | Every exported function under `lib/actions/admin`, every admin page, every admin route | Call or open each without a session. | Actions and routes `not_authenticated`; pages redirect to the login page; nothing changes. | NFR-10, FR-ADM-01, EC-73, TM-10 |
| TC-SEC-11 | Super-Admin-only actions refuse the Admin | Vitest + pgTAP | The role table of [roles][roles] §2 | Call each Super-Admin-only action as the Admin: whole-date block, settings, slots, sets and the room, accounts, legal hold, erasure. | `forbidden` each time; nothing changes. | NFR-10, EC-74, TM-36 |
| TC-SEC-12 | The role table covers every admin action | Vitest (CI) | — | List every exported admin action; compare with the role table. | A missing action fails the build. If [P] accepted. | TM-10 |
| TC-SEC-13 | Every admin database function checks the actor again | pgTAP | Actors: the Admin for Super-Admin functions, a disabled account, an account without 2FA, an unknown id | Call every admin function with each wrong actor. | `forbidden` (step A, api §5.1). | NFR-10, TM-36, WF-09C |
| TC-SEC-14 | The app's role cannot write tables directly | pgTAP | `app_rw` | INSERT, UPDATE, DELETE, and TRUNCATE on every business table. | Permission denied; it can delete no reservation, payment, block, or audit entry. | NFR-10, NFR-22, EC-54, TM-11 |
| TC-SEC-15 | Internal helpers and PUBLIC | pgTAP | — | As `app_rw`, call each internal helper (api §5.2) and each SQL-only job; list the `EXECUTE` grants of `PUBLIC` in `app`. | Refused; `PUBLIC` holds none. | NFR-10, TM-11, TM-38 |
| TC-SEC-16 | Definer functions have an empty search path | pgTAP | — | A catalog query over every `SECURITY DEFINER` function in `app`. | Each has `search_path = ''`; none can be run by `PUBLIC`. | TM-38 |
| TC-SEC-17 | The Data API shows nothing | Script on the real project | The publishable key | Read and write each table through the REST endpoint; list the exposed schemas. | Nothing readable or writable; `app` and `admin_auth` are not exposed; the Data API is off if TC-W1-05 allows it. | NFR-10, NFR-15, TM-12 |
| TC-SEC-18 | TLS is required; the role timeouts apply | Script on the real project | — | Connect without TLS; read `pg_roles.rolconfig`; trigger each timeout through port 6543. | Refused without TLS; timeouts as data §2.3 (5 s, 2 s, 10 s), giving `57014`, `55P03`, and `25P03` [U] (settled in TC-W1-01). | NFR-02, TM-22, TM-33 |
| TC-SEC-19 | The bot checks | Vitest + Playwright | Turnstile test keys | Submit with no token, a failing token, a used token, and a filled honeypot. | `bot_check_failed`, one generic message (if [P] accepted), and no call to the booking function. The checks run in the order of api §2.3: honeypot, rate limit, Zod, Turnstile. | NFR-12, FR-PUB-06, EC-14, TM-30 |
| TC-SEC-20 | Submission rate limit, hold limits, and the breaker | Vitest + pgTAP | NFR-11: 5 submissions per IP per hour | Six submissions from one IP, two of them repeats of one key; then TC-DB-20 to TC-DB-22. | The sixth `rate_limited` (repeats count, if [P] accepted); the hold limits and the breaker as BR-07 and BR-07a. | NFR-11, NFR-12, BR-07, BR-07a, EC-09, EC-10, EC-15, TM-30, TM-31, TM-35 |
| TC-SEC-21 | The same submission key | Playwright + pgTAP | — | Repeat with the same key and the same data; then with the same key and other data. | Same data: the same reservation (EC-01). Other data: refused with `submission_key_mismatch` (api §1.8; sec §4.4); the first reservation stands. | EC-01, TM-30 |
| TC-SEC-22 | A hold-limit refusal reveals nothing | Playwright + pgTAP | Eva holds 19 Dec | Submit again for 19 Dec. | No reference code, QR code, or booking detail in the response or the page. If [P] accepted. | EC-09, TM-26 |
| TC-SEC-23 | A spoofed client-IP header | Script on the real project | — | Send submissions with a different `x-forwarded-for` each time. | The rate-limit key does not change [U] (which header to trust: TC-W1-03). | NFR-11, TM-05 |
| TC-SEC-24 | The lookup rate limits | Playwright + pgTAP | NFR-11: 10 lookups per IP per 15 minutes; 5 failures per reference code per hour | Eleven lookups from one IP; six failures on one code with different mobiles and IPs. | The 11th `rate_limited`; the 6th failure `rate_limited` for that code. | NFR-11, FR-PUB-10, EC-65, TM-07, TM-34 |
| TC-SEC-25 | Failed lookups all look the same | Playwright | — | A wrong code; a wrong mobile; compare the responses and their timing. | The same message and status; no measurable time difference (if [P] accepted). | EC-65, TM-07 |
| TC-SEC-26 | No personal data on the public pages | Playwright | Ana, with name, mobile, venue, and note | Read the HTML and responses of the status page and the `/r/` page. | No name, mobile, address, or note anywhere. | NFR-15, FR-PUB-09, FR-PUB-11, TM-06, TM-08 |
| TC-SEC-27 | Every invalid token looks the same | Playwright | Revoked, replaced, unknown, guessed, final-status, and malformed tokens | Open each. | The same page with HTTP 404 and no data; nothing shows that a token ever existed. | EC-60, FR-PUB-09, NFR-13, TM-08 |
| TC-SEC-28 | The `/r/` page's headers, and no third parties | Playwright | — | Read the headers; record the network requests. | `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`, `Cache-Control: no-store`; no request to any other host. If [P] accepted. | TM-28 |
| TC-SEC-29 | No raw token or QR link in the database | pgTAP | After submissions, reissues, and queued emails | Search every table, the outbox included, for a token or a `/r/` link. | None found: the outbox holds the QR link only encrypted, in `qr_link_ciphertext`, and only while the row is queued (api §1.13; data §5.12). | NFR-13, TM-22, TM-23 |
| TC-SEC-30 | Customer actions need a lookup session | Vitest + Playwright | No `ksb_status` cookie; an expired one; one for another reservation | Ask for an upload slot, confirm an upload, reissue the QR, open a document. | `lookup_required` or the 404 page; nothing changes. The cookie is HttpOnly, Secure, SameSite=Lax, signed, and lasts 15 minutes (sec §4.5.2); a document link from an email opens the status lookup first (sec §4.5.5). If [P] accepted. | FR-PUB-12, FR-PUB-13, FR-PUB-14, TM-24, TM-25 |
| TC-SEC-31 | The customer's QR reissue limit | pgTAP | — | Four reissues within one hour. | The fourth `rate_limited` (the `qr_reissue` bucket, api §1.11; 3 per reservation per hour, data §7). If [P] accepted. | TM-07 |
| TC-SEC-32 | Harmful uploads | Playwright + pgTAP | A third file; a GIF; a 1.1 MB JPG; a text file renamed `.jpg`; an SVG | Upload each. | All refused (EC-30); the renamed file caught by the first-bytes check (if [P] accepted); SVG never allowed. | FR-PUB-12, NFR-14, EC-30, TM-13 |
| TC-SEC-33 | A signed upload link used twice | Script, local and on the real project | An issued slot | Upload twice through the same link; upload to another path with it. | The second upload refused (`upsert: false`); the slot stays in its final state. | FR-PUB-12, TM-14 |
| TC-SEC-34 | Uploaded pictures carry no photo data | Playwright | A JPG with GPS data | Upload it; download the stored object. | No EXIF and no GPS data. | FR-PUB-12, NFR-14, TM-25 |
| TC-SEC-35 | Proof view links and the private bucket | Script | A stored proof | Open a view link after its lifetime (5 minutes, sec §4.6; api §3.2); fetch the object with the publishable key and with no key. | Refused each time. | NFR-14, FR-ADM-12, TM-25 |
| TC-SEC-36 | Retention removes the files, not only the rows | pgTAP + local Storage | After TC-DB-71 | List the bucket. | The deleted proofs' files are gone from Storage. | priv §6.2, TM-25 |
| TC-SEC-37 | Job routes need the secret | Vitest + script | Both job routes | Call with no header, a wrong secret, a secret of another length, and the right secret with the wrong method. | 401 with an empty body, nothing runs, and the attempt is logged without the value; 405 for the wrong method; never redirected to the login page (the routes are outside the `proxy.ts` matcher). | FR-SYS-09, EC-78, TM-04 |
| TC-SEC-38 | Two job runs at once | Script | Both routes | Call the tick twice at the same moment. | One runs; the other answers 409 `job_running`. | FR-SYS-09, TM-04 |
| TC-SEC-39 | Previews hold no production secret | Manual + CI | A preview deployment | List its environment variables; open its pages. | No production secret; no database or email key by default. | NFR-13, TM-27 |
| TC-SEC-40 | The repository is private before backups | Manual | — | Check the repository's visibility before `backup.yml` is merged. | Private ([C] D-22, O-06). | NFR-27, TM-22, TM-27 |
| TC-SEC-41 | The secret scanner | CI | A branch with a planted test secret | Push. | CI fails. If [P] accepted. | TM-27 |
| TC-SEC-42 | Framing, security headers, and redirects | Playwright | — | Frame an admin page from another origin; read the headers of each page type; log in with a return address of `https://evil.example`. | Framing refused; HSTS (own domain), CSP, `nosniff`, Referrer-Policy, and Permissions-Policy present as sec §4.9; the return address accepts only a path under `/admin`. If [P] accepted. | TM-15, TM-16 |
| TC-SEC-43 | Customer text is shown as text | Playwright + Vitest | A name `<b>Ana</b><script>…</script>` and a note with HTML | View them in the admin panel, in each email, and in the prepared message. | Shown as plain text everywhere; no script runs. | FR-NTF-21, TM-16 |
| TC-SEC-44 | Error reports are scrubbed | Manual on the real Sentry project | A test error on a page with personal data and a `/r/` address | Read the Sentry event. | No name, mobile, email, venue, note, reference code, token, cookie, or request body; the path shows `/r/[token]`. | NFR-23, TM-20 |
| TC-SEC-45 | No contact data in the audit log | pgTAP | After the whole TC-DB suite | Scan every audit entry for mobile-number and email patterns. | None found. | NFR-25, FR-ADM-32, TM-21 |
| TC-SEC-46 | Security events are recorded | pgTAP + Playwright | — | A successful login; a failed login; a lock; a refused admin request; a job-route call without the secret; the same rate limit hit twice in one window; a proof view. | One `security` entry each (once per key and window for the limit); the successful login is `auth.login` ([P] in FR-ADM-01); an email that belongs to no admin is never stored. If [P] accepted for the others. | FR-ADM-01, TM-19 |
| TC-SEC-47 | Backups cannot be read without the key | Manual | A nightly backup artifact | Try to open it; decrypt it with the offline key; restore it (TC-NFR-16). | Unreadable without the key; the restore passes. | NFR-27, NFR-29, TM-22 |
| TC-SEC-48 | Version floors | CI | A branch whose lockfile has Next.js 16.4.0, Better Auth 1.7.6, or `sharp` 0.35.4 | Push. | CI fails. If [P] accepted. | NFR-30, TM-17, TM-39 |
| TC-SEC-49 | Dependabot and the audit gate | CI | A branch adding a package with a known high advisory | Check Dependabot for npm and Actions; push. | Dependabot is on; CI fails on the advisory. | NFR-30, TM-17 |
| TC-SEC-50 | Prices and capacity values cannot be changed from the browser | Playwright + pgTAP | — | Change the form's data and the Server Action payload: price, deposit, set, urgent flag, deadline. | Ignored or refused; the saved values come from the database (TC-DB-68). | NFR-21, TM-09 |
| TC-SEC-51 | Requests from another site | Playwright | A logged-in admin; a page on another origin | Post to an admin Server Action from that page. | Refused: the SameSite=Strict cookie is not sent, and the origin check fails. | NFR-10, TM-15 |
| TC-SEC-52 | Provider accounts | Manual | GitHub, Vercel, Supabase, Resend, Sentry, Cloudflare, the domain registrar | Check each account's 2FA and where its recovery codes are kept. | 2FA on; recovery codes offline. If [P] accepted. | TM-40 |
| TC-SEC-53 | The break-glass path | Manual + pgTAP | The script and the `postgres` password | Check where the password is kept; run the script on the local database. | The password exists only on the developer's laptop and offline; the script resets the Super Admin's 2FA, ends his sessions [P], and writes one audit entry, actor `system` and category `security` (api §3.8); `app_rw` cannot run it. | EC-71, TM-41, WF-09E |
| TC-SEC-54 | No test hooks in production | Script on the real project | — | Look for the test-clock marker and any test-only function or schema. | None present. Needed only if the clock design of 1.5 is accepted (Q1). | NFR-21 |

### 2.5 Non-functional tests (TC-NFR)

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-NFR-01 | Running cost is ₱0 | Manual, monthly from launch | The billing page of every provider | Check plans and bills; check the GitHub Actions minutes of the private repository. | Free plans only and no bill; minutes inside the allowance [U]. A domain (O-05) is a separate decision. | NFR-01, D-19 |
| TC-NFR-02 | Everything runs in Singapore | Script | Production | Call `/api/health`; read the Supabase project's region. | `sin1`; the database in Southeast Asia (Singapore). | NFR-02, FR-SYS-11 |
| TC-NFR-03 | Cached pages and live pages; no polling | Playwright | — | 1. Load `/packages` twice; change a price; load it again. 2. Book the last set in another browser while the calendar, a status page, and an admin page are open; reload each. 3. Leave each page open for 2 minutes. | 1 Served from the cache, then the new price right after the edit. 2 Each reload shows the change at once; never a cached "Available". 3 No background requests. | NFR-03, FR-PUB-02, FR-ADM-02, BR-09 |
| TC-NFR-04 | Speed | Script, in week 1 and before launch | — | From `sin1`, measure p50 and p95 of the health query, the calendar, a submission, and an admin action, 100 samples each. | Week 1: recorded (TC-W1-01). The target is set at the go / no-go and added to NFR-03 (Q8). Before launch: within that target. | NFR-03, NFR-02 |
| TC-NFR-05 | The uptime check and its alert | Manual, before launch | The Sentry uptime check on `/api/health` | Point the check at an address that fails, for a test. | The Super Admin receives the alert ([P] in NFR-04). | NFR-04, FR-SYS-11, EC-80 |
| TC-NFR-06 | The portable build | CI, and once against the real project | — | Build the standalone Docker image; start it against the local database; request a page and `/api/health`. | Both answer; the image runs as a non-root user. TC-W1-09 repeats it against the real Supabase project. | NFR-05, NFR-31, EC-80, arch §11.2 |
| TC-NFR-07 | Vercel usage | Script + manual | The week-1 load results; weekly after launch | Compare function calls and active CPU with the Hobby allotments. | Well inside the allotments [U]; checked weekly by the Super Admin ([P] in NFR-06). | NFR-06, TM-32 |
| TC-NFR-08 | Vendor terms are saved | Manual, before launch | — | Check the dated copies of the terms and data processing agreements of Vercel, Supabase, Resend, and Sentry (and GitHub and Cloudflare: priv §11 question 14). | Saved before launch (O-08). | NFR-08, O-08 |
| TC-NFR-09 | Phone first | Playwright at 360 px | Every public and admin page | Check for horizontal overflow; time a full booking. | No sideways scrolling; the booking finishes; its time is noted for comparison with TC-UAT-02. | NFR-16 |
| TC-NFR-10 | Automated accessibility scan | Playwright + axe | Every page, at phone and desktop sizes | Run axe on each page and on each form state (empty, errors, success). | No serious or critical violation. | NFR-17 |
| TC-NFR-11 | Accessibility by hand | Manual, with TC-UAT-27 | — | Keyboard only (Tab, Shift+Tab, Enter, Space, the arrow keys, Esc) through a booking and the main admin actions; 200 % zoom and the phone's large text; contrast checks; tap sizes; statuses and Available/Full in words; the QR code with the reference code as text. | Each of the eight NFR-17 items holds. | NFR-17 |
| TC-NFR-12 | Supported browsers | Playwright (Chromium, WebKit) + manual | — | Run the full TC-E2E suite in both engines; book once by hand in the Facebook and Messenger in-app browsers; use the admin panel on the laptop's Chrome or Edge and on the admins' phones. | All pass. | NFR-18 |
| TC-NFR-13 | The heartbeat alert fires | Manual, before launch | The real projects | Stop the every-minute expiry job on purpose for 10 minutes; then restart it. | Sentry alerts the Super Admin; the health panel shows the old last run; the job resumes cleanly. | NFR-24, FR-SYS-10, EC-77 |
| TC-NFR-14 | The nightly backup | Manual + CI | `backup.yml` | Check that it runs nightly through the session pooler with the read-only role, with a `pg_dump` client that matches the server; encrypts with `age`; stores the artifact with `retention-days: 14`; never commits it; holds no proof images. | All true. | NFR-27, NFR-10, FR-SYS-12 |
| TC-NFR-15 | The monthly offline copy | Manual, monthly | — | Follow the monthly step in [deployment and operations][ops]. | One encrypted copy offline; the previous one destroyed. | NFR-28 |
| TC-NFR-16 | Restore from a backup | Manual + scripts, on the schedule of [deployment and operations][ops] §5.5 (week 1 and before launch, at least) | The latest nightly artifact; a fresh project or Postgres of the same major version; never over the live database | 1. Follow the restore steps of [deployment and operations][ops] §5.4. 2. Decrypt with the offline key and restore into the fresh database. 3. Compare row counts and checksums of the main tables with the source at dump time; run the invariant checks of 1.5. 4. Run the retention job before reopening; check that data past its period is gone again. 5. End every admin session ([P] in sec §4.12). 6. Note how long it took, and record the run in 6.5. | The restore completes; counts and checksums match; the invariants hold; the retention job removes expired data again; proof images are absent, by design (EC-81). | NFR-29, NFR-27, FR-SYS-05, FR-SYS-12, EC-81, TM-22 |
| TC-NFR-17 | Pinned versions and fast fixes | CI + manual | — | Check that the lockfile pins exact versions (Next.js 16.4.2, React 19.3.1, never below the floor of NFR-30); that CI installs with `npm ci`; that Dependabot pull requests run the full CI. | All true. Each critical advisory is merged within the time in NFR-30, and the date is recorded. | NFR-30 |
| TC-NFR-18 | Automatic checks on every change | CI | — | Push a commit; open a pull request. | Lint, typecheck, unit tests, and database tests on every push; end-to-end tests and the Docker build on pull requests and `main` (1.6). | NFR-32 |
| TC-NFR-19 | Storage stays inside the free plan | Manual, monthly | The health panel | Read database and file storage use; compare with the estimate of data §11. | Inside the estimate; the warning shows above 400 MB ([P] in data §11). | NFR-26, data §11 |

### 2.6 Week-1 spike (TC-W1)

These run once, on the real projects, before features are built ([project-charter][charter] phase 4). Each case lists what it does; section 4 gives each **[U]** fact it settles, with its pass and fail criteria.

| ID | Title | Level | Preconditions and data | Steps | Expected result | Covers |
|---|---|---|---|---|---|---|
| TC-W1-01 | `sin1` to the pooler: TLS, latency, role timeouts | Script on Vercel | The real projects; `app_rw` with a SCRAM password and no `VALID UNTIL` | From a function in `sin1`: connect with the Supabase CA and `rejectUnauthorized: true`, and with a wrong CA; try the direct database host; trigger each role timeout; time 100 calls each of `select 1`, the calendar, and a booking. | Section 4, item 1. | NFR-02, NFR-03, NFR-10, TM-22, TM-33 |
| TC-W1-02 | The booking function and simultaneous bookings | Script on Vercel | One set free | Send 20 submissions for the last set at once to the deployed app; repeat 5 times; watch `pg_stat_activity` and the pooler's client chart. | Section 4, item 2. | NFR-20, BR-01, EC-04 |
| TC-W1-03 | argon2id and 2FA on Vercel | Manual + script | The deployed login | Log in with argon2id and TOTP; inspect the cookies; send spoofed IP headers; call admin actions while logged out; read Better Auth's rows. | Section 4, item 3. | NFR-09, NFR-11, TM-05, TM-29 |
| TC-W1-04 | `pg_cron`, `pg_net`, a test email, the keep-alive | Manual + script | The real projects | Enable the extensions; schedule the jobs; send a test email through Resend twice with the same idempotency key; watch `after()`, the Vercel Cron call, and the Sentry check-in over several days. | Section 4, item 4. | FR-SYS-01 to FR-SYS-08, NFR-07, NFR-24, NFR-33 |
| TC-W1-05 | A signed upload to the private bucket | Script | The real bucket with the FR-PUB-12 limits | Upload allowed and refused files through a signed link; reuse the link; turn the Data API off and upload again. | Section 4, item 5. | FR-PUB-12, NFR-14, TM-12, TM-14 |
| TC-W1-06 | QR scanning on the owner's own phone and laptop | Manual, with the business owner | `/admin/scan` deployed over HTTPS | Scan 5 QR codes, from phone screens and from paper, with the Admin's phone and with the laptop; use the screenshot fallback; open a QR link from the phone's camera app while logged in. | Section 4, item 6. | FR-ADM-06, NFR-16, NFR-18, EC-63 |
| TC-W1-07 | Backup and restore | Manual + script | The real project; the repository already private | Run `backup.yml`; then TC-NFR-16. | Section 4, item 7. | NFR-27, NFR-29, FR-SYS-12 |
| TC-W1-08 | Real usage against the Hobby allotments | Manual | After TC-W1-01 to TC-W1-07 and a load run (500 calendar views, 100 submissions) | Read Vercel's usage and the pooler's client count. | Section 4, item 8. | NFR-01, NFR-06, TM-32 |
| TC-W1-09 | The other week-1 checks | Manual | — | `updateTag` on Vercel; the reload prompt after a redeploy; the Docker image against the real project; Better Auth's tables in their own schema; the migration file names; Sentry with Cache Components; one firewall rule for several paths. | Section 4, "Also checked in week 1". | NFR-03, NFR-31, EC-02 |

### 2.7 Acceptance tests (TC-UAT)

The acceptance cases TC-UAT-01 to TC-UAT-29 are written out in section 5, in plain words, so that the business owner can run them himself. Each one there has its ID, title, who runs it, what to prepare, the steps, what you should see, what it covers, and the pass boxes.

---

## 3. Traceability

Each table maps one kind of requirement to the test cases that check it. TC IDs are written without the `TC-` prefix to keep the tables short: `DB-07` is TC-DB-07. The non-functional cases keep their prefix (`TC-NFR-03`), so they are never mistaken for the requirement NFR-03. A requirement can appear under several cases, and every case lists what it covers in its own "Covers" column.

### 3.1 Functional requirements → test cases

The second column names each acceptance criterion of [functional-requirements][fr] in a few words, followed by the cases that check it.

| FR | Acceptance criterion → test cases |
|---|---|
| FR-PUB-01 | Names both services → E2E-01. Links to every public page → E2E-01, E2E-33. No personal data → E2E-33 |
| FR-PUB-02 | Active packages with inclusions and prices → E2E-01, E2E-28. Active add-ons with prices → E2E-01. Archived not shown → DB-30, E2E-28. Same packages for both services → E2E-01. Free-delivery wording (O-04) → E2E-01, UAT-02. A new price shows after an edit → E2E-28, TC-NFR-03, UAT-19. Cached and refreshed on edit → TC-NFR-03 |
| FR-PUB-03 | Pick a service type, then Available or Full per date → DB-28, E2E-01. The two-set example → DB-01, DB-02. Available again at once after an expiry → DB-07. Dates outside the window cannot be picked → DB-28, E2E-05. No personal data → DB-28. Paused banner → DB-28, E2E-05. Continues to the form with type and date filled in → E2E-01. Live, never cached → TC-NFR-03 |
| FR-PUB-04 | One package → UT-01, E2E-01. Add-ons with quantities, stock checked at Submit → DB-04, E2E-04. Delivery: an active slot; the set held all day → DB-01, DB-30. On-site: an arrival within on-site hours → DB-14, UT-14, E2E-05. Same-day start within the notice period refused → DB-14, E2E-05. Free-delivery wording on the form → E2E-01. The start becomes the service start → DB-39 |
| FR-PUB-05 | The fields asked → UT-01, E2E-01. Mobile only in BR-11 forms, saved in one form → DB-33, UT-02, E2E-05. Note warning and 500-character limit → E2E-05, UT-01, DB-95. No other personal data asked → E2E-01. Works without an email → E2E-06, DB-77 |
| FR-PUB-06 | Summary before Submit → E2E-01, UT-05. Privacy summary and agreement → E2E-01. Prices locked at submission → DB-39, DB-32, DB-68. On success, Pending Confirmation holding its claims → DB-39. No double booking at the same instant → DB-10, W1-02, UAT-12. Taken while filling in → E2E-04. Other refusals keep the data → DB-14, DB-20, DB-21, DB-22, E2E-05. While paused → DB-22, E2E-05. No accidental duplicates → DB-39, E2E-02, SEC-21. New website version → E2E-03. Bot protection and rate limit → SEC-19, SEC-20. Emails queued → DB-39, E2E-34. Audit entry, actor customer → DB-39, DB-88. Developer note (one call, key hashed and deleted after 72 hours) → DB-39, DB-74 |
| FR-PUB-07 | Reference code, QR code, "Not yet confirmed" → E2E-01. Next steps explained → E2E-01. Nothing suggests approved or paid → E2E-01, UAT-02. Request-received email → E2E-34 |
| FR-PUB-08 | Code format and alphabet → UT-03, UT-04, DB-39, DB-95. Forgiving lookups → UT-03, E2E-07. QR link form → UT-04. Stops working at Rejected, Cancelled, Expired, Completed → DB-45, DB-46, DB-47, DB-48, E2E-14, SEC-27. Reissue stops the old one → DB-61, E2E-18. Neither means approved or paid → E2E-01. Secure random, unique, 160-bit token, hash only → UT-04, DB-95, SEC-29 |
| FR-PUB-09 | Valid, logged out: "present this at our office" → E2E-17. Valid, admin: opens the reservation → E2E-17, W1-06. Invalid, revoked, or guessed: "not found" → E2E-17, SEC-27 |
| FR-PUB-10 | Needs the code and the full mobile → E2E-07. Any BR-11 form → E2E-07, UT-02. Code matched as FR-PUB-08 → UT-03, E2E-07. No match, no data → E2E-07, SEC-25. Rate limits → SEC-24 |
| FR-PUB-11 | The listed fields → E2E-07. Never name, mobile, or address → E2E-07, SEC-26. Overdue hold shows Expired at once → DB-07, E2E-07. Live, never cached → TC-NFR-03 |
| FR-PUB-12 | Control only after a lookup, while Awaiting Deposit, before the deadline → DB-35, E2E-07, E2E-08, SEC-30. Types, size, 2 uploads ever → DB-35, E2E-09, SEC-32. Re-saved in the browser, no EXIF → E2E-08, SEC-34. Pauses expiry, joins the list, emails both admins → DB-34, E2E-08. Never confirms by itself → E2E-08. Deleted on schedule → DB-71. Single-use signed upload, private bucket → SEC-33, W1-05 |
| FR-PUB-13 | New QR shown → DB-61, E2E-18. Old one stops at once → DB-61, E2E-18. Reference code unchanged → DB-61. Audited, actor customer → DB-61 |
| FR-PUB-14 | Links on the status page → E2E-07, E2E-10. Links in the Confirmed email → E2E-34, UT-11. Printable pages → E2E-10. Content and numbering → DB-65, UT-11 |
| FR-PUB-15 | A public page with the full notice → E2E-33. Linked from the form → E2E-01. Privacy contact once it exists (O-09) → E2E-33 (Q10) |
| FR-PUB-16 | Business info → E2E-33. No online cancel or reschedule → E2E-33. FAQ (O-03, O-04) and addresses (O-05) → E2E-33 with test content (Q10) |
| FR-ADM-01 | Email, password, then TOTP → SEC-01, E2E-10. Area closed until 2FA; backup codes at setup → SEC-05, SEC-04. No sign-up → SEC-07. Lock after failures → SEC-02. Logged-out redirect → SEC-10, E2E-10. Logout → E2E-10. Account and login audit entries → DB-91, SEC-46. argon2id; checks on the server → SEC-08, SEC-10 |
| FR-ADM-02 | Urgent and pending queue, proofs to verify, upcoming events, deadline alerts, paused banner → DB-97, E2E-19. Also shown alongside the admin emails → E2E-19. Overdue shown expired → DB-97, DB-07. No background refresh → E2E-19, TC-NFR-03 |
| FR-ADM-03 | List; filters; search by code, name, mobile; normalization; overdue as Expired; live → E2E-20, DB-97 |
| FR-ADM-04 | Every listed field → E2E-21. Only allowed actions; forbidden ones refused → DB-51, E2E-21, SEC-11. Blanked records show blanks → E2E-21, DB-70 |
| FR-ADM-05 | Either admin adds; author and time → DB-62. Never shown to customers → DB-62, UT-11. Blanked on schedule → DB-70 |
| FR-ADM-06 | Camera scan → E2E-16, W1-06. Screenshot fallback → E2E-16, W1-06. Search by code → E2E-16. Invalid or revoked → E2E-16. Not used on event day **[C]**: a usage rule with nothing for the system to do; stated in UAT-09. Tested on the real devices → W1-06 |
| FR-ADM-07 | Role check → SEC-10, SEC-11, SEC-13. Reasons required → DB-45, DB-47, DB-54 to DB-56, DB-59. Two admins at once → DB-92, UAT-13. Deadlines checked, not left to jobs → DB-53. All or nothing → DB-10, DB-88. Audit → DB-88. Emails saved with the change; a failed email never undoes it → DB-77, E2E-35. No deletions → SEC-14, DB-89, DB-59. One call, status and version, lock → DB-92, DB-13 |
| FR-ADM-08 | Approve → Awaiting Deposit, deadline → DB-42. Approved email; reminder later → DB-42, DB-79. Address check by the admin, no area list → E2E-10, UAT-05. Reject with a reason shown and emailed; frees capacity → DB-45, E2E-07. Approve after the deadline refused → DB-53 |
| FR-ADM-09 | Only on Pending; message required; deadline unchanged; message on status page and email; "Info received"; audited → DB-54, E2E-22 |
| FR-ADM-10 | Offered on three statuses; reason → DB-51, DB-55. Fields changeable, not the date → DB-55. Mobile in BR-11 form → DB-55. Stock refusal → DB-55, E2E-23. Email; field names only → DB-55 |
| FR-ADM-11 | Fields, prefilled exact amount → DB-44, E2E-10. Confirmed and verified → DB-44. Acknowledgment → DB-44, DB-65. Confirmed email → DB-44. After a waiver → DB-19. One active deposit → DB-19. After the deadline refused unless paused → DB-44, DB-36. No payer details → E2E-10, UAT-06 |
| FR-ADM-12 | Short-lived image link → E2E-08, SEC-35. Verify → DB-36, E2E-08. Reject with reason → DB-37, E2E-09. Leaves the list → DB-36, DB-97. The example → DB-36, DB-37. Never past the service start → DB-38 |
| FR-ADM-13 | Offered only today, on Pending or Awaiting Deposit → DB-43, E2E-25. Reason; Confirmed with no deposit → DB-43. Email; audit with reason → DB-43. Deposit still recordable → DB-19, E2E-25 |
| FR-ADM-14 | Confirmed and Completed only → DB-58. Default amount → UT-13. Acknowledgment → DB-58, E2E-10. Status unchanged → DB-58 |
| FR-ADM-15 | Void with a reason → DB-59, E2E-26. Kept, marked void → DB-59. Number retired → DB-59, DB-65. No status change → DB-59 |
| FR-ADM-16 | Offered on holds only; reason → DB-56, DB-51. Not past the service start → DB-56, E2E-24. Overdue refused → DB-56. Email; reminder follows → DB-56, DB-78 |
| FR-ADM-17 | Offered on three statuses → DB-51. Refused if not free; unchanged → DB-57, E2E-13. Same code and prices; new deadline and urgent flag → DB-57. Email; audit → DB-57 |
| FR-ADM-18 | Offered on three statuses; reason → DB-47, DB-51. Refund decision when a deposit was paid → DB-47, E2E-14. Date free; status page shows reason and decision → DB-06, E2E-14. Email; audit → DB-47. Paying is separate → DB-60 |
| FR-ADM-19 | Fields; admin and time saved → DB-60, E2E-14. No acknowledgment → DB-60. Closure date moves → DB-60, DB-69 |
| FR-ADM-20 | Only on Completed; reason and refund decision → DB-49. Shows Cancelled with reason and decision; audited → DB-49, E2E-27. Email: not specified (Q6) |
| FR-ADM-21 | Only on Expired → DB-41, DB-51. Refused if not free → DB-41. New Pending with own code; linked; original stays Expired → DB-41, E2E-15. Not refused by hold limits → DB-41. Email; audit → DB-41 |
| FR-ADM-22 | Old QR stops → DB-61, E2E-18. Code unchanged; audited → DB-61. How the customer receives it: not specified (Q6) |
| FR-ADM-23 | Open and print from the reservation page; same documents → E2E-10, E2E-11 |
| FR-ADM-24 | Source and the same fields → E2E-11, DB-40. Capacity exactly as online → DB-16. Skips notice, limits, breaker; no admin email → DB-16. Urgent for today → DB-15. Prices locked at creation → DB-40. One-step deposit or waiver → DB-17, DB-18, DB-19, E2E-11. Otherwise Pending → DB-40. No bot checks → E2E-11 |
| FR-ADM-25 | Kinds and roles; reason → DB-24, DB-26. One per date → DB-24. Refused when taken, naming the clash → DB-25, DB-11. List by date → E2E-12. Removal frees at once; audited → DB-27. Calendar at once → DB-24, E2E-12 |
| FR-ADM-26 | Add and edit → E2E-28. Archived, never deleted → DB-30. Price change touches no reservation → DB-32. Clashing edit refused and listed → DB-29, DB-30. Packages page updated → E2E-28. Audit "catalog" → DB-88 |
| FR-ADM-27 | Role; add, rename, deactivate → DB-31, E2E-29. Pool = active sets → DB-03. Deactivation with future bookings refused → DB-31. Audited → DB-88 |
| FR-ADM-28 | The setting groups; only the allowed role saves → DB-90, E2E-29. Pause not editable → DB-23. Audit with the key → DB-90. Never changes existing reservations → DB-32. Archiving a used slot refused → DB-30 |
| FR-ADM-29 | Button on the banner → E2E-19. Either admin; accepted again at once → DB-23. Ends on its own → DB-23. Audited → DB-23 |
| FR-ADM-30 | Accounts screen; one active Admin; no self-disable → DB-91, E2E-30. Reset ends sessions and 2FA → DB-91, SEC-06. Audited → DB-91. Break-glass is a script → SEC-53 |
| FR-ADM-31 | Super Admin only → DB-63, DB-64, SEC-11. Legal hold set and cleared; retention skips → DB-63, DB-72. Erasure after the check; fields blanked unless held; ledger kept; audit → DB-64, E2E-30. Customer told → UAT-28 (how: Q6) |
| FR-ADM-32 | Both admins view → E2E-31. Entry fields → DB-88, E2E-31. Append-only → DB-89. No contact data → SEC-45. History = entries → E2E-21. Filters → E2E-31 |
| FR-ADM-33 | Both admins open it; last runs, failed emails, queue, caps with warning, storage → DB-87, E2E-32 |
| FR-NTF-01 | Request received: online, staff, recreate → DB-39, DB-40, DB-41, E2E-34; content → UT-11 |
| FR-NTF-02 | Needs info → DB-54, E2E-22; content → UT-11 |
| FR-NTF-03 | Approved → DB-42, E2E-34; content → UT-11 |
| FR-NTF-04 | Deposit reminder: timing from the current deadline; not when already passed; follows an extension; skipped when stale → DB-79, DB-78, DB-80; content → UT-11 |
| FR-NTF-05 | Deadline extended → DB-56, E2E-24; content → UT-11 |
| FR-NTF-06 | Proof not accepted → DB-37, E2E-09; content → UT-11 |
| FR-NTF-07 | Confirmed: deposit, verification, waiver → DB-44, DB-36, DB-43; document links → UT-11, E2E-34 |
| FR-NTF-08 | Reservation updated → DB-55; content → UT-11 |
| FR-NTF-09 | Rejected → DB-45; content → UT-11 |
| FR-NTF-10 | Cancelled with the refund decision → DB-47, E2E-14; content → UT-11 |
| FR-NTF-11 | Rescheduled → DB-57, E2E-13; content → UT-11 |
| FR-NTF-12 | Expired: job, proof rejection → DB-46, DB-37; content → UT-11 |
| Common to FR-NTF-01 to FR-NTF-12 | Only with an email address → DB-77, E2E-06. Reference code, Manila time, pesos, no notes → UT-11. Saved in the outbox → DB-77 |
| FR-NTF-13 | Online only, not for staff bookings → DB-39, DB-16. Urgent marked → UT-11. Both admins → DB-77. On the dashboard → E2E-19 |
| FR-NTF-14 | Proof uploaded → DB-34, E2E-08 |
| FR-NTF-15 | Breaker pause: exactly one per pause → DB-22 |
| FR-NTF-16 | Same transaction; sent after the reply; the every-minute job sends the rest; the change stands → DB-77, UT-18, E2E-35 |
| FR-NTF-17 | Unique keys; reminder key by deadline; queued or retried twice still once → DB-78, DB-83 |
| FR-NTF-18 | Retries for temporary errors; failed after the last; other 4xx at once; the change stands → DB-81, UT-10, E2E-32, E2E-35 |
| FR-NTF-19 | Skipped, not failed, when the reason is gone → DB-80 |
| FR-NTF-20 | Caps as settings; customer first; admin reserve; held to the next day with a warning; dashboard at once → DB-82, E2E-32, E2E-19 |
| FR-NTF-21 | Book and follow without email → E2E-06, DB-77. Prepared message on the reservation page → E2E-06. Same information as the email → UT-12 |
| FR-SYS-01 | Expire overdue, not paused; paused at the service start; email and audit "system"; only tidies → DB-46, DB-38, DB-52, DB-07 |
| FR-SYS-02 | Queue due reminders; never twice → DB-79, DB-78 |
| FR-SYS-03 | `pg_net` calls the tick when emails wait; sending rules → DB-86, UT-18, W1-04 |
| FR-SYS-04 | Daily at 00:15 Manila; only Confirmed before today; QR stops; "not held" corrects → DB-48, DB-52, DB-49 |
| FR-SYS-05 | Applies the schedule; skips legal hold; counts-only log; by hand after a restore; periods as settings → DB-70 to DB-75, TC-NFR-16 |
| FR-SYS-06 | HMAC of the IP; daily key, old keys destroyed → DB-76, SEC-09 |
| FR-SYS-07 | Daily keep-alive → DB-86, W1-04 |
| FR-SYS-08 | Daily Vercel route repeats expiry and flush; checks the records → UT-17, W1-04 |
| FR-SYS-09 | Secret required; constant time; stored in Vault and Vercel; outside the proxy; never overlapping → SEC-37, SEC-38, UT-09, DB-84, DB-86 |
| FR-SYS-10 | A record per run; the panel reads it; alert when records stop → DB-85, TC-NFR-13 |
| FR-SYS-11 | Region and a cheap query; no personal data; used by the uptime check → UT-19, TC-NFR-02, TC-NFR-05 |
| FR-SYS-12 | Nightly, encrypted, private repository, artifact that expires, no proofs → TC-NFR-14, W1-07, SEC-40 |

### 3.2 Business rules → test cases

| BR | Test cases | Boundary cases included |
|---|---|---|
| BR-01 | DB-01, DB-03, DB-05, DB-09, DB-10, DB-31, E2E-04, W1-02, UAT-12 | The last set taken by two at once (DB-10); the next day free again (DB-01) |
| BR-02 | DB-02, DB-09, DB-31 | A second on-site booking on the same date; a second active room refused |
| BR-03 | DB-04, DB-29, DB-55, DB-57, E2E-04 | Stock exactly at the limit accepted, one over refused (DB-04) |
| BR-04 | DB-05, DB-06, DB-11 | Every status and both block statuses (DB-05) |
| BR-05 | DB-07, DB-08, DB-12, DB-21, DB-53, E2E-07, UAT-20 | The deadline reached to the second; one second before (DB-07); a paused hold at its service start (DB-08) |
| BR-06 | DB-14, DB-17, DB-28, UT-14, E2E-05 | Exactly 1 hour accepted, 1 hour minus 1 second refused (DB-14) |
| BR-06a | DB-15, DB-16, DB-17, DB-18, DB-19, DB-94, E2E-11, UAT-10, UAT-11 | Manila midnight for "today" (DB-15, DB-94); a walk-in after the start (DB-17) |
| BR-07 | DB-20, DB-21, DB-41, SEC-20, SEC-22 | The same number in another format; the third open request; an overdue hold no longer counting (DB-21) |
| BR-07a | DB-22, DB-23, E2E-05, E2E-19, UAT-24 | The 7th online request within 60 minutes; a request 61 minutes back not counted (DB-22) |
| BR-08 | DB-04, DB-11, DB-24, DB-25, DB-26, DB-27, E2E-12, UAT-18 | A block racing a booking (DB-11); a range of dates (DB-24, DB-25) |
| BR-09 | DB-07, DB-28, E2E-01, E2E-05 | The last start time of today; today − 1, today + 180, today + 181 (DB-28) |
| BR-10 | DB-29, DB-30, DB-31, DB-32, E2E-28, UAT-19 | Stock lowered exactly to the quantity claimed (DB-29) |
| BR-11 | DB-20, DB-33, UT-02, E2E-05, E2E-07 | One digit short; a landline (DB-33) |
| BR-12 | DB-08, DB-34, DB-35, DB-36, DB-37, DB-38, E2E-08, E2E-09, UAT-07, UAT-08 | An upload stored one second after the deadline (DB-35); a rejection before and after the deadline (DB-37); the service start reached (DB-38) |

### 3.3 Edge cases → test cases

| EC | Test cases | EC | Test cases | EC | Test cases |
|---|---|---|---|---|---|
| EC-01 | DB-39, E2E-02, SEC-21 | EC-30 | DB-35, E2E-09, SEC-32 | EC-59 | DB-31, E2E-29 |
| EC-02 | E2E-03, W1-09 | EC-31 | DB-38 | EC-60 | E2E-14, E2E-17, SEC-27 |
| EC-03 | DB-01, DB-10, E2E-04 | EC-32 | DB-35 | EC-61 | E2E-17, UAT-09 |
| EC-04 | DB-10, W1-02, UAT-12 | EC-33 | DB-59, DB-65, E2E-26, UAT-22 | EC-62 | DB-61, E2E-18 |
| EC-05 | DB-04, E2E-04 | EC-34 | DB-44 | EC-63 | E2E-16, W1-06, UAT-09 |
| EC-06 | DB-14, E2E-05 | EC-35 | DB-19 | EC-64 | UT-03, E2E-07, E2E-20 |
| EC-07 | DB-28, E2E-05 | EC-36 | DB-65, DB-66 | EC-65 | E2E-07, SEC-24, SEC-25 |
| EC-08 | DB-28, E2E-05 | EC-37 | DB-67 | EC-66 | DB-81, E2E-35 |
| EC-09 | DB-20, E2E-05, SEC-22 | EC-38 | DB-48, DB-58, UAT-21 | EC-67 | DB-82, E2E-32 |
| EC-10 | DB-21, E2E-05 | EC-39 | DB-47, E2E-14, UAT-15 | EC-68 | DB-46, DB-78 |
| EC-11 | DB-33, UT-02, E2E-05 | EC-40 | DB-60, DB-69 | EC-69 | DB-80 |
| EC-12 | DB-77, E2E-06, UAT-23 | EC-41 | DB-17, DB-18, E2E-11, UAT-10 | EC-70 | DB-79 |
| EC-13 | DB-45, E2E-10, UAT-05 | EC-42 | DB-15, DB-43, E2E-19 | EC-71 | SEC-04, SEC-53, DB-91, UAT-26 |
| EC-14 | DB-22, SEC-19, SEC-20 | EC-43 | DB-43, E2E-25 | EC-72 | SEC-02 |
| EC-15 | DB-22, DB-23, E2E-05, UAT-24 | EC-44 | DB-19 | EC-73 | SEC-10 |
| EC-16 | DB-92, UAT-13 | EC-45 | DB-16 | EC-74 | DB-26, DB-90, SEC-11 |
| EC-17 | DB-11 | EC-46 | DB-55, E2E-23, UAT-17 | EC-75 | DB-91, E2E-30 |
| EC-18 | DB-11, DB-25, E2E-12 | EC-47 | DB-55, E2E-23 | EC-76 | DB-91, SEC-06 (the 30-day credential deletion: Q6) |
| EC-19 | DB-26, E2E-12, UAT-18 | EC-48 | DB-07, DB-57, E2E-13, UAT-14 | EC-77 | DB-85, UT-17, TC-NFR-13 |
| EC-20 | DB-39 | EC-49 | DB-15, DB-57 | EC-78 | DB-84, SEC-37, SEC-38 |
| EC-21 | DB-42 | EC-50 | E2E-33 | EC-79 | DB-86, W1-04 |
| EC-22 | DB-07, DB-53, E2E-07 | EC-51 | DB-49, E2E-27, UAT-21 | EC-80 | TC-NFR-05, TC-NFR-06, W1-09 |
| EC-23 | DB-44, DB-53 | EC-52 | DB-41, E2E-15, UAT-20 | EC-81 | TC-NFR-16 |
| EC-24 | DB-46 | EC-53 | DB-50, DB-51 | EC-82 | DB-15, DB-43, DB-94 |
| EC-25 | DB-56, E2E-24 | EC-54 | DB-59, DB-88, DB-89, SEC-14 | EC-83 | DB-72 |
| EC-26 | DB-53, DB-56 | EC-55 | DB-32, UAT-19 | EC-84 | DB-64, E2E-30 |
| EC-27 | DB-34, DB-36, E2E-08, UAT-07 | EC-56 | DB-32 | EC-85 | DB-71 |
| EC-28 | DB-37 | EC-57 | DB-29, E2E-28, UAT-19 | | |
| EC-29 | DB-37, E2E-09, UAT-08 | EC-58 | DB-30, E2E-28 | | |

### 3.4 Non-functional requirements → test cases

| NFR | Test cases | NFR | Test cases |
|---|---|---|---|
| NFR-01 | TC-NFR-01, W1-08 | NFR-18 | TC-NFR-12, W1-06 |
| NFR-02 | TC-NFR-02, UT-19, W1-01 | NFR-19 | DB-15, DB-48, DB-67, DB-82, DB-94, UT-06, UT-07 |
| NFR-03 | TC-NFR-03, TC-NFR-04, E2E-19, W1-09 | NFR-20 | DB-05, DB-09, DB-10, DB-11, DB-12, W1-02 |
| NFR-04 | TC-NFR-05, E2E-03, E2E-35, UT-19 | NFR-21 | DB-13, DB-50 to DB-53, DB-88, DB-92, SEC-50 |
| NFR-05 | TC-NFR-06 | NFR-22 | DB-59, DB-89, SEC-14 |
| NFR-06 | TC-NFR-07, DB-86, W1-08 | NFR-23 | SEC-44, UT-08 |
| NFR-07 | DB-86, W1-04 | NFR-24 | TC-NFR-13, DB-85, UT-17 |
| NFR-08 | TC-NFR-08 | NFR-25 | DB-88, E2E-31, SEC-45 |
| NFR-09 | SEC-01 to SEC-08, E2E-10, W1-03 | NFR-26 | DB-87, E2E-32 |
| NFR-10 | SEC-10 to SEC-17, TC-NFR-14 | NFR-27 | TC-NFR-14, SEC-40, SEC-47, W1-07 |
| NFR-11 | SEC-02, SEC-20, SEC-24, DB-35, DB-76 | NFR-28 | TC-NFR-15 |
| NFR-12 | SEC-19 to SEC-22, DB-20 to DB-23 | NFR-29 | TC-NFR-16, W1-07 |
| NFR-13 | SEC-29, SEC-37, SEC-39, UT-04, DB-61, DB-76 | NFR-30 | TC-NFR-17, SEC-48, SEC-49 |
| NFR-14 | SEC-32 to SEC-36, E2E-08, W1-05 | NFR-31 | TC-NFR-06, W1-09 |
| NFR-15 | SEC-26, DB-70, DB-75, E2E-07 | NFR-32 | TC-NFR-18, DB-96 |
| NFR-16 | TC-NFR-09, E2E-01, W1-06, UAT-02 | NFR-33 | DB-81, DB-82, E2E-35, W1-04 |
| NFR-17 | TC-NFR-10, TC-NFR-11, UT-15, UAT-27 | | |

### 3.5 Security threats → test cases

| TM | Test cases | TM | Test cases | TM | Test cases |
|---|---|---|---|---|---|
| TM-01 | SEC-01, SEC-02, SEC-03 | TM-15 | SEC-42, SEC-51 | TM-29 | SEC-09, DB-76, W1-03 |
| TM-02 | SEC-01, SEC-04 | TM-16 | SEC-42, SEC-43, UT-11 | TM-30 | SEC-19, SEC-20, SEC-21 |
| TM-03 | SEC-06 | TM-17 | SEC-48, SEC-49 | TM-31 | SEC-20, DB-22 |
| TM-04 | SEC-37, SEC-38, UT-09, DB-84 | TM-18 | DB-88, DB-89 | TM-32 | TC-NFR-07, W1-08 |
| TM-05 | SEC-23, UT-16, W1-03 | TM-19 | SEC-46 | TM-33 | SEC-18, DB-13, W1-01 |
| TM-06 | SEC-26 | TM-20 | SEC-44 | TM-34 | SEC-02, SEC-24 |
| TM-07 | SEC-24, SEC-25, SEC-31 | TM-21 | SEC-45, DB-89 | TM-35 | SEC-20, DB-82 |
| TM-08 | SEC-26, SEC-27, UT-04 | TM-22 | SEC-08, SEC-18, SEC-29, SEC-40, SEC-47, TC-NFR-16 | TM-36 | SEC-07, SEC-11, SEC-13 |
| TM-09 | SEC-50, DB-68 | TM-23 | SEC-29 | TM-37 | SEC-05, SEC-06 |
| TM-10 | SEC-10, SEC-12 | TM-24 | SEC-30 | TM-38 | SEC-15, SEC-16 |
| TM-11 | SEC-14, SEC-15 | TM-25 | SEC-30, SEC-34, SEC-35, SEC-36, DB-71 | TM-39 | SEC-48 |
| TM-12 | SEC-17, W1-05 | TM-26 | SEC-22, DB-20 | TM-40 | SEC-52 |
| TM-13 | SEC-32, DB-35 | TM-27 | SEC-39, SEC-40, SEC-41 | TM-41 | SEC-53 |
| TM-14 | SEC-33, DB-35, W1-05 | TM-28 | SEC-28 | | |

### 3.6 The security test checklist → test cases

Each row of [security][sec] §5, in its order, and the case that runs it.

| Area | Checklist row (short) | Case |
|---|---|---|
| Authentication | Password and TOTP | SEC-01 |
| | Account lock and per-IP login limits | SEC-02 |
| | Wrong TOTP and backup codes count; locked refuses a backup code [P] | SEC-03 |
| | A backup code used twice | SEC-04 |
| | A session without 2FA | SEC-05 |
| | Sign out, reset, disable | SEC-06 |
| | Closed Better Auth endpoints [P] | SEC-07 |
| | Password storage | SEC-08 |
| | No raw IP in session or limiter rows [P] | SEC-09 |
| Authorization | Every admin page, action, route, logged out | SEC-10 |
| | Every Super-Admin-only action as the Admin | SEC-11 |
| | Coverage of the role table [P] | SEC-12 |
| | pgTAP: every admin function, wrong or disabled actor | SEC-13 |
| Database | `app_rw` writes and deletes | SEC-14 |
| | Internal helpers; `PUBLIC` execute | SEC-15 |
| | Definer functions' `search_path` | SEC-16 |
| | The publishable key against the Data API | SEC-17 |
| | No TLS; role timeouts through the pooler | SEC-18 |
| Public form | Turnstile token; honeypot | SEC-19 |
| | Submission rate limit; hold limits; breaker | SEC-20 |
| | The same key, same or other data [P] | SEC-21 |
| | A hold-limit refusal echoes nothing [P] | SEC-22 |
| | A spoofed client-IP header | SEC-23 |
| Status and QR | Lookup rate limits | SEC-24 |
| | Wrong code and wrong mobile look the same [P] | SEC-25 |
| | No personal data on the status and `/r/` pages | SEC-26 |
| | Revoked, replaced, unknown, final-status tokens | SEC-27 |
| | `/r/` headers; no third parties [P] | SEC-28 |
| | No raw token or QR link stored [P] | SEC-29 |
| | Upload, reissue, documents without a lookup session [P] | SEC-30 |
| | The customer's QR reissue limit [P] | SEC-31 |
| Uploads | A third upload; wrong type; too big; a renamed file | SEC-32 |
| | A signed upload link used twice | SEC-33 |
| | No GPS or photo data | SEC-34 |
| | View link after its lifetime [P]; anonymous bucket access | SEC-35 |
| | Retention removes the files | SEC-36 |
| Job routes | No secret, wrong secret, another length | SEC-37 |
| | Two runs at once | SEC-38 |
| Secrets and configuration | A preview build | SEC-39 |
| | The repository private before backups | SEC-40 |
| | The secret scanner [P] | SEC-41 |
| Headers and pages | Framing; security headers [P] | SEC-42 |
| | HTML in the name and note | SEC-43 |
| Logging | A test error in Sentry | SEC-44 |
| | No contact data in the audit log | SEC-45 |
| | Security events [P] | SEC-46 |
| Backups | An artifact without the key; the restore | SEC-47 |
| Patching | A version below a floor [P] | SEC-48 |
| | Dependabot and the audit gate | SEC-49 |

### 3.7 Reservation lifecycle → test cases

| Lifecycle item ([reservation-lifecycle][lc]) | Test cases |
|---|---|
| Row 1 · new → Pending (online) | DB-39, DB-01, E2E-01 |
| Row 2 · new → Pending (staff), including the one-step forms | DB-40, DB-16, DB-17, DB-18, DB-19, E2E-11 |
| Row 3 · new → Pending (recreate) | DB-41, E2E-15 |
| Row 4 · Pending → Awaiting Deposit | DB-42, E2E-10 |
| Row 5 · Pending → Confirmed (waiver) | DB-43, E2E-25 |
| Row 6 · Awaiting Deposit → Confirmed (deposit; proof verified) | DB-44, DB-36, E2E-08, E2E-10 |
| Row 7 · Awaiting Deposit → Confirmed (waiver) | DB-43 |
| Row 8 · Pending → Rejected | DB-45 |
| Row 9 · Pending → Expired | DB-46, DB-07 |
| Row 10 · Awaiting Deposit → Expired: a (no deposit), b (proof unreviewed at the service start), c (proof rejected after the deadline) | a DB-46; b DB-38; c DB-37 |
| Rows 11, 12, 13 · cancel from Pending, Awaiting Deposit, Confirmed | DB-47, E2E-14 |
| Row 14 · Confirmed → Completed | DB-48 |
| Row 15 · Completed → Cancelled (event not held) | DB-49, E2E-27 |
| The 31 forbidden changes | DB-50, DB-51, DB-52 (table in 2.1.10) |
| Forbidden because overdue | DB-53, DB-07, DB-44, DB-56 |
| §5 changes that keep the status | DB-54 to DB-64, DB-34, DB-37 |
| §3 deadlines and the service start | DB-39, DB-42, DB-56, DB-57, DB-94 |
| §7 block statuses (active → removed only) | DB-27 |

### 3.8 Workflows → test cases

| WF | Test cases | WF | Test cases | WF | Test cases |
|---|---|---|---|---|---|
| WF-01A | E2E-01, DB-28, UT-14 | WF-05A | DB-07, DB-28 | WF-08A | E2E-28 |
| WF-01B | E2E-01, UT-01, UT-05 | WF-05B | DB-01, DB-04, DB-11, DB-25, DB-57 | WF-08B | DB-29, E2E-28 |
| WF-01C | DB-14, DB-20 to DB-22, DB-39, E2E-02, SEC-19, SEC-20 | WF-05C | DB-10, W1-02 | WF-08C | DB-30, E2E-28 |
| WF-02 | DB-39, UT-04, E2E-01 | WF-05D | DB-07, DB-08 | WF-08D | DB-30, E2E-29 |
| WF-03A | E2E-16, W1-06 | WF-05E | DB-92 | WF-08E | DB-03, DB-31, E2E-29 |
| WF-03B | E2E-17 | WF-06A | DB-47, E2E-14 | WF-08F | DB-32, DB-90 |
| WF-03C | E2E-20, E2E-21 | WF-06B | DB-60, E2E-14 | WF-08G | DB-23, E2E-19 |
| WF-03D | DB-61, E2E-18 | WF-06C | DB-57, E2E-13 | WF-08H | DB-24, DB-25, DB-26, E2E-12 |
| WF-03E | DB-62 | WF-06D | DB-56, E2E-24 | WF-08I | DB-27, E2E-12 |
| WF-04A | DB-42, E2E-10 | WF-06E | DB-55, E2E-23 | WF-09A | SEC-01, SEC-02, E2E-10 |
| WF-04B | DB-45 | WF-06F | DB-46, DB-53, UT-17 | WF-09B | SEC-05 |
| WF-04C | DB-54, E2E-22 | WF-06G | DB-41, E2E-15 | WF-09C | SEC-10, SEC-11, SEC-13 |
| WF-04D | DB-44, E2E-10 | WF-06H | DB-48 | WF-09D | SEC-04, UAT-26 |
| WF-04E | DB-36, DB-37, DB-38, E2E-08 | WF-06I | DB-49, E2E-27 | WF-09E | SEC-53, DB-91 |
| WF-04F | DB-43, E2E-25 | WF-06J | DB-59, E2E-26 | WF-09F | DB-91, E2E-30 |
| WF-04G | DB-16 to DB-19, DB-40, E2E-11 | WF-06K | DB-58, E2E-10 | WF-09G | DB-91, SEC-06, E2E-30 |
| WF-07A | DB-77, DB-81, DB-82, DB-83, UT-18, E2E-35 | WF-07D | DB-61, E2E-07 | WF-10A | DB-88 |
| WF-07B | DB-77, E2E-34 | WF-07E | DB-34, DB-35, E2E-08 | WF-10B | E2E-31 |
| WF-07C | DB-78, DB-79 | WF-07F | E2E-06, UT-12 | WF-10C | DB-63, DB-72 |
| | | | | WF-10D | DB-64 |
| | | | | WF-10E | DB-70 to DB-75 |

### 3.9 Coverage summary

**Result: no requirement is without a test.** Every BR (14, with BR-06a and BR-07a), every FR ID (82) and its acceptance criteria, every EC (85), every NFR (33), every threat TM-01 to TM-41, every row of the security checklist (49), every lifecycle row (1 to 15, with 10a to 10c), and the 31 forbidden status changes have at least one case. The items below are covered in a limited way, each for the reason given.

| Item | How it is covered | Why only this way |
|---|---|---|
| NFR-01, NFR-08, NFR-28 | Manual checks: TC-NFR-01, TC-NFR-08, TC-NFR-15 | They are about bills, saved documents, and a monthly task, not about code |
| FR-PUB-02 (free-delivery wording), FR-PUB-15 (privacy contact), FR-PUB-16 (FAQ and addresses) | TC-E2E-01, TC-E2E-33 with test content | The real content waits for O-03, O-04, O-05, and O-09; the same cases are run again in UAT once it is entered (Q10) |
| FR-ADM-06 "the QR code is not used on event day" [C] | Stated in TC-UAT-09 | A usage rule for people; the system has nothing to do or refuse |
| FR-ADM-20 "whether it sends an email is not specified"; FR-ADM-22 "how the customer receives the new QR is not specified" | No case, by design | The criterion says the behavior is not defined; tests are listed under Q6 |
| EC-76 "credentials deleted within 30 days" | The same-day disable is tested (TC-DB-91, TC-SEC-06) | Who or what deletes the credentials is open ([administration][wf-admin] open question 11; Q6) |
| NFR-03 speed target | TC-NFR-04 measures, but has no pass mark yet | The target is set at the week-1 go / no-go (Q8) |
| Cases marked "If [P] accepted" or "Prov." | Written and run | Dropped or changed if the review rejects the control or answers the question differently (Q11, Q6) |

---

## 4. Week-1 spike checklist

The week-1 test runs on the real Vercel Hobby project in `sin1` and the real Supabase Free project in Singapore, before any feature is built ([project-charter][charter] phase 4; the items come from [architecture][arch] §14.1 and spec §17). Each row is one **[U]** fact: the test that settles it, what counts as a pass, and what happens if it fails. "Record" means the result is written into the owning document, so the **[U]** label can be removed.

**Go / no-go.** Go when every row passes, or when each failure has a fallback that is accepted and recorded in the [decision log][dl]. No-go otherwise: the failure is fixed and the row is run again before features are built.

| Item | [U] fact | Where it is [U] | Settled by | Pass | If it fails |
|---|---|---|---|---|---|
| **1. `sin1` ↔ pooler** | Verified TLS with the Supabase CA works against the pooler | [arch][arch] §6.2; [sec][sec] §4.3 | TC-W1-01 | Connects with `rejectUnauthorized: true` and the CA; a wrong CA fails | No-go until solved; TLS is never turned off without a decision in the decision log |
| | Role timeouts set on `app_rw` apply through the shared pooler | [data][data] §2.3; [sec][sec] §4.3 | TC-W1-01, TC-SEC-18 | Through port 6543: `57014` after the statement timeout, `55P03` after the lock timeout, `25P03` after the idle timeout | Set them with `SET LOCAL` inside each function and run again |
| | The pooler accepts a SCRAM role with no `VALID UNTIL`; the direct host is unreachable from Vercel | [arch][arch] §6.1 | TC-W1-01 | Pooler login works; the IPv6 direct host fails, as expected | Fix the role; record |
| | Latency from `sin1` to the database | [nfr][nfr] NFR-03 | TC-W1-01, TC-NFR-04 | Numbers recorded (p50, p95); the speed target is set at go / no-go (Q8) | — |
| **2. Booking under load** | Exactly one success from parallel requests on the deployed function | [arch][arch] §14.1 | TC-W1-02 | 5 runs × 20 requests: exactly 1 `ok` per run, the rest `sold_out`; no "prepared statement" errors, no idle-in-transaction sessions, no lock timeouts | No-go: fix the driver or pool settings ([arch][arch] §6.2) and run again |
| | The pooler's client count stays stable | [arch][arch] §14 | TC-W1-02, TC-W1-08 | No growth after the runs | Lower the pool settings; record |
| **3. Login on Vercel** | The `@node-rs/argon2` binary loads in Vercel's Node.js runtime | [nfr][nfr] NFR-09; [sec][sec] §4.1 | TC-W1-03 | Login works; the stored hash is argon2id | Switch to the scrypt fallback of [sec][sec] §4.1; record |
| | Which client-IP header Vercel sets and the client cannot override | [sec][sec] §4.4, §7 | TC-W1-03, TC-SEC-23 | One header found that a spoofed value cannot change | Per-IP limits stay loose and the per-account and per-code limits carry the load; decision recorded |
| | The cookie flags | [sec][sec] §4.1 | TC-W1-03 | `HttpOnly`, `Secure`, `SameSite=Strict`, `__Secure-` prefix | Fix the configuration |
| | Logged-out admin actions are refused on Vercel | [arch][arch] §14.1 | TC-W1-03, TC-SEC-10 | Refused | No-go |
| | Whether Better Auth's limiter or session rows store raw IPs; how the session hook behaves | [sec][sec] §4.1, §7; [data][data] §5.19 | TC-W1-03, TC-SEC-09 | No raw IP in any row after the hook | Turn the built-in limiter off and use the database counters ([arch][arch] open question 16) |
| | The TOTP secret is stored encrypted; whether hashed backup codes are possible | [sec][sec] §4.1, §7 | TC-W1-03 | The secret is not readable in the row; the backup-code answer recorded | Record; [sec][sec] open question 5 decides |
| | Better Auth's tables work in their own schema (`admin_auth`); its column names in 1.7 | [data][data] §2.1, §5.19; [api][api] §3.8 | TC-W1-03, TC-W1-09 | Tables in `admin_auth`; column names recorded | Use the fallback of [data][data] §2.1 |
| | The environment variable names Better Auth 1.7.12 reads | [arch][arch] §8.1 | TC-W1-03 | Names confirmed | Record the right names |
| **4. Timers and email** | `pg_cron`, `pg_net`, Vault, and `pgcrypto` exist on Supabase Free | [arch][arch] §2.2; [data][data] §2.5 | TC-W1-04 | All enable; the every-minute jobs run on time for 24 hours | No-go; the timer design is decided again |
| | `pg_net`'s default timeout, and whether a timeout stops the Vercel function it called | [arch][arch] §7.4 | TC-W1-04 | Recorded; the explicit timeout is honoured | Record; adjust the timeout |
| | Resend honours the idempotency key, and for how long | [api][api] §4.1 | TC-W1-04 | The same key twice within a minute sends one email | The outbox's own unique key still holds; record |
| | How Resend counts the admin emails, one per admin recipient | [api][api] §5.9 | TC-W1-04 | Recorded | Record |
| | `after()` runs after the reply on Vercel | [arch][arch] §14.1 | TC-W1-04 | The email leaves after the response returns | The tick sends it instead; record |
| | Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; may fire late or twice | [arch][arch] §7.3; [sec][sec] §4.8 | TC-W1-04, TC-UT-17 | The header arrives; a second call does nothing twice | Call the daily route from `pg_net` instead; record |
| | The Sentry check-in and cron monitor work on the free plan | [arch][arch] §7.4, open question 7 | TC-W1-04, TC-NFR-13 | Check-ins arrive; stopping them raises an alert | Alert from the daily route only; record |
| | The keep-alive counts as activity | [arch][arch] §14; [nfr][nfr] NFR-07 | TC-W1-04 (over the week) | No pause warning from Supabase | Outside traffic covers it ([arch][arch] §14); record |
| **5. Signed upload** | Bucket size and type limits are enforced on hosted signed uploads | [arch][arch] §2.2; [sec][sec] §4.6 | TC-W1-05 | A 1.1 MB file and an SVG are refused by Storage, or caught by the server check | Either way the server check stays; record |
| | A signed upload link can be reused while it is valid | [arch][arch] §14; [sec][sec] §4.6 | TC-W1-05, TC-SEC-33 | Recorded; the app's slot states still give single use | Record |
| | Storage keeps working with the Data API turned off | [sec][sec] §4.3; [data][data] §2.4 | TC-W1-05, TC-SEC-17 | Upload works with the Data API off; it is then left off | Keep it on with the posture of [data][data] §2.4 |
| | The dashboard setting names for exposure | [data][data] §2.4 | TC-W1-05 | Recorded | Record |
| **6. QR scanning** | The self-hosted WASM scanner works on the owner's real phone and laptop over HTTPS | [arch][arch] §14.1; [nfr][nfr] NFR-16 | TC-W1-06 | 5 of 5 codes read on each device; the screenshot fallback works | No-go for the scan page until fixed; search by code still works |
| | A QR link opened from the phone's camera app carries the SameSite=Strict cookie | [sec][sec] §4.1, §7 | TC-W1-06 | The logged-in admin sees the reservation | Admins open QR codes from the scan page; record, and tell the [staff guide][staff] |
| **7. Backup and restore** | `pg_dump` through the session pooler with the read-only role; a PGDG client that matches the server | [arch][arch] §11.3 | TC-W1-07, TC-NFR-14 | The dump completes and is encrypted | No-go until fixed |
| | Supabase's Postgres major version | [arch][arch] §2.1; [data][data] §6.2 | TC-W1-07 | Recorded; the guard tests (TC-DB-05, TC-DB-09) pass on it | Record |
| | Whether GitHub's `schedule` takes a time zone | [arch][arch] §11.3 | TC-W1-07 | Recorded; the cron written accordingly | Write it in UTC |
| | A restore into a fresh Postgres works | [nfr][nfr] NFR-29 | TC-W1-07, TC-NFR-16 | TC-NFR-16 passes | No-go |
| **8. Usage** | The Hobby allotments, and real usage against them | [nfr][nfr] NFR-06 | TC-W1-08, TC-NFR-07 | Usage after the load run is far below every allotment | Reduce usage first; a paid plan is a new decision ([nfr][nfr] NFR-01) |
| | The GitHub Actions minutes allowance for a private repository | [nfr][nfr] NFR-01 | TC-W1-08 | The estimated monthly minutes fit | Run fewer jobs on each push ([arch][arch] §11.1); record |
| **Also checked in week 1** | `updateTag` also refreshes prerendered page shells on Vercel | [arch][arch] §5 | TC-W1-09, TC-NFR-03 | The packages page shows a price change at once | Refresh by path; record |
| | No skew protection: an open tab calling an old Server Action gets the reload prompt | [arch][arch] §13 | TC-W1-09, TC-E2E-03 | The prompt appears; the draft survives | No-go for the form until fixed |
| | The standalone Docker image runs against the real project | [arch][arch] §14.1 | TC-W1-09, TC-NFR-06 | A page and `/api/health` answer | Fix before launch |
| | drizzle-kit writes Supabase-style migration names | [arch][arch] §9 | TC-W1-09 | Names accepted by the Supabase CLI | Rename by script; record |
| | Sentry works with Next.js 16.4 Cache Components | [arch][arch] §2.1 | TC-W1-09 | Errors reach Sentry from cached and live pages | Record; adjust the setup |
| | One Vercel Firewall rule can cover several paths | [sec][sec] §4.4, §7 | TC-W1-09 | Recorded | The database limits stay the main control |

**[U] facts settled later, not in week 1.** The email caps of Resend (FR-NTF-20, NFR-33), the Supabase Free limits ([data][data] §11), and the vendor terms are checked from the vendors' terms before launch (TC-NFR-08, O-08). The NPC 72-hour rule and the data locations of GitHub and Cloudflare go to the lawyer (O-08). Whether foreign-key cascades bypass row-level security is settled in the data model before the schema is frozen. Whether Vercel-hosted deployments were exposed to the 2026 advisories is checked before launch ([sec][sec] §7). Whether many customers share one public IP address is seen after launch from real traffic.

---

## 5. Acceptance checklist (TC-UAT)

*For both admins. Level: acceptance, run by hand.*

### 5.1 Before you start

- **Where.** On the real website, before it opens to customers. Use your own phone and the office laptop.
- **Made-up customers only.** The Super Admin gives you a sheet of test names and test mobile numbers. Never use a real customer's details. Use your own email address where a step asks for the customer's email, so you can see the emails arrive.
- **Times.** Some steps need a deadline to pass during the session. The Super Admin prepares those bookings beforehand.
- **If something is different.** Do not tick the box. Write what you saw in the notes, and tell the Super Admin. He records it as a problem with a level (section 6.3).
- **Your guide.** The [staff guide][staff] explains each screen step by step.
- Each scenario names who runs it, what to prepare, the steps, what you should see, and what it checks ("Covers", for the developer).

### 5.2 The scenarios

#### TC-UAT-01 · Log in with your password and phone code
**Who:** both, each on their own account · **Prepare:** the authenticator app on your phone · **Covers:** FR-ADM-01, NFR-09, WF-09A
1. Open the admin address on your phone.
2. Type your email address and password.
3. Type the 6-digit code from the app.
4. Log out. Open the admin address again.

**You should see:** nothing of the admin panel before the code is accepted. After the code, the dashboard. After logging out, the login page again.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-02 · Book like a customer, on your phone
**Who:** Admin · **Prepare:** a test name and number from the sheet; a watch · **Covers:** FR-PUB-01 to FR-PUB-08, FR-NTF-01, NFR-16, charter §2 (criteria 1 and 3)
1. On your phone, not logged in, open the website. Note the time.
2. Look at the packages page. Then open the calendar and choose **Delivery**.
3. Pick a date marked **Available**. Choose Package A, 2 extra microphones, and a delivery time.
4. Type the test name, the test mobile number, your own email, and a venue.
5. Read the summary. Check the total and the deposit. Tick the agreement and press **Submit**. Note the time.

**You should see:** a reference code such as `KSB-…`, a QR code, and **"Not yet confirmed"** in large letters. Nothing says the booking is approved or paid. An email arrives with the same reference code. It took only a few minutes.
**Passed:** ☐ Admin · Minutes taken: ____ · Notes: ____________

#### TC-UAT-03 · Find the new request
**Who:** Admin · **Prepare:** the booking from TC-UAT-02 · **Covers:** FR-ADM-02, FR-ADM-03, FR-ADM-04, FR-NTF-13
1. Log in. Look at the dashboard.
2. Check your email for "new online request".
3. Search for the booking by typing its mobile number with `+63` in front instead of `0`.
4. Open it.

**You should see:** the request in the pending list on the dashboard, and in your email. The search finds it. The page shows every detail, and only the buttons that make sense now: approve, reject, needs info, and the others.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-04 · Ask the customer for more information
**Who:** Admin · **Prepare:** a Pending test booking; the customer's phone (your own) · **Covers:** FR-ADM-09, FR-PUB-10, FR-PUB-11, FR-NTF-02
1. Press **Needs info** and write "Please send a nearby landmark."
2. On your phone, open the status page and type the reference code and the mobile number.
3. Back in the admin panel, press **Info received**.

**You should see:** the message on the status page and in an email. The deadline stays the same. After "Info received", the flag is gone.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-05 · Check the address and approve
**Who:** Admin · **Prepare:** a Pending delivery booking · **Covers:** FR-ADM-08, EC-13, FR-NTF-03, D-11
1. Read the barangay, the city, and the venue details. Decide if the venue is inside your service area.
2. Press **Approve**.
3. On your phone, open the status page.

**You should see:** **Awaiting Deposit**, the deposit deadline (24 hours from now, or the event start if that is sooner), and the deposit instructions, on the status page and in an email.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-06 · Record a cash deposit and print the acknowledgment
**Who:** Admin · **Prepare:** an Awaiting Deposit booking; a second one · **Covers:** FR-ADM-11, FR-ADM-23, FR-PUB-14, EC-34, priv §7.1
1. Press **Record deposit**. Check that the amount is already filled in. Choose **Cash** and save.
2. Open and print the acknowledgment.
3. On the second booking, try to record a different amount.

**You should see:** the booking is **Confirmed**. The acknowledgment has a number like `ACK-2026-0001` and says: *"This is an acknowledgment of payment received. It is NOT an Official Receipt or Invoice."* It never says "Official Receipt", "OR No.", "Invoice", "BIR", a TIN, or anything about VAT. The different amount is refused. There is no box for the payer's name or account number.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-07 · A customer sends a payment picture, and you check it
**Who:** both (the Super Admin plays the customer) · **Prepare:** an Awaiting Deposit booking; a screenshot of a pretend e-wallet payment · **Covers:** FR-PUB-12, FR-ADM-12, FR-NTF-14, BR-12, EC-27
1. Super Admin: on the status page, upload the picture.
2. Admin: check your email for "proof uploaded", then open **Proofs to verify** on the dashboard.
3. Open the picture. Press **Verify**, choose **E-wallet**, and type only the reference number.

**You should see:** the status page says the proof was received but the booking is not confirmed yet. After you verify: **Confirmed**, the picture leaves the list, and the customer sees the acknowledgment link.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-08 · Say no to an unclear picture
**Who:** both · **Prepare:** an Awaiting Deposit booking with an uploaded picture · **Covers:** FR-ADM-12, FR-NTF-06, EC-29, EC-30
1. Admin: press **Reject proof** and write "Reference number cannot be read."
2. Super Admin: upload a second picture; the Admin rejects it too; try a third.

**You should see:** the reason on the status page and in an email. The second upload works. The third is refused with a clear message.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-09 · Scan a QR code at the office
**Who:** Admin · **Prepare:** a booking's QR code on another phone; a screenshot of it · **Covers:** FR-ADM-06, FR-PUB-09, EC-61, EC-63, D-09
1. On the admin scan page, scan the QR code from the other phone's screen, first with your phone, then with the laptop.
2. Upload the screenshot instead of scanning.
3. Type the reference code into the search.
4. On a phone that is **not** logged in, open the QR link.

**You should see:** each of 1 to 3 opens the right booking. Step 4 shows only "present this at our office", with no booking details. Remember: the QR code is used at the office and when paying, never on the event day **[C]** (D-09).
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-10 · A walk-in who wants the room in 30 minutes
**Who:** Admin · **Prepare:** the room free today · **Covers:** BR-06a, FR-ADM-24, FR-ADM-13, EC-41
1. Press **Create booking**, choose **Walk-in**, choose the room, and set an arrival 30 minutes from now.
2. The form asks for the deposit or a waiver. Record a cash deposit. Print the acknowledgment.
3. Make a second walk-in the same way, but choose **Waive the deposit** and write a reason.

**You should see:** both bookings are **Confirmed** at once and marked **Urgent**. The first has an acknowledgment. The second has none, and its reason is in the history.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-11 · A phone booking for next week
**Who:** Admin · **Prepare:** — · **Covers:** FR-ADM-24, BR-06a, FR-NTF-01, FR-NTF-13
1. Press **Create booking**, choose **Phone**, and book a delivery for next week with your email as the customer's.
2. Approve it.

**You should see:** **Pending Confirmation**, then **Awaiting Deposit**. The "customer" email arrives. No "new online request" email comes to the admins.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-12 · Two people, the last set, the same moment
**Who:** both · **Prepare:** the Super Admin makes sure only one delivery set is free on a test date · **Covers:** BR-01, NFR-20, EC-04, charter §2 (criterion 2)
1. Each of you, on your own phone, fills in the form as a customer for that date and delivery.
2. Count "3, 2, 1" and press **Submit** together.

**You should see:** exactly one of you gets a reference code. The other sees that the date was just taken, and the form still holds everything typed.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-13 · Both admins on the same booking
**Who:** both · **Prepare:** one Pending booking open on both your screens · **Covers:** FR-ADM-07, EC-16
1. Admin: press **Approve**.
2. Super Admin: without refreshing, press **Reject** and write a reason.
3. Super Admin: refresh.

**You should see:** the Super Admin gets "already changed, please refresh", and nothing changes. After refreshing, the booking is Awaiting Deposit and **Reject** is no longer offered.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-14 · Move a booking to another date
**Who:** Admin · **Prepare:** a Confirmed booking; a free date; a full date · **Covers:** FR-ADM-17, EC-48, FR-NTF-11
1. Press **Reschedule** and pick the free date.
2. Try again with the full date.

**You should see:** the first works: same reference code, same prices, new date, and an email. The second is refused, and the booking stays as it was.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-15 · Cancel a paid booking with a part refund
**Who:** Admin · **Prepare:** a Confirmed booking with a recorded deposit · **Covers:** FR-ADM-18, FR-ADM-19, EC-39, EC-60
1. Press **Cancel**, write "family emergency", and choose the refund decision **partial**, ₱500.
2. On your phone, open the status page and the QR link.
3. Press **Record refund paid**: ₱500, cash.

**You should see:** the status page shows the reason and "partial, ₱500"; the QR link says "no longer valid"; the date is free on the calendar. The refund shows in the payments, with no acknowledgment.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-16 · Give a customer more time to pay
**Who:** Admin · **Prepare:** an Awaiting Deposit booking whose event is a few days away · **Covers:** FR-ADM-16, FR-NTF-05, EC-25
1. Press **Extend**, pick a later time before the event starts, and write a reason.
2. Try again with a time after the event starts.

**You should see:** the first works: the new deadline on the status page and in an email. The second is refused, and the message names the event start.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-17 · Fix a wrong mobile number, and add an add-on
**Who:** Admin · **Prepare:** a booking made with a mistyped number · **Covers:** FR-ADM-10, EC-46, EC-47
1. Press **Edit details**, correct the mobile number, and write a reason.
2. On your phone, open the status page with the old number, then with the new one.
3. Edit again and add one party light.

**You should see:** the old number no longer opens the status page; the new one does. The total goes up by the party light's current price; the items already booked keep their prices.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-18 · Block a set for repair
**Who:** both · **Prepare:** a test date with a booking on Set 1 · **Covers:** FR-ADM-25, BR-08, EC-18, EC-19
1. Admin: block Set 2 for three days with the reason "repair". Look at the calendar.
2. Admin: remove the last day's block with the reason "repaired".
3. Admin: try to block Set 1 on the date where it has a booking.
4. Admin: try to block a whole date. Then the Super Admin blocks a whole test date.

**You should see:** three blocks, one per day, and the calendar shows them at once. The removed day is free again at once. The block on Set 1 is refused, naming the booking. The Admin cannot block a whole date; the Super Admin can.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-19 · Change a price and the daily stock
**Who:** Admin · **Prepare:** an existing booking with Package A; a test date with 3 extra microphones booked · **Covers:** FR-ADM-26, FR-PUB-02, BR-10, EC-55, EC-57
1. Change Package A's price. Open the public packages page.
2. Open the older booking.
3. Lower the extra microphone's daily stock to 2.

**You should see:** the packages page shows the new price. The older booking keeps its old price. The stock change is refused, and the bookings that use those microphones are listed.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-20 · A request that ran out of time, and recreating it
**Who:** Admin · **Prepare:** the Super Admin makes a request whose deadline passes during the session · **Covers:** BR-05, EC-22, EC-23, EC-52, FR-ADM-21
1. Right after the deadline passes, look at the request on the dashboard and on the customer's status page.
2. Try to approve it.
3. Press **Recreate**.

**You should see:** it shows **Expired** at once, everywhere. Approving is not possible. Recreate makes a new request with a new reference code; the old one stays Expired, and each page links to the other.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-21 · After the event
**Who:** Admin · **Prepare:** a Confirmed booking whose event was yesterday; another Completed booking · **Covers:** FR-SYS-04, FR-ADM-14, FR-ADM-20, EC-38, EC-51
1. Open yesterday's booking.
2. Record the balance in cash. Print the Balance Payment Acknowledgment.
3. On the other Completed booking, press **Event not held**, write a reason, and choose the refund decision "none".

**You should see:** yesterday's booking shows **Completed** by itself. The balance has its own acknowledgment number. The other booking becomes **Cancelled**, with the reason on the status page.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-22 · Undo a payment recorded on the wrong booking
**Who:** Admin · **Prepare:** two Awaiting Deposit bookings · **Covers:** FR-ADM-15, EC-33
1. Record a deposit on the wrong booking. Note its acknowledgment number.
2. Press **Void** on it and write "recorded on wrong booking".
3. Record the deposit on the right booking.

**You should see:** the voided payment stays in the list, marked void with your reason. The new acknowledgment skips the voided number; that number is never used again.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-23 · A customer without email
**Who:** both · **Prepare:** — · **Covers:** FR-NTF-21, EC-12
1. Admin: create a booking with no email address. Approve it.
2. On the booking page, copy the prepared message and send it by Messenger to the Super Admin.

**You should see:** the prepared message holds the reference code, the deposit instructions, and the deadline. No email is sent, and nothing fails.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-24 · Too many requests at once
**Who:** both · **Prepare:** the Super Admin has 7 test mobile numbers · **Covers:** BR-07a, EC-15, FR-ADM-29, FR-NTF-15
1. Super Admin: send 7 online requests quickly, each with a different number.
2. Admin: look at the website, your email, and the dashboard.
3. Admin: create a phone booking.
4. Admin: press **Resume online booking**. Super Admin: send one more online request.

**You should see:** the 7th request is refused, and the website says "please message or call us". Each admin gets one email, and the dashboard shows a banner. The phone booking still works. After Resume, online requests are accepted again.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-25 · The health panel and a booking's history
**Who:** Admin · **Prepare:** — · **Covers:** FR-ADM-32, FR-ADM-33, NFR-25, charter §2 (criterion 4)
1. Open the health panel.
2. Open the history of a test booking you changed several times.

**You should see:** the timers ran in the last few minutes, and there are no failed emails. The history lists every step with who did it, when (Manila time), and the reason.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-26 · Practise losing your phone
**Who:** both · **Prepare:** your paper backup codes; a second browser logged in as the Admin · **Covers:** EC-71, FR-ADM-30, roles §5.2
1. Admin: log in with one backup code instead of the phone code. Log out. Try the same code again.
2. Super Admin: sign out the Admin's other browser. Admin: click anything there.

**You should see:** the backup code works once only. The signed-out browser goes to the login page at the next click.
**Passed:** ☐ Admin ☐ Super Admin · Notes: ____________

#### TC-UAT-27 · Use only the keyboard
**Who:** Admin, with the Super Admin watching · **Prepare:** the laptop, with the mouse put away · **Covers:** NFR-17
1. Make a booking on the public site using only the keyboard (Tab, Shift+Tab, Enter, Space, the arrow keys, Esc).
2. In the admin panel, approve it and record the deposit with the keyboard only.

**You should see:** every button and field can be reached, and you can always see where you are on the page.
**Passed:** ☐ Admin · Notes: ____________

#### TC-UAT-28 · The Super Admin's own tools
**Who:** Super Admin, with the Admin watching · **Prepare:** an older test booking; a test booking for the erasure · **Covers:** FR-ADM-28, FR-ADM-31, EC-55, EC-84
1. Change the deposit amount in the settings. Open the older booking.
2. Set a legal hold with a reason on a test booking; clear it with a reason.
3. Process an erasure on a test booking after checking its reference code and mobile number; tell the "customer" what was kept and why.
4. Admin: open the same screens on your account.

**You should see:** the older booking keeps its old deposit. The hold flag appears and disappears. After the erasure, the name, mobile, email, street, and landmarks are blank, and the payments are still there. The Admin cannot see or use these tools.
**Passed:** ☐ Super Admin · Notes: ____________

#### TC-UAT-29 · Book from Facebook Messenger
**Who:** Admin · **Prepare:** the website link sent to you in Messenger · **Covers:** NFR-18
1. Tap the link inside Messenger, so it opens in Messenger's own browser.
2. Make a booking.

**You should see:** the booking works as in TC-UAT-02.
**Passed:** ☐ Admin · Notes: ____________

### 5.3 Sign-off

| | Admin (business owner) | Super Admin (developer) |
|---|---|---|
| Every scenario passed, or each failure is written down with its level (6.3) and accepted | ☐ | ☐ |
| The restore test passed again before launch (TC-NFR-16) | — | ☐ |
| Name and date | ____________ | ____________ |

---

## 6. Entry and exit criteria, defect severity, and regression

### 6.1 Entry criteria

| Level or phase | Can start when |
|---|---|
| TC-DB and TC-UT (each feature) | Every migration applies from zero (`supabase db reset`); the fixture function and the clock helper exist (1.3, 1.5); the case is written before the code and seen to fail (1.1) |
| TC-E2E | The build passes; the local database is reset and the E2E seed loaded |
| TC-W1 (week 1) | The real Vercel project in `sin1` and the real Supabase project in Singapore exist; the repository is private before `backup.yml` is added ([C] D-22, O-06); the Vault secrets are set by hand; the Admin's phone and the laptop are available for item 6 |
| Manual TC-SEC and TC-NFR | The production configuration is final (domain, headers, environment variables, Sentry, uptime check) |
| TC-UAT ([roadmap][roadmap] M8 reached) | Every automated level is green on `main`; no S1 or S2 defect is open; both admins have 2FA set up and their backup codes on paper; the [staff guide][staff] is available; the content of O-02, O-03, and O-04 (and the parts of O-05 and O-09 that pages show) is entered, or the run uses test content and the content steps are repeated once it is entered (Q10) |

### 6.2 Exit criteria

| Phase ([project-charter][charter] §6) | Done when |
|---|---|
| 4 · Week-1 test | The go / no-go of section 4 is decided and recorded in the [decision log][dl]; every row passed or has an accepted fallback |
| 5 · Build | For each feature: its cases pass in CI, and section 3 names them |
| 6 · Test ([roadmap][roadmap] M8 to M9) | All TC-DB, TC-UT, TC-E2E, and TC-SEC cases pass, except cases marked "If [P] accepted" whose control the review rejected (each marked "not applicable", with the decision); every TC-NFR passes, including the second restore test (TC-NFR-16); every TC-UAT is ticked by the people named, or each failure is written down as S3 or S4 with a fix date and accepted by both admins (5.3); no S1 or S2 defect is open; the coverage summary (3.9) still lists no requirement without a test |
| 7 · Launch | Phase 6 is done. The non-test conditions of the charter also hold: the vendor terms saved and the lawyer's review (O-08, TC-NFR-08) |

### 6.3 Defect severity

| Level | Meaning | Examples | What happens |
|---|---|---|---|
| **S1 · Critical** | Breaks a success criterion or a core rule, loses or leaks data, or opens a security hole | A set double-booked; a booking Confirmed without an admin action; a wrong payment record or a reused ACK number; personal data on a public page; an admin action that works logged out; a restore that fails | Fixed before any other work. Blocks every merge to `main` that touches the area, and blocks launch |
| **S2 · Major** | A rule or requirement does not work, but there is a manual way round it and no data is lost | An email type never sent; a deadline one hour wrong; a job that stops; a refused action with the wrong message | Fixed before launch |
| **S3 · Minor** | Works, with a flaw that does not change a booking, a payment, or a permission | Layout wrong in one browser; an unclear message; a slow page | May launch with a fix date agreed by both admins |
| **S4 · Cosmetic** | Looks only | Spacing, a typo, an icon | Kept in the backlog ([roadmap][roadmap]) |

A defect's level is set by the Super Admin; the Admin may ask for it to be raised. Every defect names the TC that found it, or the TC added to catch it.

### 6.4 Regression policy

- **Every push** runs lint, typecheck, TC-UT, and TC-DB; **every pull request and `main`** also run TC-E2E and the Docker build (1.6). Nothing reaches production without these.
- **Every bug fix starts with a failing test.** The test reproduces the bug, as a new TC or a new step in an existing one, before the fix is written. The test stays.
- **A changed rule** follows "How to change a decision" in the [decision log][dl]: the log first, then the owning document, then the cases that section 3 lists for that ID. The frozen spec is never edited (D-23).
- **Dependency and security updates** run the full CI before they are merged; critical fixes within the time in NFR-30 (TC-NFR-17).
- **A larger platform change** (a new Next.js minor or major version, a Better Auth update, a new Supabase Postgres major version, or a move to another host under the exit plan, [arch][arch] §12) repeats the matching TC-W1 items on the real projects **[P] (new in this doc)**.
- **After each production deploy**, the smoke checks of [deployment and operations][ops] §3.4, which create no booking. Test bookings are never made on production after launch.
- **After any restore**, the retention job runs first, then the smoke checks, before the site reopens (NFR-29; [deployment and operations][ops]).
- **Restore tests** run on the schedule of [deployment and operations][ops] §5.5, and also after any change to the backup workflow **[P] (new in this doc)**. Each run is recorded in 6.5.
- **A flaky test** is never skipped silently. It is quarantined only with an S3 defect and a fix within a week; the concurrency cases (TC-DB-10 to TC-DB-12) are never quarantined **[P] (new in this doc)**.

### 6.5 Results record

The week-1 decision and every restore test are recorded here, as [deployment and operations][ops] §5.5 asks. The UAT sign-off is in 5.3.

| Date | Run | Environment | Backup used (restore runs) | Time taken | Result | Defects raised | Recorded by |
|---|---|---|---|---|---|---|---|
| | Week-1 go / no-go (section 4) | Week-1 projects | — | — | | | |
| | Restore test, week 1 (TC-NFR-16) | | | | | | |
| | Restore test, before launch (TC-NFR-16) | | | | | | |

---

## Open questions

These are not decided here. If the reviewers agree an answer is needed, record it in the [decision log][dl] (O-12 onwards) or in the owning document named, then update this test plan.

**Test design proposals in this document [P] (new in this doc):**

1. **A clock that tests can set** (1.5): one helper, `app.now()`, that a test database can fix for one transaction, guarded by a test-only marker that production never has (TC-SEC-54). Without it, the time-based cases (deadlines, the notice period, Manila midnight, reminders, acknowledgment years, retention) can test only the pure predicates. Needs a decision in [api-specification][api] and [data-model][data].
2. **The concurrency harness** (1.5): `dblink` inside pgTAP, or a two-connection script. Either must be able to hold session A's transaction open while session B waits.
3. **Where week 1 and UAT run, and how the database is reset before launch.** If both use the project that becomes production, test reservations would use up acknowledgment numbers and leave rows in the ledger and the audit log, which the app never deletes (NFR-22). The same question is [deployment and operations][ops] open question 46, which sets out the options, and [roadmap][roadmap] open question 14; a staging project is [architecture][arch] open question 9. This test plan works with either answer: the TC-UAT cases use made-up customers only, and TC-SEC-54 checks that no test hook remains.
4. **Differences between the technical documents** that the tests depend on. Resolved (reconciled 2026-10-21): each was settled in the owning document, and the cases above now follow it:
   - a. **The order of the first submit checks.** Resolved (reconciled 2026-10-21): honeypot, rate limit, Zod, Turnstile, then `app.book_reservation` ([api-specification][api] §2.3), also in [WF-01C][wf-book] and [security][sec] §4.4 (TC-SEC-19).
   - b. **The status-page cookie.** Resolved (reconciled 2026-10-21): 15 minutes, `SameSite=Lax`, `HttpOnly`, `Secure`, signed ([security][sec] §4.5.2; [api-specification][api] §1.13) (TC-SEC-30).
   - c. **The proof view link's lifetime.** Resolved (reconciled 2026-10-21): 5 minutes everywhere (TC-SEC-35).
   - d. **The `app_rw` timeouts.** Resolved (reconciled 2026-10-21): 5 s statement, 2 s lock, 10 s idle in transaction ([data-model][data] §2.3) (TC-DB-13, TC-SEC-18).
   - e. **The duplicate-submission key.** Resolved (reconciled 2026-10-21): the key in `localStorage`, the draft in `sessionStorage`; the same key with other data refused with `submission_key_mismatch` ([api-specification][api] §1.8) (TC-E2E-02, TC-SEC-21).
   - f. **The QR link in the outbox.** Resolved (reconciled 2026-10-21): encrypted (option B, [security][sec] §4.5.4) in `qr_link_ciphertext` ([data-model][data] §5.12), erased once sent or once the QR code stops working; the server makes the token (TC-SEC-29, TC-DB-81, TC-UT-04).
   - g. **Admin email rows.** Resolved (reconciled 2026-10-21): one outbox row per admin recipient (TC-DB-22, TC-DB-77).
   - h. **The same-day waiver and the needs-info flag.** Resolved (reconciled 2026-10-21): the waiver from Pending Confirmation clears the flag, as approve does ([api-specification][api] §5.4; the CHECK of [data-model][data] §5.3, tested in TC-DB-95).
   - i. **Document links in the Confirmed email.** Resolved (reconciled 2026-10-21): documents open only after a status lookup, through the signed cookie, or for an admin from the admin panel; no signed link token (TC-SEC-30).
   - j. **The break-glass audit entry.** Resolved (reconciled 2026-10-21): actor `system`, category `security`, for the break-glass and the setup scripts (TC-DB-91, TC-SEC-53).
   - k. **The daily SQL jobs' times.** Resolved (reconciled 2026-10-21): from 00:15 Manila, staggered to 00:35 ([api-specification][api] §6) (TC-DB-86).
   - l. **How long `job_runs` rows are kept.** Resolved (reconciled 2026-10-21): 30 days, keeping the latest row per job.
   - m. **Extra limits proposed in [security][sec].** Resolved (reconciled 2026-10-21): [api-specification][api] now carries the customer's QR reissue limit (bucket `qr_reissue`), the `/r/` page counting toward the lookup limit, and Turnstile on the status lookup; their tests stay "If [P] accepted" (TC-SEC-31).
   - n. **Names.** Resolved (reconciled 2026-10-21): the reservations view is `app.reservation_effective`; the setting keys, the setting validator `app.setting_value_is_valid`, the rate-limit buckets, and the `job_name` and `job_result` values are those of [data-model][data] §3 and §7; the helper and job names are those of [api-specification][api] §5 and §6 (TC-DB-97). Still open: the signature of `app.hold_is_overdue`, which [api-specification][api] §5.2 gives without the time argument that §1.5 above and [data-model][data] §5.20 use ([api-specification][api] open question 29).
   - o. **The IP-HMAC key.** Resolved (reconciled 2026-10-21): the Vault secret `ip_hmac_key`, with the HMAC computed in the database ([data-model][data] §5.14; [security][sec] §4.4) (TC-DB-76).
   - p. **The internal note length.** Resolved (reconciled 2026-10-21): 1,000 characters ([ux-and-sitemap][ux] §8).
5. **Boundary readings to confirm:**
   - a. The booking window "from today through 180 days ahead" (BR-09) is read as including day 180 (TC-DB-28).
   - b. A staff booking that starts exactly one notice period from now meets the notice, so it is not a one-step booking (TC-DB-17), as an online request at exactly 1 hour is accepted (BR-06).
   - c. A request exactly 60 minutes before the 7th: is it "within 60 minutes" (BR-07a)? TC-DB-22 tests only 59 and 61 minutes.
   - d. An on-site arrival exactly at closing time, and a lock-out tested exactly at 15:00 minutes, are left out until the rules say which side they fall on.
6. **Behavior that no document defines yet.** No case tests these. Once each is answered, the named case gets a step.

| Behavior | Where it is open | Case to extend |
|---|---|---|
| Emails of a one-step staff booking (tested now as provisional) | [functional-requirements][fr] §7, question 1 | TC-DB-18 |
| The reminder, and the deadline shown, while expiry is paused | [functional-requirements][fr] §7, question 2 | TC-DB-79, TC-E2E-07 |
| A deposit recorded after a void on a Confirmed booking | [functional-requirements][fr] §7, question 3 | TC-DB-59 |
| How the customer receives a QR code an admin reissued | [functional-requirements][fr] §7, question 4 | TC-E2E-18 |
| Whether street and landmarks are required | [functional-requirements][fr] §7, question 6 | TC-UT-01 |
| Whether "event not held" sends the cancelled email (tested now as provisional: none) | [functional-requirements][fr] §7, question 7 | TC-DB-49 |
| A refund decision when only a balance was paid | [reservation-lifecycle][lc] §9, question 2 | TC-DB-47 |
| A block range where only some dates clash (tested now as provisional) | [edge-cases][ec] §15, question 1 | TC-DB-25 |
| Recreating after the service start (tested now as provisional) | [edge-cases][ec] §15, question 2 | TC-DB-41 |
| What admins do with a part deposit | [edge-cases][ec] §15, question 3 | — (a process) |
| An extension while expiry is paused, then a rejection | [edge-cases][ec] §15, question 4 | TC-DB-37, TC-DB-56 |
| The default balance after a waived deposit | [edge-cases][ec] §15, question 5 | TC-UT-13 |
| A balance in parts; extra units of a kept add-on; the refund against the decision; what "full" covers; voided acknowledgments on the status page; the Booking Confirmation's content and life; an earlier payment date | [catalog-and-payments][cat] §10, questions 1 to 7 | TC-DB-58, TC-DB-55, TC-DB-60, TC-DB-47, TC-E2E-07, TC-E2E-10 |
| An unverified proof on a booking that went ahead; retention of other audit categories and of outbox rows; what an erasure blanks; erasure on an active booking; telling the customer; erasures after a restore; "event not held" and the closure date (provisional); which ledger end for run logs | [privacy-and-retention][priv] §11, questions 1 to 7, 10, 11 | TC-DB-71, TC-DB-74, TC-DB-64, TC-NFR-16, TC-DB-49, TC-DB-75 |
| Whether labels show under the paused banner | [availability-and-conflicts][wf-avail] open question 4 | TC-E2E-05 |
| A set added after a whole-date block | [availability-and-conflicts][wf-avail] open question 6 | TC-DB-26 |
| The QR code of an overdue hold (tested now as provisional: "no longer valid") | [lookup-and-review][wf-review] open question 1 | TC-E2E-17 |
| The booking window for staff bookings; the late-night one-step waiver | [lookup-and-review][wf-review] open questions 12, 13b | TC-DB-17, TC-DB-19 |
| Flagging "needs info" twice | [lookup-and-review][wf-review] open question 9 | TC-DB-54 |
| Who deletes a former admin's credentials within 30 days | [administration][wf-admin] open question 11 | TC-DB-91 |
| Whether resuming early restarts the breaker count | [administration][wf-admin] open question 17a | TC-DB-23 |
| What a repeated submission shows instead of the QR code | [booking-and-submission][wf-book] open question 2 | TC-E2E-02 |

7. **A recreated request and the hold limits.** Recreate is exempt from the online hold limits (BR-07), but its source is copied from the original (provisional, [changes-and-expiry][wf-change] open question 9a). If that source is `online`, does the recreated request then count toward the customer's next online request? TC-DB-21 will get a step once this is answered.
8. **The speed target.** NFR-03 has no number yet. TC-NFR-04 records the week-1 figures; the go / no-go sets the target, which then goes into NFR-03.
9. **UAT practicalities.** TC-UAT-24 needs 7 test mobile numbers (numbers are not verified, so no SIM cards are needed); real emails go only to the admins' own addresses; the Admin's phone needs the authenticator app before the session. Confirm these with the Admin before the UAT date.
10. **Content still open.** The cases that show real content (packages, prices, slot times, on-site hours, deposit amount and instructions, the free-delivery wording, the FAQ, the business and privacy contacts) use test content until O-02, O-03, O-04, O-05, and O-09 are answered. They are run again in UAT once the content is entered.
11. **Cases that depend on [P] controls.** Fourteen TC-SEC cases test controls proposed in [security][sec] ("If [P] accepted"), and several others have a [P] step. The review of [security][sec] decides which stay; the rest are marked "not applicable" with the decision ID.
12. **Smaller test-design choices [P] (new in this doc)**, to confirm in review: TC IDs in test file names and titles (1.1); the shared fixture function and the E2E seed with known TOTP secrets, never run on a real project (1.3); the four Playwright projects and their sizes (1.4); the TypeScript-to-SQL parity checks (TC-UT-02, TC-UT-05); the rebuild with new action ids in TC-E2E-03; and the regression rules marked [P] in 6.4 (repeating week-1 items after a platform change, a restore test after a backup-workflow change, and the flaky-test rule).

[dl]: ../00-project/decision-log.md
[charter]: ../00-project/project-charter.md
[gl]: ../00-project/glossary.md
[roles]: ../01-requirements/roles-and-permissions.md
[br]: ../01-requirements/business-rules.md
[fr]: ../01-requirements/functional-requirements.md
[nfr]: ../01-requirements/non-functional-requirements.md
[ec]: ../01-requirements/edge-cases.md
[priv]: ../01-requirements/privacy-and-retention.md
[lc]: ../02-domain/reservation-lifecycle.md
[cat]: ../02-domain/catalog-and-payments.md
[wf-book]: ../03-workflows/booking-and-submission.md
[wf-avail]: ../03-workflows/availability-and-conflicts.md
[wf-review]: ../03-workflows/lookup-and-review.md
[wf-change]: ../03-workflows/changes-and-expiry.md
[wf-notify]: ../03-workflows/notifications-and-tracking.md
[wf-admin]: ../03-workflows/administration.md
[ux]: ../04-design/ux-and-sitemap.md
[arch]: ../05-technical/architecture.md
[data]: ../05-technical/data-model.md
[api]: ../05-technical/api-specification.md
[sec]: ../05-technical/security.md
[roadmap]: roadmap.md
[ops]: ../07-operations/deployment-and-operations.md
[staff]: ../07-operations/staff-guide.md
[spec]: ../superpowers/specs/2026-10-21-kasoundbox-design.md
