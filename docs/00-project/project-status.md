# Project Status

> **Purpose:** One page with what is done, who does what next, and every question still open across the docs, de-duplicated and in priority order ·
> **Audience:** The business owner (Admin), presented by the developer (Super Admin). Sections 1, 2, and 3.2 to 3.4 are written for the business owner; sections 3.1, 3.5, 4, and 5 are mainly for the developer ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Docs index][readme], [Decision log][dl], [Roadmap][rm], [Test plan][tp], [Architecture][arch], [Security][sec], [Deployment and operations][ops], and the "Open questions" section of every document in the index

## In plain words

*For the business owner (Admin).*

The design of the reservation system is approved, and all 27 project documents are written and checked against each other. Nothing has been built yet. The next step is for you and the developer to read the documents and answer the open questions in section 3: 52 business questions for you, 6 items of content to provide, and 21 legal and privacy questions, several of them for a lawyer and a CPA. After that, the developer runs a one-week technical test on the real free services (the "week-1 test"), and Claude writes the step-by-step build plan. Building then happens in five phases, followed by testing together and a short list of checks before the website opens. One technical problem must be fixed first: GitHub refuses to let Claude save its work (error 403).

## How to read this document

- **Labels** are the same as in every doc: **[C]** confirmed decision · **[P]** proposed, may still change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item in the [decision log][dl-3].
- **Question IDs.** Q-001 onwards are local to this page. They are numbered in priority order. Once a question is answered, it becomes a decision (section 6).
- **Source shorthand.** "OQ 7" means item 7 of that document's "Open questions" section. "§7 Q1" means question 1 in section 7 of that document. "Provisional" means the [API specification][api] picked a default so it can be built while the business answer is pending; the answer can still change it.
- **Phases and gates** come from the [roadmap][rm-1]: 3 Documentation (milestone M1), 4 Week-1 spike (M2), 5 Foundation (M3), 6 Core booking (M4), 7 Admin review (M5), 8 Changes and money (M6), 9 Notifications and jobs (M7), 10 Hardening (M8), 11 UAT (M9), 12 Pre-launch gates (M10, gates G1 to G21), 13 Launch (M11). Epic IDs such as E7.1 are the roadmap's backlog items.
- **Made-up examples.** Names, prices, and times in the examples are made up, as in the other docs (Ana, Ben, Carla, Dan, Eva, Rosa; Package A at ₱3,000; a ₱1,000 deposit).

---

## 1. Done

**Discovery.** Business understanding and the first workflow review ([discovery brief][brief], now superseded).

**Brainstorming with the Superpowers process.** About 40 business decisions made through structured questions. They are recorded as decisions D-01 to D-24 in the [decision log][dl].

**Research.**
- Two verified web-research rounds on the tech stack. The first compared Cloudflare, Oracle Cloud, and Netlify. The second covered Vercel Hobby with Next.js and Supabase ([architecture source notes][arch-notes]).
- One Philippine law round: Data Privacy Act, tax record retention, and business registration ([privacy and retention §10][priv-10]).

**Design spec v0.2.** Written, reviewed (48 review findings fixed), approved, and frozen on 2026-10-21 ([design spec][spec]).

**Documentation, all drafted and checked.**
- **Batch 1 (project, requirements, domain):** 11 docs, including the [decision log][dl] D-01 to D-24: [project charter][charter], [glossary][gl], [decision log][dl], [roles and permissions][roles], [business rules][br], [functional requirements][fr], [non-functional requirements][nfr], [edge cases][ec], [privacy and retention][priv], [reservation lifecycle][lc], [catalog and payments][cat].
- **Batch 2 (workflows WF-01 to WF-10):** 6 docs plus the one-page [process overview][wf]: [booking and submission][book], [availability and conflicts][avail], [lookup and review][review], [changes and expiry][change], [notifications and tracking][notify], [administration][admin].
- **Batch 3 (design and technical):** [UX and sitemap][ux], [architecture][arch], [data model][data], [API specification][api], [security][sec].
- **Batch 4 (delivery and operations):** [roadmap][rm], [test plan][tp] (262 test cases), [deployment and operations][ops], [staff guide][staff] (27 procedures).

**Consistency.** Cross-doc review and fix passes after each batch, plus a reconciliation pass that aligned the technical docs.

**Quality checks.** Every Mermaid diagram renders, every relative link resolves, and every MVP requirement is placed in the roadmap and covered by a test.

**A presentation web page of all docs** (published separately).

**Where the work is saved.** All work is committed on branch `claude/festive-hopper-81qsq5`. Pushing to GitHub is blocked by a 403 access error (see section 2, task D-1).

### 1.1 By the numbers (counted on 2026-10-21)

| What | Count |
|---|---|
| Project documents drafted | **27** (batch 1: 11 · batch 2: 7 · batch 3: 5 · batch 4: 4), about 23,700 lines, plus the [docs index][readme], this page, the frozen [spec][spec], and the superseded [discovery brief][brief] |
| Mermaid diagrams | **136** in the 27 documents (141 counting the spec and the brief) |
| Decisions | **24** (D-01 to D-24) |
| Open items in the decision log | **10** (O-02 to O-11); O-01 is resolved (D-17) |
| Test cases | **262** (233 automated and manual cases plus 29 acceptance cases, TC-UAT) |
| Staff guide procedures | **27** (P-01 to P-27) |
| Numbered items in the docs' open-question sections | **334** in 20 documents. **26** are resolved (22 marked "Resolved" in their own doc, 4 marked resolved in a later doc). The other **308** are either questions, merged here into **144** entries (Q-001 to Q-144), or [P] proposals, summarized in section 3.5.1 |
| [P] labels to review | **528** "[P] (new in this doc)" and "[P] (reconciled 2026-10-21)" labels in 18 documents (47 of them reconciled; the non-functional requirements write "[P] (new)"), counted as label occurrences |
| [U] facts to verify | **58** (section 4) |
| Pre-launch gates | **21** (G1 to G21, section 5) |

---

## 2. Pending tasks

Who does what next. "Blocks" names the roadmap phase, milestone, or gate that cannot finish without the task.

### Developer (Super Admin)

| # | Task | Blocks | Source |
|---|---|---|---|
| D-1 | **Fix GitHub access so Claude's pushes work (O-07).** Saving to the repository is currently refused with error 403. Once fixed, the branch `claude/festive-hopper-81qsq5` is pushed. | Gate G2; the week-1 spike's entry criteria **[P]** and Foundation's entry (M3) | [decision log O-07][dl-3]; [roadmap §1.4, §1.5][rm-1] |
| D-2 | **Make the GitHub repository private (O-06)** **[C]** (D-22). It must be private before the nightly backup is added. | Gate G1; the nightly backup (E20.1, Notifications and jobs, M7); week-1 item 7 if it uses GitHub Actions | [decision log O-06][dl-3]; [NFR-27][nfr] |
| D-3 | **Review every doc and answer the questions in section 3.** Confirm or correct each [P] proposal (section 3.5), answer sections 3.1 and 3.5, and go through sections 3.2 to 3.4 with the Admin. Record each answer as section 6 says. | M1 (Documentation) | [roadmap §1.3][rm-1] |
| D-4 | **Run the week-1 test.** Create the Vercel Hobby project (`sin1`) and the Supabase Free project (Singapore), run the checklist in [test plan §4][tp-4], and record the go / no-go (Q-007). | M2; gate G9 | [roadmap §1.4][rm-1]; [architecture §14.1][arch-141] |
| D-5 | **Then the implementation plan.** Review and approve the plan Claude writes, then build with Claude phase by phase. | M3 to M8 | [roadmap §9][rm-9] |
| D-6 | **Pre-launch gates owned by the Super Admin:** G3 (vendor terms), G5, G9, G10, G13, G15, G18, G19 (section 5). | M10 | [roadmap §5][rm-5]; [ops §10][ops-10] |

### Business owner (Admin)

| # | Task | Blocks | Source |
|---|---|---|---|
| A-1 | **Read and approve the docs** with the developer, including the items marked "[P] (new in this doc)", and answer the business questions in section 3.2. | M1 (Documentation) | [roadmap §6][rm-6] |
| A-2 | **Provide the content in section 3.3:** slot times and on-site hours (O-02), packages, prices, deposit and texts (O-03), the free-delivery wording (O-04), and the web address, Facebook Page, and business email (O-05). | O-02's shape: start of Core booking (M4). O-04: end of Core booking. O-05: start of Notifications and jobs. O-03 and all values: start of UAT. Gates G12, G13 | [roadmap §6][rm-6] |
| A-3 | **Lend your phone and laptop for the QR scanning test** (week-1 item 6), if you will scan QR codes at the office. | M2 | [roadmap §6][rm-6] |
| A-4 | **Decide who is the data protection officer (DPO) and set up the privacy contact email (O-09),** with the Super Admin. | Gates G6 and G5 | [decision log O-09][dl-3] |
| A-5 | **Arrange the lawyer and CPA reviews** (O-08, O-10, O-11). Who arranges and pays is still open (Q-078). They can start any time after M1 **[P]**. | Gates G4, G7, G8 | [roadmap §6][rm-6] |
| A-6 | **Set up your own login with two-factor login (2FA)** when your account is created, and keep your backup codes safe. | Start of UAT; gate G17 | [roadmap §6][rm-6] |
| A-7 | **Look at the new admin screens at the end of each build phase** and say what is unclear **[P]**. | Phases 5 to 9 | [roadmap §6][rm-6] |
| A-8 | **Work through the UAT checklist** (about thirty real situations) with the Super Admin. | M9; gate G11 | [test plan][tp]; [roadmap §6][rm-6] |
| A-9 | **Read the staff guide**, including "What the Admin should notice and report". | Gate G21 | [staff guide][staff] |
| A-10 | **Agree that the gates are cleared** and the website can open. | M10 | [roadmap §6][rm-6] |

### Lawyer / CPA

| # | Task | Blocks | Source |
|---|---|---|---|
| L-1 | **O-08: one-time review of privacy and retention by a Philippine lawyer,** including the retention periods, every [U] legal item, and the NPC's 72-hour breach rule (Q-073). | Gate G4 | [decision log O-08][dl-3]; [privacy §9][priv-9] |
| L-2 | **O-10: whether the SDAU (a free sworn exemption declaration) must be filed with the NPC** (Q-075). | Gate G7 | [decision log O-10][dl-3] |
| L-3 | **O-11: business registration (BIR, DTI business name, barangay clearance, mayor's permit), and using "DJB Kasoundbox" on acknowledgments** (CPA or lawyer; Q-076). | Gate G8 | [decision log O-11][dl-3] |
| L-4 | **The retention review:** the periods in [privacy and retention §6.2][priv] and the open retention questions Q-080 to Q-093. | Gate G4; the retention job (E19.1, Notifications and jobs) | [privacy §11][priv-q] |

### Claude (next steps once approved)

| # | Task | Blocks | Source |
|---|---|---|---|
| C-1 | **Record each answer** as a new decision (D-25 onwards), update the docs it affects, and mark the question answered here (section 6). | M1 | [decision log §4][dl-4] |
| C-2 | **Write the implementation plan** with the writing-plans process: one plan per phase, starting with the week-1 spike **[P]**, each written when the previous phase reaches its milestone. | M2 and M3 | [roadmap §9][rm-9] |
| C-3 | **Build phase by phase,** test-first: Foundation, Core booking, Admin review, Changes and money, Notifications and jobs, Hardening. Update the roadmap's phase status at each milestone. | M3 to M8 | [roadmap §1][rm-1] |
| C-4 | **Push the branch** `claude/festive-hopper-81qsq5` once O-07 is fixed. | Gate G2 | [decision log O-07][dl-3] |
| C-5 | ~~**Small follow-up:** [FR-NTF-07][fr]'s row said the Confirmed email "links to" the documents; it should match [FR-PUB-14][fr].~~ **Done 2026-10-21:** the row now points the customer to the status page. | M1 | [security OQ 16][sec-q] |

---

## 3. Questions to answer

Each question appears once, with every doc that raises it. Under the roadmap's proposed exit for M1 **[P]**, every question is answered or moved to the decision log as an open item before the docs are approved ([roadmap OQ 8][rm-q]). "Blocks" names the latest phase that cannot finish without the answer.

### 3.1 Must answer before the week-1 test / Foundation phase

*Mainly for the developer. Each entry starts with a one-line plain explanation.*

#### Q-001 · Which form does the shared "is this hold overdue?" check take?
- **In plain words:** one small database helper decides whether a request's deadline has passed. Two docs describe it differently, and the first build phase needs one version.
- **Detail:** [API §5.1][api-51] gives `app.hold_is_overdue(reservation)`, which reads the time itself. [Data model §5.20][data-520] and [test plan §1.5][tp-15] give `app.hold_is_overdue(status, deadline, expiry_paused, service_start, at)` as an `IMMUTABLE` function with the time as an argument (data model §8 explains why). The same helper also carries [availability OQ 3][avail-q] **[P]**: a paused hold counts as overdue from its service start.
- **Why it matters:** every capacity function, every reader, and the expiry job share this one predicate, so the calendar and the Submit check never disagree.
- **Options / recommendation:** [API OQ 29][api-q] says the API document settles the signature. No choice is recorded yet.
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E2.4 shared helpers)
- **Sources:** [API OQ 29][api-q] · [roadmap OQ 17][rm-q] · [test plan OQ 4n][tp-q] · [availability OQ 3][avail-q] · [data model §5.20][data-520]

#### Q-002 · What does the QR-link encryption bind to, when the IDs do not exist yet?
- **In plain words:** the QR link in a queued email is stored encrypted. The security doc ties the encryption to the email's row number and the booking's ID, but the server encrypts before the database has created either one.
- **Detail:** [Security §4.5.4][sec-454] (option B) uses AES-256-GCM with "the outbox row ID and the reservation ID" as associated data. [API §1.13][api-113] has the server make the token and encrypt the link *before* it calls `app.book_reservation`, `app.create_staff_reservation`, or `app.recreate_expired`. Both IDs are made by the database during that call: the outbox ID is an identity column and reservation IDs come from `gen_random_uuid()` ([data model §4, §5.12][data-512]).
- **Why it matters:** as written, the encryption step cannot be built. TC-SEC-29, TC-DB-81, and TC-UT-04 depend on it.
- **Options / recommendation:** none in the docs yet. [Security §4.5.4][sec-454] owns the fix; [API §1.13][api-113] and [data model §5.12][data-512] follow it.
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E1.2 `OUTBOX_LINK_KEY`, E2.2 outbox table) and Core booking (M4; E7.3)
- **Sources:** [security §4.5.4][sec-454] · [API §1.13][api-113] · [data model §5.12][data-512]

