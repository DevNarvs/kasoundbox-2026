# Decision Log

> **Purpose:** Every confirmed decision about the DJB Kasoundbox reservation system (D-01 onwards), the items still open (O-02 to O-11), and how to change a decision. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); written for readers without a technical background ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Glossary](glossary.md) (meaning of terms) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §1, §2, §3, §4, §6, §7, §8, §9, §10, §14, §15, §18, §19; options considered come from the [discovery brief](discovery-brief.md) §6 and §7 (history only)

**How to read this log.**

- Each decision has an ID (D-01, D-02, …). Each entry gives the date, the decision, the options that were considered, a short rationale (why we chose it), and the docs it affects.
- All decisions in this first version were made on 2026-10-21, in the brainstorming session, by the developer (Super Admin) on behalf of the business. They were then approved together with the design spec (D-23).
- D-25 to D-38 were also made on 2026-10-21, by the developer: they are his answers to the urgent questions Q-001 to Q-014 of the [project status](project-status.md) (§3.1).
- Labels: **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item (section 3).
- This log says *what* was decided and *why*. The detailed rule lives in the doc that owns it. Each entry states the decision briefly and links to that doc for the full rule.
- Words with a special meaning, such as *hold*, *block*, or *service start*, are explained in the [glossary](glossary.md).

**Old IDs in the discovery brief.** The [discovery brief](discovery-brief.md) used D-01 to D-12 for its *unresolved* questions. Those old IDs are retired. In every doc from now on, D-xx means a decision in this log. When this log points to an old brief item, it writes "brief §6, old D-03".

---

## 1. Decisions at a glance

| ID | Topic | Decision in one line | Label |
|---|---|---|---|
| D-01 | Services | The business offers delivery and on-site service | [C] |
| D-02 | Capacity | 2–3 delivery sets in their own pool, one room, add-on stock counted per day | [C] |
| D-03 | Rental period | Delivery by time slot; on-site by the day with an arrival time | [C] |
| D-04 | Holds and deadlines | Pending Confirmation requests hold capacity; 72 h to review, 24 h to pay the deposit, never past the service start | [C] |
| D-05 | Deposit and payments | Fixed deposit after approval, cash or e-wallet; proof upload pauses expiry; every payment recorded | [C] |
| D-06 | Same-day | Online booking with at least 1 hour's notice; same-day is urgent; deposit required or waived per booking | [C] |
| D-07 | Roles | Two admin accounts: Super Admin (developer) and Admin (business owner) | [C] |
| D-08 | Customers | No customer accounts; mobile required, email optional; no self-cancel | [C] |
| D-09 | QR code | QR at the office and when paying; reference code for messages and calls; not used on event day | [C] |
| D-10 | Notifications | Automatic email in the MVP; Messenger opt-in after the MVP; 6 h deposit reminder | [C] |
| D-11 | Delivery fee | Free inside the service area; admins check each address | [C] |
| D-12 | Prices | Prices are locked when the request is submitted | [C] |
| D-13 | Needs info | A flag on a Pending Confirmation request; the 72-hour clock keeps running | [C] |
| D-14 | Calendar and packages | Calendar shows only Available or Full; same packages for both services | [C] |
| D-15 | Completion | Bookings become Completed automatically the day after the event | [C] |
| D-16 | Abuse limits | 1 open request per mobile per date, 2 in total; online booking pauses when a 7th online reservation would be created within 60 minutes | [C]; breaker details [P] |
| D-17 | Blocks | Block a set, the room, or a whole date (resolves O-01) | [C] |
| D-18 | Location | Philippines, pesos, Asia/Manila time; business not registered | [C] |
| D-19 | Builder and budget | The developer builds it with Claude, on free tiers only (₱0), in TypeScript/JavaScript | [C] |
| D-20 | Technology | Vercel Hobby, Next.js, Supabase Free (Singapore), Better Auth, Resend, Tailwind CSS + shadcn/ui | [C] for Vercel Hobby (`sin1`, Node.js only) and Tailwind CSS + shadcn/ui; the rest approved design |
| D-21 | Privacy and legal | Proof images deleted 7 days after verification; researched retention periods as defaults; acknowledgments issued as "DJB Kasoundbox" | [C] |
| D-22 | Repository | The GitHub repository is made private before backups are added | [C] |
| D-23 | Documentation | Spec approved and frozen; these docs are the source of truth; English; written in reviewed batches | [C] |
| D-24 | Voiding payments | Both admins can void a wrongly recorded deposit, balance, or refund record, with a reason | [C] |
| D-25 | Overdue check | One `IMMUTABLE` overdue helper that takes the time as an argument; a paused hold is overdue from its service start | [C] |
| D-26 | QR-link encryption | The encrypted QR link is bound to the QR token hash and the email type, not to database IDs | [C] |
| D-27 | Bot-check message | One generic message for the honeypot and Turnstile; every attempt counts toward the submission limit | [C] |
| D-28 | Test project | Week 1 and UAT run on a separate test project; production is created fresh just before launch | [C] |
| D-29 | Test clock | Database functions read the time through `app.now()`, which tests can fix only where a test-only marker exists | [C] |
| D-30 | Pre-launch switch | A Super-Admin-only setting keeps online booking closed ("Opening soon", `noindex`) until launch | [C] |
| D-31 | Week-1 result | The week-1 go / no-go is recorded as a decision; the speed target is the measured p95 plus a margin | [C] |
| D-32 | Week-1 code | The week-1 spike code is thrown away; Foundation is built test-first | [C] |
| D-33 | Concurrency harness | A two-connection Node/Vitest script races real transactions on the local database; no `dblink` | [C] |
| D-34 | Mobile numbers | Every valid Philippine mobile number is accepted (also 08…), checked with `libphonenumber-js`, saved as E.164; changes BR-11 | [C] |
| D-35 | Prices and stock | Prices may be ₱0; an add-on's daily stock may be 0; setting ranges stay as proposed | [C] |
| D-36 | Passwords and 2FA | A new or reset password is changed at the next login; after a backup-code login, an admin may move 2FA alone | [C] |
| D-37 | Disabled accounts | The Super Admin can re-enable an account; the retention job deletes login details 30 days after a disable; no role change | [C] |
| D-38 | Foundation baseline | The [P] proposals that Foundation builds on are accepted as its baseline | [C] |

---

## 2. Decisions

### D-01 · Two services: delivery and on-site

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2; brief question Q1, old D-01

