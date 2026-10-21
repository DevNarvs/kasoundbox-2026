# Roles and Permissions

> **Purpose:** Who uses the DJB Kasoundbox system, and exactly what each role may do. This is the only place where permissions are defined. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); written for readers without a technical background, except section 7, which is mainly for the developer ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](../00-project/decision-log.md) (D-07, D-08, D-17), [Glossary](../00-project/glossary.md), [Business rules](business-rules.md), [Reservation lifecycle](../02-domain/reservation-lifecycle.md), [Catalog and payments](../02-domain/catalog-and-payments.md), [Functional requirements](functional-requirements.md), [Privacy and retention](privacy-and-retention.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §4 (main source), with §3, §5, §7, §8, §9, §10, §11, §13, §14, §16, §18

**How to read this document.**

- Labels: **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact · **[O-nn]** open item, listed in the [decision log](../00-project/decision-log.md). *No label* in a label column means the row is part of the approved permission matrix (spec v0.2 §4) but has no label of its own.
- In the permission tables, **✓** means "allowed" and **—** means "not allowed".
- **Reason required** means the action cannot be saved without a short written reason. The reason is kept in the reservation's history (the [audit log](../00-project/glossary.md)).
- **Either admin** means the Super Admin or the Admin. **Staff** means the people who run the business; in the system they always act through one of the two admin accounts.
- Every date and time is Manila time. Peso amounts in the examples are made up; the real deposit amount and prices are still open (O-03).
- This document says *who* may do an action. *What the action does* (its rules, effects, and emails) is in the document named in the "Rule details" column.

**One source for permissions.** Other documents say "either admin" or "Super Admin only" in one line and link here. If another document seems to disagree with the tables below, these tables win, and the other document is corrected. If an action is missing from these tables, treat that as a gap: add it here through the [decision log](../00-project/decision-log.md) before it is built.

---

## 1. Roles and who holds them

There are two admin accounts, one person each **[C]** (D-07). Customers have no accounts **[C]** (D-08).

| Role | Held by | Account | In short |
|---|---|---|---|
| **Super Admin** | The developer (the business owner's son) | One admin account, with two-factor login | Can do everything the Admin can do. Also manages the admin accounts, the business-wide settings, whole-date blocks, the delivery sets and the room, and the privacy tools. Builds and maintains the system. |
| **Admin** | The business owner (the developer's father) | One admin account, with two-factor login | Runs daily reservations: reviews requests, records payments, enters phone, walk-in, and Facebook bookings, keeps the catalog up to date, and blocks a set or the room. |
| **Customer** | Anyone who books or browses | None. Customers never log in. | Uses the public website. Looks up a booking with the reference code and the full mobile number (section 3). |
| **The system** | Nobody. It is not a person and has no login. | None | Makes some changes on a schedule, such as expiring overdue holds (section 4). |

Two more points:

- **No other logins.** There is no separate "staff" account, and there is no public sign-up. Claude, the lawyer, the CPA, and the service providers have no account in the admin panel.
- **Privacy officer.** One of the two admins will be named in writing as the privacy officer (DPO, data protection officer). This is a legal duty, not a role in the system. Who it will be is still open (O-09). See [privacy-and-retention](privacy-and-retention.md).

*Example.* On Saturday 19 December 2026, a customer phones to book the room for that evening. The Admin enters it as a staff-created booking from his own account. He does not need the Super Admin for this.

## 2. Permission matrix

This is the full matrix. It extends the confirmed role split in D-07 and D-17 with the permissions the spec marks **[P]**.

### 2.1 Looking up and reviewing reservations

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| View, search, and open reservations, with their details, internal notes, and history | ✓ | ✓ | No label | [functional-requirements](functional-requirements.md) (FR-ADM-03, FR-ADM-04) |
| Scan a customer's QR code to open the reservation | ✓ | ✓ | No label | [functional-requirements](functional-requirements.md) (FR-ADM-06); where the QR is used: D-09 |
| View the audit log and the health panel | ✓ | ✓ | No label | [functional-requirements](functional-requirements.md) (FR-ADM-32, FR-ADM-33) |
| Approve a Pending Confirmation request | ✓ | ✓ | [C] D-07 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Reject a Pending Confirmation request (reason required) | ✓ | ✓ | [C] D-07 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Flag "needs info" (with a message for the customer), or clear it with "Info received" | ✓ | ✓ | [C] D-13 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) |
| Add internal notes | ✓ | ✓ | No label | [functional-requirements](functional-requirements.md) (FR-ADM-05) |
| Edit details, such as a wrong mobile number or a changed add-on (reason required) | ✓ | ✓ | [P] | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (edit details) |

### 2.2 Money

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Record a deposit | ✓ | ✓ | [C] D-05, D-07 | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Void a wrongly recorded deposit (reason required) | ✓ | ✓ | No label | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Void a wrongly recorded balance or refund record (reason required) ¹ | ✓ | ✓ | [P] (new in this doc) | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Verify or reject a deposit proof the customer uploaded (rejection needs a reason) | ✓ | ✓ | [C] D-05 | [business-rules](business-rules.md) (BR-12) |
| Record a balance payment | ✓ | ✓ | [C] D-05 | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Record a refund paid | ✓ | ✓ | [C] D-05, D-07 | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Waive the deposit for a same-day booking (reason required) | ✓ | ✓ | [C] D-06 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (same-day deposit waiver) |
| Open and print payment acknowledgments and booking confirmations at the office | ✓ | ✓ | [P] | [catalog-and-payments](../02-domain/catalog-and-payments.md) |

¹ The spec's matrix (spec v0.2 §4) names only "void a deposit". This row is inferred from the payments ledger and the edge cases (spec v0.2 §8 and §16), which apply voiding to any wrongly recorded payment, and from both admins being allowed to record every kind of payment. It is **[P] (new in this doc)**: not yet approved, so please confirm or correct it in this review. If it needs a wider discussion, raise it as open item O-12 in the [decision log](../00-project/decision-log.md).

*Example.* Ben paid a ₱1,000 deposit for Sunday 27 December 2026. On 22 December he calls to cancel. Either admin cancels the booking, gives the reason, and records the refund decision, for example "partial, ₱500" (section 2.3). On 23 December, Ben collects the ₱500 at the office, and either admin records the refund paid.

### 2.3 Bookings and changes

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Create a booking for a phone, walk-in, or Facebook customer | ✓ | ✓ | [C] D-06 | [business-rules](business-rules.md) (BR-06a), [functional-requirements](functional-requirements.md) (FR-ADM-24) |
| Reschedule a booking, case by case | ✓ | ✓ | [C] D-07 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (reschedule) |
| Extend a deadline (reason required) | ✓ | ✓ | [C] D-07 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (extend a deadline) |
| Cancel a booking (reason required), with a refund decision when a deposit was paid, case by case | ✓ | ✓ | [C] D-07 | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (cancel), [catalog-and-payments](../02-domain/catalog-and-payments.md) (refunds) |
| Mark a Completed event as "not held" (reason and refund decision required) | ✓ | ✓ | [P] | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (event not held) |
| Recreate an expired request | ✓ | ✓ | [P] | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (recreate expired) |
| Reissue a customer's QR code (the old one stops working) | ✓ | ✓ | [P] | [functional-requirements](functional-requirements.md) (FR-ADM-22) |

### 2.4 Online booking

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Resume online booking early, after the breaker has paused it | ✓ | ✓ | [P] D-16 | [business-rules](business-rules.md) (BR-07a) |

### 2.5 Catalog, blocks, and resources

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Manage packages, add-ons, prices, and daily stock (add, change, archive) | ✓ | ✓ | [C] D-07 | [catalog-and-payments](../02-domain/catalog-and-payments.md); refused edits: [business-rules](business-rules.md) (BR-10) |
| Block or unblock a single delivery set or the room (with a reason) | ✓ | ✓ | [C] D-17 | [business-rules](business-rules.md) (BR-08) |
| Block or unblock a whole date (with a reason) | ✓ | — | [C] D-17 | [business-rules](business-rules.md) (BR-08) |
| Add, rename, or deactivate delivery sets and the room | ✓ | — | [P] | [catalog-and-payments](../02-domain/catalog-and-payments.md) (resources); refused changes: [business-rules](business-rules.md) (BR-10) |

*Example.* Set 2 needs repair on Friday 1 January 2027. The Admin blocks set 2 for that date; the other sets can still be booked. If the family decides to close the whole business that day, only the Super Admin can block the whole date. When a block is refused because a booking already holds that set or date, see [business-rules](business-rules.md) (BR-08).

### 2.6 Settings

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Change the **reserved settings**: deposit amount, deadlines (72 hours to review, 24 hours to pay the deposit), delivery slots, business info | ✓ | — | [C] D-07 | Deadlines: [reservation-lifecycle](../02-domain/reservation-lifecycle.md); deposit and slots: [catalog-and-payments](../02-domain/catalog-and-payments.md); settings screens: [functional-requirements](functional-requirements.md) (FR-ADM-28) |
| Change the **other settings**: notice period, on-site hours, booking window, hold limits and breaker, reminder lead time, email caps (including the admin reserve), maximum email send attempts ², rate-limit thresholds, retention periods, issuer name, deposit instructions, deposit terms text | ✓ | — | [P] | [functional-requirements](functional-requirements.md) (FR-ADM-28); each rule in its owning doc: [business-rules](business-rules.md), [functional-requirements](functional-requirements.md) (FR-NTF-04, FR-NTF-18, FR-NTF-20), [non-functional-requirements](non-functional-requirements.md) (NFR-11), [privacy-and-retention](privacy-and-retention.md), [catalog-and-payments](../02-domain/catalog-and-payments.md) |

² Spec v0.2 §11 lists the maximum number of send attempts as a notification setting, but the §4 matrix does not name it. It is treated as one of the other settings: Super Admin only **[P]**.

The one exception: either admin may end a breaker pause early (section 2.4).

### 2.7 Privacy and admin accounts

| Action | Super Admin | Admin | Label | Rule details in |
|---|---|---|---|---|
| Set a legal hold on a reservation (with a reason), or clear it ³ | ✓ | — | [P] | [privacy-and-retention](privacy-and-retention.md) (legal hold) |
| Process a customer's erasure request | ✓ | — | [P] | [privacy-and-retention](privacy-and-retention.md) (erasure) |
| Manage admin accounts: create, disable, reset, sign out | ✓ | — | [C] D-07 | Section 5 of this document |

³ Spec v0.2 §14 requires a reason to set a legal hold. A reason to clear it is **[P] (new in [privacy-and-retention](privacy-and-retention.md) §5.6)**, to be confirmed in review.

### 2.8 Summary for the Admin

As the Admin, you can do all the daily work: review and approve requests, record every payment, enter phone, walk-in, and Facebook bookings, reschedule, cancel, extend deadlines, keep the catalog and prices up to date, and block a set or the room.

Ask the Super Admin when you need to:

- block a whole date;
- change the deposit amount, a deadline, a delivery slot, the business info, or any other setting;
- add, rename, or deactivate a delivery set or the room;
- set or clear a legal hold, or handle a customer's request to erase their data;
- create, disable, or reset an admin account.

## 3. Customers

Customers have no accounts and never log in **[C]** (D-08). They use the public website, usually on a phone.

### 3.1 What a customer can do

| Customer can… | How | Rule details in |
|---|---|---|
| Browse packages and add-ons, and see which dates are Available or Full | Public pages; no login | [business-rules](business-rules.md) (BR-09), [functional-requirements](functional-requirements.md) (FR-PUB-02, FR-PUB-03) |
| Send a reservation request | The form asks for a mobile number (required) and an email address (optional) **[C]** | [functional-requirements](functional-requirements.md) (FR-PUB-04 to FR-PUB-06); limits on open requests: [business-rules](business-rules.md) (BR-07); accepted mobile number formats: BR-11 |
| Check the status of a booking | Enter the reference code and the **full** mobile number **[C]** | [functional-requirements](functional-requirements.md) (FR-PUB-10, FR-PUB-11) |
| Upload a deposit proof image | On the status page, while the booking is Awaiting Deposit | [business-rules](business-rules.md) (BR-12), [functional-requirements](functional-requirements.md) (FR-PUB-12) |
| Open the payment acknowledgments and the booking confirmation | Links on the status page and in the Confirmed email | [catalog-and-payments](../02-domain/catalog-and-payments.md) |
| Get a new QR code (the old one stops working) | On the status page, after entering the reference code and mobile number **[P]** | [functional-requirements](functional-requirements.md) (FR-PUB-13) |
| Show the QR code at the office or when paying; quote the reference code when messaging or calling | The QR code is not used on event day **[C]** (D-09) | [functional-requirements](functional-requirements.md) (FR-PUB-07, FR-ADM-06) |
| Ask for their personal data to be erased, or use their other privacy rights | Contact the business's privacy contact (O-09); the request is checked with the reference code and mobile number | [privacy-and-retention](privacy-and-retention.md) |

### 3.2 What a customer cannot do

The customer contacts the business instead, and an admin acts:

- **Cancel** a booking **[C]** (D-08). An admin cancels and decides any refund (section 2.3).
- **Reschedule** a booking **[C]** (D-08). An admin reschedules, case by case.
- **Change their details**, such as a wrong mobile number. An admin uses "edit details" (section 2.1).
- **Confirm their own booking.** Only an admin action makes a booking Confirmed. A reference code or a QR code never means the booking is approved or paid.

*Example.* Ana booked a delivery for Thursday 24 December 2026, reference `KSB-7Q2M-K9TX`. She now wants Saturday 26 December instead. The website has no button for this. She messages the business and quotes her reference code. Either admin reschedules the booking if a set is free on 26 December.

## 4. Automatic actions by the system

Some changes happen on a schedule, with no person involved. They are not a role and need no login. The audit log records them with the actor "system", so the history still shows what happened and when.

| What the system does on its own | Rule details in |
|---|---|
| Treats an overdue hold as expired, and marks it Expired | [reservation-lifecycle](../02-domain/reservation-lifecycle.md), [business-rules](business-rules.md) (BR-05), [functional-requirements](functional-requirements.md) (FR-SYS-01) |
| Marks a Confirmed booking Completed the day after the event (D-15) | [reservation-lifecycle](../02-domain/reservation-lifecycle.md), [functional-requirements](functional-requirements.md) (FR-SYS-04) |
| Pauses online booking when the breaker trips | [business-rules](business-rules.md) (BR-07a) |
| Sends queued emails and deposit reminders | [functional-requirements](functional-requirements.md) (FR-SYS-02, FR-SYS-03) |
| Runs the daily retention job, which deletes or blanks old data | [privacy-and-retention](privacy-and-retention.md), [functional-requirements](functional-requirements.md) (FR-SYS-05) |

These scheduled tasks are started by the system itself using a secret password, not by an admin logging in (developer detail: job routes, [functional-requirements](functional-requirements.md) FR-SYS-09).

Both admins receive the admin alert emails, for example one for every new online request **[C]** (D-10). The full list is in [functional-requirements](functional-requirements.md) (FR-NTF-13 to FR-NTF-15).

## 5. Account rules

These rules are **[P]** unless marked otherwise. They come from spec v0.2 §4 and §13.

### 5.1 The two accounts

- **Two accounts at most.** There is at most one Super Admin and one active Admin. The two roles are **[C]** (D-07); the limits in this section are **[P]**. There is no public sign-up. The first accounts are created by a setup script. After that, only the Super Admin can create an Admin account (see below).
- **Login.** Each admin logs in with an email address and a password, then a code from an authenticator app on their phone. This second step (two-factor authentication, 2FA) is required before the admin area opens. Login limits, such as the lockout after repeated failures, are in [non-functional-requirements](non-functional-requirements.md) (NFR-09, NFR-11).
- **Creating an Admin.** The Super Admin can create an Admin only when no Admin is active.
- **The Super Admin protects itself.** The Super Admin cannot disable or demote its own account.
- **Disable.** The Super Admin disables the account of a person who stops being an admin, so they can no longer log in. How soon this must happen, and how long their account data is kept, is in [privacy-and-retention](privacy-and-retention.md).
- **Reset.** A reset sets a new password, forces the person to set up 2FA again, and signs that person out everywhere (ends all of their sessions).
- **Sign out.** The Super Admin can end an admin's sessions, for example after a phone or laptop is lost.
- **Every account action is recorded** in the audit log.

*Example.* If the Admin account ever has to be replaced, the Super Admin first disables the old account. Only then can a new Admin be created, because only one Admin can be active at a time.

### 5.2 Backup codes and the break-glass script

- **Backup codes.** When an admin sets up 2FA, the system makes a set of one-time backup codes. The admin stores them offline, for example printed and kept in a safe place at home.
- **Break-glass script** *(technical)*. A documented script for the case where the Super Admin loses their 2FA device. It is run with the database credentials, resets the Super Admin's 2FA, and writes an audit entry. The step-by-step runbook will be in the operations docs (planned: `07-operations/deployment-and-operations.md`).

**If you lose your phone:**

| Who | What to do |
|---|---|
| **Admin** (the business owner) | Log in with one of your backup codes. If you have none left, ask the Super Admin to reset your account. You get a new password, set up 2FA again on your new phone, and are signed out everywhere else. |
| **Super Admin** (the developer) | Log in with one of your backup codes. If you have none left, run the break-glass script with the database credentials. It resets your 2FA and records this in the audit log. |

## 6. What personal data each role sees

Both admins see the same reservation data. The roles differ in what they may *change* (section 2), not in which reservations they can *see*.

| Data | Super Admin | Admin | Customer, on their own status page | Anyone else on the public site |
|---|---|---|---|---|
| Customer name | ✓ | ✓ | Not on the status page itself; shown as "received from" on the customer's own acknowledgments | — |
| Mobile number and email address | ✓ | ✓ | — (the customer types the mobile number to look up the booking) | — |
| Venue: barangay, city, street, landmarks | ✓ | ✓ | — | — |
| The customer's "Additional requirements" note | ✓ | ✓ | — | — |
| Internal notes by admins | ✓ | ✓ | — (never) | — |
| Booking details: status, service type, date, slot or arrival time, package, add-ons, current deadline | ✓ | ✓ | ✓ | — (the calendar shows only Available or Full) |
| Messages to the customer: needs-info message, rejection or cancellation reason, refund decision | ✓ | ✓ | ✓ | — |
| Money: total, deposit, balance due | ✓ | ✓ | ✓ | — |
| Payment records: method, e-wallet reference number, who received it, voids | ✓ (full ledger) | ✓ (full ledger) | Only what is printed on their own acknowledgments | — |
| Deposit proof images | ✓ (through short-lived links) | ✓ (through short-lived links) | Uploads them | — |
| Audit log (it never stores customer contact data) | ✓ | ✓ | — | — |
| Admin display name | ✓ | ✓ | ✓, as "received by" on acknowledgments | — |

Notes:

- **The status page** never shows the customer's name, mobile number, or address. The full list of what it shows is in [functional-requirements](functional-requirements.md) (FR-PUB-11).
- **A QR code scanned by someone who is not logged in** shows only "present this at our office". An invalid or revoked QR code shows a "not found / no longer valid" page with no data. A logged-in admin who scans it opens the reservation.
- **The public calendar** never shows personal data ([business-rules](business-rules.md), BR-09).
- **Customers without email.** The admin panel shows a prepared message that staff can copy into SMS or Messenger ([functional-requirements](functional-requirements.md) FR-NTF-21).
- **Old data is blanked.** After the retention period, contact details are removed, so admins see blanks on old reservations. Proof images are deleted 7 days after the deposit is verified **[C]** (D-21). The full schedule is in [privacy-and-retention](privacy-and-retention.md).
- **No sensitive data is collected**, such as IDs, birthdates, health, or religion. See [privacy-and-retention](privacy-and-retention.md).
- **Error reports** sent to the monitoring service have personal data removed ([non-functional-requirements](non-functional-requirements.md) NFR-23).

## 7. How permissions are enforced *(for the developer)*

- **Two roles in the login library.** Better Auth's admin plugin holds the two roles, Super Admin and Admin (D-20; full stack in spec v0.2 §10).
- **Server-side checks.** A check of login and role runs on the server at the top of every admin page, server action, and route. The middleware (`proxy.ts`) only redirects visitors who are not logged in. It is not the security boundary.
- **Admin code is separate.** Admin server actions live in their own module tree.
- **One database function per action.** Every admin action is one database function call. Role permissions are tested for each function.
- **Refusal tests.** Automated tests call every admin endpoint while logged out and with the wrong role, and expect a refusal. The test cases will be in the test plan (planned for batch 4: `06-delivery/test-plan.md`).
- **Database roles.** The app's database role can only call the app's functions and read what it needs. Backups use a separate read-only role. The controls are in [non-functional-requirements](non-functional-requirements.md) (NFR-10, NFR-13) and the security doc (planned: `05-technical/security.md`).
- **Two admins at once.** Each action checks the reservation's current status and version, so the second admin gets "already changed, please refresh" ([edge-cases](edge-cases.md) EC-16).
- **Audit.** Every admin action records who did it, when, and the reason where one is required. The audit log is append-only ([functional-requirements](functional-requirements.md) FR-ADM-32).

## 8. Changing a permission

A change to these tables is a change to a decision (usually D-07, D-08, or D-17). Follow "How to change a decision" in the [decision log](../00-project/decision-log.md):

1. Update the decision log first.
2. Then update this document.
3. Then update every other document that the decision lists under "Docs affected", and the tests for the changed permission.
