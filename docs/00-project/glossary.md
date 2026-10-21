# Glossary

> **Purpose:** Plain one-line meanings of the words used across the DJB Kasoundbox docs, each pointing to the document that owns the rule. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); terms marked *(technical)* are mainly for the developer ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](decision-log.md), [Project charter](project-charter.md), [Roles and permissions](../01-requirements/roles-and-permissions.md), [Business rules](../01-requirements/business-rules.md), [Functional requirements](../01-requirements/functional-requirements.md), [Non-functional requirements](../01-requirements/non-functional-requirements.md), [Privacy and retention](../01-requirements/privacy-and-retention.md), [Reservation lifecycle](../02-domain/reservation-lifecycle.md), [Catalog and payments](../02-domain/catalog-and-payments.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §2–§19 (terms collected from every section)

## How to use this glossary

- Each term has a short meaning in plain words. The full rule lives in the document after **See:**. That document is the source of truth for the rule.
- Terms are in A–Z order. Statuses are listed by the label shown on screen, with the system code in `code style`. How a reservation moves between statuses is only in [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- Numbers such as "72 hours" are the defaults from the approved design. Many of them are settings that can be changed later.
- Every date and time is Manila time.
- *(technical)* marks terms the Admin can skip.

## Labels and IDs

| Label | Meaning |
|---|---|
| **[C]** | Confirmed decision. |
| **[P]** | Proposed: accepted with the spec approval, but may still change. |
| **[U]** | Unverified fact: to be checked in the week-1 test or before launch. |
| **[O-nn]** | Open item that still needs an answer, for example O-02. Listed in the [decision log](decision-log.md). |

| ID prefix | What it names | Defined in |
|---|---|---|
| `D-xx` | A confirmed decision | [decision-log](decision-log.md) |
| `O-xx` | An open item (O-02 to O-11; O-01 is resolved and became a decision) | [decision-log](decision-log.md) |
| `BR-xx` | A business rule (BR-01 to BR-12, plus BR-06a and BR-07a) | [business-rules](../01-requirements/business-rules.md) |
| `FR-PUB-xx`, `FR-ADM-xx`, `FR-NTF-xx`, `FR-SYS-xx` | What the system must do: public site, admin panel, notifications, and system jobs | [functional-requirements](../01-requirements/functional-requirements.md) |
| `NFR-xx` | Quality requirements: cost, hosting, security, backups, and similar | [non-functional-requirements](../01-requirements/non-functional-requirements.md) |
| `EC-xx` | An unusual situation and how the system handles it | [edge-cases](../01-requirements/edge-cases.md) |
| `TC-xx` | A test case. Reserved for the test plan (batch 4) | — |

---

## A

- **Acknowledgment** (Payment Acknowledgment) — A printable page the system issues for each deposit or balance payment, titled "Deposit Acknowledgment" or "Balance Payment Acknowledgment". It states that it is NOT an Official Receipt or Invoice. **[P]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md); wording rules in [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **ACK number** — The number on an acknowledgment, in the form `ACK-YYYY-NNNN`. Example: `ACK-2026-0001` is the first acknowledgment issued in 2026. A number is never reused, even if its payment is voided. **[P]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Act 3883** — A Philippine law on business names. The legal research found that it requires DTI registration before a business name is used on receipts and similar papers. It matters because acknowledgments are issued as "DJB Kasoundbox" (O-11). See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Additional requirements note** (customer notes) — The optional free-text box on the reservation form, up to 500 characters. The form warns customers not to enter IDs, birthdates, health, or religious information. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-05; how long it is kept: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Add-on** — An optional extra that a customer adds to a package, with a quantity. Each add-on has a limited daily stock. The add-on list is open item O-03. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md); stock rule: [business-rules](../01-requirements/business-rules.md) BR-03.
- **Admin** — The account role held by the business owner (father), who runs daily reservations. **[C]** What the Admin can do: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Admin emails** (admin alerts) — Emails to both admins about each new online request (urgent ones marked), each uploaded proof, and each breaker pause. They also show on the dashboard. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-13 to FR-NTF-15.
- **Admin panel** — The private part of the website (at `/admin`) where the two admins log in and run the business. Customers never use it. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-01 to FR-ADM-33.
- **Admin reserve** — The daily email count (default 90) after which admin emails wait, so the rest of the daily cap stays free for customer emails. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-20.
- **Approve** — The admin action that accepts a Pending Confirmation request. The customer is then asked to pay the deposit. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Archive** — Take a package, add-on, or delivery slot off the website without deleting it; old bookings still show it. See: [catalog-and-payments](../02-domain/catalog-and-payments.md) §1.6; when archiving is refused: [business-rules](../01-requirements/business-rules.md) BR-10.
- **Arrival time** — For on-site bookings, the time the customer chooses to arrive. It must fall within on-site hours, and it is the on-site service start. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (service start).
- **Audit log** — The list of every status change and admin action: who, when, what, and why. Entries are only added, never edited. It never stores customer contact details, and it also serves as each reservation's history. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-32; how long entries are kept: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Availability calendar** — The public calendar that shows **Available** or **Full** for each service type and date. It never shows personal data. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-09.
- **Available** — Calendar label: that date can still take a booking of that service type. See: [business-rules](../01-requirements/business-rules.md) BR-09.
- **Awaiting Deposit** (`awaiting_deposit`) — Status label: an admin approved the request, and the customer now needs to pay the deposit. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).

