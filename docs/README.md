# DJB Kasoundbox — Reservation System Documentation

Source of truth for planning the Videoke Reservation and Party Needs Management System: a public customer website and a private admin panel.

> **Current stage:** Design. Start with the [Design Spec](superpowers/specs/2026-10-21-kasoundbox-design.md), which is the current source of truth. The index below is the planned documentation set; it will be revised after the spec is approved.

## Conventions

**Labels** — every requirement or statement is tagged with one of:

| Label | Meaning |
|---|---|
| **[C] Confirmed** | Stated by DJB Kasoundbox |
| **[P] Proposed** | Recommendation; needs approval |
| **[A] Assumption** | Treated as true for now; must be confirmed |
| **[O] Open** | Decision required |

**IDs** — used to link documents, implementation tasks, and tests:

| Prefix | Item | Defined in |
|---|---|---|
| `D-xx` | Decision | `00-project/decision-log.md` |
| `Q-xx` | Open question | `00-project/decision-log.md` |
| `FR-xx` | Functional requirement | `01-requirements/functional-requirements.md` |
| `NFR-xx` | Non-functional requirement | `01-requirements/non-functional-requirements.md` |
| `BR-xx` | Business rule | `01-requirements/business-rules.md` |
| `EC-xx` | Edge case | `01-requirements/edge-cases.md` |
| `WF-xx` | Workflow | `03-workflows/*.md` |
| `TC-xx` | Test case | `06-delivery/test-plan.md` |

**Single sources** — statuses are defined only in `reservation-lifecycle.md`, permissions only in `roles-and-permissions.md`, rules only in `business-rules.md`. Other documents link to them instead of restating them.

**Changing a decision** — update `decision-log.md` first, then every document listed in that decision's "Documents affected" column.

**Diagrams** — Mermaid inside Markdown (rendered by GitHub).

## Document index

Status: **Draft** = written, under review · **Planned** = not yet written · **Final** = approved.

| Document | Purpose | Status |
|---|---|---|
| **00 — Project** | | |
| [Design Spec](superpowers/specs/2026-10-21-kasoundbox-design.md) | Approved design from brainstorming: rules, lifecycle, stack, security, testing | Draft (owner review) |
| [Discovery Brief](00-project/discovery-brief.md) | Round 1 analysis (history only) | Superseded |
| [Project Charter](00-project/project-charter.md) | Goals, stakeholders, scope, MVP vs later | Planned |
| [Glossary](00-project/glossary.md) | Canonical terms and status names | Planned |
| [Decision Log](00-project/decision-log.md) | Decisions, open questions, assumptions | Planned |
| **01 — Requirements** | | |
| [Roles and Permissions](01-requirements/roles-and-permissions.md) | Roles and permission matrix | Planned |
| [Functional Requirements](01-requirements/functional-requirements.md) | FR-xx with MVP flag and acceptance criteria | Planned |
| [Non-Functional Requirements](01-requirements/non-functional-requirements.md) | Performance, security, privacy, devices | Planned |
| [Business Rules](01-requirements/business-rules.md) | BR-xx rules with examples | Planned |
| [Edge Cases](01-requirements/edge-cases.md) | Scenario → expected behavior → rule → test | Planned |
| **02 — Domain** | | |
| [Reservation Lifecycle](02-domain/reservation-lifecycle.md) | Statuses, state diagram, transitions | Planned |
| [Catalog and Pricing](02-domain/catalog-and-pricing.md) | Packages, add-ons, price calculation | Planned |
| **03 — Workflows** | | |
| [Booking and Submission](03-workflows/booking-and-submission.md) | WF-01, WF-02 | Planned |
| [Availability and Conflicts](03-workflows/availability-and-conflicts.md) | WF-05 | Planned |
| [Lookup and Review](03-workflows/lookup-and-review.md) | WF-03, WF-04 | Planned |
| [Changes and Expiry](03-workflows/changes-and-expiry.md) | WF-06 | Planned |
| [Notifications and Tracking](03-workflows/notifications-and-tracking.md) | WF-07 | Planned |
| [Administration](03-workflows/administration.md) | WF-08, WF-09, WF-10 | Planned |
| **04 — Design** | | |
| [UX and Sitemap](04-design/ux-and-sitemap.md) | Sitemap, page inventory, layout guidelines | Planned |
| **05 — Technical** | | |
| [Architecture](05-technical/architecture.md) | Stack evaluation, components, hosting | Planned |
| [Data Model](05-technical/data-model.md) | ERD, tables, constraints | Planned |
| [API Specification](05-technical/api-specification.md) | Public and admin endpoints | Planned |
| [Security](05-technical/security.md) | Threats and controls | Planned |
| **06 — Delivery** | | |
| [Roadmap](06-delivery/roadmap.md) | Phases, milestones, MVP backlog | Planned |
| [Test Plan](06-delivery/test-plan.md) | Test cases, UAT, traceability | Planned |
| **07 — Operations** | | |
| [Deployment and Operations](07-operations/deployment-and-operations.md) | Deploy, backup/restore, monitoring | Planned |
| [Staff Guide](07-operations/staff-guide.md) | Staff procedures in the admin panel | Planned |