#### Q-003 · What does the customer see when the robot check fails, and does every attempt count toward the limit?
- **In plain words:** the booking form has a hidden robot check. The docs agree on one general message when it fails, but its exact words and one related rule are not confirmed.
- **Detail:** [booking OQ 5][book-q] (resolved) says both bot checks, the honeypot and Turnstile, return one generic `bot_check_failed`. [Security OQ 24][sec-q] keeps two parts as **[P]**: the one generic message, and every attempt counting toward the submission limit. The draft wording in [UX §3.1.4][ux-form], "We could not check that you are not a robot. Please try again.", cites booking OQ 5 for its wording, and that item closed without wording. TC-SEC-19 runs "if [P] accepted".
- **Options / recommendation:** one generic message, as [API §2.3][api] already orders the checks; the UX draft wording.
- **Who answers:** Super Admin · **Blocks:** Core booking (M4; E7.2). Listed here because it is a loose end from the reconciliation pass.
- **Sources:** [security OQ 24][sec-q] · [booking OQ 5][book-q] · [UX §3.1.4][ux-form] · [test plan][tp] TC-SEC-19

#### Q-004 · Where do the week-1 test and acceptance testing (UAT) run, and how is production made clean before launch?
- **In plain words:** business records are never deleted. If test bookings are made in the real system, they stay forever and use up acknowledgment numbers.
- **Example:** a test deposit recorded during UAT in production would take `ACK-2026-0001`, and the first real customer would get a later number.
- **Options / recommendation:** [ops OQ 46][ops-q] sets out two options: (a) UAT on a separate pre-launch project, with production set up fresh just before launch; (b) UAT in production, then a one-time reset of the business tables and the acknowledgment counters by the Super Admin before the first real customer, recorded as a decision. For week 1, [ops OQ 1][ops-q] **[P]** proposes a separate short-lived week-1 project and a restore-test project, both deleted afterwards. A permanent staging database is [architecture OQ 9][arch-q]: a second free Supabase project with its own keep-alive; how many free projects are allowed is **[U]**.
- **Who answers:** Super Admin, with the Admin · **Blocks:** Week-1 spike (M2) for the test project; Foundation (M3), because it decides when the production admin accounts are created ([roadmap §1.5, §1.11][rm-1]); UAT (M9)
- **Sources:** [roadmap OQ 14][rm-q] · [test plan OQ 3][tp-q] · [ops OQ 46][ops-q] · [ops OQ 1][ops-q] · [architecture OQ 9][arch-q]

#### Q-005 · How do tests set the clock?
- **In plain words:** many rules depend on "now" (deadlines, "today", reminders). Tests need a safe way to pretend it is a certain time, with no such switch in the real system.
- **Detail:** [test plan §1.5][tp-15] **[P]** proposes one helper, `app.now()`, that returns `clock_timestamp()`, except in a test database, where a test can fix the time for one transaction (`SET LOCAL app.test_now = …`). It works only when a test-only marker exists; TC-SEC-54 checks that production has none. [API §1.4][api] currently reads `clock_timestamp()` and `app.manila_today()` directly.
- **Why it matters:** without it, the time-based rules can be tested only through the pure predicates.
- **Options / recommendation:** the test plan proposal; it needs a decision in the [API specification][api] and the [data model][data].
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E2.4 shared helpers and every time-based database test)
- **Sources:** [test plan OQ 1][tp-q] · [test plan §1.5][tp-15]

#### Q-006 · How is the real website kept from taking bookings before launch?
- **In plain words:** from the Foundation phase on, every finished change goes live on the production address, which is public. A customer could find it and book before the official opening.
- **Options / recommendation:** none in the docs.
- **Who answers:** Super Admin · **Blocks:** Foundation (M3) onwards, until Launch (M11)
- **Sources:** [roadmap OQ 15][rm-q] (based on [architecture][arch] §2.2 and §11)

#### Q-007 · How is the week-1 result recorded, and what speed target follows from it?
- **In plain words:** the week-1 test ends with a clear "go" or "no-go". It needs a fixed place in the records, and it also sets how fast pages must be.
- **Options / recommendation:** [roadmap OQ 1][rm-q] **[P]**: record it as a new decision in the decision log (D-25 or the next free number), listing each item's result and any fix. The speed target: [NFR-03][nfr] has no number yet; TC-NFR-04 records the week-1 delays (p50, p95), and the go / no-go sets the target ([test plan OQ 8][tp-q]).
- **Who answers:** Super Admin · **Blocks:** Week-1 spike (M2); gate G9
- **Sources:** [roadmap OQ 1][rm-q] · [test plan OQ 8][tp-q] · [NFR-03][nfr]

#### Q-008 · Is the week-1 test code thrown away, or does it become the start of Foundation?
- **In plain words:** this decides whether the week-1 code is written quickly as throw-away probes, or carefully, with tests, as the first real code.
- **Options / recommendation:** none in the docs.
- **Who answers:** Super Admin · **Blocks:** Week-1 spike (M2) and Foundation (M3)
- **Sources:** [roadmap OQ 2][rm-q]

#### Q-009 · Which tool proves that two bookings at the same moment never both succeed?
- **In plain words:** the most important test is that two people booking the last set at the same instant never both win. That test needs two database connections that overlap on purpose.
- **Options / recommendation:** [test plan §1.5][tp-15] **[P]**: `dblink` inside pgTAP, or a small two-connection script. Either must hold the first transaction open while the second waits.
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E2.3 live-claim guard and its tests)
- **Sources:** [test plan OQ 2][tp-q] · [test plan §1.5][tp-15]

#### Q-010 · Should mobile numbers that start with +638 be accepted?
- **In plain words:** the form accepts only numbers in the 09… / +639… form. Research says some valid Philippine mobile numbers may start with +638 **[U]**. If so, those customers could not book.
- **Example:** a customer types a valid number that starts with +638 and is told it is not a valid mobile number.
- **Options / recommendation:** [architecture OQ 15][arch-q] asks whether [BR-11][br] should be reviewed, and whether to use `libphonenumber-js` (with full metadata) for normalization. If BR-11 changes, the data model's `reservations_mobile_chk` changes after it.
- **Who answers:** Super Admin, with the Admin (BR-11 is a business rule) · **Blocks:** Foundation (M3; E2.4 `app.normalize_mobile`) and Core booking (M4; E7.1)
- **Sources:** [architecture OQ 15][arch-q] · [data model §13][data-q] (table) · [BR-11][br]

#### Q-011 · Which values are allowed for prices, stock, and settings?
- **In plain words:** the system needs limits on what admins can type. Can a price be ₱0? Can daily stock be 0? What range is allowed for deadlines, the notice period, email caps, rate limits, and retention periods?
- **Example:** the Admin enters ₱0 as the price of a free extra microphone. Is it accepted or refused?
- **Options / recommendation:** [API OQ 33][api-q] **[P]**: prices must be more than ₱0; a block range covers at most 62 dates. [Data model §4][data] **[P]**: text length limits. [Data model OQ 13][data-q] **[P]**: new defaults such as 5 email send attempts. The valid ranges of the settings are still open ([API OQ 24][api-q]); they become the database checks and `app.setting_value_is_valid`.
- **Who answers:** Admin (prices and stock), Super Admin (settings) · **Blocks:** Foundation (M3; E2.2 table checks, E4.1 settings screen)
- **Sources:** [administration OQ 13][admin-q] · [API OQ 24, OQ 33][api-q] · [data model OQ 13][data-q] · [staff guide OQ B][staff-q]

#### Q-012 · Two login questions without a proposal: a forced password change, and moving 2FA alone
- **In plain words:** (a) must a new or reset password be changed at the next login? (b) After logging in with a backup code, can an admin move the 2FA app to a new phone alone, or does the Super Admin have to reset it?
- **Example:** the Admin's phone is lost. She logs in with a backup code. Can she set up the authenticator app on her new phone herself?
- **Options / recommendation:** (a) Better Auth has no built-in flag for a forced change ([security OQ 4][sec-q]). (b) none. The rest of the password and backup-code rules are proposed in [security OQ 4 and OQ 5][sec-q] (Q-104, Q-105).
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E3.1 login, E3.4 accounts screen)
- **Sources:** [security OQ 4][sec-q] · [administration OQ 7, OQ 8][admin-q] · [staff guide OQ B][staff-q]

#### Q-013 · What happens to disabled and former admin accounts?
- **In plain words:** (a) can a disabled account be switched on again, or is a new account always made? (b) Who deletes a former admin's login details within 30 days ([privacy and retention §6.2][priv]): the automatic clean-up, or the Super Admin by hand? (c) Is there a "change role" action at all?
- **Options / recommendation:** [data model OQ 8][data-q] **[P]**: admin user rows are scrubbed, never deleted, so acknowledgments keep "received by"; it needs this answer. None for (a) to (c).
- **Who answers:** Super Admin · **Blocks:** Foundation (M3; E3.4 accounts screen); part (b) also the retention job (E19.1)
- **Sources:** [administration OQ 11][admin-q] · [data model OQ 8][data-q] · [test plan OQ 6][tp-q] (TC-DB-91)

#### Q-014 · Confirm the [P] proposals that Foundation builds on
- **In plain words:** Foundation sets up the code repository, the automatic checks, the whole database structure, login with 2FA, and the settings. The technical docs propose how; those proposals must be confirmed or corrected before Foundation starts.
- **Which ones:** [architecture OQ 1, 2, 8, 10][arch-q] (toolchain, migrations from the developer's laptop, environment variables and one `CRON_SECRET`, CI details) · [data model OQ 1 to 5, 7 to 10, 13][data-q] (one claims table, the `admin_auth` schema, money in centavos, the urgent flag computed, new reservation columns, guard triggers, scrubbed admin rows, no raw IP addresses, reads only through the view, new defaults) · [API OQ 1 to 5, 8, 9][api-q] (call layout, the session check, field limits, the result format, error handling, versions, wire formats) · [security OQ 1 to 13, 30, 31][sec-q] (login, authorization, logging, role timeouts, platform settings) · [ops OQ 1 to 11][ops-q] (environments and setup) · [roadmap OQ 3, 4, 10][rm-q] (all tables in Foundation, the keep-alive in Foundation, one plan per phase) · [test plan OQ 12][tp-q] (test conventions).
- **The questions they answer** for Foundation are Q-095 to Q-097 and Q-099 to Q-110 in section 3.5.2.
- **Who answers:** Super Admin · **Blocks:** Foundation (M3)
- **Sources:** the open-question lists named above

---

### 3.2 Business decisions for the business owner

*For the business owner (Admin). Each entry has a made-up example. Where the docs already suggest an answer, it is shown; you can accept it or choose differently.*

**Customer website and calendar (needed for Core booking, M4)**

#### Q-015 · Which language is the customer website in?
- **Why it matters:** every page and every email is written in it. The docs are in English (D-23), but no doc sets the language of the screens.
- **Example:** a customer reads "Pending Confirmation" on the status page. Is English enough, or should there also be a Filipino or Taglish version?
- **Options / recommendation:** English only, or English plus a Filipino (or Taglish) version. No recommendation.
- **Who answers:** Admin · **Blocks:** Core booking (M4; every public page), Notifications and jobs (M7; email texts)
- **Sources:** [UX OQ B1][ux-q]

#### Q-016 · What name, logo, and brand colours does the website use?
- **Why it matters:** none is set anywhere. Until then, the screens use a plain, neutral look.
- **Example:** the home page shows "DJB Kasoundbox" in plain black text, or your logo in your colours.
- **Options / recommendation:** none. The build can go ahead with the neutral look.
- **Who answers:** Admin · **Blocks:** Core booking (M4) for the final look; needed before Launch
- **Sources:** [UX OQ B2][ux-q]

#### Q-017 · Must the customer give a name?
- **Why it matters:** only the mobile number is required now (the email is optional). The acknowledgment prints the name as "received from".
- **Example:** Ben books with only his mobile number. His acknowledgment would say "received from" with no name.
- **Options / recommendation:** required or optional; the system is ready for either.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E7.1)
- **Sources:** [booking OQ 7][book-q] · [API OQ][api-q] (provisional defaults) · [UX OQ C][ux-q]

#### Q-018 · For a delivery, are the street and landmarks required?
- **Why it matters:** the barangay and city are required. The street and landmarks help staff find the venue.
- **Example:** a customer types only the barangay and city, with no street. Accept the request, or ask for the street first?
- **Options / recommendation:** required or optional. No recommendation.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E7.1)
- **Sources:** [FR §7 Q6][fr-q] · [booking WF-01][book] (step 4) · [UX OQ C][ux-q] · [test plan OQ 6][tp-q] (TC-UT-01)

#### Q-019 · What if a price changes, or an item is removed, while a customer is filling in the form?
- **Why it matters:** the saved price is the one at the moment of Submit, but the customer pays the price they saw (D-12).
- **Example:** Ana sees Package A at ₱3,000. While she types her details, the Admin changes it to ₱3,500. She presses Submit.
- **Options / recommendation:** refuse at Submit and show the new details, or accept. No recommendation.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E7.2)
- **Sources:** [booking OQ 4][book-q]

#### Q-020 · Should the confirmation page repeat a summary of the booking?
- **Why it matters:** the requirement does not list a summary on that page.
- **Example:** after Submit, the page shows "Thu 24 Dec, delivery, Package A, total ₱3,400", or only the reference code and a link to the status page.
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E7.3)
- **Sources:** [UX OQ B3][ux-q]

#### Q-021 · When online booking is paused, should the home and packages pages say so too?
- **Why it matters:** today the banner is only on the calendar and the form ([BR-07a][br]).
- **Example:** a customer reads the packages page for ten minutes and learns about the pause only when she opens the calendar.
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E9.1, E5.3)
- **Sources:** [UX OQ B4][ux-q]

