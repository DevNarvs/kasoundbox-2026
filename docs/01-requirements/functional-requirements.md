# Functional Requirements

> **Purpose:** What the DJB Kasoundbox system must do (public website, admin panel, emails, and scheduled jobs), with acceptance criteria for each requirement. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin). Sections 2 to 4 are written for both; parts marked *For the developer* and most of section 5 are mainly for the developer ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](../00-project/decision-log.md), [Glossary](../00-project/glossary.md), [Project charter](../00-project/project-charter.md), [Roles and permissions](roles-and-permissions.md), [Business rules](business-rules.md), [Reservation lifecycle](../02-domain/reservation-lifecycle.md), [Catalog and payments](../02-domain/catalog-and-payments.md), [Privacy and retention](privacy-and-retention.md), [Non-functional requirements](non-functional-requirements.md), [Edge cases](edge-cases.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §3, §5, §9, §13, §15 (main sources), with §2, §4, §6, §7, §8, §10, §11, §12, §14, §16

**How to read this document.**

- **Labels.** **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked in the week-1 test or before launch · **[O-nn]** open item, listed in the [decision log](../00-project/decision-log.md).
- **"MVP scope"** in a label field means the requirement is part of the approved first release ([spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §3) but the spec gives it no label of its own.
- **"[P] (new in this doc)"** marks a small detail that spec v0.2 does not state, for example which fields the admin search covers. It was added while writing this document so the requirement can be tested. It is not yet approved: please confirm or correct it in this review.
- **Each requirement** has an ID (FR-PUB-01, FR-ADM-01, …), an **MVP** flag, a **label**, the rules it **relies on**, a short description, and **acceptance criteria**. Acceptance criteria are the checks that must pass before the requirement counts as done. Some are written as *Given* (the starting situation) / *When* (what someone does) / *Then* (what the system must do).
- **This document says what the system must do.** The rules behind it live in one place each, and this document links to them instead of repeating them:

| If you need… | It is defined only in |
|---|---|
| Who may do an action (Super Admin, Admin, customer) | [roles-and-permissions](roles-and-permissions.md) |
| Capacity, availability, hold limits, the breaker, blocks, mobile-number formats (BR-01 to BR-12) | [business-rules](business-rules.md) |
| Statuses, transitions, deadlines, and the rules of each reservation action | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Packages, add-ons, delivery slots, prices, payments, acknowledgments | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Personal data, retention periods, legal hold, erasure, the wording on acknowledgments | [privacy-and-retention](privacy-and-retention.md) |
| Cost, speed, security baseline and rate-limit numbers, phone-first design, time zone, backups, monitoring | [non-functional-requirements](non-functional-requirements.md) |
| What happens in unusual situations | [edge-cases](edge-cases.md) |
| What a word means | [glossary](../00-project/glossary.md) |

- **Time and money.** Every date and time is Manila time (Asia/Manila). Every amount is in Philippine pesos (₱). Names, prices, and amounts in the examples are made up; the real prices and the deposit amount are still open (O-03).
- **Tests.** Test cases (TC-xx) will be written in the test plan (planned for batch 4: `06-delivery/test-plan.md`). Each test case will name the FR-ID it checks.

**The running example.** Many examples follow one customer:

- **Ana** books a **delivery** for **Thursday 24 December 2026**. Her reference code is `KSB-7Q2M-K9TX`. Her mobile number is `0917 123 4567`.
- She picks a package at ₱3,000 and 2 extra microphones at ₱200 each. The total is ₱3,400. The deposit is ₱1,000, so the balance due is ₱2,400.
- She submits on **Wednesday 16 December at 10:00 AM**. An admin approves on **Thursday 17 December at 2:00 PM**, so her deposit is due by **Friday 18 December at 2:00 PM** (24 hours later; the deadline rules are in [reservation-lifecycle](../02-domain/reservation-lifecycle.md)).

---

## 1. Requirements at a glance

Every requirement in this document is part of the MVP (the first release). Items for later releases are in section 6.

| ID | Requirement | MVP | Label |
|---|---|---|---|
| **Public website** | | | |
| FR-PUB-01 | Home page | Yes | MVP scope; contents [P] (new in this doc) |
| FR-PUB-02 | Packages and add-ons page | Yes | [C] |
| FR-PUB-03 | Availability calendar | Yes | [C] |
| FR-PUB-04 | Reservation form: choose the booking | Yes | [C] |
| FR-PUB-05 | Reservation form: customer details | Yes | [C] |
| FR-PUB-06 | Reservation form: review and submit | Yes | MVP scope; prices [C] |
| FR-PUB-07 | Confirmation page | Yes | [C] |
| FR-PUB-08 | Reference code and QR code | Yes | Use [C]; format [P] |
| FR-PUB-09 | QR link page | Yes | [P] |
| FR-PUB-10 | Status lookup | Yes | [C] |
| FR-PUB-11 | Status page | Yes | MVP scope |
| FR-PUB-12 | Deposit proof upload | Yes | [C] |
| FR-PUB-13 | Reissue QR on the status page | Yes | [P] |
| FR-PUB-14 | Acknowledgments and booking confirmation for the customer | Yes | [P] |
| FR-PUB-15 | Privacy notice page | Yes | MVP scope |
| FR-PUB-16 | Contact and FAQ page | Yes | MVP scope; contents [P] (new in this doc) |
| **Admin panel** | | | |
| FR-ADM-01 | Admin login with two-factor authentication | Yes | MVP scope; account rules [P] |
| FR-ADM-02 | Dashboard | Yes | MVP scope |
| FR-ADM-03 | Reservation list and search | Yes | MVP scope; search fields [P] (new in this doc) |
| FR-ADM-04 | Reservation details | Yes | MVP scope |
| FR-ADM-05 | Internal notes | Yes | MVP scope |
| FR-ADM-06 | QR scan | Yes | [C] |
| FR-ADM-07 | Rules common to every reservation action | Yes | MVP scope |
| FR-ADM-08 | Approve or reject a request | Yes | [C] |
| FR-ADM-09 | Flag or clear "needs info" | Yes | [C] |
| FR-ADM-10 | Edit details | Yes | [P] |
| FR-ADM-11 | Record a deposit | Yes | [C]; exact amount [P] |
| FR-ADM-12 | Verify or reject an uploaded proof | Yes | [C]; late rejection [P] |
| FR-ADM-13 | Same-day deposit waiver | Yes | [C] |
| FR-ADM-14 | Record a balance payment | Yes | [C] |
| FR-ADM-15 | Void a payment | Yes | MVP scope; balance and refund voids [C] (D-24) |
| FR-ADM-16 | Extend a deadline | Yes | [C] |
| FR-ADM-17 | Reschedule | Yes | [C]; details [P] |
| FR-ADM-18 | Cancel with a refund decision | Yes | [C] |
| FR-ADM-19 | Record a refund paid | Yes | [C] |
| FR-ADM-20 | Mark a Completed event as "not held" | Yes | [P] |
| FR-ADM-21 | Recreate an expired request | Yes | [P] |
| FR-ADM-22 | Reissue a QR code (admin) | Yes | [P] |
| FR-ADM-23 | Print acknowledgments and booking confirmations | Yes | [P] |
| FR-ADM-24 | Staff-created bookings | Yes | [C] |
| FR-ADM-25 | Blocks | Yes | [C] |
| FR-ADM-26 | Catalog management | Yes | [C] |
| FR-ADM-27 | Delivery sets and the room | Yes | [P] |
| FR-ADM-28 | Settings | Yes | Reserved settings [C]; others [P] |
| FR-ADM-29 | Resume online booking early | Yes | [P] |
| FR-ADM-30 | Admin accounts | Yes | [C]; account rules [P] |
| FR-ADM-31 | Legal hold and erasure requests | Yes | [P] |
| FR-ADM-32 | Audit log and reservation history | Yes | MVP scope |
| FR-ADM-33 | Health panel | Yes | MVP scope |
| **Notifications** | | | |
| FR-NTF-01 to FR-NTF-12 | Customer emails (one ID per email type) | Yes | [C]; three types [P] |
| FR-NTF-13 to FR-NTF-15 | Admin emails (one ID per email type) | Yes | [C]; two types [P] |
| FR-NTF-16 | Outbox: emails saved with the change | Yes | [P] |
| FR-NTF-17 | No duplicate emails | Yes | [P] |
| FR-NTF-18 | Retries and failed emails | Yes | [P] |
| FR-NTF-19 | Stale emails are skipped | Yes | [P] |
| FR-NTF-20 | Email caps and priority | Yes | [P]; default caps [U] |
| FR-NTF-21 | Customers without email | Yes | MVP scope |
| **Scheduled jobs and system** | | | |
| FR-SYS-01 | Expire overdue holds (every minute) | Yes | MVP scope |
| FR-SYS-02 | Queue due deposit reminders (every minute) | Yes | [C] |
| FR-SYS-03 | Send queued emails (every minute) | Yes | MVP scope |
| FR-SYS-04 | Mark finished events Completed (daily) | Yes | [C] |
| FR-SYS-05 | Retention job (daily) | Yes | Defaults [C] |
| FR-SYS-06 | Rotate the IP key (daily) | Yes | MVP scope |
| FR-SYS-07 | Keep-alive (daily) | Yes | MVP scope |
| FR-SYS-08 | Backup sweep on Vercel (daily) | Yes | MVP scope |
| FR-SYS-09 | Protected job routes | Yes | MVP scope |
| FR-SYS-10 | Job run records and heartbeat | Yes | MVP scope |
| FR-SYS-11 | Health check address | Yes | MVP scope |
| FR-SYS-12 | Nightly encrypted backup | Yes | MVP scope; private repo [C] |

---

## 2. Public website (FR-PUB)

The public website is for customers. It has no login and no customer accounts **[C]** (D-08). Most customers will use it on a phone, so every page must work well at phone size ([non-functional-requirements](non-functional-requirements.md) NFR-16).

### FR-PUB-01 · Home page

**MVP:** Yes · **Label:** MVP scope; contents [P] (new in this doc) · **Relies on:** D-01

The home page introduces DJB Kasoundbox and its two services, and leads customers to the other public pages.

**Acceptance criteria**
- The page names both services **[C]** (D-01):
  - **Delivery:** we bring the videoke to your venue, set it up, and pick it up afterwards.
  - **On-site:** you use our room.
- It links to the packages and add-ons page, the availability calendar, the reservation form, the status page, the privacy notice, and the contact and FAQ page **[P] (new in this doc)**.
- It shows no personal data.

### FR-PUB-02 · Packages and add-ons page

**MVP:** Yes · **Label:** [C] (D-14) · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (catalog structure), D-11, D-14

The page lists the packages, with their inclusions and prices, and the add-ons, with their prices.

**Acceptance criteria**
- Every active package shows its name, what it includes, and its price in pesos, for example "₱3,000".
- Every active add-on shows its name and price, for example "Extra microphone: ₱200".
- Archived packages and add-ons are not shown ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- The same packages are offered for delivery and on-site **[C]** (D-14).
- The page says that delivery is free within the service area, using the fixed wording in O-04 once it is confirmed **[C]** (D-11). Showing it on this page is **[P] (new in this doc)**.
- Given an admin changes a price, when a customer opens the page afterwards, then the new price is shown.
- *For the developer:* catalog pages are cached and refreshed whenever the catalog is edited (spec v0.2 §10).

### FR-PUB-03 · Availability calendar

**MVP:** Yes · **Label:** [C] (D-14) · **Relies on:** [business-rules](business-rules.md) BR-09 (main rule), BR-01 to BR-05, BR-07a, BR-08

The customer picks a service type and sees each date as **Available** or **Full**. When a date counts as Full is defined only in BR-09.

**Acceptance criteria**
- The customer first picks delivery or on-site. Each date in the booking window then shows **Available** or **Full** (BR-09).
- *Example.* There are 2 delivery sets. Ana and Ben each hold a set on Thursday 24 December 2026. That date shows **Full** for delivery. It can still show **Available** for on-site if the room is free.
- Given Ana's request expires, when anyone opens the calendar, then 24 December shows **Available** for delivery again at once. Nobody has to wait for the every-minute job (BR-05).
- Dates outside the booking window cannot be picked (BR-09).
- No names, counts, or other personal data are ever shown (BR-09).
- While online booking is paused by the breaker, the calendar shows a banner asking customers to message or call the business (BR-07a).
- Picking an Available date continues to the reservation form (FR-PUB-04), with the service type and date already filled in **[P] (new in this doc)**.
- *For the developer:* the calendar is always live and never cached (spec v0.2 §10).

### FR-PUB-04 · Reservation form: choose the booking

**MVP:** Yes · **Label:** [C] (D-03) · **Relies on:** D-03, [business-rules](business-rules.md) BR-03, BR-06; [catalog-and-payments](../02-domain/catalog-and-payments.md) (packages, add-ons, delivery slots); [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (service start)

The customer chooses what to book and when it starts.

**Acceptance criteria**
- The customer picks one package.
- The customer may add add-ons, with a quantity for each. The quantity cannot exceed the add-on's free daily stock; the server checks this at submission (BR-03).
- **Delivery:** the customer picks one active delivery slot. The slot sets the event time; the set is held for the whole day **[C]** (D-03).
- **On-site:** the customer picks an arrival time. It must fall within on-site hours **[C]** (D-03). A time outside on-site hours is refused.
- The slot times and on-site hours are still open (O-02).
- **Same day:** a start less than the notice period away (1 hour, a setting) is refused (BR-06).
  - *Example.* On Saturday 19 December 2026 at 5:30 PM, Ben asks for the room today. An arrival at 6:00 PM is refused. An arrival at 7:00 PM is accepted.
- When delivery is chosen, the form shows the fixed free-delivery wording (O-04). Showing it here is **[P] (new in this doc)**.
- The start of the chosen slot, or the chosen arrival time, becomes the reservation's service start ([reservation-lifecycle](../02-domain/reservation-lifecycle.md), service start).

### FR-PUB-05 · Reservation form: customer details

**MVP:** Yes · **Label:** [C] (D-08) · **Relies on:** D-08, [business-rules](business-rules.md) BR-11; [privacy-and-retention](privacy-and-retention.md)

The customer enters their contact details and, for delivery, the venue.

**Acceptance criteria**
- The form asks for:
  - **name**;
  - **mobile number**, required: a Philippine mobile number **[C]** (D-08);
  - **email address**, optional **[C]** (D-08);
  - **for delivery, the venue:** barangay and city or municipality (required), plus street and landmarks;
  - **"Additional requirements"**, an optional note of up to 500 characters.
- The mobile number is accepted only in the formats listed in BR-11, and is saved in one standard form.
  - *Example.* Ana types `0917 123 4567`. It is accepted and saved as `+639171234567`. `12345` is refused with a clear message.
- The "Additional requirements" box shows this warning: *do not enter IDs, birthdates, health, or religious information*. A note longer than 500 characters cannot be entered.
- The form asks for no other personal data ([privacy-and-retention](privacy-and-retention.md)).
- If no email address is given, the booking still works. The customer then follows it on the status page (FR-NTF-21).

### FR-PUB-06 · Reservation form: review and submit

**MVP:** Yes · **Label:** MVP scope; prices locked at submission [C] (D-12) · **Relies on:** [business-rules](business-rules.md) BR-01 to BR-03, BR-06, BR-07, BR-07a; [catalog-and-payments](../02-domain/catalog-and-payments.md) (price calculation and snapshot); [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Pending Confirmation and its deadline); [privacy-and-retention](privacy-and-retention.md) (privacy notice); [non-functional-requirements](non-functional-requirements.md) (NFR-11 rate limits, NFR-12 bot protection, NFR-20 data integrity)

Before sending, the customer checks a summary. On Submit, the server checks everything in one step. It then either creates the request or explains why not.

**Acceptance criteria**
- **Summary.** Before Submit, the customer sees the service type, date, slot or arrival time, package, add-ons with quantities, the price breakdown, the total, and the deposit amount.
  - *Example.* Package ₱3,000 + 2 × extra microphone ₱200 = **₱3,400 total**. Deposit **₱1,000**, paid after approval.
- **Privacy.** A short privacy summary sits above the Submit button and links to the full privacy notice (FR-PUB-15). The customer must agree to the policies before Submit works.
- **Prices are locked at submission** **[C]** (D-12). The server calculates them from the catalog and copies them, with the deposit amount, into the reservation ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
  - *Example.* Ana submits while the package costs ₱3,000. The next week the price goes up to ₱3,500. Ana still pays ₱3,000.
- **On success**, the request is created as **Pending Confirmation**. It holds its set or room and its add-ons until its deadline ([reservation-lifecycle](../02-domain/reservation-lifecycle.md)). The customer sees the confirmation page (FR-PUB-07).
- **No double booking.** Given one delivery set is left on 24 December, when Carla and Dan press Submit at the same instant, then exactly one of them gets it. The other sees "just taken, pick another date" (BR-01; [non-functional-requirements](non-functional-requirements.md) NFR-20).
- **Taken while filling in the form.** If the set, room, or add-on stock was taken while the customer was filling in the form, the customer sees "just taken". The form keeps everything they typed and suggests other dates.
- **Other refusals.** When a hold limit is reached (BR-07), online booking is paused (BR-07a), or the start is too soon (BR-06), the request is refused with a clear message. The form keeps the customer's data.
- **While paused**, the form shows "please message or call us" instead of accepting requests (BR-07a).
- **No accidental duplicates.** A double click, a retry after a network error, or a second browser tab returns the same reservation and reference code. It never creates a second reservation.
- **New website version.** If a new version of the website goes live while the form is open, the page asks the customer to reload. Their draft and the duplicate-submission key are kept in the browser session, so nothing is lost or sent twice.
- **Bot protection.** Submit requires the Cloudflare Turnstile check. A hidden "honeypot" field catches simple bots. Too many submissions from one internet address are refused for a while (rate limits: [non-functional-requirements](non-functional-requirements.md) NFR-11).
- **Emails queued:** request received to the customer, if an email was given (FR-NTF-01), and new online request to both admins (FR-NTF-13).
- The submission is recorded in the audit log, with the actor "customer" (FR-ADM-32).
- *For the developer:* the fields are validated in the browser, on the server, and in the database. Zod schemas are shared by the form and the server. The whole submission is one database function call (`app.book_reservation`), which takes the capacity lock, expires stale holds, runs every check, claims capacity, and writes the reservation, the audit row, and the outbox rows (spec v0.2 §12). The duplicate-submission key is stored hashed and deleted after 72 hours ([privacy-and-retention](privacy-and-retention.md)).

### FR-PUB-07 · Confirmation page

**MVP:** Yes · **Label:** [C] (D-09) · **Relies on:** D-09, FR-PUB-08, FR-NTF-01; [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (deadlines)

After a successful submission, the customer sees their reference code and QR code, and what happens next.

**Acceptance criteria**
- The page shows the reference code, the QR code, and a clear **"Not yet confirmed"** notice.
- It explains the next steps:
  - an admin will review the request;
  - after approval, the deposit is due within 24 hours, or before the service start if that is sooner, in cash at the office or by e-wallet ([reservation-lifecycle](../02-domain/reservation-lifecycle.md));
  - the status page shows progress, using the reference code and the full mobile number (FR-PUB-10);
  - show the QR code at the office or when paying; quote the reference code when messaging or calling. The QR code is not used on event day **[C]** (D-09).
- Nothing on the page says or suggests that the booking is approved or paid.
- If an email address was given, the request-received email is also sent (FR-NTF-01).

### FR-PUB-08 · Reference code and QR code

**MVP:** Yes · **Label:** Where they are used [C] (D-09); format [P] · **Relies on:** D-09; [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §11 (identifiers)

Every reservation gets a reference code and a QR code when it is created, whether it came from the website or was entered by an admin.

**Acceptance criteria**
- **Reference code format [P].** `KSB-XXXX-XXXX`. Each X is one of 31 characters: `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. The digits 0 and 1 and the letters I, L, and O are left out.
- **Lookups are forgiving.** Lowercase letters, spaces, and dashes are ignored. *Example:* typing `ksb 7q2m k9tx` finds `KSB-7Q2M-K9TX`.
- **QR code [P].** The QR code holds a web link of the form `https://<domain>/r/<token>`. The domain is still open (O-05). What the link shows is in FR-PUB-09.
- The QR link stops working when the reservation becomes Rejected, Cancelled, Expired, or Completed.
- Reissuing the QR code makes a new link and stops the old one (FR-PUB-13, FR-ADM-22).
- Neither the reference code nor the QR code means the booking is approved or paid.
- *For the developer:* the reference code comes from a cryptographically secure random generator, has a unique constraint, and is retried on collision. The token holds 160 random bits; only its SHA-256 hash is stored (spec v0.2 §11).

### FR-PUB-09 · QR link page

**MVP:** Yes · **Label:** [P] · **Relies on:** FR-PUB-08, FR-ADM-06

What someone sees when they open a QR code's link.

**Acceptance criteria**
- Given a valid QR code, when a visitor who is not logged in opens it, then the page says "present this at our office" and shows no booking data.
- Given a valid QR code, when a logged-in admin opens it, then the reservation opens in the admin panel (FR-ADM-06).
- Given an invalid, revoked, or guessed token, when anyone opens it, then a "not found / no longer valid" page is shown, with no data.

### FR-PUB-10 · Status lookup

**MVP:** Yes · **Label:** [C] (D-08) · **Relies on:** D-08, [business-rules](business-rules.md) BR-11; [non-functional-requirements](non-functional-requirements.md) (NFR-11)

The customer finds their booking without an account.

**Acceptance criteria**
- The lookup needs the reference code **and** the full mobile number **[C]** (D-08).
  - *Example.* Ana enters `KSB-7Q2M-K9TX` and `0917 123 4567` and sees her status page (FR-PUB-11).
- The mobile number may be typed in any format accepted by BR-11. It is converted to the standard form before it is compared.
- The reference code is matched as described in FR-PUB-08 (case, spaces, and dashes ignored).
- If the two do not match the same reservation, no booking data is shown.
- Too many lookups from one internet address, or too many failures for one reference code, are refused for a while (rate limits: [non-functional-requirements](non-functional-requirements.md) NFR-11).

### FR-PUB-11 · Status page

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (statuses, deadlines); [catalog-and-payments](../02-domain/catalog-and-payments.md) (amounts, deposit instructions, acknowledgments); [business-rules](business-rules.md) BR-05, BR-12

After a successful lookup, the status page is the customer's source of truth.

**Acceptance criteria**
- The page shows:
  - the status label (for example **Awaiting Deposit**) and the service type;
  - the event date, and the slot or arrival time;
  - the package and add-ons;
  - the total, the deposit, and the balance due;
  - the current deadline in Manila time, for example "Friday 18 December 2026, 2:00 PM";
  - the deposit instructions, while the booking is Awaiting Deposit ([catalog-and-payments](../02-domain/catalog-and-payments.md));
  - the needs-info message, when the request is flagged (FR-ADM-09);
  - the rejection or cancellation reason, and the refund decision;
  - links to the payment acknowledgments and the booking confirmation (FR-PUB-14);
  - the proof upload control, while the booking is Awaiting Deposit (FR-PUB-12);
  - a way to get a new QR code (FR-PUB-13).
- The page never shows the customer's name, mobile number, or address.
- Given a hold whose deadline has passed and whose expiry is not paused, when the customer opens the page, then it shows **Expired** at once, even if the every-minute job has not run yet (BR-05).
- *For the developer:* the page is always live and never cached.

### FR-PUB-12 · Deposit proof upload

**MVP:** Yes · **Label:** [C] (D-05) · **Relies on:** D-05, [business-rules](business-rules.md) BR-12; [privacy-and-retention](privacy-and-retention.md) (proof images); [non-functional-requirements](non-functional-requirements.md) (NFR-11, NFR-14)

While Awaiting Deposit, the customer may upload a picture of their payment. An admin then checks it.

**Acceptance criteria**
- The upload control appears only after a successful lookup, only while the booking is Awaiting Deposit, and only before the deadline.
- Accepted files: JPG, PNG, or WebP, at most 1 MB each. At most 2 uploads per reservation, ever; a third is refused.
- Before upload, the browser re-saves the image. This removes hidden data such as the GPS location (EXIF data).
- Given Ana's deposit is due on Friday 18 December at 2:00 PM, when she uploads a proof at 1:50 PM, then:
  - expiry pauses until an admin reviews the proof (BR-12);
  - the reservation appears in the dashboard's "proofs to verify" list (FR-ADM-02);
  - both admins get the proof-uploaded email (FR-NTF-14).
- Uploading a proof does not confirm the booking. Only an admin does (FR-ADM-12).
- Proof images are deleted on the schedule in [privacy-and-retention](privacy-and-retention.md), for example 7 days after the deposit is verified **[C]** (D-21).
- *For the developer:* the server issues a single-use, rate-limited signed upload address, bound to one reservation. The browser uploads straight to a private Supabase Storage bucket (spec v0.2 §13).

### FR-PUB-13 · Reissue QR on the status page

**MVP:** Yes · **Label:** [P] · **Relies on:** FR-PUB-08

A customer who lost or shared their QR code can get a new one.

**Acceptance criteria**
- After a successful lookup, the customer can ask for a new QR code. The new one is shown on screen.
- The old QR code stops working at once. Opening it shows the "no longer valid" page (FR-PUB-09).
- The reference code does not change.
- The reissue is recorded in the audit log, with the actor "customer".

### FR-PUB-14 · Acknowledgments and booking confirmation for the customer

**MVP:** Yes · **Label:** [P] · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (content and ACK numbers); [privacy-and-retention](privacy-and-retention.md) (wording rules)

The customer can open and print their payment acknowledgments and their booking confirmation.

**Acceptance criteria**
- The status page links to each payment acknowledgment (one per recorded deposit or balance payment) and to the booking confirmation.
- The Confirmed email links to them too (FR-NTF-07).
- Each one is a printable web page that can be printed or saved from a phone or computer browser.
- What each one contains, and how acknowledgments are numbered (`ACK-YYYY-NNNN`), is defined only in [catalog-and-payments](../02-domain/catalog-and-payments.md). The words they must never use, such as "Official Receipt", are in [privacy-and-retention](privacy-and-retention.md).

### FR-PUB-15 · Privacy notice page

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (notice contents); O-09

**Acceptance criteria**
- A public page holds the full privacy notice. What it must say is defined only in [privacy-and-retention](privacy-and-retention.md).
- The short privacy summary on the form links to it (FR-PUB-06).
- The privacy contact email is shown once it exists (O-09).

### FR-PUB-16 · Contact and FAQ page

**MVP:** Yes · **Label:** MVP scope; contents [P] (new in this doc) · **Relies on:** FR-ADM-28 (business info setting); D-08; D-09; O-05

**Acceptance criteria**
- The page shows the business's contact details from the business info setting (FR-ADM-28).
- It explains that customers cannot cancel or reschedule online. They message or call the business and quote their reference code **[C]** (D-08, D-09).
- It answers common questions **[P] (new in this doc)**. The questions and answers are written with the content in O-03 and O-04.
- Which addresses to publish (domain name, Facebook Page, business email) is still open (O-05).

---

## 3. Admin panel (FR-ADM)

The admin panel is the private part of the website, at `/admin`. Only the two admins can log in. **Who may do each action is defined only in [roles-and-permissions](roles-and-permissions.md).** This section says what each screen and action must do. The rules each action follows are in [reservation-lifecycle](../02-domain/reservation-lifecycle.md), [catalog-and-payments](../02-domain/catalog-and-payments.md), and [business-rules](business-rules.md).

### FR-ADM-01 · Admin login with two-factor authentication

**MVP:** Yes · **Label:** MVP scope; account rules [P] · **Relies on:** [roles-and-permissions](roles-and-permissions.md) section 5 (account rules) and section 7 (enforcement); [non-functional-requirements](non-functional-requirements.md) (NFR-09, NFR-11)

**Acceptance criteria**
- An admin logs in with an email address and a password, then a code from an authenticator app on their phone (TOTP two-factor authentication).
- The admin area does not open until the 2FA step is passed. When an admin sets up 2FA, they receive one-time backup codes to store offline ([roles-and-permissions](roles-and-permissions.md) section 5.2).
- There is no public sign-up and no "create account" link.
- Repeated failed logins lock the account for a while (limits: [non-functional-requirements](non-functional-requirements.md) NFR-11).
- Given a visitor who is not logged in, when they open any `/admin` address, then they are sent to the login page.
- An admin can log out.
- Account changes are recorded in the audit log, in the "account" category (FR-ADM-32). Logins are recorded in the "security" category **[P] (new in this doc)**.
- *For the developer:* Better Auth with the admin plugin and TOTP; passwords hashed with argon2id. The middleware (`proxy.ts`) only redirects; the real check of login and role runs on the server in every admin page, action, and route ([roles-and-permissions](roles-and-permissions.md) section 7).

### FR-ADM-02 · Dashboard

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [business-rules](business-rules.md) BR-06a (urgent), BR-07a (paused banner), BR-12 (proofs); [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (deadlines)

The dashboard is the admin home page. It shows what needs attention.

**Acceptance criteria**
- The dashboard shows:
  - **Urgent and pending queue:** requests waiting for admin action. Urgent ones (event date today, BR-06a) are clearly marked.
  - **Proofs to verify:** every reservation with an uploaded proof that no admin has reviewed yet, with its service start.
  - **Upcoming events:** Confirmed bookings from today onwards, soonest first. The order and range are **[P] (new in this doc)**.
  - **Deadline alerts:** holds whose deadline is coming soon. How soon counts as "soon" is **[P] (new in this doc)**, to be set while building.
  - **Paused-booking banner:** shown while the breaker has paused online booking, with a button to resume early (FR-ADM-29).
- New online requests, uploaded proofs, and breaker pauses appear here as well as in the admin emails (FR-NTF-13 to FR-NTF-15).
- A hold whose deadline has passed is shown as expired, even before the every-minute job runs (BR-05).
- The dashboard shows current data each time it is opened or refreshed. It does not refresh itself in the background, because the design avoids polling to stay within the free hosting limits ([non-functional-requirements](non-functional-requirements.md) NFR-03, NFR-06).

### FR-ADM-03 · Reservation list and search

**MVP:** Yes · **Label:** MVP scope; search fields and filters [P] (new in this doc) · **Relies on:** [business-rules](business-rules.md) BR-11; FR-PUB-08

**Acceptance criteria**
- Admins can see a list of all reservations.
- The list can be filtered by status, service type, and event date **[P] (new in this doc)**.
- Admins can search by reference code, customer name, or mobile number **[P] (new in this doc)**.
  - Reference codes match as in FR-PUB-08. Mobile numbers are converted to the standard form first (BR-11).
  - *Example.* The Admin types `0917-123-4567` and finds Ana's reservation.
- Overdue holds show as Expired at once (BR-05).
- *For the developer:* always live, never cached.

### FR-ADM-04 · Reservation details

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md); [catalog-and-payments](../02-domain/catalog-and-payments.md); [roles-and-permissions](roles-and-permissions.md) section 6 (what each role sees)

One page shows everything about one reservation, and the actions an admin can take on it.

**Acceptance criteria**
- The page shows:
  - **state:** status, source (online, phone, walk-in, or Facebook), flags (urgent, needs info, legal hold, expiry paused for proof review), and the current deadline in Manila time;
  - **booking:** service type, event date, slot or arrival time, service start, package, add-ons, the locked prices and deposit, total, and balance due;
  - **customer:** name, mobile number, email, venue barangay and city, venue details, and the customer's note;
  - **payments:** every payment in the ledger, with its kind, amount, method, e-wallet reference, admin, time, note, ACK number, and void details ([catalog-and-payments](../02-domain/catalog-and-payments.md));
  - **proofs:** each uploaded proof and its review result. The image opens through a short-lived link;
  - the refund decision, and a link to the original reservation if this one was recreated (FR-ADM-21);
  - internal notes (FR-ADM-05);
  - the history: every audit entry for this reservation (FR-ADM-32);
  - the prepared message for customers without email (FR-NTF-21).
- The page offers only the actions that the reservation's status and the admin's role allow **[P] (new in this doc)** ([reservation-lifecycle](../02-domain/reservation-lifecycle.md); [roles-and-permissions](roles-and-permissions.md)). If a forbidden action is attempted anyway, the server refuses it.
  - *Example.* The Admin does not see "Set legal hold", which is for the Super Admin only.
- Old reservations whose contact details were blanked by the retention job show blanks in those fields ([privacy-and-retention](privacy-and-retention.md)).

### FR-ADM-05 · Internal notes

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (how long notes are kept)

**Acceptance criteria**
- Either admin can add a note to a reservation. The note is saved with its author and time.
- Customers never see internal notes: not on the status page, not in emails, not on printed documents.
- Notes are kept and then blanked on the schedule in [privacy-and-retention](privacy-and-retention.md).

### FR-ADM-06 · QR scan

**MVP:** Yes · **Label:** [C] (D-09) · **Relies on:** D-09, FR-PUB-08, FR-PUB-09

At the office, an admin scans the customer's QR code to open the right reservation quickly.

**Acceptance criteria**
- A scan page in the admin panel uses the phone's or laptop's camera. Scanning a valid QR code opens the reservation.
- **Fallback:** if the camera does not work, the admin can upload a screenshot of the QR code instead.
- The admin can also type the reference code into the search (FR-ADM-03).
- An invalid or revoked QR code shows "not found / no longer valid".
- The QR code is used at the office and when paying, not on event day **[C]** (D-09).
- *For the developer:* `@yudiel/react-qr-scanner`, loaded on the admin scan page only. Scanning is tested on the real phone and laptop that will be used, in the week-1 test (spec v0.2 §17).

### FR-ADM-07 · Rules common to every reservation action

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [roles-and-permissions](roles-and-permissions.md); [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (no deletions; "no other transitions exist"); [non-functional-requirements](non-functional-requirements.md) (NFR-21, NFR-22)

These checks apply to every reservation action in FR-ADM-08 to FR-ADM-24. The role check, the audit entry, and "all or nothing" also apply to every other admin change in this section.

**Acceptance criteria**
- **Role check.** The server checks the admin's login and role before every action ([roles-and-permissions](roles-and-permissions.md)).
- **Reasons.** Where an action needs a reason, it cannot be saved without one.
- **Two admins at once.** Given both admins have the same reservation open, when one acts first, then the second admin's action is refused with "already changed, please refresh", and nothing changes.
  - *Example.* At 10:02 AM the Admin approves Ana's request on his phone. A moment later, the Super Admin clicks Reject on his laptop. The reject is refused, and he sees the message.
- **Deadlines are checked, not trusted to jobs.** A hold whose deadline has passed (and whose expiry is not paused) is treated as expired at once. Approving it or recording its deposit is refused, unless expiry is paused for proof review (BR-12).
- **All or nothing.** Each action either takes full effect or changes nothing.
- **Audit.** Each action writes an audit entry: who, when, which action, the names of the fields changed (not their values), and the reason (FR-ADM-32).
- **Emails.** The emails an action causes are saved together with the change (FR-NTF-16). If an email fails, the change still stands.
- **No deletions.** Reservations are never deleted. Mistakes are fixed with a new action and a reason ([reservation-lifecycle](../02-domain/reservation-lifecycle.md)).
- *For the developer:* each action is one database function call. It checks the reservation's current status and version, and takes the capacity lock when capacity changes (spec v0.2 §12).

### FR-ADM-08 · Approve or reject a request

**MVP:** Yes · **Label:** [C] (D-07, D-11) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Pending Confirmation → Awaiting Deposit; Pending Confirmation → Rejected); D-11; [business-rules](business-rules.md) BR-04

**Acceptance criteria**
- **Approve** moves a Pending Confirmation request to Awaiting Deposit and starts the deposit deadline ([reservation-lifecycle](../02-domain/reservation-lifecycle.md)).
  - *Example.* The Admin approves Ana's request on Thursday 17 December at 2:00 PM. Her deposit is due by Friday 18 December at 2:00 PM.
  - Emails queued: approved (FR-NTF-03). The deposit reminder follows later if it is due (FR-NTF-04).
- **Address check.** For delivery, the admin checks that the venue is inside the service area before approving. There is no area list; the admin decides **[C]** (D-11). The page shows the barangay, city, and venue details to help.
- **Reject** needs a reason. The reason is shown on the status page and sent in the rejected email (FR-NTF-09). The request stops holding capacity (BR-04).
- Approving after the deadline is refused (FR-ADM-07).

### FR-ADM-09 · Flag or clear "needs info"

**MVP:** Yes · **Label:** [C] (D-13) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (needs info); D-13

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.1 (needs info). The rules and the worked example live only there.
- "Needs info" is offered only on a Pending Confirmation request. It cannot be saved without a message for the customer.
- After flagging, the status stays Pending Confirmation, and the deadline shown on the reservation page does not change **[C]** (D-13).
- The message appears on the status page (FR-PUB-11). Email queued: needs info (FR-NTF-02).
- "Info received" clears the flag.
- Flagging and clearing each write an audit entry (FR-ADM-32).

### FR-ADM-10 · Edit details

**MVP:** Yes · **Label:** [P] · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (edit details); [catalog-and-payments](../02-domain/catalog-and-payments.md) (price snapshot); [business-rules](business-rules.md) BR-03, BR-11

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.2 (edit details). The rules and the worked examples live only there.
- "Edit details" is offered only on Pending Confirmation, Awaiting Deposit, and Confirmed reservations. It cannot be saved without a reason.
- The screen lets the admin change the customer's details, the venue, and the package or add-ons. It does not offer the date, slot, or arrival time; those use reschedule (FR-ADM-17).
- A changed mobile number is accepted only in a BR-11 format.
- If a changed package or add-on is not in stock, the edit is refused with a clear message, and nothing changes (BR-03).
- Email queued: reservation updated (FR-NTF-08). The audit entry names the changed fields, not their values (FR-ADM-32).

### FR-ADM-11 · Record a deposit

**MVP:** Yes · **Label:** [C] (D-05); amount must equal the locked deposit [P] · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (payments ledger, acknowledgments); [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Awaiting Deposit → Confirmed; same-day deposit waiver); [business-rules](business-rules.md) BR-12

**Acceptance criteria**
- The admin enters:
  - the **amount**, prefilled from the locked deposit. It must equal that amount; there are no partial deposits in the MVP **[P]**;
  - the **method**: cash or e-wallet;
  - the **e-wallet reference number**: required for e-wallet, left empty for cash;
  - an optional note.
  The admin who records it and the time are saved automatically.
- Recording the deposit moves an Awaiting Deposit booking to **Confirmed**. The deposit is marked verified, with its time ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- A **Deposit Acknowledgment** with the next ACK number is issued, for example `ACK-2026-0001` ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- Email queued: confirmed (FR-NTF-07).
- *Example.* On Friday 18 December at 11:00 AM, Ana pays ₱1,000 by e-wallet, with reference number `1234567890`. The Admin records it. Her booking becomes Confirmed, and her acknowledgment appears on her status page.
- After a same-day waiver, a deposit can still be recorded on the Confirmed booking. It issues an acknowledgment and does not change the status ([reservation-lifecycle](../02-domain/reservation-lifecycle.md)).
- A reservation has at most one active deposit.
- Recording a deposit after the deadline is refused, unless expiry is paused for proof review (FR-ADM-07, BR-12).
- Payer names and account numbers are never copied from proof screenshots. Only the reference number is saved ([catalog-and-payments](../02-domain/catalog-and-payments.md)).

### FR-ADM-12 · Verify or reject an uploaded proof

**MVP:** Yes · **Label:** [C] (D-05, BR-12); rejection after the deadline [P] · **Relies on:** [business-rules](business-rules.md) BR-12 (main rule); FR-ADM-11

**Acceptance criteria**
- The admin opens the proof image from the "proofs to verify" list or the reservation page. The image opens through a short-lived link.
- **Verify:** the admin records the deposit (FR-ADM-11), and the booking becomes Confirmed. This works even after the original deadline, because expiry was paused.
- **Reject:** a reason is required. The original deadline applies again (BR-12). Email queued: proof not accepted, with the reason (FR-NTF-06).
- Once reviewed, the proof leaves the "proofs to verify" list.
- *Example.* Ana's deposit is due on Friday 18 December at 2:00 PM. She uploads a proof at 1:50 PM. The Admin reviews it at 4:30 PM.
  - If he verifies it, he records the ₱1,000 deposit, and the booking becomes Confirmed.
  - If he rejects it, the 2:00 PM deadline has already passed, so the booking expires at once **[P]**. Ana gets the proof-not-accepted email with the reason (FR-NTF-06) and the expired email (FR-NTF-12).
- The pause never runs past the service start. A proof still unreviewed at the service start lets the booking expire (FR-SYS-01).

### FR-ADM-13 · Same-day deposit waiver

**MVP:** Yes · **Label:** [C] (D-06) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (same-day deposit waiver); D-06

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.4 (same-day deposit waiver). The rules and the worked example live only there.
- The waiver is offered only when lifecycle §6.4 allows it: event date today (Manila date) at the moment the admin acts, on a Pending Confirmation or Awaiting Deposit reservation. Otherwise it is not shown, and a direct attempt is refused.
- It cannot be saved without a reason. Afterwards the reservation shows **Confirmed**, with no deposit in the ledger.
- Email queued: confirmed (FR-NTF-07). The audit entry includes the reason (FR-ADM-32).
- "Record a deposit" is still offered on the Confirmed booking afterwards (FR-ADM-11).

### FR-ADM-14 · Record a balance payment

**MVP:** Yes · **Label:** [C] (D-05) · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (payments ledger, acknowledgments)

**Acceptance criteria**
- Allowed on Confirmed and Completed reservations.
- The amount defaults to the total minus the deposit. The other fields are the same as for a deposit: method, e-wallet reference number (required for e-wallet), and an optional note.
  - *Example.* Ana's total is ₱3,400 and her deposit was ₱1,000, so the balance defaults to ₱2,400.
- A **Balance Payment Acknowledgment** with the next ACK number is issued, and appears on the status page (FR-PUB-14).
- The status does not change.

### FR-ADM-15 · Void a payment

**MVP:** Yes · **Label:** MVP scope (voiding a deposit, spec v0.2 §4); voiding a balance or refund record **[C]** (D-24) · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (voiding); [roles-and-permissions](roles-and-permissions.md) section 2.2

**Acceptance criteria**
- An admin can void a wrongly recorded deposit, balance, or refund record. A reason is required.
- The record stays in the ledger, marked void, with the reason, the admin, and the time.
- Its ACK number is retired and never reused.
  - *Example.* The Admin records ₱1,000 on the wrong reservation, getting `ACK-2026-0007`. He voids it with the reason "recorded on wrong booking". Number 0007 is never used again; the next acknowledgment is `ACK-2026-0008`.
- Voiding does not change the reservation's status. The lifecycle has no transition for it ([reservation-lifecycle](../02-domain/reservation-lifecycle.md)). See question 3 in section 7.

### FR-ADM-16 · Extend a deadline

**MVP:** Yes · **Label:** [C] (D-07) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (extend a deadline)

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.3 (extend a deadline). The rules and the worked example live only there.
- "Extend" is offered only on Pending Confirmation and Awaiting Deposit reservations. It cannot be saved without a reason.
- A new deadline later than the service start is refused with a clear message, and nothing changes.
- An extension of an overdue hold is refused (FR-ADM-07).
- Email queued: deadline extended (FR-NTF-05). The deposit reminder follows the new deadline (FR-NTF-04, FR-NTF-17). The audit entry includes the reason (FR-ADM-32).

### FR-ADM-17 · Reschedule

**MVP:** Yes · **Label:** [C] (D-07); details [P] · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (reschedule); [business-rules](business-rules.md) BR-01 to BR-03, BR-05, BR-06a

Customers cannot reschedule online; they ask the business, and an admin decides case by case **[C]** (D-07, D-08).

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.5 (reschedule). The rules and the worked examples live only there.
- "Reschedule" is offered only on Pending Confirmation, Awaiting Deposit, and Confirmed reservations. The screen lets the admin change the date, the slot, or the arrival time.
- If anything on the new date is not free, the reschedule is refused with a clear message, and the booking stays exactly as it was.
- After a reschedule, the reservation page shows the same reference code and locked prices, and the new deadline and urgent flag from lifecycle §6.5.
- Email queued: rescheduled (FR-NTF-11). The change writes an audit entry (FR-ADM-32).

### FR-ADM-18 · Cancel with a refund decision

**MVP:** Yes · **Label:** [C] (D-07, D-08) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (cancel); [catalog-and-payments](../02-domain/catalog-and-payments.md) (refunds); [business-rules](business-rules.md) BR-04

Customers cannot cancel online; they contact the business, and an admin cancels **[C]** (D-08).

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.6 (cancel and the refund decision). The rules and the worked example live only there.
- "Cancel" is offered only on Pending Confirmation, Awaiting Deposit, and Confirmed reservations. It cannot be saved without a reason.
- When a deposit was paid, it also cannot be saved without a refund decision: none, partial, or full, with the amount **[C]** (D-07).
- Afterwards the date is free again on the calendar (BR-04), and the status page shows the reason and the refund decision (FR-PUB-11).
- Email queued: cancelled, with the refund decision (FR-NTF-10). The audit entry includes the reason (FR-ADM-32).
- Paying the refund is a separate step (FR-ADM-19).

### FR-ADM-19 · Record a refund paid

**MVP:** Yes · **Label:** [C] (D-05) · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (payments ledger); [privacy-and-retention](privacy-and-retention.md) (closure date)

**Acceptance criteria**
- When a refund decided at cancellation is actually paid, an admin records it: amount, method, e-wallet reference number (required for e-wallet), and an optional note. The admin and the time are saved automatically.
- No acknowledgment is issued. Acknowledgments are only for deposit and balance payments ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- Recording a late payment or refund moves the reservation's closure date, so retention counts from it ([privacy-and-retention](privacy-and-retention.md)).
- *Example.* Ben's cancelled booking has the refund decision "partial, ₱500" (lifecycle §6.6). On Wednesday 23 December, he collects his ₱500 at the office. The Admin records a ₱500 cash refund.

### FR-ADM-20 · Mark a Completed event as "not held"

**MVP:** Yes · **Label:** [P] · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (event not held; Completed)

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.7 (event not held). The rules and the worked example live only there.
- "Event not held" is offered only on Completed bookings. It cannot be saved without a reason and a refund decision.
- Afterwards the reservation shows **Cancelled**, with the reason and the refund decision on the status page (FR-PUB-11). The change writes an audit entry (FR-ADM-32).
- Whether it sends an email is not specified (section 7, question 7).

### FR-ADM-21 · Recreate an expired request

**MVP:** Yes · **Label:** [P] · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (recreate expired); [business-rules](business-rules.md) BR-01 to BR-03, BR-07

**Acceptance criteria**
- **Rules:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) §6.9 (recreate an expired request). The rules and the worked example live only there.
- "Recreate" is offered only on Expired reservations.
- If the set, room, or add-on stock is no longer free, it is refused with a clear message, and nothing is created (BR-01 to BR-03).
- On success, a new Pending Confirmation reservation opens with its own reference code. Each reservation page links to the other (FR-ADM-04), and the original still shows Expired.
- The new request is not refused by the online hold limits (BR-07).
- Email queued: request received (FR-NTF-01). The action writes an audit entry (FR-ADM-32).

### FR-ADM-22 · Reissue a QR code (admin)

**MVP:** Yes · **Label:** [P] · **Relies on:** FR-PUB-08

**Acceptance criteria**
- An admin can reissue a reservation's QR code. The old one stops working at once (FR-PUB-09).
- The reference code does not change.
- The reissue is recorded in the audit log.
- How the customer then receives the new QR code is not specified. See question 4 in section 7.

### FR-ADM-23 · Print acknowledgments and booking confirmations

**MVP:** Yes · **Label:** [P] · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md)

**Acceptance criteria**
- From the reservation page, an admin can open and print each payment acknowledgment and the booking confirmation, for example to hand to a customer at the office.
- They are the same documents the customer sees (FR-PUB-14).

### FR-ADM-24 · Staff-created bookings

**MVP:** Yes · **Label:** [C] (D-06) · **Relies on:** [business-rules](business-rules.md) BR-06a (main rule), BR-01 to BR-03, BR-11; [reservation-lifecycle](../02-domain/reservation-lifecycle.md); [catalog-and-payments](../02-domain/catalog-and-payments.md) (price snapshot)

Admins enter bookings that come by phone, walk-in, or Facebook, so every booking uses the same calendar.

**Acceptance criteria**
- The admin picks the source (phone, walk-in, or Facebook) and fills in the same booking and customer fields as the public form (FR-PUB-04, FR-PUB-05). The mobile number is required; the email is optional.
- Capacity is checked exactly as for online requests. A staff-created booking can never double-book a set, the room, or an add-on (BR-01 to BR-03).
- Staff-created bookings skip the notice check, the hold limits, and the breaker. They send no new-request email to the admins. The customer still gets emails if an address was given (BR-06a).
- A booking for today is flagged urgent (BR-06a).
- Prices are locked at creation, as for online requests (D-12).
- **One-step booking.** When the service start has already passed or falls within the notice period, the form finishes in one step: Confirmed with the deposit recorded, or Confirmed with the deposit waived (reason required) (BR-06a).
  - *Example.* On Sunday 20 December 2026 at 6:40 PM, Carla walks in and wants the room at 7:00 PM. That is less than 1 hour away, so the Admin finishes the booking in one step. He records her ₱1,000 cash deposit, and the booking is Confirmed with `ACK-2026-0012`.
- Otherwise the booking is created as Pending Confirmation, and the admin continues with the usual actions.
  - *Example.* On Monday 21 December, Dan phones to book a delivery for Saturday 2 January 2027. The Admin creates it as Pending Confirmation, then approves it.
- The bot checks of the public form (Turnstile, honeypot) do not apply to the admin panel.

### FR-ADM-25 · Blocks

**MVP:** Yes · **Label:** [C] (D-17) · **Relies on:** [business-rules](business-rules.md) BR-08 (main rule), BR-09; [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (block statuses); [roles-and-permissions](roles-and-permissions.md) section 2.5

A block stops a set, the room, or a whole date from being booked.

**Acceptance criteria**
- Admins can block a single delivery set, the room, or a whole date. Who may create each kind is in [roles-and-permissions](roles-and-permissions.md) section 2.5. A reason is required.
- A date range creates one block per date (BR-08).
- A block is refused if a target set or room already has a live claim (a live booking or an active block) on that date ([BR-08](business-rules.md)). The message names the booking or block that conflicts **[P] (new in this doc)**.
- A list shows the active blocks by date.
- Removing a block needs a reason, frees the capacity at once, and is recorded in the audit log.
- The public calendar reflects blocks at once (BR-09).
- *Example.* Set 2 needs repair on Friday 1 January 2027. The Admin blocks set 2 for that date, with the reason "repair". The other sets can still be booked that day.

### FR-ADM-26 · Catalog management

**MVP:** Yes · **Label:** [C] (D-07) · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (catalog structure); [business-rules](business-rules.md) BR-10; D-12

**Acceptance criteria**
- An admin can add and edit packages (name, inclusions, price) and add-ons (name, price, daily stock).
- Items are archived, never deleted. Archived items are no longer offered to customers ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- A price change never changes existing reservations (D-12).
- An edit that conflicts with future live bookings is refused, and the conflicting reservations are listed (BR-10).
  - *Example.* The extra microphone has a daily stock of 4. On Thursday 24 December, 3 are already booked. Lowering the stock to 2 is refused, and the reservations using them on 24 December are listed.
- The public packages page shows the change after the edit (FR-PUB-02).
- Every catalog change is recorded in the audit log, in the "catalog" category.
- Delivery slots are managed in the settings (FR-ADM-28).

### FR-ADM-27 · Delivery sets and the room

**MVP:** Yes · **Label:** [P] · **Relies on:** [catalog-and-payments](../02-domain/catalog-and-payments.md) (resources); [business-rules](business-rules.md) BR-01, BR-10

**Acceptance criteria**
- An admin with the right role ([roles-and-permissions](roles-and-permissions.md) section 2.5) can add, rename, or deactivate a delivery set or the room.
- The delivery pool is simply the active delivery sets. There is no separate "number of sets" setting (BR-01).
- Deactivating a set or the room that has future live bookings is refused, and those bookings are listed (BR-10).
- Every change is recorded in the audit log.

### FR-ADM-28 · Settings

**MVP:** Yes · **Label:** Reserved settings [C] (D-07); other settings [P] · **Relies on:** [roles-and-permissions](roles-and-permissions.md) section 2.6 (who may change each setting); the owning doc of each rule (linked below)

Settings are values that can be changed without changing the code.

**Acceptance criteria**
- The settings area holds these groups:

| Group | Settings | The rule is defined in |
|---|---|---|
| Reserved settings **[C]** | Deposit amount; the 72-hour and 24-hour deadlines; delivery slots (label, start time, end time, active); business info | [catalog-and-payments](../02-domain/catalog-and-payments.md), [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Booking rules **[P]** | Notice period; on-site hours; booking window; hold limits; breaker numbers | [business-rules](business-rules.md) BR-06, BR-07, BR-07a, BR-09 |
| Notifications **[P]** | Reminder lead time; daily and monthly email caps; admin reserve; maximum send attempts | FR-NTF-04, FR-NTF-18, FR-NTF-20 |
| Security **[P]** | Rate-limit thresholds | [non-functional-requirements](non-functional-requirements.md) NFR-11 |
| Privacy **[P]** | Retention periods | [privacy-and-retention](privacy-and-retention.md) |
| Payments **[P]** | Acknowledgment issuer name; deposit instructions (e-wallet name, number, and account name; office address and hours); deposit terms text | [catalog-and-payments](../02-domain/catalog-and-payments.md), [privacy-and-retention](privacy-and-retention.md) (issuer name) |

- The online-booking pause (`online_paused_until`) is not edited by hand. Only the breaker sets it, and only "resume early" clears it (FR-ADM-29).
- Only the roles allowed in [roles-and-permissions](roles-and-permissions.md) section 2.6 can save each setting. Others are refused by the server.
- Every change is recorded in the audit log, in the "settings" category: which setting, who, and when.
- A setting change never changes existing reservations. Their locked prices and deposit, stored service start, and stored deadlines stay as they were.
  - *Example.* On Monday 28 December 2026, the Super Admin raises the deposit from ₱1,000 to ₱1,500. A request sent on Saturday 26 December keeps its ₱1,000 deposit.
- Archiving a delivery slot that live reservations use is refused, and those reservations are listed (BR-10).

### FR-ADM-29 · Resume online booking early

**MVP:** Yes · **Label:** [P] (D-16) · **Relies on:** [business-rules](business-rules.md) BR-07a

**Acceptance criteria**
- While the breaker has paused online booking, the dashboard banner shows a "Resume online booking" button (FR-ADM-02).
- Either admin can press it. The form and calendar accept requests again at once.
- The pause also ends on its own when its time is up (BR-07a).
- The resume is recorded in the audit log.

### FR-ADM-30 · Admin accounts

**MVP:** Yes · **Label:** [C] (D-07); account rules [P] · **Relies on:** [roles-and-permissions](roles-and-permissions.md) section 5 (account rules)

**Acceptance criteria**
- The Super Admin has an accounts screen to create, disable, reset, and sign out admin accounts. The rules (for example, at most one active Admin, and the Super Admin cannot disable itself) are defined only in [roles-and-permissions](roles-and-permissions.md) section 5.
- A reset sets a new password, forces 2FA to be set up again, and ends all of that person's sessions.
- Every account action is recorded in the audit log, in the "account" category.
- The break-glass script for a lost Super Admin 2FA device is a script, not a screen ([roles-and-permissions](roles-and-permissions.md) section 5.2).

### FR-ADM-31 · Legal hold and erasure requests

**MVP:** Yes · **Label:** [P] · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (legal hold, erasure: main rules); FR-SYS-05

**Acceptance criteria**
- Both tools are for the Super Admin only ([roles-and-permissions](roles-and-permissions.md) section 2.7).
- **Legal hold.** The Super Admin can set a legal hold on a reservation, with a reason, and clear it again (whether clearing needs a reason: [privacy-and-retention](privacy-and-retention.md) §5.6). The flag shows on the reservation page. While it is set, the retention job deletes nothing for that reservation (FR-SYS-05).
- **Erasure.** The Super Admin can process a customer's erasure request on a reservation, after checking the requester with the reference code and mobile number ([privacy-and-retention](privacy-and-retention.md)).
  - The contact and venue-detail fields are blanked at once, unless a legal hold applies.
  - The payment ledger is kept.
  - The customer is told what was kept and why.
  - An audit entry is written.

### FR-ADM-32 · Audit log and reservation history

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (how long entries are kept); [roles-and-permissions](roles-and-permissions.md) (both admins may view)

**Acceptance criteria**
- Both admins can view the audit log.
- Each entry shows: the time (Manila time), the category (security, booking, catalog, settings, or account), what it is about (for example, a reservation and its reference code), the actor kind (admin, system, or customer) and the admin's name if an admin acted, the action, the names of the fields changed, and the reason.
- Entries are only added. Nobody can edit or delete them in the app. Old entries are removed only by the retention job ([privacy-and-retention](privacy-and-retention.md)).
- The audit log never stores customer contact data.
- A reservation's history (FR-ADM-04) is its list of audit entries.
  - *Example.* Ben's history shows "Tue 22 Dec 2026, 3:14 PM · Admin · Cancel · reason: family emergency · refund decision recorded".
- The log can be filtered by category and date **[P] (new in this doc)**.

### FR-ADM-33 · Health panel

**MVP:** Yes · **Label:** MVP scope · **Relies on:** FR-SYS-10; FR-NTF-18; FR-NTF-20; [non-functional-requirements](non-functional-requirements.md) (NFR-26)

The health panel shows whether the system is working.

**Acceptance criteria**
- Both admins can open the health panel.
- It shows:
  - the last run of the expiry job, the retention job, and the email-sending job, each with its result;
  - failed emails;
  - the email queue;
  - email cap usage today and this month, with a warning when emails are held until the next day (FR-NTF-20);
  - storage use.
- *Example.* If the every-minute job stopped 20 minutes ago, the panel shows its last run as 20 minutes ago.

---

## 4. Notifications (FR-NTF)

In the MVP, the system sends automatic emails **[C]** (D-10). Messenger comes later (section 6).

- **Customer emails** go out only if the customer gave an email address.
- **Admin emails** go to both admins.
- **The status page is always the source of truth.** An email that is late or missing never changes a booking.

### 4.1 Customer emails (FR-NTF-01 to FR-NTF-12)

Spec v0.2 labels the customer emails **[C]**, and the extra types **[P]**. In the "Must contain" column, *italic text* is **[P] (new in this doc)**; the rest comes from spec v0.2 §7 and §9.

| ID | Email | Sent when | Must contain | Label |
|---|---|---|---|---|
| FR-NTF-01 | Request received | A request is created online (FR-PUB-06), by an admin (FR-ADM-24), or by "recreate expired" (FR-ADM-21) | Reference code, QR link, and a clear "not yet confirmed" | [C] |
| FR-NTF-02 | Needs info | An admin flags the request "needs info" (FR-ADM-09) | The admin's message | [C] |
| FR-NTF-03 | Approved | An admin approves the request (FR-ADM-08) | Deposit instructions (from the settings) and the deposit deadline | [C] |
| FR-NTF-04 | Deposit reminder | 6 hours before the deposit deadline (the lead time is a setting) | *The deadline and the deposit instructions* | [C] (D-10) |
| FR-NTF-05 | Deadline extended | An admin extends the deadline (FR-ADM-16) | The new deadline | [P] |
| FR-NTF-06 | Proof not accepted | An admin rejects an uploaded proof (FR-ADM-12) | The reason | [P] |
| FR-NTF-07 | Confirmed | The booking becomes Confirmed: deposit recorded (FR-ADM-11) or deposit waived (FR-ADM-13) | Links to the acknowledgment *(when a payment was recorded)* and the booking confirmation | [C] |
| FR-NTF-08 | Reservation updated | An admin edits the details (FR-ADM-10) | *The updated booking details* | [P] |
| FR-NTF-09 | Rejected | An admin rejects the request (FR-ADM-08) | The reason | [C] |
| FR-NTF-10 | Cancelled | An admin cancels the booking (FR-ADM-18) | *The reason and* the refund decision | [C] |
| FR-NTF-11 | Rescheduled | An admin reschedules the booking (FR-ADM-17) | *The new date, slot or arrival time, and deadline* | [C] |
| FR-NTF-12 | Expired | The booking expires (FR-SYS-01, or at once after a late proof rejection, FR-ADM-12) | *That the booking expired, and how to contact the business* | [C] |

**MVP:** Yes, for every row. **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (which transition queues which email), [catalog-and-payments](../02-domain/catalog-and-payments.md) (deposit instructions, documents), FR-NTF-16 to FR-NTF-20 (how emails are sent).

**Acceptance criteria for every customer email**
- It is sent only if the reservation has an email address. Without one, nothing is sent and nothing fails (FR-NTF-21).
- It shows the reference code **[P] (new in this doc)**.
- Dates and times are in Manila time, and amounts in pesos.
- It never includes internal notes or other customers' data.
- It is saved in the outbox together with the change that causes it (FR-NTF-16).

**Extra acceptance criteria for the deposit reminder (FR-NTF-04)**
- The reminder time is worked out from the **current** deadline at send time.
  - *Example.* Ana's deposit is due on Friday 18 December at 2:00 PM, so her reminder goes out at 8:00 AM that day.
- It is not sent if that moment had already passed when the request was approved.
  - *Example.* A same-day request for a 7:00 PM arrival is approved on Saturday 19 December at 5:40 PM. Its deadline is the 7:00 PM service start. The reminder moment (1:00 PM) had already passed, so no reminder is sent.
- If the deadline is extended, the reminder follows the new deadline (FR-NTF-17).
- If the booking is already Confirmed, Cancelled, or Expired at send time, the reminder is skipped (FR-NTF-19).

### 4.2 Admin emails (FR-NTF-13 to FR-NTF-15)

In the "Must contain" column, *italic text* is **[P] (new in this doc)**.

| ID | Email | Sent when | Must contain | Label |
|---|---|---|---|---|
| FR-NTF-13 | New online request | A customer submits a request on the website (FR-PUB-06). Not sent for staff-created bookings (BR-06a). | *The reference code and booking summary;* urgent requests clearly marked | [C] (D-10) |
| FR-NTF-14 | Proof uploaded | A customer uploads a proof (FR-PUB-12) | *The reference code and the deadline that is paused* | [P] |
| FR-NTF-15 | Online booking paused | The breaker pauses online booking (BR-07a) | *When the pause ends, and that either admin can resume early* | [P] |

**MVP:** Yes, for every row. **Relies on:** [business-rules](business-rules.md) BR-06a, BR-07a, BR-12; FR-ADM-02.

**Acceptance criteria**
- Each admin email goes to both admins.
- Each one also appears on the dashboard (FR-ADM-02).
- The breaker sends exactly one email per pause (BR-07a).

### 4.3 How emails are sent (FR-NTF-16 to FR-NTF-20)

These requirements are mainly for the developer. In short: no email is lost, none is sent twice, and a problem with email never undoes a booking change.

#### FR-NTF-16 · Outbox: emails saved with the change

**MVP:** Yes · **Label:** [P] · **Relies on:** FR-ADM-07; FR-SYS-03

**Acceptance criteria**
- Each email is saved in the outbox (`notifications_outbox`) in the same database transaction as the change that causes it. If the change fails, no email is saved; if the change succeeds, the email is saved.
- The app tries to send it right after it answers the user. The every-minute job sends anything still waiting (FR-SYS-03).
- *Example.* The Admin approves Ana's request while the email service is down. The approval is saved, and Ana's status page shows Awaiting Deposit at once. The approved email goes out when the service is back.

#### FR-NTF-17 · No duplicate emails

**MVP:** Yes · **Label:** [P]

**Acceptance criteria**
- Each email has a unique key: reservation + email type + the audit entry that caused it.
- For deposit reminders, the key is reservation + "reminder" + deadline. So an extended deadline gets its own reminder, and one deadline never gets two.
- If the same email is queued twice, or a send is retried (for example, after a network error), the customer still receives it only once.

#### FR-NTF-18 · Retries and failed emails

**MVP:** Yes · **Label:** [P] · **Relies on:** FR-ADM-33

**Acceptance criteria**
- Temporary errors (network errors, "too many requests" (429), and server errors (5xx)) are retried with growing waits, up to a maximum number of attempts (a setting).
- After the last attempt, the email is marked **failed** and shown on the health panel (FR-ADM-33).
- Other errors (4xx) fail at once, without retries.
- The booking change stands in every case.

#### FR-NTF-19 · Stale emails are skipped

**MVP:** Yes · **Label:** [P]

**Acceptance criteria**
- At send time, an email is skipped if the reason for it no longer holds. It is marked **skipped**, not failed.
  - *Example.* Ana's reminder is due at 8:00 AM on Friday 18 December, but she paid at 7:30 AM and the Admin confirmed her booking. The reminder is skipped.

#### FR-NTF-20 · Email caps and priority

**MVP:** Yes · **Label:** [P]; default caps [U] · **Relies on:** [non-functional-requirements](non-functional-requirements.md) (NFR-33); FR-ADM-33

The free email plan limits how many emails can be sent.

**Acceptance criteria**
- The daily and monthly caps are settings. The defaults are 100 a day and 3,000 a month **[U]**.
- Customer emails go first. Once the daily count reaches the admin reserve (default 90), admin emails wait, so the rest of the day's cap stays free for customers.
- Emails left over when a cap is reached go out the next day, and the health panel shows a warning (FR-ADM-33).
- Admin alerts that wait still appear on the dashboard at once (FR-ADM-02).
- *Example.* On a very busy Saturday, 90 emails have gone out by 8:00 PM. A new online request arrives. Its customer email is sent, but the admin email waits until the next day. The request still shows on the dashboard at once.

### 4.4 Customers without email (FR-NTF-21)

#### FR-NTF-21 · Customers without email

**MVP:** Yes · **Label:** MVP scope · **Relies on:** FR-PUB-11; FR-ADM-04

**Acceptance criteria**
- A customer without an email address can book and follow the booking fully through the status page (FR-PUB-11).
- On the reservation page, the admin panel shows a prepared message that staff can copy into SMS or Messenger and send themselves.
- The prepared message carries the same information the email would have carried **[P] (new in this doc)**.
  - *Example.* Ben gave no email. After approving his request, the Admin copies the prepared message, with the deposit instructions and deadline, and sends it to Ben on Messenger.

---

## 5. Scheduled jobs and system functions (FR-SYS)

**In short, for the Admin:** some work happens on its own, on a timer. Every minute, the system ends holds whose time is up and sends waiting emails. Every night, it marks finished events Completed, removes old personal data on schedule, and makes an encrypted backup. Nobody has to press a button. The health panel (FR-ADM-33) shows that these jobs are running.

| When | Job | Runs on | ID |
|---|---|---|---|
| Every minute | Expire overdue holds (not paused) | Supabase Cron (SQL) | FR-SYS-01 |
| Every minute | Queue deposit reminders that are due | Supabase Cron (SQL) | FR-SYS-02 |
| Every minute, when emails are waiting | Call `/api/jobs/tick` to send or retry emails | Supabase Cron → Vercel | FR-SYS-03 |
| Daily, 00:15 Manila | Mark finished events Completed | Supabase Cron (SQL) | FR-SYS-04 |
| Daily, 00:15 Manila | Retention job | Supabase Cron (SQL) | FR-SYS-05 |
| Daily, 00:15 Manila | Rotate the IP key | Supabase Cron (SQL) | FR-SYS-06 |
| Daily, 00:15 Manila | Keep-alive query | Supabase Cron (SQL) | FR-SYS-07 |
| Daily | Backup sweep: `/api/jobs/daily` | Vercel Cron | FR-SYS-08 |
| Nightly | Encrypted database backup | GitHub Actions (private repository) | FR-SYS-12 |

*For the developer:* the daily jobs run at 00:15 Manila time (`15 16 * * *` in UTC) and work out "today" with `now() AT TIME ZONE 'Asia/Manila'` (spec v0.2 §12). The monthly offline backup copy is a task for a person, not a job ([non-functional-requirements](non-functional-requirements.md) NFR-28).

### FR-SYS-01 · Expire overdue holds (every minute)

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Pending Confirmation → Expired; Awaiting Deposit → Expired); [business-rules](business-rules.md) BR-05, BR-12

**Acceptance criteria**
- Every minute, holds whose deadline has passed and whose expiry is not paused are marked **Expired**, and their capacity is released.
- A hold whose expiry is paused for proof review is marked Expired when its service start arrives without a review (BR-12).
- Each expiry queues the expired email (FR-NTF-12) and writes an audit entry with the actor "system".
- The job only tidies up. An overdue hold already counts as expired everywhere before the job runs (BR-05; FR-ADM-07).
- *Example.* Eva's deposit was due on Tuesday 22 December at 10:00 AM, and nothing was recorded. Within a minute, her booking is marked Expired, and the set is free for others.

### FR-SYS-02 · Queue due deposit reminders (every minute)

**MVP:** Yes · **Label:** [C] (D-10) · **Relies on:** FR-NTF-04, FR-NTF-17, FR-NTF-19

**Acceptance criteria**
- Every minute, the job queues each deposit reminder whose time has come, following the rules in FR-NTF-04.
- A reminder is never queued twice for the same deadline (FR-NTF-17).

### FR-SYS-03 · Send queued emails (every minute)

**MVP:** Yes · **Label:** MVP scope · **Relies on:** FR-NTF-16 to FR-NTF-20; FR-SYS-09

**Acceptance criteria**
- When emails are waiting in the outbox, the database calls `/api/jobs/tick` (through `pg_net`) every minute, which sends or retries them.
- Sending follows FR-NTF-16 to FR-NTF-20: no duplicates, retries, skips, and caps.

### FR-SYS-04 · Mark finished events Completed (daily)

**MVP:** Yes · **Label:** [C] (D-15) · **Relies on:** [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (Confirmed → Completed)

**Acceptance criteria**
- At 00:15 Manila time each day, every **Confirmed** booking whose event date is before today becomes **Completed**.
- The job changes nothing else. A Pending Confirmation or Awaiting Deposit reservation is left alone.
- Its QR code stops working (FR-PUB-08).
- *Example.* Ana's Confirmed booking for Thursday 24 December becomes Completed at 00:15 on Friday 25 December.
- A wrong Completed is corrected with "event not held" (FR-ADM-20).

### FR-SYS-05 · Retention job (daily)

**MVP:** Yes · **Label:** Retention defaults [C] (D-21) · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (retention schedule, closure date, ledger end, legal hold: main rules)

**Acceptance criteria**
- Every day, the job applies the retention schedule in [privacy-and-retention](privacy-and-retention.md): it blanks, reduces, or deletes each kind of data when its period ends. This includes payment-proof images, duplicate-submission keys, and rate-limit counters.
- It skips every reservation under legal hold (FR-ADM-31).
- It writes a run log with counts only, never personal data.
- The developer can also start it by hand. After any restore from a backup, it runs before the system reopens (spec v0.2 §15).
- The retention periods are settings (FR-ADM-28).

### FR-SYS-06 · Rotate the IP key (daily)

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [privacy-and-retention](privacy-and-retention.md) (rate-limit counters); [non-functional-requirements](non-functional-requirements.md) (NFR-11, NFR-13)

**Acceptance criteria**
- Rate limits count visitors by a scrambled form of their internet address (an HMAC), never the address itself.
- Every day, the key used for this is replaced, and old keys are destroyed.

### FR-SYS-07 · Keep-alive (daily)

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [non-functional-requirements](non-functional-requirements.md) (NFR-07)

**Acceptance criteria**
- Every day, a small database query runs, so the free Supabase project is not paused for low activity.

### FR-SYS-08 · Backup sweep on Vercel (daily)

**MVP:** Yes · **Label:** MVP scope · **Relies on:** FR-SYS-01, FR-SYS-03, FR-SYS-10

A second, independent daily run, in case the database timer fails.

**Acceptance criteria**
- Once a day, Vercel Cron calls `/api/jobs/daily`. It repeats the expiry sweep (FR-SYS-01) and the outbox flush (FR-SYS-03).
- It checks the job run records (FR-SYS-10) to confirm that the every-minute jobs are still running.
- *For the developer:* the Vercel Hobby plan runs cron only once a day, so this is a backup, not the main timer.

### FR-SYS-09 · Protected job routes

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [non-functional-requirements](non-functional-requirements.md) (NFR-10, NFR-13); security doc (planned: `05-technical/security.md`)

**Acceptance criteria**
- `/api/jobs/tick` and `/api/jobs/daily` run only when called with the correct secret (a bearer token). Without it, or with a wrong one, they refuse and do nothing.
- The secret is stored in Supabase Vault and as a Vercel environment variable, and is compared in constant time.
- The job routes are left out of the login redirects in `proxy.ts`.
- Two runs of the same job never overlap. A second run waits or stops (advisory lock).

### FR-SYS-10 · Job run records and heartbeat

**MVP:** Yes · **Label:** MVP scope · **Relies on:** FR-ADM-33; [non-functional-requirements](non-functional-requirements.md) (NFR-24)

**Acceptance criteria**
- Every job run writes a record: job name, start, finish, result, and counts (`job_runs`).
- The health panel reads these records (FR-ADM-33).
- If the records stop, an alert is sent: the "heartbeat" check ([non-functional-requirements](non-functional-requirements.md) NFR-24).

### FR-SYS-11 · Health check address

**MVP:** Yes · **Label:** MVP scope · **Relies on:** [non-functional-requirements](non-functional-requirements.md) (NFR-04)

**Acceptance criteria**
- `/api/health` answers with the hosting region and the result of a cheap database query.
- It returns no personal data.
- The uptime check uses it ([non-functional-requirements](non-functional-requirements.md) NFR-04).

### FR-SYS-12 · Nightly encrypted backup

**MVP:** Yes · **Label:** MVP scope; private repository [C] (D-22) · **Relies on:** [non-functional-requirements](non-functional-requirements.md) (NFR-27 to NFR-29: how long copies are kept, the monthly offline copy, restore tests); [privacy-and-retention](privacy-and-retention.md) (backups); D-22, O-06

**Acceptance criteria**
- Every night, a GitHub Actions job copies the database and encrypts the copy.
- The job runs only in the **private** repository. The repository is made private before this job is added **[C]** (D-22, O-06).
- The encrypted copy is stored as a workflow artifact that expires on its own. It is never committed to the repository.
- Payment-proof images are not backed up, by design ([privacy-and-retention](privacy-and-retention.md)).
- *For the developer:* the dump runs through the session pooler with a separate read-only database role, and is encrypted with `age` to a public key (spec v0.2 §15). How long copies are kept and how restores are tested is in [non-functional-requirements](non-functional-requirements.md) (NFR-27 to NFR-29). The step-by-step runbook will be in the operations docs (planned: `07-operations/deployment-and-operations.md`).

---

## 6. Later, and out of scope

**Later, after the MVP.** These have no FR-IDs yet. Each one gets its FR-IDs when it is brought into scope through the [decision log](../00-project/decision-log.md). The list is kept in the [project charter](../00-project/project-charter.md) section 4.2:
- Messenger notifications, automated, for customers who opt in **[C]** (D-10). They will be researched again before they are built **[U]**.
- SMS notifications.
- An online payment gateway.
- Revenue reports, CSV export, and charts.
- A promotions manager, a gallery, and reviews.
- Multiple branches.

**Out of scope by confirmed decision [C].** See the [project charter](../00-project/project-charter.md) section 4.3:
- Customer accounts (D-08).
- Customers cancelling on their own (D-08). An admin cancels (FR-ADM-18).
- Customers rescheduling on their own (D-08). An admin reschedules (FR-ADM-17).

---

## 7. Questions found while writing this document

Spec v0.2 does not answer these. They are not decided here. If the reviewers agree they need an answer, add each one to the [decision log](../00-project/decision-log.md) as a new open item (O-12 onwards), then update the requirement named.

1. **One-step staff bookings and emails.** When a staff-created booking is created as Confirmed in one step (FR-ADM-24), does the customer get the request-received email (FR-NTF-01), the confirmed email (FR-NTF-07), or both?
2. **Paused expiry.** While expiry is paused for proof review, is the deposit reminder (FR-NTF-04) still sent? And what does the status page show as the deadline (FR-PUB-11)?
3. **Voided deposit on a Confirmed booking.** After a wrongly recorded deposit is voided on a Confirmed booking (FR-ADM-15), can the correct deposit be recorded on the Confirmed booking, as it can after a waiver (FR-ADM-11)?
4. **QR reissued by an admin.** How does the customer receive the new QR code after an admin reissues it (FR-ADM-22)?
5. **Document links in emails.** The Confirmed email links to the acknowledgment and the booking confirmation (FR-NTF-07). How are those links protected, given that the status page needs the reference code and mobile number? This belongs in the security doc (planned: `05-technical/security.md`).
6. **Venue details.** For delivery, are the street and landmarks required, or optional (FR-PUB-05)?
7. **"Event not held" and email.** Does marking a Completed event "not held" (FR-ADM-20) send the cancelled email (FR-NTF-10)?

---

## 8. Changing a requirement

- **A change to a decision** (for example, adding SMS) starts in the [decision log](../00-project/decision-log.md): update the log first, then this document and every other document the decision lists under "Docs affected".
- **A new requirement** gets the next free number in its group, for example FR-ADM-34. Numbers are never reused or renumbered.
- **A dropped requirement** stays in this document, marked "Withdrawn", with the date and the decision ID.
- **A detail marked "[P] (new in this doc)"** becomes plain text once the review confirms it, or is corrected.
- **The frozen spec is never edited** (D-23).
