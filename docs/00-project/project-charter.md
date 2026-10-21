# Project Charter

> **Purpose:** Why we are building the DJB Kasoundbox reservation system, who uses it, what the first release includes, and the limits we work within. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); written for readers without a technical background ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](decision-log.md), [Glossary](glossary.md), [Roles and permissions](../01-requirements/roles-and-permissions.md), [Privacy and retention](../01-requirements/privacy-and-retention.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §1, §2, §3, §4, §10, §14, §15, §17, §18, §19

**How to read this document.** Labels: **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item, listed in the [decision log](decision-log.md). Words with a special meaning, such as *hold*, *block*, or *reference code*, are explained in the [glossary](glossary.md).

This charter sets no business rules. Where a rule matters, it gives one line and a link to the document that owns it.

---

## 1. Why we are building this

DJB Kasoundbox is a small videoke rental business in the Philippines **[C]**. It offers two services **[C]**:

- **Delivery.** Staff bring a videoke set to the customer's venue, set it up, and pick it up afterwards.
- **On-site.** The customer uses the business's own room.

The business has a small pool of 2–3 delivery sets and one on-site room **[C]**. With so few, every booking must be counted correctly. How capacity is counted is in [business-rules](../01-requirements/business-rules.md) (BR-01 to BR-04).

We are building a reservation system with two parts:

1. **A public website, for customers.** Customers browse videoke packages and add-ons, check which dates are free, and send a reservation request. They do not need an account.
2. **A private admin panel, for the business.** The two admins review requests, record payments, and run daily operations. Bookings that come by phone, walk-in, or Facebook are entered here too, so every booking uses the same calendar.

**The big picture, in five steps:**

1. A customer sends a request on the website. They get a reference code and a QR code, with a clear "Not yet confirmed" notice.
2. An admin reviews the request and approves or rejects it.
3. After approval, the customer pays a fixed deposit, in cash at the office or by e-wallet. An admin records the payment.
4. The booking becomes **Confirmed**.
5. After the event, the system marks the booking **Completed** on its own.

The exact statuses, deadlines, and exceptions (such as same-day bookings) are in [reservation-lifecycle](../02-domain/reservation-lifecycle.md). Prices, deposits, and payments are in [catalog-and-payments](../02-domain/catalog-and-payments.md).

## 2. Success criteria

The first release succeeds when all five statements below are true.

| # | The release succeeds when… | Example | Specified in |
|---|---|---|---|
| 1 | A customer on a phone can send a request in a few minutes and receive a reference code and a QR code. | Ana fills in the form on her phone and sees her reference code (for example `KSB-7Q2M-K9TX`) and her QR code on screen. | [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-04 to FR-PUB-08), [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-16) |
| 2 | No set, room, or add-on is ever double-booked, even when two people book at the same moment. | Only one delivery set is still free on Thursday 24 December 2026. Carla and Dan press Submit at the same instant. Only one of them gets the set; the other sees "just taken, pick another date". | [business-rules](../01-requirements/business-rules.md) (BR-01 to BR-04) |
| 3 | A request becomes Confirmed only through an admin action. A reference code or QR code never means the booking is approved or paid. | Ana's status page shows **Pending Confirmation** until an admin acts on her request. Showing her QR code at the office does not confirm anything by itself. | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| 4 | Every status change and admin action can be traced: who, when, and why. | If a booking is cancelled, its history shows which admin cancelled it, at what time (Manila time), and the reason given. | [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-32), [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-25) |
| 5 | Running cost is ₱0 per month on free tiers **[C]**. | No monthly bills. Whether to buy a domain name or use the free `vercel.app` address is still open (O-05). | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-01) |

## 3. Stakeholders and who uses what

Two people run the system, each with their own admin account **[C]**. Customers have no accounts **[C]**.