#### Q-022 · How does a customer get a QR code that cannot be shown twice?
- **Why it matters:** for safety, the system keeps only a scrambled fingerprint of each QR code, so it cannot show the same QR code again. This affects three cases: (a) a customer presses Submit twice, or the network fails, and the repeat cannot show the QR code; (b) a phone or Facebook customer without email; (c) after an admin makes a new QR code.
- **Example:** Dan books by phone and has no email. How does he receive his QR code?
- **Options / recommendation:** [UX §8 proposal 12][ux-8] **[P]**: after an admin creates a booking or a new QR code, the screen shows it once, with "Save QR code" and "Print"; the admin can show it, print it, or send the saved picture by Messenger or SMS. For (a), [API OQ 7][api-q] (provisional): the repeat shows the reference code and links to the status page, where "Get a new QR code" works. An alternative token design ([security §4.5.4][sec-454], option C) would let a QR code be shown again, at some security cost.
- **Who answers:** Admin, with the Super Admin · **Blocks:** Core booking (M4; E7.3), Admin review (M5; E10.6, E13.1)
- **Sources:** [FR §7 Q4][fr-q] · [lookup OQ 14][review-q] · [booking OQ 2][book-q] · [UX §8 proposal 12][ux-8] · [security §4.5.4][sec-454] · [API OQ 7][api-q] · [test plan OQ 6][tp-q] · [staff guide OQ B][staff-q]

#### Q-023 · On which statuses can a new QR code be made, and how often?
- **Why it matters:** a QR code stops working at Rejected, Cancelled, Expired, and Completed.
- **Example:** a customer asks for a new QR code after her event is Completed. Or someone presses "Get a new QR code" ten times in a minute.
- **Options / recommendation:** [API][api] (provisional): only while Pending Confirmation, Awaiting Deposit, or Confirmed. [Security OQ 21][sec-q] **[P]**: a customer's new QR code counts as a status lookup, at most 3 per reservation per hour.
- **Who answers:** Admin, with the Super Admin · **Blocks:** Core booking (M4; E8.4), Admin review (M5; E10.6)
- **Sources:** [lookup OQ 7][review-q] · [notifications OQ 13][notify-q] · [security OQ 21][sec-q] · [UX OQ C][ux-q] · [staff guide OQ B][staff-q]

#### Q-024 · When blocking several dates, what if one date is already booked?
- **Why it matters:** a block is refused when its target is taken ([BR-08][br]).
- **Example:** the Admin blocks Set 2 from Sunday 20 to Thursday 24 December for repairs, but Ben has Set 2 on Tuesday 22 December. Is the whole block refused, or are the other four dates blocked?
- **Options / recommendation:** [API][api] (provisional): the whole range is refused, and the message names the clashing booking ([FR-ADM-25][fr] **[P]**).
- **Who answers:** Admin · **Blocks:** Core booking (M4; E6.3)
- **Sources:** [EC §15 Q1][ec-q] · [API OQ][api-q] (provisional defaults) · [test plan OQ 6][tp-q] (TC-DB-25) · [staff guide OQ B][staff-q]

#### Q-025 · Can a block be made for a past date or far ahead, and can an old block be removed?
- **Why it matters:** the rules do not say whether a block may be in the past or beyond the 180-day booking window, or removed on or after its date.
- **Example:** the Admin forgot to block last Sunday and wants to record it now.
- **Options / recommendation:** [API][api] (provisional): a block cannot start before today.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E6.3)
- **Sources:** [administration OQ 19][admin-q] · [API OQ][api-q] (provisional defaults)

#### Q-026 · Does a whole-date block also cover a set added later?
- **Why it matters:** a whole-date block covers the sets that exist when it is made. A new set would show that date as Available.
- **Example:** you block Friday 1 January 2027 (closed for New Year). In November you add Set 3. As written, 1 January shows Available for delivery with Set 3.
- **Options / recommendation:** none. If yes, adding a set also adds it to future whole-date blocks ([data model §13][data-q]).
- **Who answers:** Admin · **Blocks:** Core booking (M4; E5.2, E6.3)
- **Sources:** [availability OQ 6][avail-q] · [data model §13][data-q] (table) · [test plan OQ 6][tp-q] (TC-DB-26)

#### Q-027 · Does a booking for today block a stock change?
- **Why it matters:** stock cannot be lowered, and an item cannot be archived, while a *future* booking uses it ([BR-10][br]). It is not said whether today counts as future.
- **Example:** three extra microphones break this morning, so the Admin lowers the daily stock from 4 to 1. Ana's booking today uses 2. Is the change refused?
- **Options / recommendation:** [API][api] (provisional): today counts as future, so the change is refused.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E5.1)
- **Sources:** [availability OQ 7][avail-q] · [API OQ][api-q] (provisional defaults)

#### Q-028 · Can an archived item be brought back, or still be edited?
- **Why it matters:** the docs describe archiving a package, add-on, or slot, and deactivating a set or the room, but not undoing it.
- **Example:** you archive the "Christmas package" in January and want it back in November.
- **Options / recommendation:** [API][api] (provisional): an archived item cannot be edited. Bringing it back: none.
- **Who answers:** Admin · **Blocks:** Foundation (M3; E4.2 slots), Core booking (M4; E5.1, E5.2)
- **Sources:** [administration OQ 14][admin-q] · [API OQ][api-q] (provisional defaults) · [staff guide OQ B][staff-q]

#### Q-029 · After a delivery slot's times change, what do existing bookings show?
- **Why it matters:** a booking keeps the start time it was saved with ([reservation lifecycle §3.1][lc]).
- **Example:** the "Evening" slot moves from 5:00 PM to 6:00 PM. Ben's booking stays at 5:00 PM. Do his status page and emails say "Evening, 5:00 PM" or the new "Evening, 6:00 PM"?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Foundation (M3; E4.2), Core booking (M4; E8.3)
- **Sources:** [administration OQ 16][admin-q]

#### Q-030 · Exact boundaries in three rules
- **Why it matters:** the tests need to know which side of a limit an exact value falls on.
- **Example:** (a) a request for a date exactly 180 days ahead: inside the booking window? (b) at 5:00 PM the Admin enters a phone booking for 6:00 PM, exactly the 1-hour notice: a normal booking, or the one-step kind? (c) six online requests since 7:00 PM, and a seventh at exactly 8:00 PM: "within 60 minutes", so online booking pauses?
- **Options / recommendation:** the test plan reads (a) as inside and (b) as a normal booking. (c) is not settled.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E6.2, E7.2), Admin review (M5; E13.1)
- **Sources:** [test plan OQ 5a to 5c][tp-q]

#### Q-031 · Do you want any of the anti-abuse ideas that were not adopted?
- **Why it matters:** research suggested more limits that the rules do not include. Each would be a new business rule.
- **Example:** requests waiting for review or deposit ("holds") that end a set time before the event (say, one day) even if the 72 hours have not run out; a daily limit for the automatic pause; a limit on open requests per internet address per date; a button to release many holds at once.
- **Options / recommendation:** none; the docs left them out.
- **Who answers:** Admin, with the Super Admin · **Blocks:** Documentation (M1), as scope
- **Sources:** [security OQ 33][sec-q]

#### Q-032 · Are two missing capacity tools needed?
- **Why it matters:** without them, the only options are reschedule, cancel, or wait.
- **Example:** (a) Set 1 needs repair on Saturday; Ana is booked on Set 1 that day while Set 2 is free, but there is no "move to another set" action. (b) One microphone is broken for one day only, but stock can be lowered only for every day.
- **Options / recommendation:** none. Each would be a new feature.
- **Who answers:** Admin · **Blocks:** Documentation (M1), as scope
- **Sources:** [administration OQ 18][admin-q] · [staff guide OQ B][staff-q]

**Reviewing requests and taking deposits (needed for Admin review, M5)**

#### Q-033 · One-step phone and walk-in bookings: emails, history, and the late-night case
- **Why it matters:** a staff booking for a time that has started, or is less than 1 hour away, becomes Confirmed in one step.
- **Example:** Rosa walks in at 6:30 PM for the room at 7:00 PM and pays the deposit in cash. (a) Does she get the "request received" email, the "confirmed" email, or both? (b) Does the history show each step (created, approved, deposit recorded)? (c) Who decides that it is one-step: the screen, or the database when saving? (d) A phone booking made at 11:30 PM for 12:15 AM is within the notice period, but its event date is tomorrow, while the waiver needs the event date to be today. Allowed?
- **Options / recommendation:** [API OQ 23][api-q]: both emails (provisional); one history entry per step **[P]**; the database decides when saving **[P]**. (d): none.
- **Who answers:** Admin for (a) and (d); Super Admin for (b) and (c) · **Blocks:** Admin review (M5; E13.1)
- **Sources:** [FR §7 Q1][fr-q] · [lifecycle §9 Q1][lc-q] · [lookup OQ 13][review-q] · [API OQ 23][api-q] · [test plan OQ 6][tp-q] (TC-DB-18, TC-DB-19) · [staff guide OQ B][staff-q]

#### Q-034 · Do the online-only limits also apply when an admin books or changes a booking?
- **Why it matters:** for staff bookings, reschedules, and recreated requests, the docs name only the capacity check. The booking window (180 days), inactive slots, on-site hours, and start times already past are not mentioned.
- **Example:** a regular customer calls to book a date eight months ahead. Can the Admin enter it?
- **Options / recommendation:** [API OQ 33][api-q] **[P]**: a reschedule needs an active slot. The rest: none.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E13.1), Changes and money (M6; E14.3, E14.4)
- **Sources:** [availability OQ 5][avail-q] · [lookup OQ 12][review-q] · [API OQ 33][api-q] · [test plan OQ 6][tp-q] (TC-DB-17)

#### Q-035 · Should the admin's date picker show which dates are free?
- **Why it matters:** admins may see counts and names, but the screens only check the date on saving.
- **Example:** while rescheduling Ana, the Admin picks three full dates in a row before finding a free one.
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E13.1), Changes and money (M6; E14.3)
- **Sources:** [UX OQ B5][ux-q]

#### Q-036 · What do staff do with a part payment of the deposit?
- **Why it matters:** only the exact deposit can be recorded; there are no partial deposits **[P]** ([EC-34][ec]).
- **Example:** the deposit is ₱1,000. A customer sends ₱500 by e-wallet. What happens to the ₱500?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E12.1); the staff procedure for UAT
- **Sources:** [EC §15 Q3][ec-q] · [staff guide][staff] (P-04 and §4 "What to do when…")

#### Q-037 · Can staff enter the actual payment date?
- **Why it matters:** today the acknowledgment shows the day the admin records the payment.
- **Example:** cash is received on Thursday but recorded on Friday. Should the acknowledgment say Thursday?
- **Options / recommendation:** none. If yes, payments get a "paid on" date ([data model §13][data-q]).
- **Who answers:** Admin · **Blocks:** Admin review (M5; E12.1)
- **Sources:** [catalog §10 Q7][cat-q] · [data model §13][data-q] (table) · [staff guide OQ B][staff-q]

#### Q-038 · Does the status page still show a voided acknowledgment?
- **Why it matters:** a wrongly recorded payment can be voided (D-24), and its acknowledgment number is retired.
- **Example:** a ₱1,000 deposit is recorded on the wrong booking and voided. Does the customer still see `ACK-2026-0007`, marked void, or is it hidden?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E12.4), Changes and money (M6; E15.2)
- **Sources:** [catalog §10 Q5][cat-q] · [UX OQ C][ux-q] · [staff guide][staff] (P-18)

#### Q-039 · What does the Booking Confirmation show, and how long can the customer open it?
- **Why it matters:** the spec does not list its contents, or say whether it stays available after Completed or Cancelled.
- **Example:** after her event, Ana wants to print her Booking Confirmation for her records.
- **Options / recommendation:** [API OQ 19][api-q] (provisional): only while Confirmed. Contents: none.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E12.4)
- **Sources:** [catalog §10 Q6][cat-q] · [API OQ 19][api-q] · [UX OQ C][ux-q] · [test plan OQ 6][tp-q]

#### Q-040 · Should the delivery-area check be saved as a record?
- **Why it matters:** an admin must check that a delivery address is inside the service area before approving (D-11). It is not said whether that check is recorded.
- **Example:** a customer later says "you approved my address, so you must deliver". A saved tick shows the check was done.
- **Options / recommendation:** [UX §8 proposal 11][ux-8] **[P]**: the Approve window shows the venue and a tick box, "I checked that this venue is inside our service area", and Approve works only after it is ticked. Whether the tick is saved: open.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E11.1)
- **Sources:** [lookup OQ 8][review-q] · [UX §8 proposal 11][ux-8] · [data model §13][data-q] (table)

#### Q-041 · Can a "needs info" message be changed or sent again?
- **Why it matters:** decides whether the customer gets a second email, and what the status page shows afterwards.
- **Example:** the Admin flags Ana's request: "Please send a landmark." An hour later she flags it again: "Also confirm the arrival time." Does Ana get a second email? Is the message kept after "Info received"?
- **Options / recommendation:** [API][api] (provisional): flagging again replaces the message and sends a new email; "Info received" keeps the old message but hides it from the status page. [API OQ 15][api-q] **[P]**: the message is shown only while Pending Confirmation.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E11.2)
- **Sources:** [lookup OQ 9][review-q] · [API OQ 15][api-q] · [test plan OQ 6][tp-q] (TC-DB-54)

#### Q-042 · Payment pictures that are still waiting for review
- **Why it matters:** a customer can upload a picture of their payment (a "proof"). The rules do not say what happens when things move on before an admin checks it.
- **Example:** Carla uploads a picture of her e-wallet payment, then walks in and pays cash before anyone checks it. (a) Could she have uploaded a second picture while the first was waiting? (b) What happens to the waiting picture, the "proofs to verify" list, and the paused deadline? (c) If her booking is cancelled or expires instead, does the picture leave the list?
- **Options / recommendation:** [API OQ 16][api-q] (provisional): one picture under review at a time. [API OQ 21][api-q] **[P]**: "proofs to verify" lists only Awaiting Deposit bookings. (b): none. When the picture is deleted is Q-083.
- **Who answers:** Admin, with the Super Admin · **Blocks:** Admin review (M5; E12.2, E12.3)
- **Sources:** [notifications OQ 15][notify-q] · [lookup OQ 10][review-q] · [changes OQ 2][change-q] · [API OQ 16, OQ 21][api-q] · [data model §13][data-q] (table)

