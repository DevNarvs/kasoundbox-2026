# Non-Functional Requirements

> **Purpose:** The quality requirements for the DJB Kasoundbox system (NFR-01 to NFR-33): cost, hosting, availability, security, privacy, devices, time zone, data integrity, monitoring, backups, maintainability, and email limits. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); lines marked "Developer note" are mainly for the developer ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](../00-project/decision-log.md) (D-18, D-19, D-20, D-21, D-22), [Glossary](../00-project/glossary.md), [Roles and permissions](roles-and-permissions.md), [Business rules](business-rules.md), [Functional requirements](functional-requirements.md), [Privacy and retention](privacy-and-retention.md), [Edge cases](edge-cases.md), [Reservation lifecycle](../02-domain/reservation-lifecycle.md), [Catalog and payments](../02-domain/catalog-and-payments.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §1, §10, §12, §13, §15, §18 (main sources), with details from §2, §9, §11, §14, §16, §17

## How to read this document

- **What "non-functional" means.** The [functional requirements](functional-requirements.md) say *what* the system does (pages, admin actions, emails, jobs). This document says *how well* it must do it: how much it may cost, where it runs, how safe it is, which phones and browsers it supports, and how data is protected and backed up.
- **IDs.** Each requirement has an ID, NFR-01 to NFR-33. Other docs link here and cite the ID instead of repeating the requirement.
- **Layout.** Each requirement gives the requirement itself, the details, how it is checked, and "Related" links. Some end with a short "Developer note".
- **Labels.** **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item. A requirement, or part of one, with no label is part of the approved design (spec v0.2, approved on 2026-10-21, see D-23). In the tables, "—" in the Label column means the same.
- **New proposals.** **[P] (new)** marks a proposal made for the first time in this document. It is not in the approved spec. It becomes accepted when this document is approved in review. Until then, it may change.
- **Time.** Every date and time here is Manila time (Asia/Manila). Requirement NFR-19 explains why.
- **Admins.** "An admin" means either admin account. "The Super Admin" (the developer) and "the Admin" (the business owner) mean one specific account.
- **Tests.** The "Verified by" column points to the test plan (planned for batch 4: `06-delivery/test-plan.md`), which will hold the test cases. The "How it is checked" line under each requirement says which kind of check the approved design already plans.
- **The week-1 test** is the short technical trial on the real free services, before any features are built ([project-charter](../00-project/project-charter.md), phase 4; its 8 items are listed in spec v0.2 §17). "Week-1 item 3" means the third item of that list.

### What this document does not cover

| Topic | Where it lives |
|---|---|
| Who may do what, and the admin account rules | [Roles and permissions](roles-and-permissions.md) |
| When a date is Full, hold limits, and the breaker | [Business rules](business-rules.md) |
| Statuses, status changes, and deadlines | [Reservation lifecycle](../02-domain/reservation-lifecycle.md) |
| Prices, the payments ledger, and acknowledgments | [Catalog and payments](../02-domain/catalog-and-payments.md) |
| Pages, admin actions, emails (including how sending, retries, and caps work), and scheduled jobs | [Functional requirements](functional-requirements.md) (FR-PUB, FR-ADM, FR-NTF, FR-SYS) |
| The privacy notice, the retention schedule, erasure, legal hold, and the legal notes | [Privacy and retention](privacy-and-retention.md) |
| Unusual situations and how the system reacts | [Edge cases](edge-cases.md) |
| The full threat list and the detailed security controls | [Security](../05-technical/security.md) (planned) |
| The full stack with versions, and the system structure | Architecture (planned: `05-technical/architecture.md`); until then [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §10 |
| Step-by-step runbooks: deploy, backup, restore, exit from Vercel, incidents | Deployment and operations (planned: `07-operations/deployment-and-operations.md`) |

---

## Requirements at a glance

| ID | Requirement in one line | Label | Based on | Verified by |
|---|---|---|---|---|
| **Cost** | | | | |
| NFR-01 | Running cost is ₱0 per month, on free plans only. | [C] | [D-19](../00-project/decision-log.md) | test-plan (batch 4) |
| **Hosting and speed** | | | | |
| NFR-02 | The website and the database both run in Singapore. | [C] for Vercel `sin1`; database region: approved design | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-03 | Catalog pages load from a cache; availability, booking, status, and admin pages are always live. | —; speed target [P] (new) | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| **Availability and free-plan risks** | | | | |
| NFR-04 | An uptime check alerts when the site is down; no uptime percentage is promised. | —; alert receiver [P] (new) | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-05 | Vercel Hobby's non-commercial terms are an accepted risk, reduced by a portable design. | [C] | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-06 | The system stays well inside Vercel Hobby's monthly usage limits. | [U] limits | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-07 | The free Supabase project is never paused for low activity. | — | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-08 | The vendor terms are read in full and saved before launch. | [U] | [O-08](../00-project/decision-log.md) | test-plan (batch 4) |
| **Security baseline** | | | | |
| NFR-09 | Admin login needs a strong password hash and two-factor login; sessions can be ended. | — | [D-07, D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-10 | Every admin request is checked on the server; database roles get the least access they need. | — | [D-07](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-11 | Rate limits on login, status lookup, form submission, and proof uploads. | [P] | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| NFR-12 | The public form is protected against bots and floods. | — | [D-16](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-13 | Secrets stay in encrypted settings; codes and tokens are random and hashed where stored. | —; codes [P] | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| NFR-14 | Proof uploads are private, limited, and stripped of location data. | — | [D-05](../00-project/decision-log.md) | test-plan (batch 4) |
| **Privacy** | | | | |
| NFR-15 | The system collects and shows as little personal data as possible, and supports the privacy rules. | [C] defaults | [D-21](../00-project/decision-log.md) | test-plan (batch 4) |
| **Devices, accessibility, browsers** | | | | |
| NFR-16 | Mobile-first: a customer can book on a phone in a few minutes. | —; widths [P] (new) | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| NFR-17 | Accessibility baseline: keyboard use, contrast, and labels. | [P] (new) | — | test-plan (batch 4) |
| NFR-18 | Supported browsers for the public site and the admin panel. | [P] (new) | — | test-plan (batch 4) |
| **Time zone** | | | | |
| NFR-19 | Every date and time is Asia/Manila time. | [C] | [D-18](../00-project/decision-log.md) | test-plan (batch 4) |
| **Data integrity** | | | | |
| NFR-20 | No set, room, or add-on is ever double-booked, even at the same instant. | — | [D-02](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-21 | Every change is one complete database step; two admins cannot overwrite each other. | — | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| NFR-22 | Business records are never deleted; mistakes are fixed with a new action. | — | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| **Observability** | | | | |
| NFR-23 | Errors are recorded in Sentry, without personal data. | — | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-24 | Scheduled jobs are watched; an alert fires if they stop. | — | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-25 | Every status change and admin action can be traced: who, when, and why. | — | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| NFR-26 | Admins can see the system's health on a health panel. | — | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| **Backup and restore** | | | | |
| NFR-27 | A nightly encrypted backup is kept for 14 days. | — | [D-22](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-28 | One encrypted backup a month is kept offline. | — | [D-22](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-29 | A restore is tested before features are built and again before launch. | — | [D-23](../00-project/decision-log.md) (approved design) | test-plan (batch 4) |
| **Maintainability and portability** | | | | |
| NFR-30 | Versions are pinned; critical security fixes are applied within 24–48 hours. | — | [D-19, D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-31 | The system can move off Vercel by changing configuration, not by rewriting it. | — | [D-20](../00-project/decision-log.md) | test-plan (batch 4) |
| NFR-32 | TypeScript strict, rules in the database, and automatic checks on every code change. | [C] TypeScript | [D-19](../00-project/decision-log.md) | test-plan (batch 4) |
| **Email limits** | | | | |
| NFR-33 | Email stays inside the free email plan, and no status change depends on an email being sent. | [U] limits; mechanism [P] | [D-10, D-19](../00-project/decision-log.md) | test-plan (batch 4) |

---

## 1. Cost

### NFR-01 · Running cost is ₱0 per month

**Label:** [C] · **Based on:** [D-19](../00-project/decision-log.md)

**Requirement.** The system runs on free plans only. The running cost is ₱0 per month **[C]**.

**Details.**
- The free services used are:

  | Service | Used for |
  |---|---|
  | Vercel Hobby | The website (public site and admin panel) |
  | Supabase Free | The database, the uploaded proof images, and the scheduled jobs |
  | Resend Free | Emails |
  | Sentry Free | Error reports, the uptime check, and the job alert |
  | Cloudflare Turnstile (free) | The bot check on the public form |
  | GitHub | The code, the automatic checks, and the nightly backups |

- **The only cost still being considered** is a domain name (the business's own web address) instead of the free `vercel.app` address. That is open item O-05.
- **Free plans have limits.** NFR-06 (Vercel usage), NFR-07 (Supabase pausing), and NFR-33 (emails) say how the system stays inside them.
- **Leaving a free plan costs money.** If the website ever has to move off Vercel Hobby (NFR-05), the exit options cost money, for example Vercel Pro at about US$20 per month. Moving to any paid plan is a new decision, recorded in the [decision log](../00-project/decision-log.md) first.
- **GitHub minutes [P] (new).** Once the code repository is private (D-22), the nightly backup and the automatic checks must fit inside GitHub's free allowance of minutes for private repositories. The allowance figure is **[U]**; it is checked with the vendor terms before launch (NFR-08).

**How it is checked.** Week-1 item 8 compares real usage with the Vercel Hobby allotments. Before launch, the free-plan terms are read and saved (NFR-08). After launch, there is no bill each month.

**Related:** [project-charter](../00-project/project-charter.md) (constraints) · NFR-05 · NFR-06 · NFR-07 · NFR-33

---

## 2. Hosting and speed

### NFR-02 · The website and the database run in Singapore

**Label:** [C] for Vercel `sin1` and the Node.js runtime; the database region is approved design (no label in spec v0.2 §10) · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.** The website's server code runs on Vercel in the Singapore region (`sin1`), on the Node.js runtime only **[C]**. The database and file storage run on Supabase in the region "Southeast Asia (Singapore)".

**Details.**
- **Why Singapore.** It is close to the Philippines, so pages respond quickly. The website and the database sit in the same region, so each database call is short.
- **Privacy effect.** Customer data is stored in Singapore and processed abroad. The privacy notice must say so ([privacy-and-retention](privacy-and-retention.md)).
- **Developer note.** The app connects through the Supavisor transaction pooler (port 6543, IPv4) with the `pg` driver and a pool of 1 connection per function. Backups and migrations use the session pooler (port 5432). The full stack is in spec v0.2 §10 until the architecture doc (planned: `05-technical/architecture.md`) is written.

**How it is checked.** Week-1 item 1 checks the connection between Vercel `sin1` and the Supabase pooler: TLS (encryption in transit), latency (delay), and database role timeouts. After launch, `/api/health` reports the region it runs in (NFR-04).

**Related:** [privacy-and-retention](privacy-and-retention.md) (recipients and data abroad) · NFR-03 · NFR-31

### NFR-03 · Pages are quick, and always current where it matters

**Label:** — (approved design); speed target **[P] (new)** · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.**
- **Cached pages.** The catalog pages (packages and add-ons) are cached, so they load quickly. The cache is refreshed whenever an admin edits the catalog.
- **Live pages.** Availability, booking, the status page, and every admin page are always live. They are never served from a cache, so a customer never sees an old "Available".
- **Light pages.** No page keeps asking the server for updates in the background (no polling). Every call to an outside service has a time limit. Vercel's image optimization is not used.

**Details.**
- These choices also keep usage inside the Vercel Hobby limits (NFR-06).
- **Success criterion.** A customer on a phone can submit a request in a few minutes and receive a reference code and a QR code ([project-charter](../00-project/project-charter.md), success criteria).
- **Speed target [P] (new).** The approved design sets no number for page speed. Proposal: the week-1 test records the real delays between the website and the database. The go / no-go decision at the end of the week-1 test then sets a target, and the target is added here.

**How it is checked.** Week-1 item 1 (latency). End-to-end tests at phone size (NFR-16).

**Related:** NFR-06 · NFR-16 · [functional-requirements](functional-requirements.md) (FR-PUB-02)

---

## 3. Availability and free-plan risks

### NFR-04 · Knowing when the site is down

**Label:** — (approved design); who gets the alerts **[P] (new)** · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.**
- The approved design promises no uptime percentage. Free plans come with no uptime guarantee.
- An uptime check in Sentry calls the health check address `/api/health` regularly ([functional-requirements](functional-requirements.md), FR-SYS-11). If it fails, Sentry sends an alert.
- Alerts go to the Super Admin **[P] (new)**.

**Details.**
- **Bookings are safe during a website outage.** All bookings and payments live in the Supabase database, not on Vercel. A website outage stops new requests, but loses no data.
- **A failed email never blocks a change.** If an email cannot be sent, the status change still stands. The status page always shows the true status (NFR-33).
- **A deploy does not lose a customer's form.** If a new version goes live while a customer is filling in the form, the page asks the customer to reload. The draft and the duplicate-submission key are kept in the browser session ([edge-cases](edge-cases.md) EC-02).

**How it is checked.** **[P] (new):** the uptime check and its alert are set up and tried before launch. The deploy case is in the test plan.

**Related:** NFR-23 · NFR-24 · NFR-33 · [edge-cases](edge-cases.md) EC-02, EC-80

### NFR-05 · Vercel Hobby terms: an accepted risk

**Label:** [C] · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.** The website runs on Vercel Hobby, chosen knowingly **[C]**. The system must stay easy to move to another host.

**Details.**
- **The risk.** Vercel's Hobby plan is for non-commercial use only. Vercel may disable a Hobby project with or without notice.
- **In plain words.** If Vercel disables the project, customers cannot open the website until it is moved. The bookings and payments stay safe in Supabase.
- **How the risk is reduced.** The design is portable (NFR-31): all data and rules live in Supabase, the business controls its own domain settings, no Vercel-only storage is used, and a Docker build is tested in the automatic checks.
- **The exit.** Move to Vercel Pro (about US$20 per month) or to a Node.js host that allows commercial use. This is a change of configuration, not a rewrite. The exit steps will be in the operations runbook (planned: `07-operations/deployment-and-operations.md`). Paying for a host is a new decision (NFR-01).

**How it is checked.** The Docker build runs in the automatic checks (NFR-31).

**Related:** NFR-01 · NFR-31 · [decision-log](../00-project/decision-log.md) (D-20)

### NFR-06 · Stay inside Vercel Hobby's usage limits

**Label:** [U] for the limit figures · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.** The system must stay well inside Vercel Hobby's monthly allotments.

**Details.**
- **The risk.** Going over any monthly allotment pauses all projects until someone acts. The allotments are about 4 active-CPU-hours or 1 million function calls per month **[U]**.
- **How the risk is reduced:**
  - catalog pages are static (NFR-03);
  - no polling;
  - Turnstile and the rate limits stop bots from using up the allowance (NFR-11, NFR-12);
  - every outgoing call has a time limit;
  - no Vercel image optimization.
- **Weekly check.** Usage is checked weekly, by the Super Admin **[P] (new)**.
- **Vercel's own scheduler runs only once a day on Hobby.** So it is used only as the daily backup sweep ([functional-requirements](functional-requirements.md), FR-SYS-08). The every-minute jobs run in Supabase.

**How it is checked.** Week-1 item 8 compares real usage with the Hobby allotments. After launch, the weekly usage check.

**Related:** NFR-01 · NFR-03 · NFR-05 · [functional-requirements](functional-requirements.md) (FR-SYS-08, FR-ADM-02 no background refresh)

### NFR-07 · The free Supabase project is never paused

**Label:** — (approved design) · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.** The free Supabase project must never be paused for low activity.

**Details.**
- **The risk.** Supabase pauses a free project after 7 days of low activity. A paused database means no bookings at all.
- **How the risk is reduced:**
  - a daily keep-alive query ([functional-requirements](functional-requirements.md), FR-SYS-07);
  - real traffic from customers and admins;
  - watching for Supabase's warning emails.
- **Supabase Free has no backups.** The system makes its own (NFR-27 to NFR-29).

**How it is checked.** Week-1 item 4 checks the scheduled jobs (`pg_cron`, `pg_net`) on the free plan and the keep-alive.

**Related:** NFR-24 · NFR-27 · [functional-requirements](functional-requirements.md) (FR-SYS-07)

### NFR-08 · Vendor terms are read and saved before launch

**Label:** [U] · **Based on:** [O-08](../00-project/decision-log.md)

**Requirement.** Before launch, the terms of Vercel, Supabase, Resend, and Sentry are read in full, together with their data processing agreements, and dated copies are saved.

**Details.**
- **Why.** The terms were not read in full during research **[U]**. Several figures in this document, such as the Vercel allotments (NFR-06) and the email limits (NFR-33), come from summaries or a docs mirror.
- This is part of open item O-08. The legal review of privacy and retention in O-08 is covered in [privacy-and-retention](privacy-and-retention.md).

**How it is checked.** The saved, dated copies exist before launch.

**Related:** [decision-log](../00-project/decision-log.md) (O-08) · NFR-06 · NFR-33

---

## 4. Security baseline

These requirements are the minimum security level. The full list of threats and the detailed controls will be in the [security](../05-technical/security.md) doc (planned).

### NFR-09 · Strong admin login

**Label:** — (approved design) · **Based on:** [D-07, D-20](../00-project/decision-log.md)

**Requirement.**
- There is no public sign-up. The admin accounts are created by a setup script. The account rules (one Super Admin, one active Admin, reset, backup codes, the break-glass script) are defined only in [roles-and-permissions](roles-and-permissions.md).
- Passwords are stored only as an argon2id hash (fallback: scrypt), never as the password itself.
- Two-factor login with an authenticator app (TOTP) is required before the admin area opens.
- Sessions can be ended. A password reset ends all of that person's sessions.
- Login attempts are rate-limited (NFR-11).
- The login screen and its steps are defined in [functional-requirements](functional-requirements.md) (FR-ADM-01).

**Developer note.** Better Auth 1.7.x with the admin plugin and required TOTP 2FA; argon2id through `@node-rs/argon2`.

**How it is checked.** Week-1 item 3 (login with argon2id and 2FA on Vercel). An end-to-end test where an admin logs in with 2FA.

**Related:** [roles-and-permissions](roles-and-permissions.md) (account rules) · NFR-11

### NFR-10 · Server-side checks and least-privilege database access

**Label:** — (approved design) · **Based on:** [D-07](../00-project/decision-log.md)

**Requirement.**
- Every admin page, action, and route checks the login and the role on the server. How this is enforced is described in [roles-and-permissions](roles-and-permissions.md), section 7.
- The app's database role can only call the app's functions and read what it needs.
- Backups use a separate, read-only database role.

**How it is checked.** Security tests call every admin endpoint while logged out and with the wrong role, and expect a refusal. The job routes are called without their secret, and must refuse.

**Related:** [roles-and-permissions](roles-and-permissions.md) · NFR-13 · NFR-27

### NFR-11 · Rate limits

**Label:** [P] · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.** The system limits how often one visitor can try each of these. The numbers are the defaults. All of them are settings, which only the Super Admin can change ([roles-and-permissions](roles-and-permissions.md)).

| Target | Default limit |
|---|---|
| Login | 5 failed attempts on one account → that account is locked for 15 minutes. 20 attempts per IP address per hour. |
| Status lookup | 10 per IP address per 15 minutes. 5 failed attempts per reference code per hour. |
| Form submission | 5 per IP address per hour. |
| Proof upload link | 3 per reservation per hour. |

**Example.** Someone types the wrong password 5 times on the Admin account. The account is locked for 15 minutes, even if the next try is correct.

**Details.**
- The counters are stored under a one-way code (an HMAC) of the IP address, never the IP address itself, and under an HMAC of the reference code plus mobile number. The IP key is replaced daily ([functional-requirements](functional-requirements.md), FR-SYS-06).
- The counters are deleted after 24 hours ([privacy-and-retention](privacy-and-retention.md)).

**How it is checked.** Security tests for each limit.

**Related:** NFR-09 · NFR-12 · NFR-13 · [glossary](../00-project/glossary.md) (rate limits)

### NFR-12 · Bot and flood protection on the public form

**Label:** — (approved design) · **Based on:** [D-16](../00-project/decision-log.md)

**Requirement.** The public reservation form is protected by all of these:
- **Turnstile**, Cloudflare's free bot check;
- **a honeypot**: a hidden field that people never see but bots often fill in;
- **validation twice**: in the app and again in the database;
- **the rate limits** (NFR-11);
- **the hold limits and the breaker**, defined in [business-rules](business-rules.md) (BR-07, BR-07a);
- **a duplicate-submission key**, so a double click or a retry returns the original reference code instead of creating a second request ([edge-cases](edge-cases.md) EC-01).

**Details.**
- **The risk.** Fake requests could tie up the sets, because a Pending Confirmation request holds capacity until it expires. Against this: hold limits, the breaker, Turnstile, and admins rejecting fake requests.
- The status page needs the reference code and the full mobile number ([functional-requirements](functional-requirements.md), FR-PUB-10).

**How it is checked.** Database tests for the hold limits and the breaker. Security tests for the rate limits.

**Related:** [business-rules](business-rules.md) (BR-07, BR-07a) · NFR-11 · [edge-cases](edge-cases.md) EC-14, EC-01

### NFR-13 · Secrets, keys, and random codes

**Label:** — (approved design); identifiers [P]; backup key [P] (new) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.**
- **Secrets** (passwords to services, API keys) live only in Vercel's and GitHub's encrypted settings. They are never written in the code. Preview deployments (test versions of the website) never get production secrets.
- **Job routes.** The two addresses the scheduled jobs call refuse any call without the right secret. How they are protected is defined in [functional-requirements](functional-requirements.md) (FR-SYS-09).
- **Random codes [P].** Reference codes and QR tokens are made with a cryptographically secure random generator. A QR token has 160 random bits. Only a one-way hash (SHA-256) of the QR token is stored, so a leaked database does not reveal working QR links. The formats are in [functional-requirements](functional-requirements.md) FR-PUB-08.
- **IP addresses** are kept only as an HMAC, never as the address itself. The key is replaced daily ([functional-requirements](functional-requirements.md), FR-SYS-06).
- **Backup key [P] (new).** Backups are encrypted to a public key (NFR-27). The matching private key, needed for a restore, is kept offline by the Super Admin. It is never stored in GitHub.

**How it is checked.** Security tests for the job routes without the secret and for revoked QR tokens. Unit tests for reference-code and token generation.

**Related:** NFR-10 · NFR-11 · NFR-27 · [security](../05-technical/security.md) (planned)

### NFR-14 · Safe proof uploads

**Label:** — (approved design) · **Based on:** [D-05](../00-project/decision-log.md)

**Requirement.** Payment-proof images are never public. Only a customer who has passed the reference code and mobile number check can upload one, and only admins can view them.

**Details.**
- **Private storage.** Proofs are kept in a private storage bucket, never at a public address.
- **Where the details live.** The upload itself (single-use upload link, accepted file types and sizes, the 2-upload limit, and removal of location data from the photo) is defined in [functional-requirements](functional-requirements.md) (FR-PUB-12). Admin viewing through short-lived links is FR-ADM-12. The rate limit on upload links is in NFR-11.
- What an upload does to the reservation (it pauses expiry) is BR-12 in [business-rules](business-rules.md).
- Proof images are deleted on a schedule, and they are not backed up ([privacy-and-retention](privacy-and-retention.md); NFR-27).

**How it is checked.** Week-1 item 5 (a signed upload to the private bucket, with the size and type limits). An end-to-end test where a customer uploads a proof and an admin verifies it.

**Related:** [business-rules](business-rules.md) (BR-12) · [functional-requirements](functional-requirements.md) (FR-PUB-12, FR-ADM-12) · NFR-11 · NFR-15

---

## 5. Privacy

### NFR-15 · Privacy by design

**Label:** [C] for the retention defaults (D-21); the rest is approved design · **Based on:** [D-21](../00-project/decision-log.md)

**Requirement.** The system collects, shows, and keeps as little personal data as it can, and it supports every privacy rule. The rules themselves (privacy notice, privacy officer, erasure, legal hold, breach procedure, and the retention schedule) are defined only in [privacy-and-retention](privacy-and-retention.md). This requirement lists what the system must do to support them.

**Details.**
- **No sensitive data.** The system never asks for IDs, birthdates, ages, religion, or health data. The form's notes field warns customers not to enter them ([privacy-and-retention](privacy-and-retention.md)).
- **Little shown in public.**
  - The status page never shows the customer's name, mobile number, or address ([functional-requirements](functional-requirements.md), FR-PUB-11).
  - The calendar never shows personal data ([business-rules](business-rules.md), BR-09).
  - A QR code scanned by someone who is not logged in shows only "present this at our office" ([functional-requirements](functional-requirements.md), FR-PUB-09).
- **No payer details from screenshots.** Payer names and account numbers are never copied from proof images. Only the e-wallet reference number is stored ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- **Clean logs.** Error reports are scrubbed of personal data (NFR-23). The audit log never stores customer contact data (NFR-25). IP addresses are kept only as an HMAC (NFR-13).
- **Automatic retention.** A daily retention job applies the retention schedule and skips records under legal hold ([functional-requirements](functional-requirements.md), FR-SYS-05; [privacy-and-retention](privacy-and-retention.md)). The periods are settings **[C]** (D-21), so they can change after the lawyer's review (O-08) without code changes.
- **Location of data.** Data is stored in Singapore (NFR-02).

**How it is checked.** Database tests for the retention job (blanking after 2 years, proof deletion, skipping legal-hold rows). **[P] (new):** security tests that the status page and the QR page show no personal data.

**Related:** [privacy-and-retention](privacy-and-retention.md) · NFR-13 · NFR-14 · NFR-23 · NFR-25

---

## 6. Devices, accessibility, and browsers

### NFR-16 · Mobile-first and responsive

**Label:** — (approved design); minimum width **[P] (new)** · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.**
- **Phone first.** The public site is designed for phones first, then for larger screens. A customer on a phone can submit a request in a few minutes and receive a reference code and a QR code ([project-charter](../00-project/project-charter.md), success criteria).
- **Admin panel on phone and laptop.** Admins can use the panel on a phone and on a laptop. They can scan a customer's QR code with the camera, or upload a screenshot of it if the camera does not work ([functional-requirements](functional-requirements.md), FR-ADM-06).
- **Minimum width [P] (new).** Every page works on a screen 360 pixels wide (a small Android phone) without sideways scrolling.

**How it is checked.** End-to-end tests run at phone and desktop sizes. Week-1 item 6 tests QR scanning on the real phone and laptop the admins will use.

**Related:** NFR-03 · NFR-17 · NFR-18

### NFR-17 · Accessibility baseline

**Label:** [P] (new) · **Based on:** — (proposal in this document)

**Requirement.** The public site and the admin panel meet this baseline. WCAG 2.2 level AA (the common web accessibility standard) is the guide for these checks.

1. **Keyboard.** Every link, button, field, date picker, and dialog works with a keyboard alone (Tab, Shift+Tab, Enter, Space, the arrow keys, and Esc). The keyboard focus is always visible, and it moves in the order of the page.
2. **Contrast.** Normal text has a contrast of at least 4.5 to 1 against its background. Large text, icons, and field borders have at least 3 to 1.
3. **Labels.** Every form field has a visible label. Placeholder text alone is not a label. Required fields say "required" in words.
4. **Clear errors.** An error message says what is wrong and how to fix it. It appears next to the field and is read out by screen readers. *Example:* "Enter a Philippine mobile number, for example 0917 123 4567" (accepted forms: BR-11).
5. **Not by colour alone.** Statuses, Available or Full, and the urgent flag are always shown in words, not only by colour. The calendar already shows words ([business-rules](business-rules.md), BR-09).
6. **Images and the QR code.** Meaningful images have a text description. The QR code is always shown together with the reference code as text, so the code can be typed or read out.
7. **Zoom and large text.** Pages still work at 200% zoom, and with a phone's large-text setting, without cut-off content.
8. **Tap size.** Main buttons and links are large enough to tap with a thumb: about 44 × 44 pixels.

**Details.** The UI library (shadcn/ui) is built on accessible components. That helps, but it does not replace these checks.

**How it is checked [P] (new).** An automated accessibility scan (for example, axe) runs inside the end-to-end tests at phone and desktop sizes. The acceptance checklist includes one booking and the main admin actions done with the keyboard only.

**Related:** NFR-16 · NFR-18 · [functional-requirements](functional-requirements.md)

### NFR-18 · Supported browsers

**Label:** [P] (new) · **Based on:** — (proposal in this document)

**Requirement.**

| Area | Supported | Notes |
|---|---|---|
| **Public site** (customers) | The current and the previous major version of: Chrome on Android, Safari on iPhone and iPad, Samsung Internet; and on computers, Chrome, Edge, Firefox, and Safari | Also the in-app browsers of Facebook and Messenger, because customers may open the site from a Facebook post or a Messenger chat |
| **Admin panel** | The current version of Chrome or Edge on the laptop; Chrome on Android or Safari on iPhone | Camera scanning of QR codes needs a secure (HTTPS) address and camera permission. The screenshot upload works in every supported browser. |
| **Not supported** | Internet Explorer; browsers with JavaScript turned off | The bot check (Turnstile) needs JavaScript |

**How it is checked [P] (new).** The end-to-end tests run in Chromium and WebKit (the engines behind Chrome and Safari). Before launch, one booking is tried by hand in the Facebook in-app browser.

**Related:** NFR-16 · NFR-17

---

## 7. Time zone

### NFR-19 · Every date and time is Manila time

**Label:** [C] · **Based on:** [D-18](../00-project/decision-log.md)

**Requirement.** Every calendar date in the system is an Asia/Manila date: the event date, "today", "the previous day", year numbers, and the closure year. Every time shown is Manila time (UTC+8; the Philippines has no daylight saving time).

**Details.**
- **A visitor's phone setting does not matter.** A customer whose phone is set to another time zone, for example a relative booking from Dubai, still sees Manila times. The status page shows the current deadline in Manila time.
- **Example: "today".** A customer sends a request at 12:30 AM on Thursday 24 December 2026, Manila time, for an event that same day. In UTC (world time) it is still 4:30 PM on Wednesday 23 December. The system uses the Manila date, so the request is for "today": it is same-day and flagged urgent ([business-rules](business-rules.md), BR-06 and BR-06a).
- **Example: year numbers.** A deposit recorded at 12:30 AM on Friday 1 January 2027, Manila time, gets a 2027 acknowledgment number, such as `ACK-2027-0001`, even though in UTC it is still 31 December 2026. The numbering rule is in [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Developer note.**
  - Event dates are stored as `date`. Service start and deadlines are exact moments, stored as `timestamptz`.
  - Daily jobs run at 00:15 Manila time, which is `15 16 * * *` in UTC cron. They compute dates with `now() AT TIME ZONE 'Asia/Manila'`.
  - Code formats times with `Intl.DateTimeFormat` and `timeZone: 'Asia/Manila'`.

**How it is checked.** Database tests for the same-day notice in Manila time, including a walk-in after the start. Unit tests for time-zone formatting.

**Related:** [glossary](../00-project/glossary.md) (Manila time) · [business-rules](business-rules.md) (BR-06, BR-06a, BR-09) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (deadlines) · [privacy-and-retention](privacy-and-retention.md) (closure year)

---

## 8. Data integrity

### NFR-20 · No double booking

**Label:** — (approved design) · **Based on:** [D-02](../00-project/decision-log.md)

**Requirement.** No set, room, or add-on is ever double-booked, including when two people book at the same moment ([project-charter](../00-project/project-charter.md), success criteria). The capacity rules themselves are BR-01 to BR-05 in [business-rules](business-rules.md).

**Details.**
- **One capacity lock.** Every change that uses or frees capacity (book, reschedule, edit, block, recreate) first takes one shared lock. So two changes never check the same free set at the same moment.
- **A hard guard in the database.** A unique index allows only one live claim per set or room per date. It covers bookings and blocks together. Even a programming mistake cannot create a second live claim.
- **Add-on stock.** Add-on totals are checked while the lock is held.
- **Why one lock is enough.** A date has only a few resources (2–3 sets and 1 room), so the volume is small. One lock is simple and safe at this size, and it avoids lock-ordering problems.
- **Example.** Carla and Dan press Submit at the same instant for the last free set. Exactly one gets it. The other sees "just taken, pick another date" and keeps the form data ([business-rules](business-rules.md), "Worked example: one busy date").

**Developer note.** The lock is a single row taken with `SELECT … FOR UPDATE`. The guard is a partial unique index on live claims across `reservation_resources` and `block_resources` (spec v0.2 §11, §12).

**How it is checked.** A database test with two simultaneous bookings for the last set, where exactly one wins. Week-1 item 2 runs it on the real database.

**Related:** [business-rules](business-rules.md) (BR-01 to BR-05) · NFR-21 · [edge-cases](edge-cases.md) EC-03, EC-04

### NFR-21 · Every change is one complete step

**Label:** — (approved design) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.**
- **One database call per change.** Every booking and every admin action is one database function call. The change either happens completely or not at all. For example, a status change and its email are saved together: the email is queued in the same step ([functional-requirements](functional-requirements.md), FR-NTF-16).
- **Rules live in the database.** Booking, capacity, deadlines, payments, and status changes are database functions. The app checks the input and calls one function per action. This keeps the rules testable and the app portable (NFR-31).
- **Two admins at once.** Each action checks the reservation's current status and version. If both admins act on the same reservation, the second one sees "already changed, please refresh" ([edge-cases](edge-cases.md) EC-16).
- **Deadlines are checked, not left to jobs.** Every action treats an overdue hold as expired at once, even before the every-minute job runs ([business-rules](business-rules.md), BR-05; [reservation-lifecycle](../02-domain/reservation-lifecycle.md)).
- **Checked twice.** Input is validated in the app and again in the database.
- **Prices on the server.** Prices are calculated on the server, never taken from the browser ([catalog-and-payments](../02-domain/catalog-and-payments.md)).

**How it is checked.** Database tests for every allowed and every forbidden status change, and for each rule.

**Related:** NFR-20 · NFR-22 · [reservation-lifecycle](../02-domain/reservation-lifecycle.md)

### NFR-22 · Nothing is deleted by mistake

**Label:** — (approved design) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.** Business records are never deleted. Mistakes are fixed with a new action and a reason, and the fix is recorded in the audit log.

**Details.**

| Record | Instead of deleting | Rule lives in |
|---|---|---|
| Reservations | Fixed with a new action and a reason ("no deletions") | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Packages, add-ons, and slots | Archived | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Payments | Voided with a reason; the acknowledgment number is retired, never reused | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Blocks | Moved to `removed`, with a reason | [business-rules](business-rules.md) (BR-08) |
| Audit log | Append-only: entries are only added, never changed | NFR-25 |

- **The only planned removals** are the ones in the retention schedule: personal data blanked after its period, proof images deleted, and short-lived technical records (rate-limit counters, duplicate-submission keys) removed. They are defined in [privacy-and-retention](privacy-and-retention.md), together with erasure requests.

**How it is checked.** Database tests for voids, edit details, and recreate. **[P] (new):** a test that the app's database role cannot delete these records.

**Related:** NFR-21 · NFR-25 · [privacy-and-retention](privacy-and-retention.md)

---

## 9. Observability (seeing what the system does)

### NFR-23 · Errors are recorded without personal data

**Label:** — (approved design) · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.**
- Sentry (free plan) records every error, with personal data scrubbed before it is sent.
- Vercel keeps its runtime logs for only 1 hour. So Sentry and the audit log in the database are the lasting record of what happened.

**How it is checked [P] (new).** Before launch, a test error is sent, and the report is checked for personal data.

**Related:** NFR-04 · NFR-15 · NFR-25 · [privacy-and-retention](privacy-and-retention.md) (provider copies)

### NFR-24 · Scheduled jobs are watched

**Label:** — (approved design); who gets the alerts **[P] (new)** · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.**
- Every scheduled job writes a record each time it runs, the heartbeat ([functional-requirements](functional-requirements.md), FR-SYS-10).
- A Sentry cron monitor alerts if the heartbeat stops. Alerts go to the Super Admin **[P] (new)**.
- The daily backup sweep on Vercel also checks the heartbeat ([functional-requirements](functional-requirements.md), FR-SYS-08).

**How it is checked.** Week-1 item 4 (scheduled jobs on the free plan). **[P] (new):** before launch, a job is stopped on purpose to see the alert fire.

**Related:** NFR-07 · NFR-26 · [functional-requirements](functional-requirements.md) (FR-SYS-08, FR-SYS-10)

### NFR-25 · Every change can be traced

**Label:** — (approved design) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.** Every status change and every admin action can be traced: who did it, when, and why ([project-charter](../00-project/project-charter.md), success criteria).

**Details.**
- **The audit log** does this. Entries are only added, never changed; old entries are removed only by the retention schedule ([privacy-and-retention](privacy-and-retention.md)).
- **No customer contact data** is ever stored in it, so tracing never spreads personal data.
- What each entry shows, and the reservation history built from it, are defined in [functional-requirements](functional-requirements.md) (FR-ADM-32).

**How it is checked.** Database tests that every action writes an audit entry with the right fields.

**Related:** NFR-22 · NFR-23 · [functional-requirements](functional-requirements.md) (FR-ADM-32) · [privacy-and-retention](privacy-and-retention.md) (how long entries are kept)

### NFR-26 · A health panel for the admins

**Label:** — (approved design) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.** Both admins can see whether the system is working without technical tools. The admin health panel shows the scheduled jobs, failed emails, the email queue, cap usage, and storage use. The screen itself is defined in [functional-requirements](functional-requirements.md) (FR-ADM-33).

**How it is checked [P] (new).** An end-to-end test that an email marked failed appears on the health panel.

**Related:** NFR-24 · NFR-33 · [roles-and-permissions](roles-and-permissions.md) (both admins can view it)

---

## 10. Backup and restore

### NFR-27 · Nightly encrypted backups, kept 14 days

**Label:** — (approved design); the private repository **[C]** (D-22) · **Based on:** [D-22](../00-project/decision-log.md)

**Requirement.**
- **Every night** there is a new encrypted copy of the whole database. The backup job itself is defined in [functional-requirements](functional-requirements.md) (FR-SYS-12).
- **Kept 14 days.** Each copy is stored as a GitHub workflow artifact with `retention-days: 14`, so it is removed automatically after 14 days.
- **Always encrypted.** Copies are encrypted with `age` to a public key; the private key stays offline (NFR-13). A read-only database role makes the copy (NFR-10).
- **Private repository first.** The repository must be private before backups are added **[C]** (D-22). The Super Admin will do this (open item O-06).
- **No proof images.** Payment-proof images are not backed up, by design. The e-wallet reference number in the payment record is the lasting record.

**Details.**
- **In plain words.** If the database were lost, the newest backup would be at most about one day old.
- The overall limit on how long backups may be kept is in the retention schedule in [privacy-and-retention](privacy-and-retention.md). The 14-day artifacts fit inside it.
- The step-by-step backup and restore runbook will be in deployment and operations (planned: `07-operations/deployment-and-operations.md`).

**How it is checked.** Week-1 item 7 (a backup through the session pooler). Before launch, a check that the repository is private.

**Related:** NFR-28 · NFR-29 · [functional-requirements](functional-requirements.md) (FR-SYS-12) · [decision-log](../00-project/decision-log.md) (D-22, O-06)

### NFR-28 · One offline copy each month

**Label:** — (approved design) · **Based on:** [D-22](../00-project/decision-log.md)

**Requirement.** Once a month, the Super Admin downloads one encrypted backup to their own drive and destroys the previous offline copy. Only the latest monthly copy is kept ([privacy-and-retention](privacy-and-retention.md)).

**Details.** The offline copy protects the business if the GitHub account or the backups there are lost. It stays encrypted (NFR-13).

**How it is checked [P] (new).** The monthly step is on the operations checklist (planned: `07-operations/deployment-and-operations.md`).

**Related:** NFR-27 · NFR-29

### NFR-29 · Restore is tested

**Label:** — (approved design) · **Based on:** [D-23](../00-project/decision-log.md) (approved design)

**Requirement.**
- A restore from backup is tested in the week-1 test and again before launch.
- **After any restore, the retention job runs before the system reopens.** A backup can be days or weeks old (the monthly offline copy even older). Some data in it may have passed its retention period since then. Running the retention job first removes that data again, so a restore never brings back data that should be gone ([privacy-and-retention](privacy-and-retention.md)).

**How it is checked.** Week-1 item 7 (restore test). The restore test is repeated in the test phase before launch ([project-charter](../00-project/project-charter.md), phase 6).

**Related:** NFR-27 · NFR-28 · [functional-requirements](functional-requirements.md) (FR-SYS-05)

---

## 11. Maintainability and portability

### NFR-30 · Pinned versions and fast security fixes

**Label:** — (approved design) · **Based on:** [D-19, D-20](../00-project/decision-log.md)

**Requirement.**
- **Pinned versions.** Every library version is pinned, so an update happens only on purpose.
  - Next.js is pinned exactly at 16.4.2 and never goes below 16.4.1, which has the security fixes of 2026-10-14. React is 19.3.1.
  - The other versions are pinned at setup. The full list is in spec v0.2 §10 until the architecture doc (planned: `05-technical/architecture.md`) is written.
- **Fast fixes.** Critical security fixes are applied within 24–48 hours. Dependabot opens pull requests for security updates.
- **Fewer risks.** Risky framework features are avoided.

**Details.** The developer (Super Admin) builds and maintains the system with Claude (D-19), so the developer applies these fixes.

**How it is checked.** Dependabot is switched on. The automatic checks run on every security update before it is merged.

**Related:** NFR-32 · [security](../05-technical/security.md) (planned)

### NFR-31 · Portable design

**Label:** — (approved design) · **Based on:** [D-20](../00-project/decision-log.md)

**Requirement.** The system can move off Vercel to another host by changing configuration, not by rewriting code (NFR-05).

**Details.**
- **All data and rules live in Supabase.** No Vercel-only storage is used.
- **The business controls its own domain settings (DNS).** Vercel does not.
- **Node.js runtime only** (NFR-02), which runs on almost any host.
- **A Docker build is tested** in the automatic checks, so the app is known to build as a container that another host can run.
- **Rules in Postgres.** Because the rules are database functions (NFR-21), the website part is thin and easy to move.
- **Note for O-05.** The QR code holds a web address (`https://<domain>/r/<token>`). With an own domain, a move to another host keeps every customer's QR code working. With the free `vercel.app` address, a move would change the address. This is worth weighing when O-05 is decided.

**How it is checked.** The Docker build runs in the automatic checks.

**Related:** NFR-05 · NFR-21 · [decision-log](../00-project/decision-log.md) (O-05) · deployment and operations (exit runbook, planned: `07-operations/deployment-and-operations.md`)

### NFR-32 · Code quality and automatic checks

**Label:** [C] TypeScript (developer's chosen language); strict mode per spec v0.2 §10 · **Based on:** [D-19](../00-project/decision-log.md)

**Requirement.**
- The code is TypeScript in strict mode.
- The rules are database functions, each one tested by database tests (pgTAP).
- Admin server code lives in its own module tree, apart from the public site ([roles-and-permissions](roles-and-permissions.md), section 7).
- On every push, GitHub Actions runs lint, type checks, unit tests, and database tests.

**How it is checked.** The automatic checks themselves. The test cases are in the test plan (planned for batch 4: `06-delivery/test-plan.md`).

**Related:** NFR-21 · NFR-30 · NFR-31

---

## 12. Email limits

### NFR-33 · Email stays inside the free plan, and nothing depends on it

**Label:** [U] for the free-plan limits; the sending mechanism [P] · **Based on:** [D-10, D-19](../00-project/decision-log.md)

**Requirement.**
- **Inside the free plan.** Emails are sent through Resend's free plan. It allows only a limited number of emails per day and per month, believed to be 100 a day and 3,000 a month **[U]**. The system must never try to send more than the free plan allows.
- **Nothing depends on an email.** A status change never waits for an email and is never undone because an email failed. If an email cannot be sent, the change stands. The email is retried, held for the next day, or marked failed and shown on the health panel (NFR-26; [edge-cases](edge-cases.md) EC-66, EC-67).
- **The status page is the source of truth.** Customers without email, or whose email is late, always see the true status there. Admins also get a prepared message to copy into SMS or Messenger ([functional-requirements](functional-requirements.md), FR-NTF-21).

**Details.** How sending works is defined only in [functional-requirements](functional-requirements.md): the outbox (FR-NTF-16), no duplicates (FR-NTF-17), retries and failed emails (FR-NTF-18), skipping stale emails (FR-NTF-19), and the cap settings with their defaults, the customer-first order, and the admin reserve (FR-NTF-20).

**How it is checked.** Week-1 item 4 sends a test email through Resend. Database tests for outbox de-duplication, retry, and skip. Before launch, the real limits are confirmed from Resend's terms (NFR-08).

**Related:** NFR-01 · NFR-08 · NFR-26 · [functional-requirements](functional-requirements.md) (FR-NTF-16 to FR-NTF-21) · [decision-log](../00-project/decision-log.md) (D-10)

---

## Changing a requirement

A change to a requirement marked **[C]** is a change to a decision. Follow "How to change a decision" in the [decision log](../00-project/decision-log.md): update the log first, then this document, then every other doc that the decision lists under "Docs affected". Requirements marked **[P]** or **[P] (new)** change the same way, through the decision log. Never edit the frozen [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) (D-23).