**Decision.** The business offers two services, and the system handles both:
- **Delivery.** Staff bring the videoke to the customer's venue, set it up, and pick it up afterwards.
- **On-site.** The customer uses the business's own room.

**Options considered.** Delivery only, on-site only, or both.

**Rationale.** These are the two services the business runs. Putting both in one system means one calendar for every booking.

**Docs affected:** [project-charter](project-charter.md) · [glossary](glossary.md) · [business-rules](../01-requirements/business-rules.md) (BR-01, BR-02) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (service start) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (resources) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-01, FR-PUB-04)

---

### D-02 · Capacity: separate delivery sets, one room, add-on stock per day

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §6; brief questions Q2–Q4, old D-02

**Decision.**
- Delivery uses its own pool of 2–3 sets. This pool is separate from the on-site room.
- A delivery set takes one booking per day. The delivery slot only sets the event time. The set is free again the next day.
- There is one on-site room. It takes one booking per day.
- Add-ons have limited stock. Stock is tracked per day.

*Example.* With 2 sets, two delivery bookings on Thursday 24 December 2026 fill delivery for that day. The room can still take one on-site booking that day. On Friday 25 December, both sets are free again.

**Options considered.** Capacity counted per day, per number of hours, or by fixed time slots; buffer time between events for travel, setup, and pickup; add-ons tracked by stock, or treated as always available.

**Rationale.** It matches the real equipment. Because a set is held for the whole day, no buffer time between events has to be worked out. With so few sets, every booking must be counted exactly.

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-01 to BR-04) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (resources, add-on stock) · [glossary](glossary.md) · [edge-cases](../01-requirements/edge-cases.md) · [project-charter](project-charter.md) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-20)

---

### D-03 · Rental period: delivery by time slot, on-site by the day

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §5, §7; brief question Q3, old D-02

**Decision.**
- **Delivery** is booked by time slot. The customer picks a delivery slot, and the set is held for the whole day.
- **On-site** is booked per day. The customer picks an arrival time within on-site hours.
- The slot start (delivery) or the arrival time (on-site) is the booking's service start. How it is stored is in [reservation-lifecycle](../02-domain/reservation-lifecycle.md).

**Options considered.** Rental per day, overnight, per number of hours, or by fixed time slots; overtime charges.

**Rationale.** For delivery, the slot fixes the event time, and the set is held all day anyway (D-02). For on-site, a whole-day booking with a chosen arrival time is simple for customers and easy to count. The actual slot times and on-site hours are still open (O-02).

**Docs affected:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (delivery slots) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (service start) · [business-rules](../01-requirements/business-rules.md) (BR-06, BR-09) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-04) · [glossary](glossary.md)

---

### D-04 · Pending Confirmation requests hold capacity until they expire

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §5, §6, §7; brief question Q5, brief §6 old D-03

**Decision.**
- A request holds its set or room, and its add-ons, from the moment it is submitted, even before an admin reviews it.
- A Pending Confirmation request that no admin reviews expires 72 hours after it was submitted.
- After approval, the deposit is due within 24 hours.
- Every deadline also ends at the service start at the latest.

The exact deadlines for each status are defined in [reservation-lifecycle](../02-domain/reservation-lifecycle.md). When a hold stops counting is in [business-rules](../01-requirements/business-rules.md) (BR-04, BR-05).

**Options considered.** From the discovery brief: (a) a pending request holds capacity until it expires; (b) only Confirmed bookings hold capacity; (c) pending requests hold capacity, but staff can override. Option (a) was chosen.

**Rationale.** The business has only 2–3 sets. With option (b), three customers could ask for two sets, and one of them would be turned down after waiting. Expiry stops old requests from blocking a date forever. Ending every deadline at the service start means no hold outlives its event.

**Docs affected:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (statuses, deadlines) · [business-rules](../01-requirements/business-rules.md) (BR-04, BR-05) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-SYS-01, FR-NTF-12) · [edge-cases](../01-requirements/edge-cases.md) · [glossary](glossary.md)

---

### D-05 · Deposit and a full payment ledger

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §6 (BR-12), §8; brief question Q6, old D-04

**Decision.**
- A deposit is required. It is a fixed amount. (The amount itself is still open: O-03.)
- It is paid after an admin approves the request, in cash at the office or by e-wallet.
- An admin records the deposit. The customer may also upload a proof image.
- A proof uploaded before the deadline pauses expiry until an admin reviews it. The pause never runs past the service start (BR-12).
- Balance payments are recorded too. The system keeps a full payment ledger: deposits, balances, and refunds.

How payments are recorded and acknowledged is in [catalog-and-payments](../02-domain/catalog-and-payments.md).

**Options considered.** No deposit; an admin records the deposit by hand; the customer uploads a proof; an online payment gateway. The choice combines admin recording with an optional proof upload. An online payment gateway is a "Later" item in the [project-charter](project-charter.md).

**Rationale.** Without a gateway, running cost stays at ₱0. The pause protects a customer who paid on time from expiring only because no admin had checked yet. A full ledger keeps clear money records, which also support a later business registration (see [privacy-and-retention](../01-requirements/privacy-and-retention.md)).

**Docs affected:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (ledger, acknowledgments) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Awaiting Deposit) · [business-rules](../01-requirements/business-rules.md) (BR-12) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-12, FR-ADM-11 to FR-ADM-15, FR-ADM-19) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (proof images) · [edge-cases](../01-requirements/edge-cases.md) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-14) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.2)

---

### D-06 · Same-day bookings

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §6 (BR-06, BR-06a), §7

**Decision.**
- Customers can book online with at least 1 hour's notice before the start, including on the same day, for both services.
- Admins can create same-day bookings themselves (bookings that come by phone, walk-in, or Facebook).
- Same-day requests are flagged **urgent**.
- For each same-day booking, the admins decide whether to require the deposit or to waive it. A waiver needs a reason.

**Options considered.** Not written down at the time. The discovery brief listed the booking lead time as a later-round question.

**Rationale.** Same-day customers can still book. The 1-hour notice and the urgent flag let the admins see and handle these requests first. There may be no time to collect a deposit before a same-day event, so the admins decide case by case.

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-06, BR-06a) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (same-day deposit waiver) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-02, FR-ADM-13, FR-ADM-24) · [edge-cases](../01-requirements/edge-cases.md) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (§4.3 deposit)

---

### D-07 · Two admin accounts: Super Admin and Admin

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §4; brief question Q9, old D-05

