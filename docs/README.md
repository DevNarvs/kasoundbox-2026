# DJB Kasoundbox — Reservation System Documentation

These documents are the **source of truth** for the reservation system, which has two parts: a public customer website and a private admin panel. They are written for two readers:

- **The developer**, who holds the Super Admin account and builds the system.
- **The business owner**, who holds the Admin account and runs daily reservations.

> **Current stage:** all documentation (batches 1–4) is drafted. See [Project Status](00-project/project-status.md) for what is done and what is still open. The approved [design spec](superpowers/specs/2026-10-21-kasoundbox-design.md) is **frozen** as the design record. New changes go into these docs, never into the spec.

## Where to start

| If you are… | Read these first |
|---|---|
| **The business owner (Admin)** | [Project Charter](00-project/project-charter.md) → [Glossary](00-project/glossary.md) → [Business Rules](01-requirements/business-rules.md) → [Reservation Lifecycle](02-domain/reservation-lifecycle.md) → [Catalog and Payments](02-domain/catalog-and-payments.md) → [Edge Cases](01-requirements/edge-cases.md) → [Staff Guide](07-operations/staff-guide.md). For a one-page picture, see the [Process Overview](03-workflows/overview.md). |
| **The developer (Super Admin)** | All of the above, then [Functional Requirements](01-requirements/functional-requirements.md), [Non-Functional Requirements](01-requirements/non-functional-requirements.md), [Roles and Permissions](01-requirements/roles-and-permissions.md), [Privacy and Retention](01-requirements/privacy-and-retention.md), the [Decision Log](00-project/decision-log.md), the six workflow docs, then the technical docs (05), [Roadmap](06-delivery/roadmap.md), [Test Plan](06-delivery/test-plan.md) and [Deployment and Operations](07-operations/deployment-and-operations.md) |

## Conventions

**Labels.**

| Label | Meaning |
|---|---|
| **[C]** | Confirmed decision (see the decision log) |
| **[P]** | Proposed. Accepted when the spec was approved, but may still change |
| **[U]** | Unverified fact. It must be checked in the week-1 test or before launch |
| **[O-nn]** | Open item that still needs input (see the decision log) |

**IDs.**

| Prefix | Item | Defined in |
|---|---|---|
| `D-xx` | Decision | [Decision Log](00-project/decision-log.md) |
| `O-xx` | Open item | [Decision Log](00-project/decision-log.md) |
| `BR-xx` | Business rule | [Business Rules](01-requirements/business-rules.md) |
| `FR-PUB-xx`, `FR-ADM-xx`, `FR-NTF-xx`, `FR-SYS-xx` | Functional requirement for the public site, admin panel, notifications, and system jobs | [Functional Requirements](01-requirements/functional-requirements.md) |
| `NFR-xx` | Non-functional requirement | [Non-Functional Requirements](01-requirements/non-functional-requirements.md) |
| `EC-xx` | Edge case | [Edge Cases](01-requirements/edge-cases.md) |
| `TC-…` | Test case | [Test Plan](06-delivery/test-plan.md) |

**Single source.** Each rule lives in exactly one document; the others link to it.

| Topic | Its single source |
|---|---|
| Statuses, transitions, and deadlines | [Reservation Lifecycle](02-domain/reservation-lifecycle.md) |
| Permissions | [Roles and Permissions](01-requirements/roles-and-permissions.md) |
| Capacity and booking limits | [Business Rules](01-requirements/business-rules.md) |
| Prices and money | [Catalog and Payments](02-domain/catalog-and-payments.md) |
| Retention and privacy | [Privacy and Retention](01-requirements/privacy-and-retention.md) |

**Changing a decision.** Update the [Decision Log](00-project/decision-log.md) first. Then update every document listed under that decision's "Docs affected".

**Diagrams** are Mermaid, written inside the Markdown files. GitHub renders them.

## Document index

Status key: **Draft** = written, awaiting review · **Planned** = not yet written · **Final** = approved · **Frozen** = kept as a record, never edited.