#### Q-043 · While a payment picture waits, is the reminder sent, and which deadline is shown?
- **Why it matters:** uploading a picture pauses the deadline (D-05). The 6-hour reminder and the status page deadline are not settled for that case.
- **Example:** Dan's deposit deadline is 6:00 PM, so his reminder is due at 12:00 noon. He uploads a picture at 11:00 AM. Is the noon reminder still sent? What deadline does his status page show?
- **Options / recommendation:** [API][api] (provisional): no reminder while the deadline is paused. The deadline shown: none.
- **Who answers:** Admin · **Blocks:** Core booking (M4; E8.3 status page), Notifications and jobs (M7; E18.2)
- **Sources:** [FR §7 Q2][fr-q] · [UX OQ C][ux-q] · [API OQ][api-q] (provisional defaults) · [test plan OQ 6][tp-q] (TC-DB-79) · [staff guide OQ B][staff-q]

#### Q-044 · After you resume online booking early, does the count start fresh?
- **Why it matters:** online booking pauses when a 7th online request would arrive within 60 minutes (D-16). Right after an early resume, the count of the last hour can still be 6.
- **Example:** six requests arrive between 8:00 and 8:40 PM, and the seventh pauses online booking. You check they are real and resume at 8:45 PM. At 8:50 PM a real customer submits, and online booking pauses again.
- **Options / recommendation:** resume restarts the count, or not. None. If it does, a new setting is needed ([data model §13][data-q]). Pressing resume after the pause has already ended: [UX §8 proposal 14][ux-8] **[P]** shows "Online booking is already open", and [API OQ 25][api-q] **[P]** writes nothing.
- **Who answers:** Admin · **Blocks:** Admin review (M5; E10.1)
- **Sources:** [administration OQ 17][admin-q] · [UX §8 proposal 14][ux-8] · [API OQ 25][api-q] · [data model §13][data-q] (table) · [test plan OQ 6][tp-q] (TC-DB-23)

#### Q-045 · How do staff check who is asking for a forgotten reference code?
- **Why it matters:** the privacy rules use the reference code and mobile number as the identity check ([privacy and retention §5.4][priv]), but this customer no longer has the code.
- **Example:** someone messages from a new Facebook account: "I'm Ana, I lost my code."
- **Options / recommendation:** [staff guide OQ A2][staff-q] **[P]**: search by full mobile number or name, and give the code only to the person on the booking. How to confirm that person: none.
- **Who answers:** Admin · **Blocks:** UAT (M9; staff procedures)
- **Sources:** [staff guide OQ A2][staff-q] · [privacy and retention §5.4][priv]

**Changes, cancellations, and money (needed for Changes and money, M6)**

#### Q-046 · Refund rules
- **Why it matters:** the refund decision is shown to the customer, and the money recorded must match it.
- **Example:** Ana paid a ₱1,000 deposit and a ₱2,400 balance, then the event is cancelled. (a) Is a "full" refund ₱1,000 (the deposit) or ₱3,400 (everything paid)? (b) After a same-day waiver, a customer paid only a balance: is a refund decision asked? (c) Must the refund paid equal the decided amount, and can it be paid in parts? (d) Can a refund be recorded when the decision was "none"?
- **Options / recommendation:** [API][api] (provisional): (b) a refund decision is optional when only a balance was paid; (d) refused, a refund is recorded only after a partial or full decision. **[P]**: a partial or full amount must be more than ₱0 and at most what was paid. (a) and (c): none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E15.3, E15.4)
- **Sources:** [catalog §10 Q3, Q4][cat-q] · [lifecycle §9 Q2][lc-q] · [changes OQ 10][change-q] · [API OQ][api-q] (provisional defaults) · [test plan OQ 6][tp-q] · [staff guide OQ B][staff-q]

#### Q-047 · Can the balance be paid in parts?
- **Why it matters:** the screen fills in "total minus what was paid" as the default.
- **Example:** a customer pays half the balance at setup and the rest at pickup. Can both be recorded, and does the second default subtract the first?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E15.1)
- **Sources:** [catalog §10 Q1][cat-q] · [test plan OQ 6][tp-q] · [staff guide OQ B][staff-q]

#### Q-048 · After a waived deposit, what balance is filled in?
- **Why it matters:** the default is "total minus deposit", but a waived deposit was never paid.
- **Example:** Rosa's same-day booking totals ₱3,400 and her deposit was waived. The screen fills in ₱2,400, but she owes ₱3,400.
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E15.1)
- **Sources:** [EC §15 Q5][ec-q] · [test plan OQ 6][tp-q] (TC-UT-13) · [staff guide][staff] (P-08, P-15)

#### Q-049 · After voiding a wrong deposit on a Confirmed booking, can the right one be recorded?
- **Why it matters:** after a waiver, a deposit can still be recorded on a Confirmed booking. After a void, it is not said.
- **Example:** on Ana's Confirmed booking, the Admin recorded her ₱1,000 as cash, but it was e-wallet. She voids it. Can she now record it correctly?
- **Options / recommendation:** [API][api] (provisional): refused until answered. The staff guide says to ask the Super Admin before voiding such a deposit.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E15.2)
- **Sources:** [FR §7 Q3][fr-q] · [API OQ][api-q] (provisional defaults) · [test plan OQ 6][tp-q] (TC-DB-59) · [staff guide][staff] (P-18)

#### Q-050 · When an admin adds more of an add-on already booked, which price applies?
- **Why it matters:** items already booked keep their saved price; newly added items take today's price.
- **Example:** Dan booked 1 extra microphone at ₱200. The price is now ₱250. The Admin raises his quantity to 2. Is the second one ₱200 or ₱250?
- **Options / recommendation:** none. The answer changes how booked add-ons are stored ([data model §13][data-q]).
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.1); the table layout in Foundation (E2.2)
- **Sources:** [catalog §10 Q2][cat-q] · [data model §13][data-q] (table)

#### Q-051 · If an admin changes a request's mobile number, do the limits apply to the new number?
- **Why it matters:** each mobile number may have 1 open request per date and 2 in total (D-16).
- **Example:** Eva's request is changed to her sister's number, which already has 2 open requests.
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.1)
- **Sources:** [changes OQ 6][change-q]

#### Q-052 · If an admin changes or removes the email address, where do emails go?
- **Why it matters:** decides who gets the "reservation updated" email, and what happens to emails already waiting for the old address.
- **Example:** Ben asks to change his email. Does the "updated" email go to the new address? Is a reminder already queued for the old address still sent there?
- **Options / recommendation:** [API][api] (provisional): the "updated" email goes to the address as it is after the change. Queued emails: none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.1)
- **Sources:** [changes OQ 7][change-q] · [API OQ][api-q] (provisional defaults) · [staff guide OQ B][staff-q]

#### Q-053 · Can a booking switch between delivery and on-site?
- **Why it matters:** neither "reschedule" nor "edit details" changes the service type.
- **Example:** Ben booked delivery but decides to come to the room instead. Is that a change, or a cancel and a new booking?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.1, E14.3)
- **Sources:** [changes OQ 3][change-q] · [staff guide OQ B][staff-q]

#### Q-054 · Must "extend a deadline" always make it later?
- **Why it matters:** the action could also be used to shorten a deadline.
- **Example:** the Admin types a new deadline that is earlier than the current one.
- **Options / recommendation:** [changes OQ 5][change-q] **[P]**: refused unless it is later than the current deadline. [API OQ 33][api-q] **[P]**: it must also be later than now.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.2)
- **Sources:** [changes OQ 5][change-q] · [API OQ 33][api-q]

#### Q-055 · A deadline is extended while a payment picture waits, then the picture is rejected. Which deadline applies?
- **Why it matters:** the rule says "the original deadline applies again" ([BR-12][br]), but not whether that is before or after the extension.
- **Example:** Carla's deadline is Monday 2:00 PM. She uploads a picture Monday morning. The Admin extends her deadline to Tuesday 2:00 PM. On Monday at 3:00 PM the picture is rejected. Does her request expire at once, or run until Tuesday?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.2), Admin review (M5; E12.3)
- **Sources:** [EC §15 Q4][ec-q] · [test plan OQ 6][tp-q] (TC-DB-37, TC-DB-56) · [staff guide][staff] (P-10)

#### Q-056 · When a deposit deadline moves, what happens to the reminder?
- **Why it matters:** a reschedule can move the deadline earlier, and an extension moves it later. The reminder rules cover only the first deadline.
- **Example:** the reminder comes 6 hours before the deadline. At 1:00 PM the Admin extends Dan's 3:00 PM deadline to 5:00 PM. The new reminder time (11:00 AM) has already passed. Is a reminder sent at once, or not at all? And a reminder already waiting for the old deadline: skipped, or sent with the new deadline?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.2, E14.3), Notifications and jobs (M7; E18.2)
- **Sources:** [changes OQ 4][change-q] · [notifications OQ 7][notify-q]

#### Q-057 · Does a recreated request count toward the customer's limit of open requests?
- **Why it matters:** a recreated request is exempt from the online limits ([BR-07][br]), but it keeps the original's "online" source, so it might count against the customer's next online request.
- **Example:** Eva's online request expired, and the Admin recreates it. Later that day Eva books another date online. Is the recreated one counted as one of her 2 open requests?
- **Options / recommendation:** [API][api] (provisional): the source is copied from the original. Whether it counts: none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.4)
- **Sources:** [changes OQ 9a][change-q] · [changes, source note 4][change-notes] · [test plan OQ 7][tp-q] (TC-DB-21) · [data model §13][data-q] (table)

#### Q-058 · Recreating an expired request: a start time already past, removed items, and more than once
- **Why it matters:** recreate makes a new request from an expired one.
- **Example:** (a) the party time has already passed. (b) The original's package was archived since. (c) The same expired request is recreated twice.
- **Options / recommendation:** [API][api] (provisional): (a) refused, because the new request would be overdue at once; (b) refused while the package, add-ons, or slot are inactive. (c): none. The staff guide suggests a new staff booking for a walk-in whose time has started.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E14.4)
- **Sources:** [EC §15 Q2][ec-q] · [changes OQ 9c, OQ 9d][change-q] · [API OQ][api-q] (provisional defaults) · [test plan OQ 6][tp-q] (TC-DB-41) · [staff guide][staff] (P-17)

#### Q-059 · How is a mistaken cancel undone?
- **Why it matters:** Cancelled is final, and nothing is ever deleted.
- **Example:** the Admin cancels Ben's booking instead of Dan's, or marks the wrong event "not held". Is the fix a new staff booking, with a new reference code and today's prices?
- **Options / recommendation:** none.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E15.3, E16.2)
- **Sources:** [changes OQ 1][change-q] · [staff guide OQ B][staff-q]

#### Q-060 · Does marking an event "not held" send the cancelled email?
- **Why it matters:** the customer may not know otherwise.
- **Example:** Dan's event was rained out, and the Admin marks it "not held" with a refund decision.
- **Options / recommendation:** [test plan OQ 6][tp-q] (provisional): no email. The staff guide says to tell the customer yourself.
- **Who answers:** Admin · **Blocks:** Changes and money (M6; E16.2)
- **Sources:** [FR §7 Q7][fr-q] · [test plan OQ 6][tp-q] (TC-DB-49) · [staff guide][staff] (P-16)

**Emails, backups, and outages (needed for Notifications and jobs, M7, and later)**

#### Q-061 · Is a reminder in the middle of the night acceptable?
- **Why it matters:** with the default 6-hour lead time, an early deadline gives a night-time reminder.
- **Example:** a 10:00 AM deadline gives a 4:00 AM reminder.
- **Options / recommendation:** accept, or set another rule for night-time reminders. None.
- **Who answers:** Admin · **Blocks:** Notifications and jobs (M7; E18.2)
- **Sources:** [notifications OQ 9][notify-q] · [staff guide OQ B][staff-q]

#### Q-062 · When an email fails, what do staff do?
- **Why it matters:** the health panel shows failed emails, but there is no "send again" button.
- **Example:** Ana's "approved" email bounces. Does she still learn that she must pay the deposit?
- **Options / recommendation:** [ops OQ 30][ops-q] and [staff guide OQ A3][staff-q] **[P]**: until a rule exists, staff message or call the customer. The ready-made message appears only for customers with no email ([UX §8 proposal 8][ux-8]).
- **Who answers:** Admin, with the Super Admin · **Blocks:** Notifications and jobs (M7; E17.3, E20.2)
- **Sources:** [notifications OQ 5][notify-q] · [ops OQ 30][ops-q] · [staff guide OQ A3][staff-q]

#### Q-063 · What happens to payment pictures after a restore from backup?
- **Why it matters:** payment pictures are never backed up, by design ([NFR-27][nfr]). After a restore, a booking whose picture was waiting still has a paused deadline but no picture to check.
- **Example:** after a restore, Carla's booking says "proof waiting for review", but the picture is gone.
- **Options / recommendation:** reject the proof and ask for a new upload, or check the payment another way. None.
- **Who answers:** Admin · **Blocks:** Hardening (M8; the restore runbook); gate G10
- **Sources:** [ops OQ 23][ops-q]

#### Q-064 · If the website is down, how do staff take bookings without double-booking?
- **Why it matters:** phone and walk-in customers still call while the site is down.
- **Example:** the website is down on a Saturday morning, and two people call for the same date and set.
- **Options / recommendation:** [ops "In plain words" and §7.1][ops]: keep taking bookings by phone and Facebook, write them down, and enter them when the site is back. [Architecture §12.4][arch] **[P]**: enter them as staff bookings through the same locked function; the Super Admin can read the reservations in the Supabase dashboard meanwhile. How staff avoid promising the same set twice while the site is down: open.
- **Who answers:** Admin, with the Super Admin · **Blocks:** gate G20 (runbooks); UAT (M9)
- **Sources:** [staff guide OQ A4][staff-q] · [ops][ops] §7.1 · [architecture][arch] §12.4