**Decision.** There are two admin accounts:
- **Super Admin:** the developer (the business owner's son).
- **Admin:** the business owner (the developer's father).

**Only the Super Admin** can:
- manage the admin accounts;
- change the settings for the deposit amount, the deadlines, the delivery slots, and the business info;
- block a whole date.

**Both admins** can:
- approve and reject requests;
- record deposits;
- manage packages, add-ons, and prices;
- cancel bookings and decide refunds, case by case;
- reschedule bookings, case by case;
- extend deadlines, with a reason;
- block a single set or the room.

The full permission matrix, including the permissions marked **[P]**, is defined only in [roles-and-permissions](../01-requirements/roles-and-permissions.md).

**Options considered.** The business owner only; any staff member; or permissions by role, possibly with a separate Staff role (the discovery brief's suggestion). Two roles, one person each, was chosen.

**Rationale.** Two people run the business. Either one can handle daily work. The settings that change how the whole system behaves, and the accounts, stay with the Super Admin, who builds and maintains the system.

**Docs affected:** [roles-and-permissions](../01-requirements/roles-and-permissions.md) · [project-charter](project-charter.md) (stakeholders) · [glossary](glossary.md) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-26, FR-ADM-28, FR-ADM-30) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (who may do each action) · [business-rules](../01-requirements/business-rules.md) (BR-08) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (§1, §1.3, §4.5, §7) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-09, NFR-10)

---

### D-08 · Customers have no accounts

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §3, §5, §13; brief §6 old D-11

**Decision.**
- Customers have no accounts and never log in.
- A mobile number is required. An email address is optional.
- To check a status, the customer enters the reference code and the full mobile number.
- Customers cannot cancel on their own. They contact the business, and an admin cancels.
- Customers cannot reschedule on their own either. Admins reschedule, case by case (D-07).

**Options considered.** Guest use or customer accounts. For the status check, the discovery brief suggested the reference code plus the last 4 digits of the mobile number. The brief's early status diagram also let customers withdraw a request themselves.

**Rationale.** Customers book without signing up. The full mobile number is much harder to guess than 4 digits, which makes it hard for a stranger to look up someone else's booking. Cancelling can involve a refund decision, which an admin makes case by case.

**Docs affected:** [roles-and-permissions](../01-requirements/roles-and-permissions.md) (customers) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-05, FR-PUB-10, FR-ADM-17, FR-ADM-18) · [business-rules](../01-requirements/business-rules.md) (BR-11 mobile numbers) · [project-charter](project-charter.md) (out of scope) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) · [edge-cases](../01-requirements/edge-cases.md) (EC-12, EC-39, EC-50) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (§6.5, §6.6)

---

### D-09 · Where the QR code and reference code are used

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2; brief question Q7, old D-09

**Decision.**
- The customer shows the QR code when visiting the office or paying.
- The customer quotes the reference code when messaging or calling.
- The QR code is not used on event day.

A reference code or QR code never means a booking is approved or paid (see [project-charter](project-charter.md), success criteria).

**Options considered.** At the office, when paying, when messaging, on event day to the crew, or all of these.

**Rationale.** The QR code helps an admin open the right booking quickly at the office. Because it is not used on event day, the delivery crew needs no scanning step.

**Docs affected:** [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-07, FR-PUB-08, FR-ADM-06) · [glossary](glossary.md) · [project-charter](project-charter.md) · [edge-cases](../01-requirements/edge-cases.md) (EC-61) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.1, §3.1)

---

### D-10 · Notifications: email first, Messenger later

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §3, §9; brief question Q10, old D-06

**Decision.**
- In the MVP, the system sends automatic emails.
- After the MVP, automated Messenger messages are added for customers who opt in.
- Both admins get an email for every new online request, and see it on the dashboard.
- Customers get a reminder 6 hours before the deposit deadline.

The full list of emails, when each is sent, and what happens for customers without email are in [functional-requirements](../01-requirements/functional-requirements.md) (FR-NTF-01 to FR-NTF-21).

**Options considered.** SMS, email, Messenger, or staff calls and texts using messages the system prepares. The discovery brief recommended one channel in the MVP, with the status page as a fallback.

**Rationale.** Email can be sent at ₱0 on a free plan. The status page always shows the current state, even when an email is missed. The reminder gives the customer a last chance to pay before the hold ends. Messenger will be researched again before it is built **[U]**.

**Docs affected:** [functional-requirements](../01-requirements/functional-requirements.md) (FR-NTF-01 to FR-NTF-21) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-33) · [project-charter](project-charter.md) (Later list) · [edge-cases](../01-requirements/edge-cases.md) (EC-70) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§4)

---

### D-11 · Free delivery inside the service area

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §19 (O-04); brief question Q1, old D-08

**Decision.** Delivery is free inside the service area. No list of areas is kept. The admins check each address when they review the request.

**Options considered.** A fixed delivery fee, a fee based on distance, or free delivery; a published list of areas, or a check by the admins.

**Rationale.** Prices stay simple, and there is no area list to maintain. The admins know the local area. The exact wording shown to customers is still open (O-04).

**Docs affected:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (price calculation) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-02, FR-ADM-08) · [edge-cases](../01-requirements/edge-cases.md) (EC-13) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (§3.1) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (row 4)

---

### D-12 · Prices are locked at submission

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §8; brief §1.2

**Decision.** The price is calculated from the catalog and copied into the reservation when the customer submits it. Later price changes do not affect that reservation. The deposit amount is copied the same way.

*Example (made-up prices; the real ones are O-03).* Ana submits a request when a package costs ₱3,000. Next week, the admins raise the price to ₱3,500. Ana still pays ₱3,000.

**Options considered.** Lock the price at submission (the discovery brief's proposal), or use the catalog price at a later step.

**Rationale.** The customer pays the price they were shown. Updating the catalog never changes existing bookings.

**Docs affected:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (price snapshot) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (edit details, recreate expired) · [edge-cases](../01-requirements/edge-cases.md) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-06, FR-ADM-24, FR-ADM-26)

---

### D-13 · Needs Info is a flag, not a status

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §7; brief §2.1 and §3.2

**Decision.** When an admin needs more information, they flag the Pending Confirmation request "Needs info" and write a message for the customer. The request stays Pending Confirmation, and its 72-hour clock keeps running.

**Options considered.** A separate "Needs Info" status with its own reply deadline (the discovery brief's proposal), or a flag on a Pending Confirmation request.

**Rationale.** There are fewer statuses to learn. Asking a question cannot stretch how long a request holds a set or the room.

**Docs affected:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (needs info) · [glossary](glossary.md) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-09, FR-NTF-02) · [edge-cases](../01-requirements/edge-cases.md) (EC-24) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.1)

