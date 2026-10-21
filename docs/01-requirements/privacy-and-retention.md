# Privacy and Retention

> **Purpose:** How the DJB Kasoundbox system follows Philippine privacy law, how long each kind of data is kept, the wording rules for acknowledgments, and the legal facts to review before launch. ·
> **Audience:** The developer (Super Admin) and the business owner (Admin); written for readers without a technical background, except the lines marked "Developer note". The Philippine lawyer and the CPA who review the system before launch (O-08, O-11) can read it on its own ·
> **Status:** Draft for review ·
> **Last updated:** 2026-10-21 ·
> **Depends on:** [Decision log](../00-project/decision-log.md) (D-18, D-20, D-21, D-22; O-08 to O-11), [Glossary](../00-project/glossary.md), [Roles and permissions](roles-and-permissions.md), [Functional requirements](functional-requirements.md), [Non-functional requirements](non-functional-requirements.md), [Reservation lifecycle](../02-domain/reservation-lifecycle.md), [Catalog and payments](../02-domain/catalog-and-payments.md) ·
> **Derived from:** [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §14 (main source) and §11 (closure date), with details from §5, §8, §10, §13, §15, §18, and §19

**This is not legal advice.** Read section 1 first.

**How to read this document.**

- **Labels.** **[C]** confirmed decision · **[P]** proposed, accepted with the spec approval but may change · **[U]** unverified fact, to be checked before launch · **[O-nn]** open item, listed in the [decision log](../00-project/decision-log.md). A statement with no label is part of the approved design (spec v0.2, approved on 2026-10-21, see D-23). **[P] (new in this doc)** marks a small detail that spec v0.2 does not state; it is not yet approved, so please confirm or correct it in review.
- **Time.** Every date and time is Manila time (Asia/Manila). A "year" is the calendar year in Manila.
- **Examples.** Names and peso amounts in the examples are made up. The real prices and the deposit amount are still open (O-03). The examples follow the same customers as the other docs: Ana, Ben, Carla, and Dan.
- **Citing this document.** This document has no ID prefix of its own. Other docs link here and name the section, for example "privacy-and-retention, legal hold" or "privacy-and-retention §6 (retention schedule)".
- **Words.** "Personal data" means what the law calls *personal information*. "Blank" or "set to null" means the field is emptied; the value is gone, not hidden. Other terms, such as *closure date* and *legal hold*, are also in the [glossary](../00-project/glossary.md).
- **Tests.** The database tests for this document (the 2-year blanking, proof deletion, and skipping legal-hold rows; spec v0.2 §17) will be listed in the test plan (planned for batch 4: `06-delivery/test-plan.md`).

### What this document does not cover

| Topic | Where it lives |
|---|---|
| Who may set a legal hold, process an erasure, or change the retention settings and the issuer name | [Roles and permissions](roles-and-permissions.md) (sections 2.6 and 2.7) |
| Which personal data each role can see in the admin panel and on the status page | [Roles and permissions](roles-and-permissions.md) (section 6) |
| The screens and jobs: the privacy summary on the form, the privacy notice page, the legal hold and erasure tools, the retention job, the IP-key rotation, the nightly backup | [Functional requirements](functional-requirements.md) (FR-PUB-06, FR-PUB-15, FR-ADM-31, FR-SYS-05, FR-SYS-06, FR-SYS-12) |
| Security controls: login, rate limits, safe uploads, secrets, error scrubbing | [Non-functional requirements](non-functional-requirements.md) (NFR-09 to NFR-15, NFR-23) and the security doc (planned: `05-technical/security.md`) |
| How often backups are made, how long each copy lasts, the monthly offline copy, restore tests | [Non-functional requirements](non-functional-requirements.md) (NFR-27 to NFR-29) |
| What an acknowledgment contains, and how acknowledgments are numbered | [Catalog and payments](../02-domain/catalog-and-payments.md) |
| Statuses, and when a reservation reaches its final status | [Reservation lifecycle](../02-domain/reservation-lifecycle.md) |
| Decisions and open items | [Decision log](../00-project/decision-log.md) |

---

## In short (for the Admin)

1. **Privacy law applies to the business,** even though the business is not registered.
2. **The system asks only for what it needs.** It never asks for IDs, birthdates, ages, religion, or health information.
3. **Payment-proof pictures are deleted 7 days after the deposit is verified [C]** (D-21).
4. **Customer names, mobile numbers, emails, street addresses, and notes are erased 2 years after a booking is closed.**
5. **Money records are kept until the end of the 6th year after the booking closed.** Then they are reduced to anonymous totals.
6. **Acknowledgments are not Official Receipts.** The system never prints "Official Receipt", "OR No.", "Invoice", a TIN, "BIR", or VAT wording.
7. **Only the Super Admin can set a legal hold.** If a written complaint, demand, or case arrives about a booking, pass it to the Super Admin, who sets the hold so nothing about that booking is deleted.
8. **A Philippine lawyer checks all of this before launch** (O-08).

---

## 1. Legal caveat

> **This section and everything below it is research, not legal advice.** The official legal websites could not be reached during research, so the wording comes from secondary copies and summaries. A Philippine lawyer must confirm everything marked **[U]**, and the retention periods, before launch (O-08).

Until that review, every legal statement here is the research's best reading. It is not a confirmed fact.

---

## 2. Does the Data Privacy Act apply?

**Yes.** The Data Privacy Act of 2012 (RA 10173) applies to the business, whether or not the business is registered (D-18).

- **Why it applies.** Section 4 of the Act covers any person who processes personal information. The Act has an exemption for personal or household use, but it does not fit a rental business that charges fees.
- **Who is responsible.** The person who runs the business is the *personal information controller*: the one who decides what personal data is collected and how it is used. The business is not registered, so it has no separate legal identity. Who the controller is in law, and how that relates to naming the DPO (O-09), is confirmed in the lawyer's review **[U]** (O-08). The controller stays accountable for the data its service providers hold for it: Supabase, Vercel, Resend, Sentry, GitHub, and Cloudflare (Secs. 14, 20(d), and 21 of the Act). The providers are listed in section 4.
- **Personal, but not sensitive.** All the data the system collects is personal information. None of it is *sensitive personal information*, a stricter legal category, as long as the system never collects IDs, birthdates, ages, religion, or health data. The "Additional requirements" box on the form warns customers not to enter these ([functional-requirements](functional-requirements.md), FR-PUB-05).

---

## 3. What personal data the system holds

### 3.1 The data, and what it is used for

| Data | Given by, and when | Used for | How long it is kept |
|---|---|---|---|
| Customer name | The customer | Knowing whose booking it is; "received from" on acknowledgments | Closure + 2 years (section 6) |
| Mobile number (saved in the `+639XXXXXXXXX` format, BR-11) | The customer (required) **[C]** (D-08) | Contacting the customer; the status-page check; the limit on open requests (BR-07) | Closure + 2 years |
| Email address | The customer (optional) **[C]** (D-08) | Sending the customer emails ([functional-requirements](functional-requirements.md), FR-NTF-01 to FR-NTF-12) | Closure + 2 years |
| Venue barangay and city or municipality (delivery only) | The customer (required for delivery) | Delivering the set; admins check the address is inside the service area **[C]** (D-11) | Barangay: until ledger end. City: kept in the anonymous statistics |
| Venue details: street and landmarks (delivery only) | The customer | Finding the venue | Closure + 2 years |
| "Additional requirements" note (up to 500 characters) | The customer (optional) | Special requests for the booking | Closure + 2 years |
| Internal notes | An admin | Notes between the admins | Closure + 2 years |
| Booking details: reference code, service type, date, slot or arrival time, package, add-ons, prices, status, refund decision | The customer and the admins | Running the booking | Until ledger end, then anonymous statistics |
| Payment records: acknowledgment number, amount, date, method, e-wallet reference number, the admin who received it | An admin, when recording a payment | The full payment ledger **[C]** (D-05) | Until ledger end, then anonymous statistics |
| Payment-proof images | The customer, on the status page, while Awaiting Deposit | Letting an admin check a payment (BR-12) | 7 days after the deposit is verified **[C]** (D-21); see section 6 for unverified proofs |
| Audit log entries | The system, for every status change and admin action | Tracing who did what, when, and why | Security events: 12 months. Booking events: until ledger end |
| Rate-limit counters | The system | Slowing down abuse of the login, status lookup, form, and upload | 24 hours |
| Duplicate-submission keys | The system | Making a double click or a retry return the same reservation | 72 hours |
| Admin account data: name, email, password (stored only as a hash), 2FA secret, backup codes, sessions | The admin, when the account is set up ([roles-and-permissions](roles-and-permissions.md), section 5.1) | Admin login | While the person is an admin (section 6) |

For phone, walk-in, and Facebook bookings, an admin types the customer's details into the system ([functional-requirements](functional-requirements.md), FR-ADM-24).

*Example.* Ana books a delivery for Thursday 24 December 2026 (reference `KSB-7Q2M-K9TX`). The system holds her name, her mobile number `+639171234567`, her email, her venue (barangay, city, street, and landmarks), her note "please bring extra microphone stands", her booking, and later her two payment records (₱1,000 deposit and ₱2,400 balance). Nothing else about her is collected.

### 3.2 What the system never collects or copies

- **No sensitive data.** The system never asks for IDs, birthdates, ages, religion, or health data (section 2).
- **No payer details from screenshots.** Payer names and account numbers are never copied from proof images. Only the e-wallet reference number is stored ([catalog-and-payments](../02-domain/catalog-and-payments.md)).
- **No raw internet (IP) addresses.** Rate limits count visitors by an HMAC of their IP address: a scrambled code made with a secret key. The key is replaced every day and old keys are destroyed ([functional-requirements](functional-requirements.md), FR-SYS-06; [non-functional-requirements](non-functional-requirements.md), NFR-13).
- **No photo location data.** The browser re-encodes each proof image before upload, which removes GPS and other hidden photo data ([functional-requirements](functional-requirements.md), FR-PUB-12).
- **No customer contact data in the audit log** ([functional-requirements](functional-requirements.md), FR-ADM-32).
- **No personal data in error reports.** Personal data is scrubbed before an error is sent to Sentry ([non-functional-requirements](non-functional-requirements.md), NFR-23).

What the status page, the calendar, and the QR page show to the public, and how little that is, is in [non-functional-requirements](non-functional-requirements.md) (NFR-15).

### 3.3 Legal basis

The full privacy notice (section 5.1) must say on what legal basis each kind of data is used. The research names three bases:

- **The contract:** handling the customer's booking.
- **Legitimate interest:** for example, the audit log and the rate limits.
- **Legal obligation:** for example, the financial records (the payment ledger).

Which basis fits each row of the table in section 3.1 is written in the notice text and confirmed in the lawyer's review (O-08).

---

## 4. Service providers and data abroad

The business uses these providers. Each one holds some data for the business, and the business stays accountable for it (section 2). The full stack is in [spec v0.2](../superpowers/specs/2026-10-21-kasoundbox-design.md) §10 and D-20.

| Provider | What it does for the business | What data it holds | Where |
|---|---|---|---|
| **Supabase** (free plan) | The database and the file storage | Everything in section 3.1. Proof images sit in a private storage bucket | Singapore ("Southeast Asia (Singapore)" region) |
| **Vercel** (Hobby plan) | Runs the website and its server code | Handles each request as it happens. Its runtime logs are kept for only 1 hour | Singapore (`sin1`) |
| **Resend** (free plan) | Sends the emails | Recipient addresses (customers who gave an email, and the two admins) and the content of each email | Abroad; the exact location is checked in its terms **[U]** (O-08) |
| **Sentry** (free plan) | Error reports, the uptime check, and the alert when scheduled jobs stop | Error reports, with personal data scrubbed | Abroad **[U]** (O-08) |
| **GitHub** | Holds the code and runs the nightly backup job | Encrypted database backups, kept as workflow artifacts for 14 days ([non-functional-requirements](non-functional-requirements.md), NFR-27), in a private repository **[C]** (D-22) | Abroad **[U]** (O-08) |
| **Cloudflare** (Turnstile) | The bot check on the public form | What the check collects from the visitor's browser is set by its terms **[U]** (O-08) | Abroad **[U]** (O-08) |

Rules for providers:

- **The privacy notice names every provider** and says that data is stored in Singapore and processed abroad (section 5.1).
- **Each provider's own copies are kept as short as it allows.** See the "Provider copies" row in section 6.2.
- **The terms are read before launch.** The vendor terms and their data processing agreements are read and dated copies saved (O-08; [non-functional-requirements](non-functional-requirements.md), NFR-08).

---

## 5. Obligations built into the design

### 5.1 Privacy notice

- **A short summary sits above the Submit button** on the reservation form, and it links to the full notice ([functional-requirements](functional-requirements.md), FR-PUB-06 and FR-PUB-15).
- **The full notice is a public page.** It must cover all of these:
  1. who the controller is, with a privacy contact (O-09);
  2. what is collected and why, and on what legal basis: the contract, legitimate interest (audit log, rate limits), or legal obligation (financial records) (section 3);
  3. every recipient, including that data is stored in Singapore and processed abroad (section 4);
  4. the retention schedule (section 6);
  5. the customer's rights as a data subject, and that a person making a request is checked with the reference code and the full mobile number (section 5.4);
  6. the right to complain to the NPC (National Privacy Commission, the privacy regulator);
  7. that deleted data may remain in encrypted backups for up to 30 days.

### 5.2 Privacy officer

- **One of the two admins is named in writing** as the DPO (data protection officer), also called the compliance officer. Who it will be is still open (O-09).
- **A privacy contact email is published** on the privacy notice (O-09; [functional-requirements](functional-requirements.md), FR-PUB-15).
- The DPO is a legal duty, not a role in the system ([roles-and-permissions](roles-and-permissions.md), section 1).

### 5.3 NPC registration

- **Full registration with the NPC is probably not required.** The system holds no sensitive personal information, and the business has far fewer than 250 employees.
- **A free sworn exemption declaration (SDAU) may still be required [U].** Whether it must be filed is open item O-10, for the lawyer.

### 5.4 Customer requests and rights

- **Checking who is asking.** Customers have no accounts **[C]** (D-08). Before acting on a privacy request, the admin checks the reference code and the full mobile number, the same pair the status page asks for ([functional-requirements](functional-requirements.md), FR-PUB-10).
- **Where customers send requests.** To the privacy contact (O-09; [roles-and-permissions](roles-and-permissions.md), section 3.1).

| The customer asks to… | What happens | Where the rule is |
|---|---|---|
| Correct a detail, such as a wrong mobile number | Either admin uses "edit details", with a reason | [reservation-lifecycle](../02-domain/reservation-lifecycle.md) (edit details); [edge-cases](edge-cases.md) |
| Erase their personal data | The Super Admin processes an erasure request | Section 5.5 |
| Complain to the regulator | The notice tells them they may complain to the NPC | Section 5.1 |

### 5.5 Erasure requests

**Who:** the Super Admin only **[P]** ([roles-and-permissions](roles-and-permissions.md), section 2.7). The tool is [functional-requirements](functional-requirements.md) FR-ADM-31.

**What happens:**

1. The Super Admin checks the requester with the reference code and the full mobile number (section 5.4).
2. **If the reservation is under a legal hold, the fields are not blanked** (section 5.6).
3. Otherwise, the system **blanks the contact fields** (name, mobile number, email address) **and the venue details** (street and landmarks) at once.
4. **The payment ledger is kept:** acknowledgment numbers, amounts, dates, methods, e-wallet reference numbers, and the admin who received each payment. These are financial records with a legal reason to keep them until ledger end (section 6.1).
5. **The customer is told what was kept and why.**
6. **An audit entry is written.** Like every audit entry, it names the fields changed, not their values.

**What this means in practice.**
- The status lookup needs the mobile number, so after an erasure the customer can no longer open the status page for that booking.
- Admins see blanks in the erased fields ([roles-and-permissions](roles-and-permissions.md), section 6).

*Example.* On Monday 1 February 2027, Ana emails the privacy contact and asks for her data to be deleted. She gives `KSB-7Q2M-K9TX` and `0917 123 4567`. Her event on 24 December 2026 is over, and there is no legal hold. The Super Admin processes the erasure. Her name, mobile, email, street, and landmarks are blanked at once. Her ₱1,000 deposit and ₱2,400 balance records stay, with their acknowledgment numbers, until 31 December 2032. Ana is told that the payment records are kept for the tax-record and claim periods.

### 5.6 Legal hold

**When:** a written complaint, demand, or case concerns a reservation.

**Who:** the Super Admin only **[P]** ([roles-and-permissions](roles-and-permissions.md), section 2.7). Setting the hold needs a reason. A reason for clearing it is **[P] (new in this doc)**, to be confirmed in review. The tool is [functional-requirements](functional-requirements.md) FR-ADM-31.

**What it does:**
- **Every deletion in the retention schedule (section 6) for that reservation is paused** until the hold is cleared. This includes blanking contact data, deleting proof images, reducing the records to statistics, and deleting its booking audit events.
- **An erasure request does not blank the fields** while the hold is set (section 5.5).
- The daily retention job skips the reservation ([functional-requirements](functional-requirements.md), FR-SYS-05).
- **When the hold is cleared,** the retention job treats the reservation like any other from its next daily run. Anything already past its period is processed then.

*Example.* Ben cancelled his booking for Sunday 27 December 2026 and collected a ₱500 refund on Wednesday 23 December 2026 ([functional-requirements](functional-requirements.md), FR-ADM-18 and FR-ADM-19). His contact data would normally be blanked from Saturday 23 December 2028. On Thursday 30 November 2028, a demand letter from Ben about the refund arrives. The Super Admin sets a legal hold with the reason "demand letter received 30 Nov 2028". On 23 December 2028 nothing is blanked. The matter is settled, and on Thursday 15 March 2029 the Super Admin clears the hold, with a reason. In the next daily run, Ben's contact data is blanked, because the 2 years have already passed.

> **Developer note.** The hold is the `legal_hold` flag on the reservation, with its reason. Setting and clearing it are audited. The retention job filters out held reservations before it touches any of their rows, including `payment_proofs` and the reservation's audit entries.

### 5.7 Breach procedure

- **A breach** is personal data that is lost, stolen, or seen by someone who should not see it.
- **Payment data makes notification more likely.** Because the system holds payment records, a breach is more likely to require notification under NPC Circular 16-03, which has a 72-hour rule **[U]**.
- **The incident runbook** (what to do, step by step) will be in the operations docs (planned: `07-operations/deployment-and-operations.md`).

---

## 6. Retention schedule

**Label: [C] (D-21).** The periods below are the confirmed defaults. Each one is stored as a setting, so it can change after the lawyer's review (O-08) without code changes.

### 6.1 The two dates that drive it

**Closure date [P].** A reservation's retention periods count from its closure date. The closure date is the **latest** of:

- the date the reservation reached its final status (Rejected, Cancelled, Expired, or Completed; see [reservation-lifecycle](../02-domain/reservation-lifecycle.md));
- its event date, for Completed reservations;
- its latest payment or refund date.

It is **recomputed** if a payment or refund is recorded later ([functional-requirements](functional-requirements.md), FR-ADM-14 and FR-ADM-19). A reservation that is still Pending Confirmation, Awaiting Deposit, or Confirmed has no closure date yet, so none of its retention periods has started.

**Ledger end.** Ledger end is **31 December of the 6th year after the closure year.** For example, records closed in 2026 are kept through 31 December 2032 and processed in January 2033.

This covers two legal periods:
- the 5-year period for keeping tax records (NIRC Sec. 235 as amended by EOPT; RR 7-2024);
- the 6-year period for claims based on oral contracts (Civil Code Art. 1145).

| Closure year | Ledger end | Processed in |
|---|---|---|
| 2026 | 31 December 2032 | January 2033 |
| 2027 | 31 December 2033 | January 2034 |
| 2028 | 31 December 2034 | January 2035 |

### 6.2 The schedule

| Data | Kept for | Then |
|---|---|---|
| Customer name, mobile, email, customer notes, admin notes | Closure + 2 years | Set to null. A hash does not count as anonymized |
| Venue details (street, landmarks) | Closure + 2 years | Set to null |
| Venue barangay | Until ledger end | Set to null, keeping the city only |
| Booking details, amounts, payments (acknowledgment number, amount, date, method, e-wallet reference, admin) | Until ledger end | Reduced to anonymous statistics: month and year, package, amounts, city |
| Payment-proof images | 7 days after the deposit is verified **[C]** (D-21). Unverified proofs: 7 days after the reservation becomes Rejected, Expired, or Cancelled **[P]** | Hard-deleted from storage, and the deletion is logged. Proofs are not backed up, by design |
| Rate-limit counters (HMAC'd IPs) | 24 hours; the HMAC key is rotated daily and old keys are destroyed | Deleted |
| Duplicate-submission keys | 72 hours | Deleted |
| Audit log: security events | 12 months, rolling | Deleted |
| Audit log: booking events | Until that booking's ledger end | Added to monthly per-action counts in the retention run log, then deleted |
| Retention run logs (counts only) | Until ledger end | Deleted |
| Encrypted backups | 30 days at most, rolling. Only the latest monthly offline copy is kept | Expired or destroyed |
| Admin account data | While the person is an admin. The account is disabled the same day they leave; their login credentials are deleted within 30 days | Only the admin's ID and display name stay, inside the audit entries that are still kept |
| Provider copies (Resend, Sentry, Vercel logs) | The shortest setting each provider offers (30 days or less). Customer data is scrubbed from Sentry | Expired by the provider |

**What the "Then" words mean.**

- **Set to null.** The field is emptied. *A hash does not count as anonymized:* replacing a mobile number with a scrambled code (a hash) is not enough, because anyone could hash every possible mobile number and find the match. The value must be removed.
- **Anonymous statistics.** After ledger end, only the month and year, the package, the amounts, and the city are kept. Nobody can tell whose booking it was. *Example:* "December 2026 · Package A · total ₱3,400 · deposit ₱1,000 · balance ₱2,400 · San Pablo City".
- **Hard-deleted.** The image file is removed from storage for good. The e-wallet reference number in the payment record is the lasting record of the payment.
- **Monthly per-action counts.** Before booking audit events are deleted, they are added up per month and action, for example "December 2026: 14 approvals, 3 cancellations". Only those counts remain.

**Backups.** The nightly copies expire after 14 days, and the Super Admin keeps only the latest monthly offline copy ([non-functional-requirements](non-functional-requirements.md), NFR-27 and NFR-28). This is why the privacy notice says that deleted data may remain in encrypted backups for up to 30 days. Proof images are never in a backup.

**Admin accounts.** Disabling an account is in [roles-and-permissions](roles-and-permissions.md) (section 5.1).

### 6.3 Worked examples

**Example A: Ana, a normal delivery booking.** Total ₱3,400; deposit ₱1,000; balance ₱2,400.

| When | What happens |
|---|---|
| Fri 18 Dec 2026, 10:45 AM | Ana pays ₱1,000 by e-wallet and uploads a proof image. |
| Fri 18 Dec 2026, 11:00 AM | The Admin verifies the proof and records the deposit. The booking becomes Confirmed. The deposit is now verified. |
| Thu 24 Dec 2026 | Event day. Ana pays the ₱2,400 balance in cash, and the Admin records it. |
| Fri 25 Dec 2026, early morning | The daily job marks the booking Completed ([functional-requirements](functional-requirements.md), FR-SYS-04). **Closure date: Friday 25 December 2026**, the latest of the Completed date (25 Dec), the event date (24 Dec), and the last payment (24 Dec). |
| Sat 26 Dec 2026, early morning | The 7 days after verification ended on Friday 25 December at 11:00 AM. The first daily run after that deletes the proof image and logs the deletion. |
| From Mon 25 Dec 2028 | Closure + 2 years. Her name, mobile, email, note, any internal notes, street, and landmarks are blanked. |
| Fri 31 Dec 2032 | Ledger end (closure year 2026). |
| Sat 1 Jan 2033 | The first daily run after ledger end blanks the barangay, reduces the booking and payment records to anonymous statistics, counts the booking audit events, and then deletes them. |

**Example B: Ben, a refund paid in the new year.** Ben's booking for Sunday 27 December 2026 is cancelled on Tuesday 22 December 2026, with the refund decision "partial, ₱500".

- If Ben collects his ₱500 on Wednesday 23 December 2026, the closure date is 23 December 2026. Ledger end is 31 December 2032.
- Suppose instead he collects it only on **Monday 4 January 2027**. When the Admin records the refund, the closure date is recomputed to 4 January 2027.
  - The closure year is now 2027, so ledger end moves to **31 December 2033**.
  - His contact data is blanked from **Thursday 4 January 2029** instead of 23 December 2028.

**Example C: Carla, a request nobody reviewed.** Carla submits a request for Sunday 20 December 2026 on Monday 7 December 2026 at 9:00 AM. No admin reviews it, and it expires on Thursday 10 December 2026 at 9:00 AM (deadline rules: [reservation-lifecycle](../02-domain/reservation-lifecycle.md)). No money changed hands.

- Closure date: Thursday 10 December 2026.
- Her contact data is blanked from Sunday 10 December 2028.
- Ledger end: 31 December 2032. Even an expired request keeps its booking details until then.

**Example D: Dan, a proof that was not accepted [P].** Dan uploads a proof. On Tuesday 22 December 2026 the Admin rejects it, with the reason "amount does not match". His deadline has already passed, so the reservation expires at once ([business-rules](business-rules.md), BR-12). The proof was never verified, so its image is deleted in the first daily run once 7 days have passed since the reservation became Expired, that is, after the same time on Tuesday 29 December 2026.

### 6.4 How the schedule is applied

- **The daily retention job** applies the schedule, skips every reservation under legal hold, and writes a retention run log with counts only, never personal data ([functional-requirements](functional-requirements.md), FR-SYS-05).
- **The periods are settings.** Only the Super Admin can change them **[P]** ([roles-and-permissions](roles-and-permissions.md), section 2.6). Each change is recorded in the audit log. If the lawyer advises different periods (O-08), record the change in the [decision log](../00-project/decision-log.md) first (section 12 of this document).
- **After a restore from a backup,** the retention job runs before the system reopens, so a restore never brings back data that should already be gone ([non-functional-requirements](non-functional-requirements.md), NFR-29).

> **Developer note.** The closure date is stored on the reservation and recomputed inside the payment and refund recording functions. Proof rows in `payment_proofs` keep their deletion time after the file is removed. The `retention_runs` table holds the date and the counts per category. The table and field details will be in the data model (planned: `05-technical/data-model.md`).

---

## 7. Acknowledgments and the business name

### 7.1 Wording rules

These rules apply to every page, email, and printable document the system makes.

- **Only these titles are used:** "Deposit Acknowledgment", "Balance Payment Acknowledgment", and "Booking Confirmation".
- **These words never appear:** "Official Receipt", "OR No.", "Invoice", a TIN, "BIR", or any VAT wording.
- **Every acknowledgment carries this line:** *"This is an acknowledgment of payment received. It is NOT an Official Receipt or Invoice."*
- **Why.** The business is not registered (D-18), so nothing it issues may look like a BIR tax document.

What each acknowledgment contains, and the `ACK-YYYY-NNNN` numbering, are in [catalog-and-payments](../02-domain/catalog-and-payments.md).

### 7.2 Issuer name

- **Acknowledgments are issued as "DJB Kasoundbox" [C]** (D-21).
- **The risk.** The research found that Act 3883 requires a business name to be registered with the DTI (Department of Trade and Industry) before it is used on receipts and other written evidence of transactions.
- **The risk is accepted knowingly** as a confirmed decision (D-21), and a lawyer will advise (O-11).
- **The issuer name is a setting,** so it can be changed without code changes. Only the Super Admin can change it **[P]** ([roles-and-permissions](roles-and-permissions.md), section 2.6).

---

## 8. Unregistered business: facts for the CPA or lawyer

The business is not registered: it is small and serves only its local area **[C]** (D-18). The research found these facts. They are for review with a CPA or a lawyer (O-11). They are not decisions.

- **BIR registration has no size threshold.** A sole proprietor registers before starting the business (NIRC Sec. 236 as amended by EOPT; RMC 91-2024).
- **RA 12214** (in effect since 1 July 2025) sets penalties for doing business without registering.
- **The other registrations** are a DTI business name, a barangay clearance, and a mayor's permit.
- **RA 11967** (the Internet Transactions Act) may require showing a registered business name and address **[U]**.
- **The records are ready for a later registration.** The payment ledger records every deposit, balance, and refund, as if the business were registered ([catalog-and-payments](../02-domain/catalog-and-payments.md)).

---

## 9. Open privacy and legal items

These are tracked in the [decision log](../00-project/decision-log.md). They are listed here so they are not forgotten.

| Item | What is needed | When | Tracked as |
|---|---|---|---|
| A Philippine lawyer reviews this document once, including the retention periods and every **[U]** item | Lawyer | Before launch | O-08 |
| Read the vendor terms and their data processing agreements, and save dated copies | Action | Before launch | O-08; [non-functional-requirements](non-functional-requirements.md) NFR-08 |
| Name the DPO in writing; set up the privacy contact email | Action | No date set | O-09 |
| Confirm whether the SDAU must be filed with the NPC | Lawyer | No date set | O-10 |
| Business registration (BIR, DTI name, barangay, mayor's permit) and the use of "DJB Kasoundbox" on acknowledgments | CPA or lawyer | No date set | O-11 |
| Make the GitHub repository private | Action, by the Super Admin **[C]** | Before backups are added | O-06; D-22 |
| Set each provider's data retention to its shortest option | Action | No date set | Section 6.2 ("Provider copies") |
| Write the incident runbook for breaches | Action | With the operations docs | Section 5.7 |

---

## 10. Key legal sources

These are the sources the research used (spec v0.2 §14). See the caveat in section 1.

- **Privacy:** [RA 10173](https://privacy.gov.ph/wp-content/uploads/2017/03/DPA-of-2012.pdf) · [IRR](https://privacy.gov.ph/wp-content/uploads/2023/06/IRR_RA-10173-as-amended.pdf) · [NPC Circular 2022-04](https://privacy.gov.ph/wp-content/uploads/2023/05/Circular-2022-04-1.pdf) · [NPC Advisory 2017-01](https://privacy.gov.ph/wp-content/uploads/2022/01/NPC-Advisory-2017-01-sgd.pdf) · [NPC Circular 2023-06](https://privacy.gov.ph/wp-content/uploads/2024/03/NPC-Circular-Repeal-16-01-Signed.pdf) · [NPC Advisory 2026-02](https://privacy.gov.ph/wp-content/uploads/2026/05/Advisory-Clarification-on-the-Submission-of-Personal-Data-Breach-Notification-through-DBNMS_11-May-2026.pdf)
- **Tax and business registration:** [RR 7-2024](https://bir-cdn.bir.gov.ph/BIR/pdf/RR%207-2024%20(final).pdf) · [RMC 91-2024](https://bir-cdn.bir.gov.ph/BIR/pdf/RMC%20No.%2091-2024%20Digest.pdf) · [RA 12214](https://www.lawphil.net/statutes/repacts/ra2025/ra_12214_2025.html) · [Act 3883](https://lawphil.net/statutes/acts/act1931/act_3883_1931.html)
- **Contracts and transactions:** [Civil Code](https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html) · [Consumer Act](https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html) · [RA 11967](https://www.lawphil.net/statutes/repacts/ra2023/ra_11967_2023.html) · [RA 8792](https://www.lawphil.net/statutes/repacts/ra2000/ra_8792_2000.html)

---

## 11. Questions found while writing this document

Spec v0.2 does not answer these. They are not decided here. If the reviewers agree they need an answer, add each one to the [decision log](../00-project/decision-log.md) as a new open item (O-12 onwards), then update this document.

1. **Proofs that were never verified, on a booking that went ahead.** A proof can be rejected, or never reviewed because the customer then paid in cash or the deposit was waived, while the reservation still ends Confirmed and then Completed. Neither proof-deletion rule in section 6.2 covers that image. When is it deleted?
2. **Other audit log categories.** The audit log has five categories: security, booking, catalog, settings, and account. The schedule gives periods only for security and booking events. How long are catalog, settings, and account events kept?
3. **The email outbox.** Each queued email keeps its recipient's address in the outbox table. The schedule has no row for it. How long are outbox rows kept?
4. **What an erasure blanks.** This document reads "contact fields" as name, mobile number, and email address. Does an erasure also blank the customer's note, the internal notes, and the barangay?
5. **Erasure on an active booking.** Can an erasure be processed while a booking is still Pending Confirmation, Awaiting Deposit, or Confirmed? Afterwards, the admins could not contact the customer, and the customer could not open the status page.
6. **Telling the customer after an erasure.** The customer is told what was kept and why. How, when the email address is blanked in the same step?
7. **Erasures and restores.** After a restore, the retention job removes data that is past its period. An erasure processed after the backup was made is not part of the schedule. How is it applied again (for example, from its audit entry)?
8. **A request for a copy of one's data.** The notice lists the customer's rights, but the spec does not describe how a request for a copy of one's data is answered.
9. **Sensitive data typed in anyway.** If a customer enters an ID number or health information in the "Additional requirements" note despite the warning, what do the admins do?
10. **"Event not held" and the closure date.** When a Completed booking is moved to Cancelled, this document reads the date of that change as the new final-status date, so the closure date moves. The spec names only payments and refunds as triggers for recomputing. Is this reading right?
11. **Which ledger end for the run logs.** Retention run logs are kept "until ledger end". Is that the ledger end of the year in which each run happened?
12. **The issuer name on old acknowledgments.** If the issuer name setting changes, do acknowledgments that were already issued keep the old name, or show the new one?
13. **Monthly offline copy and "30 days at most".** The offline copy is replaced once a month. In a 31-day month, it can be slightly older than 30 days before it is replaced. Does the notice wording "up to 30 days" need to allow for that?
14. **Terms of all six providers.** NFR-08 names four vendors whose terms are read before launch: Vercel, Supabase, Resend, and Sentry. Section 4 names six providers that hold data. Should the GitHub and Cloudflare terms also be read and saved under O-08?

---

## 12. Changing this document

- **A change to a retention period, the issuer name, or another rule here** is a change to a decision (usually D-21). Update the [decision log](../00-project/decision-log.md) first, then this document, then every other document the decision lists under "Docs affected".
- **A setting changed in the admin panel** is recorded in the audit log. If the new value is meant to become the new standard, also record it in the decision log, so the docs stay true.
- **After the lawyer's review (O-08),** each confirmed **[U]** item loses its label, and any changed period or rule is recorded as a new decision.
- **The frozen spec is never edited** (D-23).