#### Q-065 · Should the way out of Vercel be agreed in advance?
- **Why it matters:** Vercel's free plan may disable the project (accepted knowingly, D-20). Agreeing the exit option now lets the developer act the same day.
- **Example:** on a Friday, Vercel disables the site. Option A is Vercel's paid plan; option B is another host ([architecture §12.3][arch]).
- **Options / recommendation:** agree A or B in advance. Paying for either is still a new decision ([NFR-01][nfr]).
- **Who answers:** Admin · **Blocks:** gate G20 (runbooks)
- **Sources:** [architecture OQ 13][arch-q]

#### Q-066 · Practical arrangements for the UAT session
- **Why it matters:** the session runs on your own phone, with test data.
- **Example:** one case needs 7 test mobile numbers (numbers are not verified, so no SIM cards); real emails go only to the two admins' own addresses; your phone needs the authenticator app before the session.
- **Options / recommendation:** confirm these with the Super Admin before the UAT date.
- **Who answers:** Admin · **Blocks:** UAT (M9)
- **Sources:** [test plan OQ 9][tp-q]

---

### 3.3 Content to provide

*For the business owner (Admin). The build uses made-up content until these arrive.*

#### Q-067 · O-02 · Delivery slot times and on-site hours
- **What is needed:** the delivery slots (name, start, and end) and the on-site opening hours.
- **Also decide:** (a) are on-site hours the same every day, or different per weekday? (b) Does every slot stay within one day? (c) Is the closing time itself a valid arrival time?
- **Example:** "Evening, 6:00 PM to 11:00 PM" works. "Late, 10:00 PM to 2:00 AM" crosses midnight, which the proposed database rule refuses.
- **Options / recommendation:** [data model OQ 14][data-q] **[P]**: one opening and closing time for on-site hours. [Data model OQ 16][data-q] **[P]**: slots cannot cross midnight. [UX §8 proposal 15][ux-8] **[P]**: arrival times in 30-minute steps. [Roadmap OQ 18][rm-q]: if (a) is not answered by Core booking, build one set of hours first and change it later.
- **Who answers:** Admin · **Blocks:** the shape by the start of Core booking (M4); the values by the start of UAT; gate G12
- **Sources:** [decision log O-02][dl-3] · [data model OQ 14, OQ 16][data-q] · [roadmap OQ 18][rm-q] · [availability OQ 8][avail-q] · [UX §8 proposal 15][ux-8] · [test plan OQ 5d][tp-q]

#### Q-068 · O-03 · Packages, prices, stock, deposit, sets, and deposit texts
- **What is needed:** the package and add-on list with prices; the daily stock of each add-on; the deposit amount; the delivery sets; the deposit instructions (e-wallet name, number, and account name; office address and hours); and the deposit terms text.
- **Who answers:** Admin · **Blocks:** start of UAT; gate G12
- **Sources:** [decision log O-03][dl-3] · [catalog and payments][cat] · [roadmap §6][rm-6]

#### Q-069 · O-04 · Confirm the free-delivery wording
- **What is needed:** confirm or change: *"Delivery is free within our service area; we confirm your address during review."* No area list is kept (D-11).
- **Who answers:** Admin · **Blocks:** end of Core booking (M4; it appears on the packages page, the form, and the FAQ); gate G12
- **Sources:** [decision log O-04][dl-3] · [catalog and payments][cat]

#### Q-070 · O-05 · Web address, Facebook Page, and business email
- **What is needed:** buy a domain name, or use the free `vercel.app` address; a Facebook Page; a business email address.
- **Why it matters:** the email sender depends on it. If Resend's free plan sends only to the account's own address until a domain is verified **[U]**, customer emails need a domain, so O-05 must be decided before launch ([ops OQ 44][ops-q]). QR codes already handed out keep working after a move only with your own domain ([NFR-31][nfr]).
- **Example:** with only `kasoundbox.vercel.app` (made-up), a later move to another host would change every printed QR code.
- **Who answers:** Admin · **Blocks:** start of Notifications and jobs (M7; the sender address); gates G12, G13
- **Sources:** [decision log O-05][dl-3] · [ops OQ 44][ops-q] · [roadmap §6][rm-6]

#### Q-071 · Business info, contact details, and FAQ text
- **What is needed:** the business info shown on the contact page, and the questions and answers for the FAQ, written with O-03 and O-04.
- **Who answers:** Admin · **Blocks:** gate G12 (no setting left "not set"); the content checks in UAT
- **Sources:** [test plan OQ 10][tp-q] · [FR-PUB-16][fr] **[P]** · [ops §10][ops-10] (row 12)

#### Q-072 · A short written service-area guide for staff
- **Why it matters:** the system keeps no area list (D-11). A short guide outside the system would help both admins decide the same way.
- **Example:** one admin accepts a venue on the edge of town and the other refuses a similar one.
- **Who answers:** Admin · **Blocks:** UAT (M9), not the build
- **Sources:** [staff guide OQ A5][staff-q]

---

### 3.4 Legal and compliance

*For the business owner, the lawyer, and the CPA. Many of these are about how long data is kept ("retention") and how a customer's request to delete their data ("erasure") is handled.*

#### Q-073 · O-08 · Vendor terms, and the lawyer's one-time review
- **What is needed:** (a) read the service providers' terms and data processing agreements in full, and save dated copies (Super Admin). Should GitHub's and Cloudflare's terms be included, not only Vercel, Supabase, Resend, and Sentry? (b) A one-time review by a Philippine lawyer of privacy and retention, including the retention periods, every [U] legal item (for example, who the "personal information controller" is in law), the NPC's 72-hour breach-notification rule, and where GitHub and Cloudflare keep data.
- **Who answers:** Super Admin (a); lawyer (b) · **Blocks:** gates G3 and G4
- **Sources:** [decision log O-08][dl-3] · [privacy §9][priv-9] · [privacy §11 Q14][priv-q] · [security §7][sec-7] · [test plan §4][tp-4] · [NFR-08][nfr] · [glossary][gl]

#### Q-074 · O-09 · Name the data protection officer and set up the privacy contact
- **What is needed:** one of the two admins is named in writing as the DPO (compliance officer), and a privacy contact email is set up.
- **Who answers:** Admin and Super Admin · **Blocks:** gate G6, and G5 (the privacy notice must show the contact); the privacy page (E9.2)
- **Sources:** [decision log O-09][dl-3] · [privacy §9][priv-9]

#### Q-075 · O-10 · Must the SDAU be filed with the NPC?
- **What is needed:** confirm whether the free sworn exemption declaration must be filed.
- **Who answers:** lawyer · **Blocks:** gate G7
- **Sources:** [decision log O-10][dl-3] · [privacy §9][priv-9]

#### Q-076 · O-11 · Business registration, and the name on acknowledgments
- **What is needed:** advice on BIR tax registration, the DTI business name, the barangay clearance, and the mayor's permit, and on using "DJB Kasoundbox" on acknowledgments. The current name is a knowingly accepted risk **[C]** (D-21).
- **Who answers:** CPA or lawyer · **Blocks:** gate G8
- **Sources:** [decision log O-11][dl-3] · [privacy §9][priv-9]

#### Q-077 · Do O-10 and O-11 hold the launch?
- **Why it matters:** the privacy doc sets "no date" for both, and D-21 accepts the acknowledgment-name risk. Must the opening wait for the lawyer's and the CPA's advice, or only for O-08?
- **Who answers:** Admin, with the lawyer · **Blocks:** M10 (gates G7, G8 are **[P]**)
- **Sources:** [roadmap OQ 12][rm-q]

#### Q-078 · Who arranges and pays for the lawyer and CPA reviews, and when?
- **Why it matters:** the ₱0 rule covers running costs only (NFR-01), and no doc says who engages them. The roadmap suggests starting any time after the docs are approved **[P]**.
- **Who answers:** Admin · **Blocks:** gates G4, G7, G8
- **Sources:** [roadmap OQ 13][rm-q] · [roadmap §6][rm-6]

#### Q-079 · If the issuer name changes, what do old acknowledgments show?
- **Why it matters:** after O-11, the issuer name setting may change.
- **Example:** acknowledgments issued in December say "DJB Kasoundbox". In February the registered name changes. Do the December ones keep the old name?
- **Who answers:** CPA or lawyer, with the Admin · **Blocks:** Admin review (M5; E12.4)
- **Sources:** [privacy §11 Q12][priv-q]

#### Q-080 · Which history category does each action use, and how long are catalog, settings, and account entries kept?
- **Why it matters:** the history ("audit log") has five categories. Only security and booking entries have a retention period, so the category decides when an entry is deleted.
- **Options / recommendation:** [API OQ 20][api-q] **[P]**, which "needs the owner's review": `booking` for reservation, payment, proof, note, QR, legal hold, and erasure entries; `catalog` for blocks, sets, and the room; `settings` for the automatic pause and resume. Periods for catalog, settings, and account entries: none.
- **Who answers:** Super Admin (categories), lawyer (periods) · **Blocks:** Foundation (M3; E2.5 the history writer) and the retention job (M7; E19.1)
- **Sources:** [administration OQ 1][admin-q] · [privacy §11 Q2][priv-q] · [API OQ 20][api-q] · [data model §13][data-q] (table)

#### Q-081 · How long are queued email rows kept?
- **Why it matters:** each queued email keeps its recipient's address, and the retention schedule has no row for it.
- **Options / recommendation:** [data model OQ 11][data-q] **[P]**: the address is blanked together with the booking's contact details, and on erasure. The rest of the row: none.
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.1)
- **Sources:** [privacy §11 Q3][priv-q] · [data model OQ 11][data-q]

#### Q-082 · New rows for the retention schedule
- **Why it matters:** the technical docs propose clean-ups that the retention schedule does not list yet.
- **Options / recommendation:** [security OQ 28][sec-q] and [API OQ 35][api-q] **[P]**: upload files that were never recorded as proofs are deleted daily after one day. [Architecture OQ 7][arch-q] **[P]**: the database job log (`cron.job_run_details`) is cleaned after 7 days. Each needs a row in [privacy and retention §6.2][priv] if accepted.
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.1)
- **Sources:** [notifications OQ 17][notify-q] · [security OQ 28][sec-q] · [API OQ 35][api-q] · [architecture OQ 7][arch-q]

#### Q-083 · When is a payment picture deleted if it was never verified, but the booking went ahead?
- **Why it matters:** neither deletion rule covers it.
- **Example:** Carla's picture is rejected, she then pays cash, and her booking ends Completed. When is the picture deleted?
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.1)
- **Sources:** [privacy §11 Q1][priv-q]

#### Q-084 · What does an erasure remove?
- **Why it matters:** the privacy doc reads "contact fields" as name, mobile number, and email address.
- **Example:** Ana asks to have her data erased. Is her note ("near the blue gate"), the staff's internal notes, and her barangay also blanked?
- **Who answers:** lawyer, with the Super Admin · **Blocks:** Notifications and jobs (M7; E19.3)
- **Sources:** [privacy §11 Q4][priv-q] · [data model §13][data-q] (table)

#### Q-085 · Handling an erasure request: active bookings, checking the person, and telling them
- **Why it matters:** an erasure cannot be undone, and afterwards nobody can contact the customer.
- **Example:** Ben asks to be erased while his booking for next week is Confirmed. (a) Is that allowed? (b) Does the tool itself check his reference code and full mobile number? (c) If he has several bookings, is each erased separately? (d) How is he told what was kept and why, if his email is blanked in the same step? (e) What is he told if a legal hold stops the erasure?
- **Options / recommendation:** [API OQ 27][api-q] **[P]**: (b) the tool checks the code and mobile number itself, and skips the customer emails still waiting for that booking. The rest: none.
- **Who answers:** lawyer, with the Admin and Super Admin · **Blocks:** Notifications and jobs (M7; E19.3)
- **Sources:** [privacy §11 Q5, Q6][priv-q] · [administration OQ 20][admin-q] · [API OQ 27][api-q]

#### Q-086 · How is an erasure applied again after a restore from backup?
- **Why it matters:** a backup made before the erasure still holds the data.
- **Example:** Ana is erased on Tuesday; on Friday the database is restored from Monday's backup.
- **Options / recommendation:** none (for example, from its history entry).
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.3); the restore runbook (M8)
- **Sources:** [privacy §11 Q7][priv-q]

#### Q-087 · How is a request for a copy of one's data answered?
- **Why it matters:** the privacy notice lists this right, but no procedure exists.
- **Example:** a customer emails the privacy contact asking for "all the data you have about me".
- **Who answers:** lawyer, with the Admin · **Blocks:** gates G4, G5
- **Sources:** [privacy §11 Q8][priv-q]

#### Q-088 · What do staff do with sensitive data a customer types into a note anyway?
- **Why it matters:** customers are warned not to, but some will. Notes cannot be edited or deleted ([UX §8 proposal 6][ux-8] **[P]**).
- **Example:** a customer writes an ID number or a health detail in "Additional requirements".
- **Options / recommendation:** the staff guide says: do not copy it anywhere, and tell the Super Admin. Beyond that: none.
- **Who answers:** lawyer, with the Admin · **Blocks:** Admin review (M5; E10.3); UAT
- **Sources:** [privacy §11 Q9][priv-q] · [UX §8 proposal 6][ux-8] · [staff guide][staff] (§4 "What to do when…")

#### Q-089 · Is the customer's agreement to the policies stored, and for how long?
- **Why it matters:** the customer must agree before Submit. Storing the time and the notice version would prove it.
- **Who answers:** lawyer (O-08), with the Super Admin · **Blocks:** Core booking (M4; E7.2)
- **Sources:** [booking OQ 6][book-q] · [data model §13][data-q] (table)

#### Q-090 · Do late changes move the start of the retention period?
- **Why it matters:** the closure date starts the retention clock.
- **Example:** (a) Dan's event is marked "not held" a week after it was Completed: does the closure date move to that day? (b) A payment is voided: is the closure date worked out again?
- **Options / recommendation:** (a) the privacy doc reads yes, and [API][api] applies that reading. (b) [API][api] (provisional): yes.
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Changes and money (M6; E15.2, E16.2); the retention job (E19.1)
- **Sources:** [privacy §11 Q10][priv-q] · [changes OQ 11][change-q] · [data model §13][data-q] (table) · [test plan OQ 6][tp-q]