---

### D-14 · Calendar shows Available or Full; same packages for both services

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §5, §6 (BR-09)

**Decision.**
- The public calendar shows only **Available** or **Full** for each service and date.
- The same packages are offered for delivery and on-site.

**Options considered.** Not written down at the time.

**Rationale.** The calendar shows no personal data and no counts, only whether a customer can book. One set of packages means one catalog to keep up to date.

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-09) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (packages) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-02, FR-PUB-03)

---

### D-15 · Completed automatically the day after the event

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §7, §15; brief §2 and §3.2

**Decision.** A daily job marks Confirmed bookings as Completed the day after the event. If an event did not actually happen, an admin moves the booking to Cancelled with "event not held" **[P]**.

*Example.* A Confirmed booking for Thursday 24 December 2026 becomes Completed early on Friday 25 December.

**Options considered.** The discovery brief proposed that staff mark each event Completed by hand, with a separate No-show status.

**Rationale.** It is one less daily task for the admins. No separate No-show status is needed.

**Docs affected:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Completed, event not held) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-SYS-04, FR-ADM-20) · [glossary](glossary.md) · [edge-cases](../01-requirements/edge-cases.md) (EC-51) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§4)

---

### D-16 · Hold limits and the breaker

**Date:** 2026-10-21 · **Label:** [C], breaker details [P] · **Source:** spec v0.2 §6 (BR-07, BR-07a), §18

**Decision.**
- **Hold limits.** One mobile number may have at most 1 open online request per event date, and at most 2 in total. Exactly what counts is in BR-07.
- **Breaker.** When an online request would be the 7th reservation created online in the last 60 minutes, it is refused and online booking pauses. The numbers (the limit and the 60-minute pause, both kept as settings), and early resume by either admin, are **[P]**; see BR-07a.

**Options considered.** Not written down at the time. The discovery brief listed "limits per customer" as a later-round question.

**Rationale.** Fake or careless requests could tie up the few sets. The limits and the breaker help stop that before an admin has to step in.

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-07, BR-07a) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-03, FR-PUB-06, FR-ADM-02, FR-ADM-29, FR-NTF-15) · [edge-cases](../01-requirements/edge-cases.md) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-12) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.4)

---

### D-17 · Blocks on a set, the room, or a whole date

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §4, §6 (BR-08), §19 (O-01 resolved)

**Decision.** Admins can block a single delivery set, the room, or a whole date, so it cannot be booked.
- Either admin can block a single set or the room.
- Only the Super Admin can block a whole date.

This resolves open item **O-01** (who can create blocks). How blocks work is in [business-rules](../01-requirements/business-rules.md) (BR-08).

**Options considered.** O-01 asked who may create blocks. The answer splits the permission by the kind of block.

**Rationale.** A set or the room can be out of use for a day, and either admin may need to mark that. A whole-date block stops every booking for that day, so it stays with the Super Admin, like the other business-wide settings (D-07).

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-08) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (block statuses) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-25) · [edge-cases](../01-requirements/edge-cases.md) (EC-19)

---

### D-18 · Philippines, pesos, Manila time; unregistered small business

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §2, §14; brief question Q11

**Decision.**
- The business is in the Philippines. Prices are in Philippine pesos (₱).
- The time zone is Asia/Manila. Every date and time in the system is Manila time.
- The business is not registered as a business: it is small and serves only its local area.

**Options considered.** None. These are facts about the business, confirmed in answer to the discovery questions.

**Rationale.** The system must use the currency and time of the customers and the business. Privacy law applies even though the business is not registered. The registration facts to review with a CPA (accountant) or a lawyer are in [privacy-and-retention](../01-requirements/privacy-and-retention.md) (O-11).

**Docs affected:** [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-19) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) · [project-charter](project-charter.md) (constraints) · [glossary](glossary.md) (Manila time) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (§4.1) · [edge-cases](../01-requirements/edge-cases.md) (EC-82)

---

### D-19 · Builder and budget

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §1, §2; brief question Q11

**Decision.**
- The developer builds and maintains the system, with Claude (an AI assistant).
- The code is written in TypeScript [C]. The developer chose JavaScript/TypeScript as the preferred stack during brainstorming, and spec v0.2 §10 sets TypeScript strict mode.
- Budget: free tiers only. Running cost is ₱0 per month. Whether to buy a domain name is still open (O-05).

**Options considered.** The discovery brief asked who would build the system, with which technologies, and on what monthly hosting budget.

**Rationale.** It is a small business. Free plans keep the running cost at zero.

**Docs affected:** [project-charter](project-charter.md) (constraints) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-01, NFR-30 to NFR-32)

---

### D-20 · Technology stack

**Date:** 2026-10-21 · **Label:** [C] for Vercel Hobby (`sin1`, Node.js only) and for Tailwind CSS + shadcn/ui; Next.js, Supabase Free, Better Auth, and Resend are approved design (no label in spec v0.2 §10) · **Source:** spec v0.2 §10, §18; brief §6 old D-12

**Decision.**
- **Vercel Hobby** (free) hosts the website, in the Singapore region. It was chosen knowingly, even though its terms allow only non-commercial use. The system is designed so it can move to another host.
- **Next.js** is the website framework.
- **Supabase Free**, in Singapore, holds the database and the uploaded files.
- **Better Auth** handles admin login with two-factor authentication.
- **Resend** sends the emails.
- **Tailwind CSS** and **shadcn/ui** are used for page design.

The full stack, with versions, is in [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §10.

**Options considered.** Vercel Pro (about US$20 per month), or another hosting company that can run this kind of website (a Node.js host) and allows commercial use. Both stay as the exit plan, but were not chosen now because of the ₱0 budget (D-19).

**Rationale.** Every part has a free plan. Singapore is close to the Philippines, which keeps pages quick. The Vercel Hobby risks were accepted knowingly: Vercel may disable the project, and going over a usage limit pauses the site. Supabase Free has limits of its own: it pauses after 7 days of low activity, and it has no backups. How each risk is reduced is in [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-05 to NFR-07, NFR-27 to NFR-29, NFR-31).

**Docs affected:** [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-02, NFR-04 to NFR-07, NFR-31) · [project-charter](project-charter.md) (constraints) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (service providers) · architecture (planned: `05-technical/architecture.md`) · security (planned: `05-technical/security.md`) · [edge-cases](../01-requirements/edge-cases.md) (EC-80) · [glossary](glossary.md) (Vercel Hobby) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§7)