| Who | Account | Uses | What they do with it |
|---|---|---|---|
| **The developer** (the business owner's son) | **Super Admin** | The admin panel, the code, and the service accounts (Vercel, Supabase, Resend, Sentry, GitHub, Cloudflare) | Builds and maintains the system, with help from Claude. Can do everything in the admin panel, including managing the admin accounts and the main business settings. |
| **The business owner** (his father) | **Admin** | The admin panel, on a phone or a laptop | Runs daily reservations: reviews requests, records deposits and balance payments, enters phone, walk-in, and Facebook bookings, keeps packages, add-ons, and prices up to date, and blocks a set or the room when needed. |
| **Customers** | None. Customers never log in. | The public website, usually on a phone | Browse, check availability, and send a request. Give a mobile number (required) and an email address (optional). Check the status with the reference code and the full mobile number. Upload a deposit proof. Pay in cash at the office or by e-wallet. To cancel or change a booking, they contact the business. |
| **Claude** (an AI assistant) | None | The developer's tools | Helps the developer write these docs and the code **[C]**. |
| **A Philippine lawyer and a CPA** | None | These docs, before launch | Review privacy, data retention, and business registration (O-08, O-10, O-11). |
| **Service providers** | None | — | Run parts of the system and hold some data for the business. Who they are and what they hold is in [privacy-and-retention](../01-requirements/privacy-and-retention.md). |

Notes:

- **Exact permissions.** The table above only describes how each person uses the system. Who may do what is defined in one place only: [roles-and-permissions](../01-requirements/roles-and-permissions.md). That document also has the account rules (resets, backup codes, and what to do if a 2FA phone is lost).
- **Where the QR code is used [C].** Customers show the QR code when they visit the office or pay. They quote the reference code when they message or call. The QR code is not used on event day.
- **Emails.** Both admins get an email for every new online request, and see it on the dashboard **[C]**. Customers get emails only if they gave an address. The full list is in [functional-requirements](../01-requirements/functional-requirements.md) (FR-NTF-01 to FR-NTF-15).

## 4. Scope

**MVP** (minimum viable product) means the first release: the smallest version the business can use for real bookings.

### 4.1 In the MVP

| Area | What is included | Details in |
|---|---|---|
| Public website | Home; packages and add-ons; availability calendar; reservation form; confirmation page with the reference code and QR code; status page (with deposit-proof upload while Awaiting Deposit, and payment acknowledgments); privacy notice; contact and FAQ | [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-01 to FR-PUB-16) |
| Admin login | Login with required two-factor authentication (2FA: a password plus a code from an app on your phone); the Super Admin and Admin roles | [roles-and-permissions](../01-requirements/roles-and-permissions.md) |
| Dashboard | Urgent and pending requests; "proofs to verify" list; upcoming events; deadline alerts; a banner when online booking is paused | [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-02) |
| Reservations | List and search; QR scan; details; internal notes; history | [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-03 to FR-ADM-06, FR-ADM-32) |
| Reservation actions | Approve; reject; flag or clear "needs info"; edit details; record or void a deposit; verify or reject an uploaded proof; waive the deposit for a same-day booking; record a balance payment; extend a deadline; reschedule; cancel with a refund decision; record a refund paid; mark a Completed event as "not held"; recreate an expired request; reissue a QR code | [reservation-lifecycle](../02-domain/reservation-lifecycle.md), [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Staff-created bookings | Bookings that arrive by phone, walk-in, or Facebook, entered by an admin | [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-24), [business-rules](../01-requirements/business-rules.md) (BR-06a) |
| Blocks | Block a single set, the room, or a whole date | [business-rules](../01-requirements/business-rules.md) (BR-08) |
| Catalog | Packages, add-ons, prices, daily stock | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Settings and admin tools | Settings, including delivery slots and resources (the sets and the room); admin accounts; legal hold and erasure; audit log; health panel | [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-27 to FR-ADM-33), [privacy-and-retention](../01-requirements/privacy-and-retention.md) (legal hold, erasure) |
| Emails | Customer notifications, admin alerts, deposit reminders | [functional-requirements](../01-requirements/functional-requirements.md) (FR-NTF-01 to FR-NTF-21) |
| Behind the scenes | Scheduled jobs, nightly encrypted backups, and monitoring | [functional-requirements](../01-requirements/functional-requirements.md) (FR-SYS-01 to FR-SYS-12), [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-23 to NFR-29) |

### 4.2 Later, after the MVP

- Messenger notifications, automated, for customers who opt in **[C]**. They will be re-researched before they are built **[U]**.
- SMS notifications.
- Online payment gateway.
- Revenue reports, CSV export, and charts.
- Promotions manager, gallery, and reviews.
- Multiple branches.

Until Messenger is built, customers without email rely on the status page, and admins can copy a prepared message to send by SMS or Messenger themselves ([functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-21).

### 4.3 Out of scope by confirmed decision [C]

- **Customer accounts.** Customers use their reference code and mobile number instead.
- **Customer self-cancel.** Customers contact the business, and an admin cancels.
- **Customer-initiated rescheduling.** Admins reschedule, case by case.

## 5. Constraints

| Constraint | What it means in practice | Details in |
|---|---|---|
| **₱0 per month: free tiers only [C]** | Every service runs on a free plan. Free plans have limits, for example on how many emails can be sent per day. A domain name is the only cost still being considered (O-05). | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-01, NFR-33) |
| **Website hosted on Vercel Hobby, risk accepted [C]** | Vercel runs the website. Its free Hobby plan is for non-commercial use only, and Vercel may disable a project with or without notice. Going over a monthly usage limit also pauses the site until someone acts. This plan was chosen knowingly. The system is built so it can move to Vercel Pro (about US$20 per month) or another host by changing its configuration, not by rewriting it. | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-05, NFR-06, NFR-31), [decision log](decision-log.md) (D-20) |
| **Database on Supabase Free, in Singapore** (approved design) | Supabase holds the database and the uploaded files. A free project pauses after 7 days of low activity, and the free plan has no backups. The system runs a daily keep-alive and makes its own nightly backups. | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-02, NFR-07, NFR-27 to NFR-29) |
| **Philippines: pesos and Manila time [C]** | Prices are in pesos (₱). Every date and time in the system and in these docs is Asia/Manila time. | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-19) |
| **Unregistered small business [C]** | The business is not registered because it is small and local; privacy law still applies, and the facts to review with a CPA or lawyer (O-11) are in [privacy-and-retention](../01-requirements/privacy-and-retention.md). | [privacy-and-retention](../01-requirements/privacy-and-retention.md) |
| **One developer, with Claude [C]** | The developer builds the system with Claude. The code is TypeScript [C]. | [decision log](decision-log.md) (D-19) |
| **Chosen tools** | Confirmed **[C]**: Vercel Hobby (website, Singapore region, Node.js only) and Tailwind CSS with shadcn/ui (page design). Approved design (no label in spec v0.2 §10): Next.js (website framework), Supabase Free in Singapore (database and files), Better Auth (admin login), and Resend (email). | Full stack: [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §10 |
| **Private code repository (O-06)** | The GitHub repository that holds the code must be made private before backups are added. The Super Admin will do it **[C]**. | [decision log](decision-log.md) (O-06) |

## 6. Phases

| Phase | Status | What happens | Finished when |
|---|---|---|---|
| 1. Discovery | Done | A first round of questions about the business, recorded in the [discovery brief](discovery-brief.md). It is now kept for history only. | The questions were answered in the brainstorming session on 2026-10-21. |
| 2. Design | Done | The design spec v0.2: rules, statuses, tools, security, and testing. A review by several reviewers raised 48 findings, and all were applied. | The spec was approved and frozen on 2026-10-21 **[C]**. From then on, these docs are the source of truth. |
| 3. Docs | In progress | These documents, written in English and in batches, each batch reviewed **[C]**. | All batches are written and reviewed. Batch 4 includes the roadmap and the test plan. |
| 4. Week-1 test | Next | A short technical trial on the real free services in Singapore, before any features are built. It checks the connection between the website and the database; two bookings at the same moment; admin login with 2FA; scheduled jobs and a test email; proof uploads; QR scanning on the real phone and laptop that will be used; a backup and a restore; and real usage against the Vercel free-plan limits. | A go / no-go decision. Anything that fails is fixed before features are built. |
| 5. Build | Planned | The developer builds the MVP features (section 4.1) with Claude. | The MVP is built. The order of work is set in the roadmap. |
| 6. Test | Planned | Automated tests check the database rules, the code, full customer and admin journeys at phone and desktop size, and security. Then both admins work through a checklist of real scenarios, and the restore test is repeated. | Both admins accept the checklist, and the restore test passes. |
| 7. Launch | Planned | The website opens to customers. | Before launch, the vendor terms are read and saved, and a Philippine lawyer reviews privacy and retention (O-08). The other open items are tracked in the [decision log](decision-log.md). |

The phase order, milestones, and gates are in the roadmap (batch 4), with no calendar dates. Test cases are in the test plan (batch 4).

## 7. Where to find details

| If you want to know… | Read |
|---|---|
| What a word means | [Glossary](glossary.md) |
| What was decided, why, and what is still open | [Decision log](decision-log.md) |
| Who can do what in the admin panel | [Roles and permissions](../01-requirements/roles-and-permissions.md) |
| When a date shows Full, and the limits on online requests | [Business rules](../01-requirements/business-rules.md) |
| What each page, admin action, and email must do | [Functional requirements](../01-requirements/functional-requirements.md) |
| Cost, hosting, security, backups, and other quality requirements | [Non-functional requirements](../01-requirements/non-functional-requirements.md) |
| What happens in unusual situations | [Edge cases](../01-requirements/edge-cases.md) |
| What personal data is kept, for how long, and the legal notes | [Privacy and retention](../01-requirements/privacy-and-retention.md) |
| What each status means, how a booking moves between statuses, and the deadlines | [Reservation lifecycle](../02-domain/reservation-lifecycle.md) |
| Packages, add-ons, prices, deposits, payments, and acknowledgments | [Catalog and payments](../02-domain/catalog-and-payments.md) |
| The original approved design (frozen, kept for history, never edited) | [Design spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) |

## 8. Changing this charter

The scope and constraints in this charter come from confirmed decisions. To change one, follow "How to change a decision" in the [decision log](decision-log.md): update the log first, then this charter and every other document that decision lists.