#### Q-091 · Which "ledger end" applies to the retention job's own run logs?
- **Why it matters:** the run logs are kept "until ledger end".
- **Options / recommendation:** the privacy doc asks whether it is the ledger end of the year in which each run happened.
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.1)
- **Sources:** [privacy §11 Q11][priv-q] · [test plan OQ 6][tp-q] (TC-DB-75)

#### Q-092 · Does the "up to 30 days" wording fit the monthly offline copy?
- **Why it matters:** the copy is replaced once a month, so in a 31-day month it can be slightly older than 30 days.
- **Who answers:** lawyer, with the Super Admin · **Blocks:** gate G5 (privacy notice wording), G19
- **Sources:** [privacy §11 Q13][priv-q]

#### Q-093 · Should the anonymous statistics also keep the service type?
- **Why it matters:** after the retention period, a booking is reduced to anonymous statistics with exactly the fields the privacy doc lists.
- **Example:** in two years, you want to know how many bookings were delivery and how many on-site.
- **Who answers:** Super Admin, with the lawyer · **Blocks:** Notifications and jobs (M7; E19.1)
- **Sources:** [data model OQ 12][data-q]

---

### 3.5 Technical proposals for the developer to confirm

*For the developer (Super Admin).* Full detail stays in each doc.

#### 3.5.1 [P] proposals per doc

"Labels" counts each "[P] (new in this doc)" or "[P] (reconciled 2026-10-21)" in the doc (the non-functional requirements use "[P] (new)"). One proposal can carry the label twice, in the text and again in its Open questions list, so the number of separate proposals is lower. "In its Open questions" counts the [P] items that doc lists for review.

| Doc | Labels | In its Open questions | The most important ones | Where to review |
|---|---|---|---|---|
| [Functional requirements][fr] | 25 (2 reconciled) | — (§8: confirm in review) | Admin search fields and filters (FR-ADM-03); only allowed actions offered (FR-ADM-04); a refused block names the clash (FR-ADM-25); logins in the `security` category (FR-ADM-01); audit-log filters (FR-ADM-32); the italic email contents (FR-NTF table); reconciled: draft and duplicate key storage (FR-PUB-06), documents only after a lookup (FR-PUB-14) | [§7][fr-q] |
| [Non-functional requirements][nfr] | 29 | — | Speed target set at the week-1 go / no-go (NFR-03); alerts go to the Super Admin (NFR-04, NFR-24); weekly usage check (NFR-06); 360 px minimum width (NFR-16); accessibility and browser baselines (NFR-17, NFR-18); backup private key offline; GitHub minutes | [doc][nfr] |
| [Privacy and retention][priv] | 1 | — | A reason is needed to clear a legal hold (§5.6) | [§11][priv-q] |
| [Catalog and payments][cat] | 3 | — | The free-delivery wording on the packages page; no sensitive data in payment notes; the deposit instructions in the reminder | [§10][cat-q] |
| [Edge cases][ec] | 1 (reconciled) | — | The draft and the duplicate key survive a new deploy (EC-02) | [§15][ec-q] |
| [Booking and submission][book] | 1 (reconciled) | — | "Urgent" is computed, not stored (WF-01C step 15) | [OQ][book-q] |
| [Availability and conflicts][avail] | 12 | 5 (OQ 1, 2, 3, 10, 11) | Overdue holds expired before every claim; the capacity lock also for stock, archive, and deactivate; a paused hold counts as expired from its service start; lock order; the message if the unique index fires | [OQ][avail-q] |
| [Changes and expiry][change] | 6 | 2 (OQ 5, 11) | An extension must be later; voiding a void payment is refused | [OQ][change-q] |
| [Administration][admin] | 7 | 2 (OQ 4, 7) | Disabling ends sessions at once; 2FA setup ends with a first correct code | [OQ][admin-q] |
| [UX and sitemap][ux] | 14 | 16 (A1 to A16) | §8 proposals 1 to 15 answering the workflow docs' UX questions; queue order, read-only deposit amount, no codes in URLs, repeat-submission fallback, badge colours, components, routes, layout, draft wording (A16) | [§8][ux-8], [OQ][ux-q] |
| [Architecture][arch] | 35 (2 reconciled) | 11 (OQ 1 to 4, 6 to 10, 12, 13) | Toolchain; migrations from the laptop; capacity-lock behaviour; a lease instead of an advisory lock for job routes; daily Vercel cron at 02:00 Manila; Sentry heartbeat every 5 minutes; one `CRON_SECRET`; previews with no database; CI details; edge rate-limit rule; outage mode | [OQ][arch-q] |
| [Data model][data] | 66 (14 reconciled) | 14 (OQ 1 to 5, 7 to 14, 16) | One `resource_claims` table; the `admin_auth` schema; money in centavos; the urgent flag computed (differs from spec §11); new reservation columns incl. `final_status_at`; lifecycle guard triggers; scrubbed admin rows; reads only through `reservation_effective`; setting shapes | [§13][data-q] |
| [API specification][api] | 112 (25 reconciled) | 32 (OQ 1 to 36, minus resolved 11, 14, 24, 36) | The session check and `p_actor_id`; result envelope and exception policy; versions; wire formats; audit categories (needs the owner); which functions take the lock; expiring holds before claims; upload confirmation; email sending rules; one-step staff bookings | [OQ][api-q] |
| [Security][sec] | 67 (2 reconciled) | 27 (OQ 1 to 14, 18 to 24, 26 to 28, 30 to 32) | argon2id settings; 24-hour sessions; lock rules; passwords; ten backup codes stored encrypted; the actor ID in every function; security events; Turnstile on the status lookup; QR reissue limit; upload slots; platform account settings; backups; the generic bot-check message | [OQ][sec-q] |
| [Roadmap][rm] | 32 | 11 (OQ 1 to 11) | Go / no-go recorded as a decision; all tables in Foundation; keep-alive in Foundation; phase-end demos; extra gates G6, G7, G8, G12, G17, G18, G20; the docs exit criterion; one plan per phase | [OQ][rm-q] |
| [Test plan][tp] | 11 | 3 (OQ 1, 2, 12) plus 4 boundary readings (OQ 5) | The test clock `app.now()`; the concurrency harness; test conventions (TC IDs in file names, fixtures, four Playwright projects, regression rules) | [OQ][tp-q] |
| [Deployment and operations][ops] | 101 | 42 (OQ 1 to 22, 24 to 43) | Short-lived week-1 and restore projects; role passwords set by hand; migration steps; deploy window 23:00 to 06:00 Manila; rollback order; restore procedure; breach steps; lost phone and laptop; key rotation | [OQ][ops-q] |
| [Staff guide][staff] | 5 | 3 (OQ A1 to A3) | The daily routine; a forgotten code given only to the person on the booking; message or call after a failed email | [OQ][staff-q] |
| **Total** | **528** (47 reconciled) | | | |

Fourteen security test cases run only "if [P] accepted", so the security review also decides which tests stay ([test plan OQ 11][tp-q]).

#### 3.5.2 Technical questions for the developer

Each row is a question raised in an earlier doc. Most already have a [P] answer in a later doc, which the developer confirms or corrects. **Who answers:** Super Admin for every row.