## B

- **Backup** — A nightly encrypted copy of the database, kept for 14 days, plus one offline copy each month. Payment-proof images are not backed up, by design. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-27 to NFR-29; [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-12.
- **Backup codes** — One-time codes made when an admin sets up two-factor login. They are kept offline and let the admin log in if the phone is lost. **[P]** See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Balance** — The rest of the price after the deposit. When it is paid, an admin records it in the payments ledger. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Balance due** — The amount the customer still owes, shown on the status page and on acknowledgments. See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Barangay** — The smallest local government area in the Philippines. For delivery, the venue's barangay and city or municipality are required on the form. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-05.
- **BIR** — Bureau of Internal Revenue, the Philippine tax agency. The system never uses "BIR", "Official Receipt", "Invoice", TIN, or VAT wording. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Block** — A record, with a reason, that makes a set, the room, or a whole date unavailable. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-08.
- **Block status** — A block is `active` (it uses capacity) or `removed` (capacity released; removing needs a reason). See: [business-rules](../01-requirements/business-rules.md) BR-08; [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (block statuses).
- **Booking** — Everyday word for a reservation. On its own it does not mean approved; only the status Confirmed means that. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Booking Confirmation** — A printable page for a Confirmed reservation, linked from the status page and the Confirmed email. See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Booking window** — How far ahead customers can book online: from today up to 180 days ahead (default, a setting). Dates outside it cannot be picked. **[P]** See: [business-rules](../01-requirements/business-rules.md) BR-09.
- **Breach procedure** — What to do if personal data leaks, including whether the NPC must be told. The step-by-step runbook comes with the operations docs. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Breaker** — An automatic safety switch for online requests. When an online request would be the 7th in the last 60 minutes, it is refused and online booking pauses for 60 minutes (both numbers are settings). Either admin can resume early. **[C, details P]** See: [business-rules](../01-requirements/business-rules.md) BR-07a.
- **Break-glass script** *(technical)* — A documented emergency script, run with database access, that resets the Super Admin's two-factor login if the device is lost. It writes an audit entry. **[P]** See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).

## C

- **Cancel** — The admin action that ends a reservation, with a reason. If a deposit was paid, the admin also records a refund decision. Customers cannot cancel by themselves; they contact the business. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Cancelled** (`cancelled`) — Status label: an admin cancelled the reservation. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Capacity** — How many bookings a date can take: one per delivery set, one for the room, and up to each add-on's daily stock. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-01, BR-02, BR-03.
- **Capacity lock** *(technical)* — One database lock that every booking or capacity change takes first, so two people can never both get the last set. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-20; [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §12.
- **Catalog** — What the business offers and books: packages, add-ons with their prices and daily stock, delivery slots, and resources (the sets and the room). See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Claim** — The record that a reservation or a block uses a set, the room, or some add-on units on a date. See: [business-rules](../01-requirements/business-rules.md) BR-01 to BR-04.
- **Closure date** — The date from which a reservation's retention periods count: the latest of the date it reached its final status, its event date (for Completed bookings), and its last payment or refund date. Example: Ben's booking is cancelled on 22 Dec 2026 and his refund is paid on 4 Jan 2027, so its closure date is 4 Jan 2027. **[P]** See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Completed** (`completed`) — Status label: the event of a Confirmed booking is over. The system sets it automatically. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Confirmed** (`confirmed`) — Status label: the booking is secured. It is the only status that means the business has confirmed the booking. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **CPA** — Certified Public Accountant. The business-registration questions go to a CPA or a lawyer (O-11). See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Customer** — A person who books. Customers have no account and never log in; they use their reference code and mobile number. **[C]** See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Customer emails** — Automatic emails to the customer about their reservation. They go out only if the customer gave an email address. **[C]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-01 to FR-NTF-12.
- **Customer notes** — See *Additional requirements note*.

## D

- **Daily job** — The scheduled run each day at 00:15 Manila time. It marks finished events Completed, runs the retention job, and runs the keep-alive. A second daily sweep on Vercel acts as a backup. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-04 to FR-SYS-08.
- **Daily stock** — How many units of an add-on can be booked for one date. Bookings can never go over it. See: [business-rules](../01-requirements/business-rules.md) BR-03.
- **Dashboard** — The admin home page: urgent and pending requests, proofs to verify, upcoming events, deadline alerts, and the paused-booking banner. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-02.
- **Data Privacy Act** (DPA, RA 10173) — The Philippine privacy law. It applies to this business even though the business is not registered. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Deadline** — The moment a hold expires if the next step has not happened. A Pending Confirmation request has 72 hours from submission; an approved request has 24 hours to get its deposit recorded. Every deadline ends at the service start at the latest. Example: approved on 20 Dec 2026 at 3:00 PM → deposit due by 21 Dec 2026 at 3:00 PM, unless the service starts sooner. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Delivery** — Service type: staff bring the videoke set to the customer's venue, set it up, and pick it up. **[C]** See: [decision-log](decision-log.md) D-01; [business-rules](../01-requirements/business-rules.md) BR-01.
- **Delivery pool** — All active delivery sets. Their number is the delivery capacity for each date; there is no separate count setting. See: [business-rules](../01-requirements/business-rules.md) BR-01.
- **Delivery set** — One videoke set kept for delivery bookings. There are 2–3 of them, separate from the on-site room, and each takes one booking per day. The set list is O-03. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-01; [catalog-and-payments](../02-domain/catalog-and-payments.md) (resources).
- **Delivery slot** — A fixed time window the customer picks for a delivery booking. It sets the event time, but the set is held for the whole day. The slot times are O-02. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md); [business-rules](../01-requirements/business-rules.md) BR-01.
- **Deposit** — A fixed amount the customer pays after an admin approves the request, in cash at the office or by e-wallet. Staff record it, and recording it confirms the booking. The amount is O-03. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Deposit instructions** — The settings text that tells customers how to pay: e-wallet name, number, and account name, plus the office address and hours. It is shown in the approved email and on the status page. **[P]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Deposit reminder** — An email to the customer 6 hours before the deposit deadline (default, a setting). **[C]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-04.
- **Deposit terms** — The settings text with the deposit conditions, printed on every acknowledgment. Its wording is O-03. **[P]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Design spec** — The approved design document (spec v0.2), frozen on 2026-10-21. These docs replace it as the source of truth; it is never edited. See: [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md).
- **DPO** — Data Protection Officer (also called compliance officer): the person named in writing to handle privacy matters (O-09). See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **DTI** — Department of Trade and Industry, where business names are registered. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Duplicate-submission key** *(technical)* — A hidden key on the form, so a double click or a retry returns the same reservation instead of making a second one. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-06.

## E

- **E.164** — The international phone-number format. Every mobile number is saved as `+63` followed by the 10-digit mobile number; for example, 0917 123 4567 becomes +639171234567. See: [business-rules](../01-requirements/business-rules.md) BR-11.
- **Edit details** — The admin action that corrects a reservation's details, such as a wrong mobile number, with a reason. **[P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Email caps** — Daily and monthly limits on emails sent (defaults 100 a day and 3,000 a month **[U]**). Customer emails go first; emails left over at the cap go out the next day. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-20.
- **Erasure request** — A customer's request to delete their personal data. The Super Admin processes it; payment records are kept, and the customer is told what was kept and why. **[P]** See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Event date** — The Manila calendar date of the event. Capacity is counted per event date. See: [business-rules](../01-requirements/business-rules.md) BR-01.
- **Event not held** — The admin correction for a booking marked Completed whose event did not happen. It needs a reason and a refund decision. **[P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Every-minute job** — The scheduled run each minute that expires overdue holds, sends due deposit reminders, and starts the sending of queued emails. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-01 to FR-SYS-03.
- **E-wallet** — A mobile-wallet payment, one of the two deposit methods (the other is cash at the office). The account to pay into is in the deposit instructions. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **E-wallet reference number** — The transaction number of an e-wallet payment. It is required when an admin records one, and it is the lasting record after the proof image is deleted. Payer names and account numbers are never stored. See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Expired** (`expired`) — Status label: a deadline passed before the next step happened. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Expiry paused** — The state of an Awaiting Deposit reservation whose uploaded proof is waiting for review. It does not expire in the meantime, but never past the service start. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-12.
- **Extend a deadline** — The admin action that gives the customer more time, with a reason, but never past the service start. The customer is emailed the new deadline. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).

## F

- **Final status** — The status a reservation ends in. Which statuses are final, and the one correction allowed after Completed, are in [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Full** — Calendar label: that date cannot take another booking of that service type. For today, it can also mean that no start time is left that meets the notice period. See: [business-rules](../01-requirements/business-rules.md) BR-09.

## H

- **Health panel** — An admin page that shows whether the system is working: recent job runs, failed emails, the email queue, cap usage, and storage use. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-33.
- **Heartbeat** *(technical)* — A record each scheduled job writes when it runs. If the records stop, Sentry sends an alert. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-10; [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-24.
- **Hold** — A Pending Confirmation or Awaiting Deposit reservation. It uses capacity, but only until its deadline. Not the same as a *legal hold*. See: [business-rules](../01-requirements/business-rules.md) BR-04, BR-05; [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Hold limits** — Caps on open online requests (Pending Confirmation or Awaiting Deposit) per mobile number: at most 1 per event date and 2 in total. Staff-created bookings do not count. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-07.
- **Honeypot** *(technical)* — A hidden form field that people never see but bots often fill in, used to catch bots. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-12.

## I

- **Info received** — The admin action that clears the needs-info flag. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Internal notes** — Notes that admins add to a reservation. Customers never see them. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-05.
- **IP address** *(technical)* — The internet address of the phone or computer a visitor uses. Rate limits count tries per IP address, stored only in scrambled form. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-11, NFR-13.
- **Issuer name** — The business name printed on acknowledgments as the issuer: **DJB Kasoundbox**. It is a setting, so it can change without code changes. **[C]** See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).

## J

- **Job routes** *(technical)* — The two protected web addresses that the scheduled jobs call: `/api/jobs/tick` (send queued emails) and `/api/jobs/daily` (the daily backup sweep). Both need a secret. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-09.

## K

- **Keep-alive** — A small daily database query that stops the free Supabase project from being paused for low activity. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-07; [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-07.

## L

- **Later** — Features planned for after the MVP, such as Messenger notifications and online payments. See: [project-charter](project-charter.md).
- **Ledger end** — The date until which booking and payment records are kept: 31 December of the 6th year after the closure year. Example: records closed in 2026 are kept through 31 December 2032 and processed in January 2033. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Legal hold** — A flag the Super Admin sets, with a reason, when there is a written complaint, demand, or case. While it is set, the retention job deletes nothing for that reservation. **[P]** See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Live claim** — A claim that still uses capacity: its reservation is Pending Confirmation, Awaiting Deposit, or Confirmed, or its block is active. Other claims are released. See: [business-rules](../01-requirements/business-rules.md) BR-04; overdue holds: BR-05.

## M

- **Manila time** — Asia/Manila time (UTC+8, no daylight saving). Every date and time in the system and in these docs is Manila time. **[C]** See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-19.
- **Messenger** — Facebook Messenger. Automatic Messenger updates, which customers opt into, come after the MVP. **[C]** See: [project-charter](project-charter.md).
- **Mobile number** — The customer's Philippine mobile number. It is required (email is optional), and together with the reference code it opens the status page. **[C]** Accepted formats: [business-rules](../01-requirements/business-rules.md) BR-11.
- **MVP** — Minimum viable product: the first release. Its feature list is in the charter. See: [project-charter](project-charter.md).

## N

- **Needs info** — A flag (not a status) on a Pending Confirmation request when an admin needs more information. The admin's message shows on the status page and is emailed. The 72-hour clock keeps running. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **No deletions** — Reservations are never deleted. Mistakes are fixed with a new action and a reason. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Notice period** — The minimum time between sending an online request and the service start: 1 hour (default, a setting), for both service types. Example: for a 7:00 PM start today, the latest online request is at 6:00 PM. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-06.
- **NPC** — National Privacy Commission, the Philippine privacy regulator. Customers have the right to complain to it. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).

## O

- **Official Receipt** (OR) — A BIR-registered receipt. The system never issues one; every acknowledgment says it is NOT an Official Receipt or Invoice. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Online request** — A request a customer sends from the website (source `online`), while it is Pending Confirmation or Awaiting Deposit. Only these count toward hold limits and the breaker. See: [business-rules](../01-requirements/business-rules.md) BR-07, BR-07a.
- **On-site** — Service type: customers use the business's own room. **[C]** See: [decision-log](decision-log.md) D-01; [business-rules](../01-requirements/business-rules.md) BR-02.
- **On-site hours** — The hours when the room can be used; the customer's arrival time must fall inside them. It is a setting; the hours are O-02. **[P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (service start).
- **Open item** — A question that still needs an answer, numbered O-02 to O-11 (O-01 is resolved). See: [decision-log](decision-log.md).
- **Outbox** — The queue where each email is saved together with the change that causes it, then sent and retried. It keeps emails from being lost or sent twice. **[P]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-16.
- **Out of scope** — Things decided not to build: customer accounts, customer self-cancel, and customer-initiated rescheduling. **[C]** See: [project-charter](project-charter.md).
- **Overdue hold** — A hold whose deadline has passed and that is not paused for proof review. It stops counting at once, even before the system marks it Expired. See: [business-rules](../01-requirements/business-rules.md) BR-05.

## P

- **Package** — A main videoke rental offer with its inclusions and price. The same packages are offered for delivery and on-site. The package list is O-03. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Paused online booking** — The period when the breaker has stopped online requests. The form and calendar ask customers to message or call, and the dashboard shows a banner. See: [business-rules](../01-requirements/business-rules.md) BR-07a.
- **Payments ledger** — The record of every movement of money on a reservation: deposits, balance payments, and refunds paid. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Pending Confirmation** (`pending`) — Status label: the request is waiting for an admin to review it. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Personal information controller** — The legal term for whoever decides how personal data is used; here, the person who runs the business (who that is in law is confirmed in the lawyer's review **[U]**, O-08). The controller stays responsible for data kept by its service providers. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Peso** (₱, PHP) — The currency of all prices and payments. See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Prepared message** — Ready-made text in the admin panel that staff copy into SMS or Messenger for customers who gave no email. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-21.
- **Price snapshot** — The prices and deposit amount copied into a reservation when it is submitted. Later catalog changes do not affect it. Example: a package booked at ₱3,000 stays ₱3,000 even if the price later goes up to ₱3,500 (example figures only). **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Privacy notice** — The page that explains what personal data is collected and why, who receives it, how long it is kept, and the customer's rights. A short summary sits above the Submit button. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Proof** (payment proof) — A picture of a payment that the customer uploads on the status page while Awaiting Deposit (at most 2 per reservation). An admin verifies or rejects it. See: [business-rules](../01-requirements/business-rules.md) BR-12; when images are deleted: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Proofs to verify** — The dashboard list of uploaded proofs waiting for an admin to review. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-02.

## Q

- **QR code** — The code the customer gets after submitting. They show it when visiting the office or paying; it is not used on event day. Like the reference code, it does not mean approved or paid. **[C]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-08, FR-ADM-06.
- **QR scan** — Admins scan a customer's QR code, or upload a screenshot of it, to open the reservation. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-06.
- **QR token** *(technical)* — The long random secret inside the QR code's link. Only a one-way hash of it is stored, and it stops working once the reservation is Rejected, Cancelled, Expired, or Completed. **[P]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-08; [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §11.

## R

- **Rate limits** — Caps on how often one visitor can try something, such as logging in, checking a status, sending the form, or uploading a proof. **[P]** See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-11.
- **Recreate expired** — The admin action that makes a new Pending Confirmation request from an Expired one, with a new reference code, QR code, and deadline, at current prices. The expired original stays as it is. **[P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Reference code** — The reservation's code, such as `KSB-7K3M-Q9TD`. Customers quote it when messaging or calling, and with the full mobile number it opens the status page. It does not mean approved or paid. **[C]** (format **[P]**) See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-08; [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §11.
- **Refund** — Money returned to a customer after a cancellation. The amount is decided case by case when cancelling; the payout is recorded later as "refund paid". **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Refund decision** — The choice recorded when cancelling a reservation with a paid deposit: none, partial, or full, with the amount. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Reissue QR** — Makes a new QR code and stops the old one from working. Available on the status page and as an admin action. **[P]** See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-13, FR-ADM-22.
- **Reject** — The admin action that declines a Pending Confirmation request, with a reason. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Rejected** (`rejected`) — Status label: an admin declined the request. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Request** — What a customer submits online, or an admin enters, before it is Confirmed: a reservation in Pending Confirmation or Awaiting Deposit. It holds capacity but is not confirmed. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Reschedule** — The admin action that moves a reservation to another date, slot, or arrival time, case by case. It fails if the new choice is not available; the reference code, QR code, and prices stay the same. **[C, details P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Resend** *(technical)* — The email-sending service (free plan). See: [functional-requirements](../01-requirements/functional-requirements.md) FR-NTF-16 to FR-NTF-20.
- **Reservation** — The system's record for one event: service type, event date, package and add-ons, customer details, status, and payments. "Request" and "booking" both refer to a reservation. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Reserved settings** — The deposit amount, the 72-hour and 24-hour deadlines, the delivery slots, and the business info. Only the Super Admin changes them **[C]** (D-07). See: [roles-and-permissions](../01-requirements/roles-and-permissions.md) §2.6.
- **Reset** (account reset) — A Super Admin action on an admin account: it sets a new password, forces new two-factor setup, and logs that user out everywhere. **[P]** See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Resource** — Something booked for a whole day: each delivery set and the on-site room. Add-ons are counted by daily stock instead. See: [business-rules](../01-requirements/business-rules.md) BR-01, BR-02; [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Restore test** — A check that a backup can really be loaded back. It is done in the week-1 test and again before launch. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-29.
- **Retention job** — The daily job that applies the retention schedule. It skips anything under legal hold and logs only counts. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-SYS-05; [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Retention schedule** — The table of how long each kind of data is kept and what happens after that. The periods are defaults stored as settings, and a lawyer must confirm them (O-08). **[C]** (defaults) See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Room** (on-site room) — The business's one room for on-site bookings. It takes one booking per day. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-02.

## S

- **Same-day booking** — A booking whose event date is today. Customers can make one online if the notice period is met, and it is always flagged urgent. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-06, BR-06a.
- **SDAU** — A free sworn declaration to the NPC that may still be needed even though full NPC registration probably is not. Whether to file it is O-10. **[U]** See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Sensitive personal information** — A stricter legal category of personal data, such as age or birthdate, religion, health, and government-issued ID numbers. The system never collects it. See: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Sentry** *(technical)* — The error-monitoring service (free plan). Personal data is scrubbed before errors are sent. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-23, NFR-24.
- **Service area** — The area where delivery is free. There is no area list; staff check each address during review. The customer-facing wording is O-04. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Service start** — When the service begins: for delivery, the start time of the chosen slot; for on-site, the chosen arrival time. It is saved at submission, and no deadline can go past it. **[C/P]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Service type** — Delivery or on-site. Each has its own capacity. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-01, BR-02.
- **Set or room block** — A block on one delivery set, or on the room, for a date. Either admin can create one. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-08; who can do it: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Settings** — Values that can be changed without code, such as the deposit amount, the deadlines, and the hold limits. Who may change each one: [roles-and-permissions](../01-requirements/roles-and-permissions.md). See: [functional-requirements](../01-requirements/functional-requirements.md) FR-ADM-28.
- **Source** — Where a reservation came from: `online`, `phone`, `walk_in`, or `facebook`. See: [business-rules](../01-requirements/business-rules.md) BR-06a.
- **Staff** — The people who run the business. In the system they act through the two admin accounts; there are no other staff logins. See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
- **Staff-created booking** — A reservation an admin enters for a phone, walk-in, or Facebook customer. It skips the notice check, hold limits, and breaker. If its start is already past or within the notice period, it is created as Confirmed in one step, with a deposit or a waiver. See: [business-rules](../01-requirements/business-rules.md) BR-06a.
- **Status** — The stage a reservation is in: Pending Confirmation, Awaiting Deposit, Confirmed, Completed, Rejected, Cancelled, or Expired. See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Status page** — The public page where a customer enters the reference code and full mobile number to see the status, amounts, deadline, and documents, and to upload a proof. It never shows the name, mobile, or address. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-10, FR-PUB-11.
- **Submission** — The moment a reservation is created, from the online form or by an admin. The prices and the service start are fixed at this moment. See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-06; [catalog-and-payments](../02-domain/catalog-and-payments.md).
- **Supabase** *(technical)* — The database service (free plan, Singapore region) that holds all data and booking rules. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-02, NFR-07.
- **Super Admin** — The account role held by the developer (son), who builds and maintains the system. Only the Super Admin manages admin accounts and changes settings (the Admin can only resume a breaker pause early). **[C]** See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).

## T

- **Turnstile** *(technical)* — Cloudflare's free bot check on the public form. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-12.
- **Two-factor authentication** (2FA) — A second login step: after the password, the admin types a code from an authenticator app on their phone. It is required for both admin accounts. See: [roles-and-permissions](../01-requirements/roles-and-permissions.md).

## U

- **Unregistered business** — DJB Kasoundbox is not registered as a business, because it is small and local. The system still keeps full payment records, which will support a later registration. **[C]** See: [project-charter](project-charter.md); [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Urgent** — A flag on any reservation whose event date is today, whatever its source. It shows in the dashboard's urgent queue and is marked in admin emails. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-06a.
- **UTC** *(technical)* — World standard time, 8 hours behind Manila time. Servers often keep time in UTC, but the system always shows and counts dates in Manila time. See: [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-19.

## V

- **Venue** — For delivery, where the event takes place: barangay and city or municipality (required), plus street and landmarks (the venue details). See: [functional-requirements](../01-requirements/functional-requirements.md) FR-PUB-05; how long it is kept: [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Vercel Hobby** *(technical)* — The free hosting plan for the website. Its terms allow non-commercial use only; this risk was accepted knowingly, and the design stays portable so the site can move. **[C]** See: [decision-log](decision-log.md) D-20; [non-functional-requirements](../01-requirements/non-functional-requirements.md) NFR-05, NFR-06.
- **Verified** — Said of a deposit: an admin has checked the payment and recorded it. The time is saved as `verified_at`. If the customer uploaded a proof, its image is deleted 7 days later. **[C]** See: [catalog-and-payments](../02-domain/catalog-and-payments.md); [privacy-and-retention](../01-requirements/privacy-and-retention.md).
- **Videoke** — The Filipino name for karaoke with a screen and song videos. The business rents out videoke sets. See: [project-charter](project-charter.md).
- **Void** — Cancels a wrongly recorded payment, with a reason. The record stays, and its acknowledgment number is retired, never reused. See: [catalog-and-payments](../02-domain/catalog-and-payments.md).

## W

- **Waiver** (same-day deposit waiver) — An admin confirms a booking whose event date is today without requiring the deposit, and records a reason. A deposit can still be recorded later. **[C]** See: [reservation-lifecycle](../02-domain/reservation-lifecycle.md).
- **Week-1 test** — A first trial on the real hosting and database in Singapore, before any features are built. It ends with a go / no-go decision. See: [project-charter](project-charter.md) (details in the roadmap, batch 4).
- **Whole-date block** — A block on a whole date: it takes every active set and the room, but not add-on stock. Only the Super Admin can create one. **[C]** See: [business-rules](../01-requirements/business-rules.md) BR-08; who can do it: [roles-and-permissions](../01-requirements/roles-and-permissions.md).