---

### D-21 · Privacy defaults and the name on acknowledgments

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §8, §14, §15

**Decision.**
- **Proof images.** Payment-proof images are deleted 7 days after the deposit is verified.
- **Retention periods.** The periods found in the legal research are used as the defaults. They are stored as settings, and a Philippine lawyer confirms them before launch (O-08).
- **Issuer name.** Payment acknowledgments are issued under the name **DJB Kasoundbox**. The research found that Act 3883 requires a business name to be registered with the DTI (Department of Trade and Industry) before it is used on receipts and similar papers. This risk is accepted knowingly, and a lawyer will advise (O-11).

The full retention schedule and the wording rules for acknowledgments are defined only in [privacy-and-retention](../01-requirements/privacy-and-retention.md).

**Options considered.** For the issuer name: use "DJB Kasoundbox" now and accept the risk, or register the business name first. For proof images and retention periods: not written down at the time.

**Rationale.** After verification, the e-wallet reference number in the payment record is the lasting proof, so the image is no longer needed. Keeping less personal data lowers the privacy risk. Both the retention periods and the issuer name are settings, so they can change after legal advice without changing the code.

**Docs affected:** [privacy-and-retention](../01-requirements/privacy-and-retention.md) (retention schedule, acknowledgment wording) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (acknowledgments) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-SYS-05) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-15) · [edge-cases](../01-requirements/edge-cases.md) (EC-85) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§6)

---

### D-22 · Make the code repository private before backups

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 §10, §15, §19 (O-06)

**Decision.** The GitHub repository that holds the code is made private before the nightly backups are added. The developer (Super Admin) will do it. The action itself is tracked as open item O-06.

**Options considered.** Not written down at the time.

**Rationale.** The nightly backups are stored with the repository's automated jobs on GitHub. They are encrypted, but they must still never be public.

**Docs affected:** [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-27 to NFR-29) · [project-charter](project-charter.md) (constraints) · deployment and operations (planned: `07-operations/deployment-and-operations.md`) · roadmap (planned for batch 4: `06-delivery/roadmap.md`) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-SYS-12) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (§4, §9)

---

### D-23 · Spec approved and frozen; docs are the source of truth

**Date:** 2026-10-21 · **Label:** [C] · **Source:** spec v0.2 (header and labels)

**Decision.**
- The [design spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) was approved on 2026-10-21 and is now frozen. It is never edited again.
- From now on, these docs are the source of truth.
- The docs are written in English.
- The docs are created in batches, and each batch is reviewed.
- Items marked **[P]** in the spec were accepted with the approval. They may still change, through this log (section 4).

**Options considered.** Not written down at the time.

**Rationale.** Each rule has one home, so the docs cannot contradict each other. Small batches are easier to review.

**Docs affected:** every doc in `docs/`, and the [docs index](../README.md)

---

### D-24 · Both admins can void any wrongly recorded payment

**Date:** 2026-10-21 · **Label:** [C] · **Source:** batch 1 review (the developer's answer)

**Decision.**
- Either admin can void a wrongly recorded deposit, balance, or refund record. A reason is required.
- The record stays, marked void with the reason, the admin, and the time.
- Its acknowledgment number is retired and never reused.
- A voided payment no longer counts toward the deposit or the balance due.

**Options considered.** Both admins, or the Super Admin only.

**Rationale.** It follows the existing rule for deposits, and both admins already record every kind of payment.

**Docs affected:** [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.2) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (voiding, balance due) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-15)

---