| ID | Question (plain) | Why it matters | Docs' proposal | Blocks | Sources |
|---|---|---|---|---|---|
| Q-094 | Which overdue holds are expired before a booking or block claims a set? | A stale hold must not block a date | [API OQ 31][api-q] **[P]**: only those on the affected dates, both service types; also in staff bookings, recreate, and blocks | Core booking (E6.1) | [booking OQ 8][book-q] · [availability OQ 1][avail-q] · [API OQ 31][api-q] |
| Q-095 | Which actions take the capacity lock, and what does a lock wait return? | No booking may slip in between a check and a change | [API OQ 30][api-q] **[P]**: claiming functions and clash checks take it, freeing ones do not; [architecture OQ 3][arch-q] **[P]**: a timeout returns "busy, please try again" | Foundation (E2.3) | [availability OQ 2][avail-q] · [API OQ 30][api-q] · [architecture OQ 3][arch-q] |
| Q-096 | In which order does each function take its locks and check status and version? | The same order everywhere prevents deadlocks | [availability OQ 10][avail-q] **[P]**: capacity lock, then the reservation row; [API OQ 8][api-q] **[P]**: version before status | Foundation (E2.4) | [availability OQ 10][avail-q] · [architecture OQ 3][arch-q] · [API OQ 8][api-q] |
| Q-097 | How does one guard cover bookings and blocks, when an index covers one table? | The guard is the last defence against double booking | [Data model OQ 1][data-q] **[P]**: one `resource_claims` table with read-only views | Foundation (E2.3) | [availability OQ 12][avail-q] · [data model OQ 1][data-q] |
| Q-098 | What does the customer see if the unique guard ever fires? | It fires only after a bug | [Availability OQ 11][avail-q] **[P]**: the "just taken" message plus a Sentry report | Core booking (E7.2) | [availability OQ 11][avail-q] |
| Q-099 | Which changes raise a reservation's version (a proof upload, a QR reissue, a note, the expiry job)? | Decides when an open admin page counts as out of date | [API OQ 8][api-q] **[P]** | Foundation (E2.4) | [availability OQ 9][avail-q] · [API OQ 8][api-q] · [data model §13][data-q] |
| Q-100 | How does a database function know which admin is acting? | The role is checked again in the database | [Security OQ 11][sec-q], [API OQ 2][api-q] **[P]**: the actor's ID as the first parameter; the function checks the role and the disabled flag | Foundation (E2.4) | [administration OQ 22][admin-q] · [security OQ 11][sec-q] · [API OQ 2][api-q] |
| Q-101 | Does disabling an account end its open sessions at once? | Otherwise a disabled person keeps access | [Administration OQ 4][admin-q], [API OQ 2][api-q] **[P]**: yes, revoked on the next request | Foundation (E3.2, E3.4) | [administration OQ 4][admin-q] · [API OQ 2][api-q] |
| Q-102 | How long does an admin session last? | Limits the damage of a lost device | [Security OQ 2][sec-q] **[P]**: 24 hours from login, no sliding renewal, no "trust this device" | Foundation (E3.1) | [administration OQ 5][admin-q] · [security OQ 2][sec-q] |
| Q-103 | Do wrong 2FA and backup codes count toward the lock, and what does the screen say? | The lock is the main brake on password guessing | [Security OQ 3][sec-q] **[P]**: they count; a locked account refuses everything; a reset clears it; [UX §8 proposal 13][ux-8] **[P]**: generic messages. Open: a lock-out at exactly 15 minutes ([test plan OQ 5d][tp-q]) | Foundation (E3.1) | [administration OQ 6][admin-q] · [security OQ 3][sec-q] · [UX §8 proposal 13][ux-8] |
| Q-104 | How is 2FA set up, and how do backup codes work? | Recovery after a lost phone | [Administration OQ 7][admin-q] **[P]**: setup ends after a first correct code; [security OQ 5][sec-q] **[P]**: ten codes shown once, a new set needs the password and a code and ends the old set, stored encrypted. Moving 2FA alone: Q-012 | Foundation (E3.1) | [administration OQ 7][admin-q] · [security OQ 5][sec-q] |
| Q-105 | How are first and reset passwords made and handed over? | No "forgot password" link exists | [Security OQ 4][sec-q] **[P]**: at least 12 characters; made by the system and handed over in person; changing your own needs the current one; break-glass for a forgotten Super Admin password. Forced change: Q-012 | Foundation (E3.3, E3.4) | [administration OQ 8][admin-q] · [security OQ 4][sec-q] |
| Q-106 | What do the setup and break-glass scripts do besides their main job? | They run outside the app | [Security OQ 7][sec-q] **[P]**: break-glass also ends the Super Admin's sessions and can set a new password; the setup script records the first accounts | Foundation (E3.3) | [administration OQ 9][admin-q] · [security OQ 7][sec-q] · [API OQ 26][api-q] |
| Q-107 | Does "sign out" end one session or all? | Ending a lost phone's access | [Security OQ 6][sec-q] **[P]**: all of that admin's sessions; each admin can end their own other sessions; [API OQ 26][api-q] **[P]**: signing yourself out keeps the current session | Foundation (E3.4) | [administration OQ 10][admin-q] · [security OQ 6][sec-q] · [API OQ 26][api-q] |
| Q-108 | What does the `security` history category record? | The main evidence after a breach | [Security OQ 13][sec-q] **[P]**: the list in security §4.11; a typed email that matches no admin is never stored | Foundation (E3.1) | [administration OQ 3][admin-q] · [security OQ 13][sec-q] |
| Q-109 | Which customer and system actions write a history entry? | Retention and evidence | [API OQ 17][api-q] **[P]**: a `proof.uploaded` entry. The retention job and email sending: none | Foundation (E2.5); Notifications and jobs | [administration OQ 2][admin-q] · [notifications OQ 16][notify-q] · [API OQ 17][api-q] |
| Q-110 | Does Better Auth store raw IP addresses? | IPs may be kept only as an HMAC (NFR-13) | [Security OQ 9][sec-q], [data model OQ 9][data-q] **[P]**: HMAC-keyed limiter storage or the limiter off, and no IP in session rows, pending the **[U]** check | Foundation (E3.1); week-1 item 3 | [architecture OQ 16][arch-q] · [security OQ 9][sec-q] · [data model OQ 9][data-q] |
| Q-111 | Do cached pages show settings, and how are they refreshed? | A settings change must reach the public pages | [API OQ 12][api-q] **[P]**: a `settings` cache tag. How long a failed refresh may show an old price: none | Core booking (E5.3, E9.1) | [administration OQ 15][admin-q] · [API OQ 12][api-q] |
| Q-112 | Does the QR code of an overdue hold still open it before the job marks it Expired? | Overdue holds count as expired everywhere | [API OQ 18][api-q] **[P]**: it shows "no longer valid" | Core booking (E8.1) | [lookup OQ 1][review-q] · [API OQ 18][api-q] |
| Q-113 | Which limit and headers protect the QR link page? | Guarding the free allotments and the link | [Security OQ 22][sec-q] **[P]**: one 404 for every invalid token; `no-referrer`, `noindex`, `no-store`; counted toward the lookup limit | Core booking (E8.1) | [lookup OQ 5][review-q] · [security OQ 22][sec-q] |
| Q-114 | Does the "present this at our office" page offer a staff login? | An admin not logged in on that phone | [UX §8 proposal 4][ux-8] **[P]**: a small "Staff login" link that returns to the same QR link | Core booking (E8.1) | [lookup OQ 4][review-q] · [UX §8 proposal 4][ux-8] |
| Q-115 | What key does the failed-lookup counter use? | A code-plus-mobile key would not slow down guessing many numbers | [Security OQ 18][sec-q], [API OQ 10][api-q] **[P]**: the reference code alone | Core booking (E8.2) | [notifications OQ 11][notify-q] · [security OQ 18][sec-q] · [API OQ 10][api-q] |
| Q-116 | What does a failed status lookup say? | It must never reveal that a code exists | [UX §8 proposal 7][ux-8], [security OQ 19][sec-q] **[P]**: one message for a wrong code or mobile, another for the limit | Core booking (E8.2) | [notifications OQ 12][notify-q] · [UX §8 proposal 7][ux-8] · [security OQ 19][sec-q] |
| Q-117 | Does the form have its own date picker? | The form and the calendar must agree | [UX §8 proposal 1][ux-8] **[P]**: the date field is the live calendar | Core booking (E7.1) | [booking OQ 9][book-q] · [UX §8 proposal 1][ux-8] |
| Q-118 | How does "just taken" suggest other dates? | Keeps the customer booking | [UX §8 proposal 2][ux-8] **[P]**: up to 3 nearest Available dates plus "See the calendar" | Core booking (E7.2) | [booking OQ 10][book-q] · [UX §8 proposal 2][ux-8] |
| Q-119 | Can the QR code be saved from the confirmation page? | Customers without email | [UX §8 proposal 3][ux-8] **[P]**: a "Save QR code" button; the picture is made in the browser and never stored | Core booking (E7.3) | [booking OQ 11][book-q] · [UX §8 proposal 3][ux-8] |
| Q-120 | Which on-site arrival times can be picked? | The picker and the same-day check must match | [UX §8 proposal 15][ux-8] **[P]**: 30-minute steps; too-soon times shown but not selectable. The closing time: Q-067 | Core booking (E7.1) | [availability OQ 8][avail-q] · [UX §8 proposal 15][ux-8] |
| Q-121 | Does the calendar still show Available and Full while online booking is paused? | Customers can still call about a free date | [UX §8 proposal 9][ux-8] **[P]**: labels stay, dates cannot be picked | Core booking (E6.2) | [availability OQ 4][avail-q] · [UX §8 proposal 9][ux-8] |
| Q-122 | How does admin search match names and numbers, and how are results paged? | Daily lookup speed | [UX §8 proposal 5][ux-8] **[P]** | Admin review (E10.2) | [lookup OQ 6][review-q] · [UX §8 proposal 5][ux-8] |
| Q-123 | Can an internal note be corrected or removed? | Nothing is ever deleted | [UX §8 proposal 6][ux-8] **[P]**: no edit or delete; a new note starting "Correction:"; 1,000 characters (resolved) | Admin review (E10.3) | [lookup OQ 15][review-q] · [UX §8 proposal 6][ux-8] |
| Q-124 | Is opening a reservation recorded in the history? | It shows personal data | [Security OQ 14][sec-q] **[P]**: proof views are recorded, reservation views are not | Admin review (E10.3) | [lookup OQ 3][review-q] · [security OQ 14][sec-q] |
| Q-125 | How is the history screen searched and paged, and is viewing it recorded? | Finding evidence quickly | [UX §8 proposal 10][ux-8] **[P]**: category and date filters, reference-code search, newest first, 50 per page. Recording views of the log: none | Admin review (E10.5) | [administration OQ 21][admin-q] · [UX §8 proposal 10][ux-8] · [API OQ 21][api-q] |
| Q-126 | Where is a QR screenshot read, and is it kept? | Privacy of the image | [Security OQ 23][sec-q], [API OQ 22][api-q] **[P]**: read in the browser, never stored | Admin review (E10.4) | [lookup OQ 2][review-q] · [security OQ 23][sec-q] · [API OQ 22][api-q] |
| Q-127 | Is a double press on the staff booking form protected? | Two bookings from one press | [API OQ 7][api-q] **[P]**: the same duplicate key as the public form | Admin review (E13.1) | [lookup OQ 11][review-q] · [API OQ 7][api-q] · [staff guide OQ B][staff-q] |
| Q-128 | How soon is "soon" for the dashboard's deadline alerts? | Staff act on these alerts | [API OQ 21][api-q] **[P]**: a 24-hour window; the first 50 upcoming events | Admin review (E10.1) | [FR-ADM-02][fr] **[P]** · [UX OQ C][ux-q] · [API OQ 21][api-q] · [staff guide OQ B][staff-q] |
| Q-129 | What counts as an upload, how does the server learn the file arrived, and what happens to stray files? | The 2-upload limit and "before the deadline" | [API OQ 17][api-q] **[P]**: the database checks storage; it counts at the file's stored time; only recorded proofs count; 10-minute slots. [Security OQ 28][sec-q] **[P]**: final slot states, a file-signature check, a daily clean-up of stray files (retention row: Q-082) | Admin review (E12.2) | [notifications OQ 14, OQ 17][notify-q] · [API OQ 17, OQ 35][api-q] · [security OQ 28][sec-q] |
| Q-130 | Which moment is stored as the time a hold became Expired? | It sets the closure date and the proof clock | [Data model OQ 5][data-q] **[P]**: the moment it counted as expired | Notifications and jobs (E18.1) | [changes OQ 8][change-q] · [data model OQ 5][data-q] |
| Q-131 | Does recreate copy the stored start time, and is it offered before Expired is recorded? | Recreate must not fail on a late job | [API OQ 33][api-q] **[P]**: copies the stored start; records an overdue original as Expired in the same step | Changes and money (E14.4) | [changes OQ 9b, OQ 9e][change-q] · [API OQ 33][api-q] |
| Q-132 | Is voiding an already-void payment refused? | Avoids double voids | [Changes OQ 11][change-q] **[P]**: refused (`already_void`) | Changes and money (E15.2) | [changes OQ 11][change-q] |
| Q-133 | Should the daily Vercel sweep also run the Completed job? | Backup if the database scheduler stops | None | Changes and money (E16.1); Notifications and jobs (E18.4) | [changes OQ 12][change-q] |
| Q-134 | How are failed emails retried, and how many times? | No default existed | [Data model OQ 13][data-q] **[P]**: 5 attempts; [API OQ 28][api-q] **[P]**: the waits and limits of api §4 | Notifications and jobs (E17.3) | [notifications OQ 1][notify-q] · [data model OQ 13][data-q] · [API OQ 28][api-q] |
| Q-135 | Which day do the email caps count, and what happens at the monthly cap? | Customer emails could wait for weeks | [API OQ 34][api-q] **[P]**: Manila day and month; at the monthly cap, emails wait until the next month. The provider's own reset clock is **[U]** | Notifications and jobs (E17.3) | [notifications OQ 2][notify-q] · [API OQ 34][api-q] |
| Q-136 | Is a late email filled in when queued or when sent, and is it sent after an erasure? | A held email may be out of date | [API OQ 34][api-q] **[P]**: filled in at send time; [API OQ 27][api-q] **[P]**: an erasure skips that booking's queued customer emails | Notifications and jobs (E17.1) | [notifications OQ 3][notify-q] · [API OQ 34, OQ 27][api-q] |
| Q-137 | When is a queued email no longer worth sending? | Stale emails confuse customers | [API OQ 34][api-q] **[P]**: per-type rules in api §5.9 | Notifications and jobs (E17.3) | [notifications OQ 4][notify-q] · [API OQ 34][api-q] |
| Q-138 | What is the unique key of admin emails and the pause email? | No duplicates | One row per admin (resolved); [API §5.9][api] **[P]**: the pause email's key is the type, the audit entry, and the admin | Notifications and jobs (E17.3) | [notifications OQ 6][notify-q] · [API §5.9][api] |
| Q-139 | Is a reminder still queued after its moment, if the job was late? | Jobs can stop and catch up | None | Notifications and jobs (E18.2) | [notifications OQ 8][notify-q] |
| Q-140 | How does the ready-made message for customers without email work? | Staff send it by hand | [UX §8 proposal 8][ux-8] **[P]**: one message per event, newest first, a ready-made reminder, and a "No email" tag on deadline alerts | Notifications and jobs (E17.4) | [notifications OQ 18][notify-q] · [UX §8 proposal 8][ux-8] · [staff guide OQ B][staff-q] |
| Q-141 | How does the health panel know the nightly backup ran? | The backup role is read-only | [Security OQ 32][sec-q] **[P]**: the role stays read-only; GitHub's failure email is the alert | Notifications and jobs (E20.1, E20.2) | [architecture OQ 11][arch-q] · [security OQ 32][sec-q] |
| Q-142 | If a private free repository has no protected environments **[U]**, is a repository secret acceptable for the backup? | Where the backup connection string lives | None | Notifications and jobs (E20.1) | [ops OQ 45][ops-q] |
| Q-143 | After a restore, what happens to emails that may already have been sent? | They could be sent twice | [Ops OQ 24][ops-q] **[P]**: the Super Admin marks those older than Resend's idempotency window **[U]** as skipped. Should it become a rule in FR-NTF-18 or the API? | Hardening (M8; restore runbook) | [ops OQ 24][ops-q] |
| Q-144 | Is a working email sender wanted before phase 9? | Emails are only queued until Notifications and jobs | None | Admin review (M5) onwards | [roadmap OQ 5][rm-q] |

---

## 4. Facts to verify ([U])

*For the developer.* Each fact is **[U]** until checked. "Record" means the result is written into the owning doc and the [U] label is removed. Rows 1 to 40 are the week-1 checklist ([test plan §4][tp-4], [architecture §14 and §14.1][arch-14]); all of them clear gate G9.