| Document | Purpose | Status |
|---|---|---|
| **Design record** | | |
| [Design Spec v0.2](superpowers/specs/2026-10-21-kasoundbox-design.md) | The approved design from brainstorming | Frozen |
| [Discovery Brief](00-project/discovery-brief.md) | Round 1 analysis | Superseded (history only) |
| **00 — Project (batch 1)** | | |
| [Project Status](00-project/project-status.md) | Done, pending tasks, and all open questions | Draft |
| [Project Charter](00-project/project-charter.md) | Why we're building this, scope, stakeholders, constraints, phases | Draft |
| [Glossary](00-project/glossary.md) | Plain meaning of every term | Draft |
| [Decision Log](00-project/decision-log.md) | Decisions D-01–D-24 and open items O-01–O-11 | Draft |
| **01 — Requirements (batch 1)** | | |
| [Roles and Permissions](01-requirements/roles-and-permissions.md) | Who can do what | Draft |
| [Business Rules](01-requirements/business-rules.md) | Capacity, holds, limits, blocks, calendar (BR-01–BR-12) | Draft |
| [Functional Requirements](01-requirements/functional-requirements.md) | What the system must do, with acceptance criteria | Draft |
| [Non-Functional Requirements](01-requirements/non-functional-requirements.md) | Cost, hosting, security, privacy, mobile, backups, maintenance | Draft |
| [Edge Cases](01-requirements/edge-cases.md) | Unusual situations and how the system behaves | Draft |
| [Privacy and Retention](01-requirements/privacy-and-retention.md) | Data Privacy Act duties, retention schedule, acknowledgment wording | Draft |
| **02 — Domain (batch 1)** | | |
| [Reservation Lifecycle](02-domain/reservation-lifecycle.md) | Statuses, transitions, deadlines, admin actions | Draft |
| [Catalog and Payments](02-domain/catalog-and-payments.md) | Packages, add-ons, prices, payments ledger, acknowledgments | Draft |
| **03 — Workflows (batch 2)** | | |
| [Process Overview](03-workflows/overview.md) | The whole process on one page | Draft |
| [Booking and Submission](03-workflows/booking-and-submission.md) | WF-01 browse and submit, WF-02 reference code and QR | Draft |
| [Availability and Conflicts](03-workflows/availability-and-conflicts.md) | WF-05 availability and conflict prevention | Draft |
| [Lookup and Review](03-workflows/lookup-and-review.md) | WF-03 scan/search, WF-04 review and decisions | Draft |
| [Changes and Expiry](03-workflows/changes-and-expiry.md) | WF-06 cancel, reschedule, extend, edit, expire, payments | Draft |
| [Notifications and Tracking](03-workflows/notifications-and-tracking.md) | WF-07 emails, status page, proof upload | Draft |
| [Administration](03-workflows/administration.md) | WF-08 catalog and settings, WF-09 login and roles, WF-10 audit and retention | Draft |
| **04 — Design (batch 3)** | | |
| [UX and Sitemap](04-design/ux-and-sitemap.md) | Sitemap, page inventory, screens, UI conventions | Draft |
| **05 — Technical (batch 3)** | | |
| [Architecture](05-technical/architecture.md) | Components, stack versions, request flows, CI, portability | Draft |
| [Data Model](05-technical/data-model.md) | ERD, tables, constraints, roles, settings keys | Draft |
| [API Specification](05-technical/api-specification.md) | Server actions, routes, database functions, result codes | Draft |
| [Security](05-technical/security.md) | Threat model and controls | Draft |
| **06 — Delivery (batch 4)** | | |
| [Roadmap](06-delivery/roadmap.md) | Phases, milestones, MVP backlog, gates | Draft |
| [Test Plan](06-delivery/test-plan.md) | 262 test cases, UAT, traceability | Draft |
| **07 — Operations (batch 4)** | | |
| [Deployment and Operations](07-operations/deployment-and-operations.md) | Setup, deploy, backup/restore, monitoring, incident runbooks | Draft |
| [Staff Guide](07-operations/staff-guide.md) | 27 step-by-step admin procedures | Draft |