### D-25 · The overdue check takes the time as an argument

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-001 (developer's answer)

**Decision.**
- The one shared helper that decides whether a hold is overdue is `app.hold_is_overdue(status, deadline, expiry_paused, service_start, at)`. It takes the time as an argument and is `IMMUTABLE`. This is the form in the data model and the test plan.
- A hold whose expiry is paused counts as overdue from its service start ([BR-12](../01-requirements/business-rules.md): the pause never runs past the service start).
- The calendar, the status page, the admin views, every function, and the expiry job use this one helper.

**Options considered.** `app.hold_is_overdue(reservation)`, which reads the time itself (the API specification's draft), or the form with the time as an argument (the data model and the test plan).

**Rationale.** A helper that takes the time as an argument gives the same answer for the same moment everywhere, and tests can check it at any moment directly. With one helper, the calendar and the Submit check never disagree.

**Docs affected:** [api-specification](../05-technical/api-specification.md) (§5.1, §5.2, open question 29) · [data-model](../05-technical/data-model.md) (§5.20, §8) · [availability-and-conflicts](../03-workflows/availability-and-conflicts.md) (open question 3) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (§3.3, §4.3) · [roadmap](../06-delivery/roadmap.md) (open question 17) · [test-plan](../06-delivery/test-plan.md) (open question 4n)

---

### D-26 · The QR-link encryption is bound to the token hash and the email type

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-002 (developer's answer)

**Decision.**
- The QR link in a queued request-received email stays encrypted with AES-256-GCM (option B of [security](../05-technical/security.md) §4.5.4).
- Its associated data is the QR token's hash and the email type. The server knows both before it calls the database.
- The outbox row ID and the reservation ID are not used: the database creates both during that call.

**Options considered.** The outbox row ID and the reservation ID as associated data (the security doc's draft, which could not be built), or the token hash and the email type.

**Rationale.** Both values exist before the database call, so the server can encrypt as designed. A ciphertext still cannot be moved to another reservation's row or another email type, and it stops decrypting once the QR code is reissued, because the hash changes.

**Docs affected:** [security](../05-technical/security.md) (§4.5.4) · [api-specification](../05-technical/api-specification.md) (§1.13) · [data-model](../05-technical/data-model.md) (§5.12)

---

### D-27 · One generic message for a failed bot check

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-003 (developer's answer)

**Decision.**
- Both bot checks, the honeypot and Turnstile, show one generic message: "We could not check that you are not a robot. Please try again."
- Every attempt counts toward the submission rate limit ([NFR-11](../01-requirements/non-functional-requirements.md)), including a repeat with the same duplicate-submission key.

**Options considered.** One message for both checks, or a message per check; counting every attempt, or only accepted ones.

**Rationale.** One message never tells a bot which check caught it. Counting every attempt means retries cannot get round the limit.

**Docs affected:** [security](../05-technical/security.md) (§4.4, open question 24) · [ux-and-sitemap](../04-design/ux-and-sitemap.md) (§3.1.4) · [api-specification](../05-technical/api-specification.md) (§1.7, §2.3) · [test-plan](../06-delivery/test-plan.md) (TC-SEC-19, TC-SEC-20)

---

### D-28 · A separate test project; production is created fresh before launch

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-004 (developer's answer)

**Decision.**
- The week-1 test and acceptance testing (UAT) run on a separate test project (Supabase Free and Vercel). During the build it is also the staging environment.
- Production is created fresh just before launch. So it holds no test records, and acknowledgment numbering starts clean.
- A short-lived restore-test project is allowed, as [deployment-and-operations](../07-operations/deployment-and-operations.md) open question 1 proposes.

**Options considered.** From [deployment-and-operations](../07-operations/deployment-and-operations.md) open question 46: (a) UAT on a separate pre-launch project, with production set up fresh just before launch; (b) UAT in production, then a one-time reset of the business tables and the acknowledgment counters before the first real customer. Option (a) was chosen.

**Rationale.** Business records are never deleted ([NFR-22](../01-requirements/non-functional-requirements.md)). A test booking in production would stay forever and use up acknowledgment numbers. A fresh production needs no reset.

**Docs affected:** [deployment-and-operations](../07-operations/deployment-and-operations.md) (§1, §2, §5.5, §10, open questions 1 and 46) · [roadmap](../06-delivery/roadmap.md) (§1.4, §1.5, §1.11, §1.12, §5, open question 14) · [test-plan](../06-delivery/test-plan.md) (§1.2, §4, §5.1, §6.5, open question 3) · [architecture](../05-technical/architecture.md) (§8.2, §10.4, open question 9) · [project-status](project-status.md) (§4)

---

### D-29 · A test clock, `app.now()`

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-005 (developer's answer)

**Decision.**
- Database functions read the current time only through `app.now()`.
- `app.now()` returns `clock_timestamp()`. The one exception is a test database that has the test-only marker: there, a test fixes the time for its own transaction with `SET LOCAL app.test_now`.
- `app.manila_today()` is worked out from `app.now()`.
- Production has no marker; TC-SEC-54 checks this.

**Options considered.** Testing the time-based rules only through the pure predicates, or a settable test clock guarded by a test-only marker (the test plan's proposal).

**Rationale.** Many rules depend on "now". A settable clock lets the database tests check deadlines, the notice period, Manila midnight, reminders, acknowledgment years, and retention at exact moments, while production always uses the real time.

**Docs affected:** [api-specification](../05-technical/api-specification.md) (§1.4, §5.1 to §5.3) · [data-model](../05-technical/data-model.md) (§5.20, §8) · [architecture](../05-technical/architecture.md) (§6.3) · [functional-requirements](../01-requirements/functional-requirements.md) (§5, developer note) · [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (§4.3) · [test-plan](../06-delivery/test-plan.md) (§1.5, open question 1, TC-SEC-54)

---

### D-30 · A pre-launch switch for online booking

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-006 (developer's answer)

**Decision.**
- A setting, `public_booking_open`, says whether online booking is open. Its default is false. Only the Super Admin can change it.
- While it is false, online booking is off: a submit is refused, the public pages show "Opening soon", and every page sends `noindex`. Bookings that staff enter for phone, walk-in, and Facebook customers are not affected.
- Turning it on is a step of the launch gate.

**Options considered.** None were in the docs ([roadmap](../06-delivery/roadmap.md) open question 15).

**Rationale.** From Foundation on, every merge to `main` deploys a public website. The switch keeps that website from taking real bookings, or showing in search results, before the official opening.

**Docs affected:** [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-34, new) · [data-model](../05-technical/data-model.md) (§7) · [api-specification](../05-technical/api-specification.md) (§1.7, §2.1 to §2.3, §2.11, §3.7, §5.3, §7) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.6) · [ux-and-sitemap](../04-design/ux-and-sitemap.md) (§3.1, §3.2.9, §7.2) · [roadmap](../06-delivery/roadmap.md) (§1.13, §2.1, §5 gate G22, open question 15) · [deployment-and-operations](../07-operations/deployment-and-operations.md) (§2, §10) · [test-plan](../06-delivery/test-plan.md) (TC-DB-98, TC-SEC-55, TC-E2E-36) · [staff-guide](../07-operations/staff-guide.md) (other Super Admin tasks)

---

### D-31 · How the week-1 result and the speed target are recorded

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-007 (developer's answer)

**Decision.**
- The week-1 go / no-go is recorded as a new decision in this log, with the next free D number at that time. It lists each week-1 item's result and its fix.
- The speed target of [NFR-03](../01-requirements/non-functional-requirements.md) is set at the same time: the p95 measured in week 1, plus a safety margin.

**Options considered.** A decision in this log (the roadmap's proposal), or only the test plan's results record; a target picked in advance, or one set from the measured figures.

**Rationale.** Decisions that change the plan already live in this log. A target set from real measurements fits the free services actually used.

**Docs affected:** [roadmap](../06-delivery/roadmap.md) (§1.4, open question 1) · [test-plan](../06-delivery/test-plan.md) (§3.9, §4, TC-NFR-04, open question 8) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-03)

---

### D-32 · The week-1 spike code is thrown away

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-008 (developer's answer)

**Decision.** The week-1 spike code is written as quick probes and then thrown away. Foundation is built properly, test-first.

**Options considered.** Throw the spike code away, or keep it as the start of Foundation.

**Rationale.** The spike's job is to answer the unverified questions quickly. Keeping its code would carry untested shortcuts into the base of the system.

**Docs affected:** [roadmap](../06-delivery/roadmap.md) (§1.4, §1.5, open question 2)

---

### D-33 · The concurrency harness: two real connections from Node/Vitest

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-009 (developer's answer)

**Decision.** The tests that race two sessions use a small Node/Vitest script with two connections to the local Supabase database. It races real transactions: session A holds its transaction open while session B waits. `dblink` is not used.

**Options considered.** `dblink` inside pgTAP, or a two-connection script (both in the test plan).

**Rationale.** Two real connections behave like two real callers, need no extra database extension, and keep one transaction open across steps, which a single pgTAP transaction cannot do.

**Docs affected:** [test-plan](../06-delivery/test-plan.md) (§1.5, §2.1, open question 2, and the cases that name the harness: TC-DB-10 to TC-DB-13, TC-DB-66, TC-DB-83, TC-DB-84, TC-DB-92)

---

### D-34 · Every valid Philippine mobile number is accepted

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-010 (developer's answer)

**Decision.**
- Every valid Philippine mobile number is accepted, including valid numbers that start with 08…. Validity is checked with the `libphonenumber-js` library, with its full metadata.
- Accepted inputs: the local forms `09…` and `08…`, `9…` and `8…`, `639…` and `638…`, and `+63…`. Spaces and dashes are ignored.
- Every number is saved in E.164 form: `+63` followed by the 10-digit mobile number.
- The database keeps a simple format check as a backstop; the app does the real check with the library.
- This changes [BR-11](../01-requirements/business-rules.md), which accepted only `09…` / `+639…` numbers.

**Options considered.** Keep BR-11 as it was, or accept every valid Philippine mobile number checked by `libphonenumber-js` ([architecture](../05-technical/architecture.md) open question 15).

**Rationale.** Some valid Philippine mobile numbers start with 08…; under the old rule, those customers could not book. The library follows the national number plan, so the system does not track mobile prefixes by hand.

**Docs affected:** [business-rules](../01-requirements/business-rules.md) (BR-11) · [glossary](glossary.md) (E.164) · [data-model](../05-technical/data-model.md) (§5.3, §13) · [api-specification](../05-technical/api-specification.md) (§1.3, §5.2) · [architecture](../05-technical/architecture.md) (open question 15) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (§3.1) · [booking-and-submission](../03-workflows/booking-and-submission.md) (WF-01B, WF-01C) · [lookup-and-review](../03-workflows/lookup-and-review.md) (WF-03C) · [notifications-and-tracking](../03-workflows/notifications-and-tracking.md) (WF-07D) · [changes-and-expiry](../03-workflows/changes-and-expiry.md) (WF-06E) · [test-plan](../06-delivery/test-plan.md) (TC-DB-33, TC-UT-02) · [project-status](project-status.md) (§4)

---

### D-35 · Prices may be ₱0, and daily stock may be 0

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-011 (developer's answer)

**Decision.**
- A package price or an add-on price may be ₱0, so free extras are allowed.
- An add-on's daily stock may be 0. The add-on is then not available: none can be booked while the stock is 0.
- The valid ranges of the settings stay as the docs propose ([data-model](../05-technical/data-model.md) §7). The developer reviews them later.

**Options considered.** Prices of more than ₱0 (the API specification's draft), or ₱0 allowed; a daily stock of at least 1, or 0 allowed ([administration](../03-workflows/administration.md) open question 13).

**Rationale.** A free extra is a normal offer. A stock of 0 lets an admin stop an add-on for a while without archiving it.

**Docs affected:** [api-specification](../05-technical/api-specification.md) (§5.6, open question 33) · [data-model](../05-technical/data-model.md) (§5.1) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (§1.2) · [administration](../03-workflows/administration.md) (WF-08A, WF-08D, WF-08F, open question 13) · [ux-and-sitemap](../04-design/ux-and-sitemap.md) (§3.2.8, §3.2.9) · [staff-guide](../07-operations/staff-guide.md) (P-21, P-25, open questions B) · [test-plan](../06-delivery/test-plan.md) (TC-DB-99)

---

### D-36 · A forced password change, and moving 2FA alone

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-012 (developer's answer)

**Decision.**
- **Forced change.** A new or reset password must be changed at the next login, before the admin area opens. Better Auth has no built-in flag for this, so the app keeps its own flag.
- **Moving 2FA alone.** After logging in with a backup code, an admin may move 2FA to a new phone without the Super Admin. This needs the password and a backup code. It is recorded in the audit log, in the category `security`, and the Super Admin gets an email. When the Super Admin moves his own 2FA, no email is sent.

**Options considered.** (a) No forced change, or a change at the next login. (b) A reset by the Super Admin every time, or a move by the admin alone after a backup-code login.

**Rationale.** (a) A system-made password has been seen by the Super Admin, so the person replaces it with one only they know. (b) An admin with a backup code can get back to work the same day, and the email tells the Super Admin at once if someone else did it.

**Docs affected:** [security](../05-technical/security.md) (§4.1, open questions 4 and 5) · [administration](../03-workflows/administration.md) (WF-09B, WF-09D, WF-09F, WF-09G, open questions 7 and 8) · [staff-guide](../07-operations/staff-guide.md) (§2.1, P-23, P-27, open questions B) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§5.1, §5.2) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-01, FR-ADM-30, FR-NTF-22, new) · [api-specification](../05-technical/api-specification.md) (§1.2, §3.8, §5.7) · [data-model](../05-technical/data-model.md) (§3, §5.19) · [ux-and-sitemap](../04-design/ux-and-sitemap.md) (§2, §3.2.1) · [deployment-and-operations](../07-operations/deployment-and-operations.md) (§7.7) · [test-plan](../06-delivery/test-plan.md) (TC-DB-100, TC-SEC-56, TC-SEC-57)

---

### D-37 · Disabled admin accounts

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-013 (developer's answer)

**Decision.**
- The Super Admin can re-enable a disabled account.
- The daily retention job deletes a disabled admin's login details 30 days after the disable: the password hash, the 2FA secrets, the backup codes, and the sessions.
- The user row is scrubbed and kept, so the audit log and the "received by" line on acknowledgments still name the person.
- There is no "change role" action.

**Options considered.** (a) Re-enable, or always create a new account. (b) The retention job, or a manual step by the Super Admin. (c) A change-role action, or none.

**Rationale.** (a) A mistaken disable can be undone without a second account for the same person. (b) A job never forgets the 30-day period of [privacy-and-retention](../01-requirements/privacy-and-retention.md) §6.2. (c) With one person per role, a role never needs to change.

**Docs affected:** [administration](../03-workflows/administration.md) (WF-09G, open question 11) · [data-model](../05-technical/data-model.md) (§4, §5.19, §9, open question 8) · [privacy-and-retention](../01-requirements/privacy-and-retention.md) (§6.2) · [roles-and-permissions](../01-requirements/roles-and-permissions.md) (§2.7, §2.8, §5.1) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-30, FR-SYS-05) · [api-specification](../05-technical/api-specification.md) (§3.8, §5.7, §5.9) · [ux-and-sitemap](../04-design/ux-and-sitemap.md) (§3.2.10) · [staff-guide](../07-operations/staff-guide.md) (P-27) · [edge-cases](../01-requirements/edge-cases.md) (EC-76) · [test-plan](../06-delivery/test-plan.md) (TC-DB-91, TC-DB-101, §3.9)

---

### D-38 · The Foundation baseline

**Date:** 2026-10-21 · **Label:** [C] · **Source:** Project Status Q-014 (developer's answer)

**Decision.** These [P] proposals are accepted as the Foundation baseline and are now confirmed decisions:
- [architecture](../05-technical/architecture.md) open questions 1, 2, 8, and 10;
- [data-model](../05-technical/data-model.md) open questions 1 to 5, 7 to 10, and 13;
- [api-specification](../05-technical/api-specification.md) open questions 1 to 5, 8, and 9;
- [security](../05-technical/security.md) open questions 1 to 13, 30, and 31;
- [deployment-and-operations](../07-operations/deployment-and-operations.md) open questions 1 to 11;
- [roadmap](../06-delivery/roadmap.md) open questions 3, 4, and 10;
- [test-plan](../06-delivery/test-plan.md) open question 12.

Each one can still change through this log (section 4). Where D-28 or D-36 adds to one of them (deployment-and-operations open question 1; security open questions 4 and 5), the newer decision applies.

**Options considered.** Confirming each proposal one by one in a later review, or accepting the listed set now as the baseline and changing single items later through this log.

**Rationale.** Foundation (the repository, CI, the whole schema, login with 2FA, accounts, and settings) builds on these proposals. Accepting them as one baseline lets Foundation start, and any single item can still change.

**Docs affected:** [architecture](../05-technical/architecture.md) · [data-model](../05-technical/data-model.md) · [api-specification](../05-technical/api-specification.md) · [security](../05-technical/security.md) · [deployment-and-operations](../07-operations/deployment-and-operations.md) · [roadmap](../06-delivery/roadmap.md) · [test-plan](../06-delivery/test-plan.md) (each: a line near the top, and "Accepted (D-38)" on the listed open questions) · [project-status](project-status.md) (§3.1, §3.5)

---

## 3. Open items

These items still need an answer or an action. The IDs are kept from spec v0.2 §19, written with two digits (spec "O-2" is "O-02" here).

| ID | Item | What is needed | Docs affected |
|---|---|---|---|
| O-01 | Who can create blocks | **Resolved** on 2026-10-21. See D-17. | — |
| O-02 | Delivery slot times and on-site hours | Content | [catalog-and-payments](../02-domain/catalog-and-payments.md) (delivery slots) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-ADM-28) |
| O-03 | The package and add-on list, prices, daily stock, the deposit amount, the delivery sets, the deposit instructions, and the deposit terms text | Content | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| O-04 | The fixed customer wording: *"Delivery is free within our service area; we confirm your address during review."* No area list is kept (D-11). | Confirm the wording | [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-02, FR-PUB-04) · [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| O-05 | Buy a domain name, or use the free `vercel.app` address; a Facebook Page; a business email address | Decision | [project-charter](project-charter.md) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-01, NFR-31) · [functional-requirements](../01-requirements/functional-requirements.md) (FR-PUB-08, FR-PUB-16) |
| O-06 | Make the GitHub repository private before backups are added **[C: the Super Admin will do it]** (D-22) | Action | [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-27) · roadmap (planned for batch 4: `06-delivery/roadmap.md`) |
| O-07 | Developer task: give Claude permission to save code to the GitHub repository (it is currently refused with error 403, "forbidden") | Action (Super Admin) | roadmap (planned for batch 4: `06-delivery/roadmap.md`) |
| O-08 | Before launch: read and save the vendor terms and their data processing agreements; a one-time review of privacy and retention by a Philippine lawyer, including the retention periods | Action | [privacy-and-retention](../01-requirements/privacy-and-retention.md) · [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-08) |
| O-09 | Name the DPO (data protection officer) / compliance officer in writing; set up a privacy contact email | Action | [privacy-and-retention](../01-requirements/privacy-and-retention.md) |
| O-10 | Confirm whether the SDAU (a free sworn exemption declaration) must be filed with the NPC (National Privacy Commission) | Lawyer | [privacy-and-retention](../01-requirements/privacy-and-retention.md) |
| O-11 | Business registration (BIR tax registration, DTI business name, barangay clearance, mayor's permit), and using "DJB Kasoundbox" on acknowledgments (D-21) | CPA or lawyer | [privacy-and-retention](../01-requirements/privacy-and-retention.md) · [catalog-and-payments](../02-domain/catalog-and-payments.md) (acknowledgments) |

When an open item is answered, it becomes a decision. Follow section 4.

---

## 4. How to change a decision

**Always update this log first.** Then update every doc listed under that decision's "Docs affected". Do both in the same change, so the docs never disagree with each other.

**Steps.**

1. **Write the new decision here.** Add a new entry with the next free number (D-39, D-40, …). Give the date, the new decision, the options considered, the rationale, and the docs affected.
2. **Mark the old entry.** Add "Superseded by D-xx on (date)" to the old decision. Do not delete it, and never reuse or renumber an ID. Small wording fixes that do not change the meaning can be edited in place.
3. **Update every doc in "Docs affected".** Also search all docs for the old decision ID and for the rule it changes, in case another doc mentions it. Run a search for the ID across `docs/` (excluding the frozen spec), and add any doc it finds to "Docs affected".
4. **Update the label.** A [P] item that is confirmed becomes [C]. A [U] fact that has been checked loses its [U].
5. **Never edit the frozen spec.** The [design spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) stays as it was approved (D-23).
6. **Have the change reviewed,** the same way as a docs batch.

**Resolving an open item.** Record the answer as a new decision (D-xx). Then mark the open item "Resolved, see D-xx", as was done for O-01. A new open item gets the next free number (O-12, O-13, …).

**Changing a [P] item.** Items marked [P] were accepted with the spec approval but may change. Changing one follows the same steps: record it here as a decision first.

**Settings.** Many numbers, such as the 24-hour deposit deadline, are stored as settings so they can be changed without new code. A change made in the admin panel's settings is recorded in the audit log. If the new value is meant to become the new standard, also record it here as a decision, so the docs stay true.

*Example.* Suppose the admins later want customers without email to get an SMS. SMS is on the "Later" list, so this changes D-10.
1. Add D-39: "Send SMS notifications to customers without email", with the date, the options, the rationale, and the docs affected.
2. Mark D-10 "Superseded by D-39".
3. Update the docs D-39 lists, for example [functional-requirements](../01-requirements/functional-requirements.md) (FR-NTF-21), [non-functional-requirements](../01-requirements/non-functional-requirements.md) (NFR-01), and the Later list in the [project-charter](project-charter.md).