| # | Fact | How and when it is checked | Source |
|---|---|---|---|
| **Week 1, item 1: Vercel to the database pooler** | | | |
| 1 | Verified TLS with the Supabase CA works against the pooler | TC-W1-01 | [architecture][arch] §6.2; [security][sec] §4.3 |
| 2 | Role timeouts set on `app_rw` apply through the shared pooler | TC-W1-01, TC-SEC-18 | [data model][data] §2.3; [security][sec] §4.3; [architecture §14][arch-14] |
| 3 | The pooler accepts a SCRAM role with no `VALID UNTIL`; the direct host is unreachable from Vercel | TC-W1-01 | [architecture][arch] §6.1, [§14][arch-14] |
| 4 | Latency from `sin1` to the database (sets the speed target, Q-007) | TC-W1-01, TC-NFR-04 | [NFR-03][nfr] |
| **Week 1, item 2: booking under load** | | | |
| 5 | Exactly one success from parallel requests on the deployed function | TC-W1-02 (5 runs × 20 requests) | [architecture §14.1][arch-141] |
| 6 | The pooler's client count stays stable (a known leak was reported fixed) | TC-W1-02, TC-W1-08; then the weekly check | [architecture §14][arch-14] |
| **Week 1, item 3: login on Vercel** | | | |
| 7 | The `@node-rs/argon2` binary loads in Vercel's Node.js runtime (else the scrypt fallback) | TC-W1-03 | [NFR-09][nfr]; [security][sec] §4.1; [architecture §14][arch-14] |
| 8 | Which client-IP header Vercel sets that a client cannot override | TC-W1-03, TC-SEC-23 | [security §7][sec-7] |
| 9 | The cookie flags (`HttpOnly`, `Secure`, `SameSite=Strict`, `__Secure-`) | TC-W1-03 | [security][sec] §4.1 |
| 10 | Logged-out admin actions are refused on Vercel | TC-W1-03, TC-SEC-10 | [architecture §14.1][arch-141] |
| 11 | Whether Better Auth's limiter or session rows store raw IPs; how the session hook behaves | TC-W1-03, TC-SEC-09 | [security §7][sec-7]; [data model][data] §5.19 |
| 12 | The TOTP secret is stored encrypted; whether hashed backup codes are possible | TC-W1-03 | [security §7][sec-7] |
| 13 | Better Auth's tables work in their own schema (`admin_auth`); its 1.7 column names | TC-W1-03, TC-W1-09 | [data model][data] §2.1, §5.19; [API][api] §3.8 |
| 14 | The environment variable names Better Auth 1.7.12 reads | TC-W1-03 | [architecture][arch] §8.1 |
| **Week 1, item 4: timers and email** | | | |
| 15 | `pg_cron`, `pg_net`, Vault, and `pgcrypto` exist on Supabase Free | TC-W1-04 (24 hours) | [architecture][arch] §2.2, [§14][arch-14]; [data model][data] §2.5; [security §7][sec-7] |
| 16 | `pg_net`'s default timeout, and whether a timeout stops the Vercel function it called | TC-W1-04 | [architecture][arch] §7.4 |
| 17 | Resend honours the idempotency key, and for how long | TC-W1-04 | [API][api] §4.1 |
| 18 | How Resend counts the admin emails (one per admin recipient) | TC-W1-04 | [API][api] §5.9 |
| 19 | `after()` runs after the reply on Vercel | TC-W1-04 | [architecture §14.1][arch-141] |
| 20 | Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; it may fire late or twice | TC-W1-04, TC-UT-17 | [architecture][arch] §7.3; [security §7][sec-7] |
| 21 | The Sentry check-in and cron monitor work on the free plan (monitor count) | TC-W1-04, TC-NFR-13 | [architecture OQ 7][arch-q] |
| 22 | The keep-alive counts as activity | TC-W1-04, over the week | [architecture §14][arch-14]; [NFR-07][nfr] |
| **Week 1, item 5: signed upload** | | | |
| 23 | Bucket size and type limits are enforced on hosted signed uploads | TC-W1-05 | [architecture][arch] §2.2; [security §7][sec-7] |
| 24 | A signed upload link can be reused while it is valid | TC-W1-05, TC-SEC-33 | [architecture §14][arch-14]; [security][sec] §4.6 |
| 25 | Storage keeps working with the Data API turned off | TC-W1-05, TC-SEC-17 | [security §7][sec-7]; [data model][data] §2.4 |
| 26 | The dashboard setting names for exposure | TC-W1-05 | [data model][data] §2.4 |
| **Week 1, item 6: QR scanning** | | | |
| 27 | The self-hosted WASM scanner works on the owner's real phone and laptop over HTTPS | TC-W1-06 (needs task A-3) | [architecture §14.1][arch-141]; [NFR-16][nfr] |
| 28 | A QR link opened from the phone's camera app carries the `SameSite=Strict` cookie | TC-W1-06 | [security §7][sec-7] |
| **Week 1, item 7: backup and restore** | | | |
| 29 | `pg_dump` works through the session pooler with the read-only role and a matching PGDG client | TC-W1-07, TC-NFR-14 | [architecture][arch] §11.3 |
| 30 | Supabase's Postgres major version | TC-W1-07 | [architecture][arch] §2.1; [data model][data] §6.2 |
| 31 | Whether GitHub's `schedule` takes a time zone | TC-W1-07 | [architecture][arch] §11.3 |
| 32 | A restore into a fresh Postgres works | TC-W1-07, TC-NFR-16 | [NFR-29][nfr] |
| **Week 1, item 8: usage** | | | |
| 33 | The Vercel Hobby allotments (about 4 active-CPU-hours or 1 million function calls a month), and real usage against them | TC-W1-08, TC-NFR-07 | [NFR-06][nfr]; [architecture][arch] §13 |
| 34 | The GitHub Actions minutes allowance for a private repository | TC-W1-08 | [NFR-01][nfr] |
| **Also checked in week 1** | | | |
| 35 | `updateTag` also refreshes prerendered page shells on Vercel | TC-W1-09, TC-NFR-03 | [architecture][arch] §5 |
| 36 | No skew protection: an open tab calling an old Server Action gets the reload prompt | TC-W1-09, TC-E2E-03 | [architecture][arch] §13 |
| 37 | The standalone Docker image runs against the real project | TC-W1-09, TC-NFR-06 | [architecture §14.1][arch-141] |
| 38 | drizzle-kit writes Supabase-style migration names | TC-W1-09 | [architecture][arch] §9, [OQ 2][arch-q] |
| 39 | Sentry works with Next.js 16.4 Cache Components | TC-W1-09 | [architecture][arch] §2.1 |
| 40 | One Vercel Firewall rate-limit rule can cover several paths | TC-W1-09 | [security §7][sec-7]; [architecture OQ 12][arch-q] |
| **Checked before launch or later, not in week 1** | | | |
| 41 | Resend's free-plan email caps (believed 100 a day and 3,000 a month), and which clock they reset on | TC-NFR-08, from the vendor terms (G3) | [FR-NTF-20][fr]; [NFR-33][nfr]; [notifications OQ 2][notify-q] |
| 42 | The Supabase Free database, storage, and transfer limits | From the vendor terms (G3) | [data model][data] §11; [architecture §14][arch-14] |
| 43 | The vendor terms themselves (several figures came from summaries or a docs mirror) | TC-NFR-08 (G3) | [NFR-08][nfr]; [architecture][arch] §13 |
| 44 | The NPC's 72-hour breach-notification rule (NPC Circular 16-03) | Lawyer review (G4) | [security §7][sec-7] |
| 45 | The data locations of GitHub and Cloudflare, and what Turnstile collects | Lawyer review (G4) | [test plan §4][tp-4]; [privacy and retention][priv] §4 |
| 46 | Who the personal information controller is in law, and every other [U] legal item in the privacy doc | Lawyer review (G4) | [glossary][gl]; [privacy §9][priv-9] |
| 47 | Whether foreign-key cascade actions bypass row-level security | In the data model, before the schema is frozen (Foundation) | [security §7][sec-7] |
| 48 | Whether Vercel-hosted deployments were exposed to the 2026 Image Optimization and proxy-bypass advisories | Before launch (G14) | [security §7][sec-7] |
| 49 | Whether many Philippine mobile users share public IP addresses (carrier-grade NAT) | After launch, from real traffic | [security §7][sec-7] |
| 50 | Whether the Better Auth adapter stays free of transactions in other plugins and future versions | At each Better Auth update | [security §7][sec-7] |
| **Named in open questions** | | | |
| 51 | Resend's free plan sends only to the account's own address until a domain is verified | From the vendor terms (G3); decides O-05 (Q-070, G13) | [ops OQ 44][ops-q] |
| 52 | Whether GitHub offers protected environments on a private free repository | At backup setup (E20.1; Q-142) | [ops OQ 45][ops-q] |
| 53 | How many free Supabase projects one account may have | From the vendor terms; before Q-004 is answered | [architecture OQ 9][arch-q] |
| 54 | Whether some valid Philippine mobile numbers start with +638 | Before Foundation (Q-010) | [architecture OQ 15][arch-q] |
| 55 | How Better Auth 1.7.12 rotates `BETTER_AUTH_SECRETS` | At setup (Foundation) | [ops][ops] §9.6; [architecture][arch] §8.1 |
| 56 | Whether a data-only restore with `session_replication_role` works as planned | The restore test (TC-NFR-16, G10) | [ops OQ 21][ops-q] |
| 57 | drizzle-kit's `migrations.prefix: 'supabase'` option and Better Auth's session IP-tracking option name | At setup; week-1 items 3 and "also checked" | [architecture][arch] §9; [data model OQ 9][data-q] |
| 58 | Messenger notifications are researched again before they are built | Before the post-MVP Messenger work | [project charter][charter]; [roadmap][rm] §7 |

---

## 5. Pre-launch gates

All 21 gates must be cleared before the website opens (M10). The gates are owned by [roadmap §5][rm-5]; the evidence for each is in [ops §10][ops-10]. Owners come from the ops checklist; where it has no row yet, the owner is "not named". No doc reports any gate as cleared.

| # | Gate | Owner | Status | Notes |
|---|---|---|---|---|
| G1 | Private repository (O-06) | Super Admin | Not started | Must be done before the nightly backup (E20.1) **[C]** (D-22); task D-2 |
| G2 | Claude can save code (O-07) | Super Admin | Not started | Pushes still fail with error 403; planned to be done before Foundation; no ops row yet; task D-1 |
| G3 | Vendor terms (O-08) | Super Admin | Not started | Also confirms the [U] free-plan figures (section 4, rows 41 to 43) |
| G4 | Lawyer review (O-08) | Lawyer | Not started | Task L-1; Q-073 |
| G5 | Privacy notice | Super Admin | Not started | Needs the O-09 contact |
| G6 | DPO and privacy contact (O-09) | Admin and Super Admin | Not started | A gate **[P]**; task A-4 |
| G7 | SDAU (O-10) | Lawyer | Not started | A gate **[P]**; whether it holds launch is Q-077 |
| G8 | Registration and the acknowledgment name (O-11) | CPA or lawyer; the Admin | Not started | A gate **[P]**; the current name is a knowingly accepted risk **[C]** (D-21) |
| G9 | Week-1 go recorded | Super Admin | Not started | Section 4, rows 1 to 40; Q-007 |
| G10 | Restore test | Super Admin | Not started | The second restore test (NFR-29), at M8 |
| G11 | UAT accepted | Admin and Super Admin | Not started | M9; task A-8 |
| G12 | Content in place (O-02 to O-05) | Admin and Super Admin | Not started | A gate **[P]**; section 3.3 |
| G13 | Email sending domain | Super Admin | Not started | Depends on O-05 (Q-070) |
| G14 | Security and unverified items | Not named (no ops row yet) | Not started | M8, plus the security §7 items marked "Before launch" |
| G15 | Monitoring tried | Super Admin | Not started | Uptime alert, test error, stopped job |
| G16 | Facebook in-app browser | Not named (no ops row yet) | Not started | The hand check of NFR-18 |
| G17 | Accounts and devices | Admin and Super Admin | Not started | A gate **[P]**; task A-6 |
| G18 | Provider retention | Super Admin | Not started | A gate **[P]**; each provider set to its shortest retention |
| G19 | First offline backup copy | Super Admin | Not started | Plus the sealed second copy of the backup key |
| G20 | Runbooks ready | Not named (no ops row yet) | Not started | A gate **[P]**; the runbooks are drafted in [ops][ops] §3 to §8 and await review |
| G21 | Staff guide handed over | Admin | Not started | The [staff guide][staff] is drafted; task A-9 |

---

## 6. How to answer

1. **Record each answer as a new decision** in the [decision log][dl], from D-25 onwards, following its [§4 "How to change a decision"][dl-4]: the date, the decision, the options considered, the rationale, and the docs affected. An answered open item is marked "Resolved, see D-xx", as was done for O-01.
2. **Update every doc the decision affects** in the same change, so the docs never disagree. A confirmed [P] item becomes plain text or [C]; a checked [U] fact loses its label. The frozen spec is never edited (D-23).
3. **Mark the question answered here**: add "Answered: D-xx (date)" under its entry, and leave the entry in place so its ID is never reused.
4. **A question that needs more time** is added to the decision log as a new open item (O-12 onwards), as each doc's Open questions section asks, and its entry here gets the O-number.
5. **The week-1 result** is recorded the same way, as a decision (Q-007).

[readme]: ../README.md
[spec]: ../superpowers/specs/2026-10-21-kasoundbox-design.md
[brief]: discovery-brief.md
[charter]: project-charter.md
[gl]: glossary.md
[dl]: decision-log.md
[dl-3]: decision-log.md#3-open-items
[dl-4]: decision-log.md#4-how-to-change-a-decision
[roles]: ../01-requirements/roles-and-permissions.md
[br]: ../01-requirements/business-rules.md
[fr]: ../01-requirements/functional-requirements.md
[fr-q]: ../01-requirements/functional-requirements.md#7-questions-found-while-writing-this-document
[nfr]: ../01-requirements/non-functional-requirements.md
[ec]: ../01-requirements/edge-cases.md
[ec-q]: ../01-requirements/edge-cases.md#15-situations-the-spec-does-not-fully-answer
[priv]: ../01-requirements/privacy-and-retention.md
[priv-q]: ../01-requirements/privacy-and-retention.md#11-questions-found-while-writing-this-document
[priv-9]: ../01-requirements/privacy-and-retention.md#9-open-privacy-and-legal-items
[priv-10]: ../01-requirements/privacy-and-retention.md#10-key-legal-sources
[lc]: ../02-domain/reservation-lifecycle.md
[lc-q]: ../02-domain/reservation-lifecycle.md#9-questions-found-while-writing-this-document
[cat]: ../02-domain/catalog-and-payments.md
[cat-q]: ../02-domain/catalog-and-payments.md#10-questions-found-while-writing-this-document
[wf]: ../03-workflows/overview.md
[book]: ../03-workflows/booking-and-submission.md
[book-q]: ../03-workflows/booking-and-submission.md#open-questions
[avail]: ../03-workflows/availability-and-conflicts.md
[avail-q]: ../03-workflows/availability-and-conflicts.md#open-questions
[review]: ../03-workflows/lookup-and-review.md
[review-q]: ../03-workflows/lookup-and-review.md#open-questions
[change]: ../03-workflows/changes-and-expiry.md
[change-q]: ../03-workflows/changes-and-expiry.md#open-questions
[change-notes]: ../03-workflows/changes-and-expiry.md#source-notes-batch-1-docs-and-the-frozen-spec
[notify]: ../03-workflows/notifications-and-tracking.md
[notify-q]: ../03-workflows/notifications-and-tracking.md#open-questions
[admin]: ../03-workflows/administration.md
[admin-q]: ../03-workflows/administration.md#open-questions
[ux]: ../04-design/ux-and-sitemap.md
[ux-8]: ../04-design/ux-and-sitemap.md#8-answers-to-the-workflow-docs-ux-open-questions
[ux-q]: ../04-design/ux-and-sitemap.md#open-questions
[ux-form]: ../04-design/ux-and-sitemap.md#314-reservation-form-p4-to-p6
[arch]: ../05-technical/architecture.md
[arch-q]: ../05-technical/architecture.md#open-questions
[arch-14]: ../05-technical/architecture.md#14-known-technical-risks-and-mitigations
[arch-141]: ../05-technical/architecture.md#141-what-the-week-1-test-must-prove-for-this-architecture
[arch-notes]: ../05-technical/architecture.md#source-notes-the-spec-the-research-and-the-batch-1-docs
[data]: ../05-technical/data-model.md
[data-q]: ../05-technical/data-model.md#13-open-questions
[data-512]: ../05-technical/data-model.md#512-notifications_outbox
[data-520]: ../05-technical/data-model.md#520-views-and-shared-helper-functions
[api]: ../05-technical/api-specification.md
[api-q]: ../05-technical/api-specification.md#open-questions
[api-113]: ../05-technical/api-specification.md#113-the-status-page-session-and-document-access
[api-51]: ../05-technical/api-specification.md#51-standard-steps
[sec]: ../05-technical/security.md
[sec-q]: ../05-technical/security.md#open-questions
[sec-7]: ../05-technical/security.md#7-unverified-items-to-check
[sec-454]: ../05-technical/security.md#454-the-qr-link-in-the-request-received-email-p-new-in-this-doc
[rm]: ../06-delivery/roadmap.md
[rm-1]: ../06-delivery/roadmap.md#1-phases-and-milestones
[rm-5]: ../06-delivery/roadmap.md#5-pre-launch-gates
[rm-6]: ../06-delivery/roadmap.md#6-what-the-business-owner-will-be-asked-to-provide-and-when
[rm-9]: ../06-delivery/roadmap.md#9-how-this-connects-to-the-implementation-plan
[rm-q]: ../06-delivery/roadmap.md#open-questions
[tp]: ../06-delivery/test-plan.md
[tp-4]: ../06-delivery/test-plan.md#4-week-1-spike-checklist
[tp-15]: ../06-delivery/test-plan.md#15-time-control-and-concurrency
[tp-q]: ../06-delivery/test-plan.md#open-questions
[ops]: ../07-operations/deployment-and-operations.md
[ops-10]: ../07-operations/deployment-and-operations.md#10-pre-launch-gate-checklist
[ops-q]: ../07-operations/deployment-and-operations.md#open-questions
[staff]: ../07-operations/staff-guide.md
[staff-q]: ../07-operations/staff-guide.md#open-questions
