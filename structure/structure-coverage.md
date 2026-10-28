# Structure Coverage Register

Last updated: 2026-10-28
Owner: Structure agent, `agents/structure/structure.md`
Source: `research/Deep Research/chatgpt-research.md`. Phase IDs from `structure/bsa-lifecycle-phases.md`. Feature IDs from `traceability.md`.

Every step, output and checkpoint in the source gets a row here. A row with no status is the one thing this file must never contain.

Statuses are the Structure agent's assessment, not decisions. Alireza can overrule any of them. Gaps are reported, never filled: each one waits for a decision.

ID scheme: `ST-<phase>-<item>`. Steps keep the source numbering. Outputs are O1, O2 in source order. The checkpoint is C.

## Progress

| Phase | Items | Covered | Partial | Gap | Out of scope | Run |
|---|---|---|---|---|---|---|
| PH-01 Initiation and preparation | 25 | 6 | 12 | 6 | 1 | 2026-10-28 |
| PH-02 to PH-25 | - | - | - | - | - | Not yet run |

---

## PH-01 Initiation and preparation

Source section 2.

### Steps

| ID | Source step | Status | Where, or what is missing |
|---|---|---|---|
| ST-01-01 | Receive the assignment: who assigned the work | Gap | Intake names a sponsor but not who assigned the work. Not the same person |
| ST-01-02 | Clarify the request: what triggered it. Customer problem, regulatory change, operational inefficiency, system replacement, new product, audit finding, or defect | Covered | F-35, accepted by Alireza 2026-10-28. Not yet built: lands in P4 intake |
| ST-01-03 | Identify the sponsor | Covered | Intake exit condition "sponsor named", design spec 6b. Enforced by F-19 |
| ST-01-04 | Identify the product or system owner | Partial | The `owns` edge (Role to any node) holds system ownership in the model, F-01. Intake does not ask for it, so an unowned system is caught only by the Quality Gate Control "no owner" check |
| ST-01-05 | Review the intake material: request, charter, ticket, email, incident report, enhancement request, regulatory notice | Partial | A regulatory notice is uploaded in mandate mode, F-07 and F-08. No other kind of intake material can be attached to a request |
| ST-01-06 | Understand the urgency: requested deadline, why it matters, genuine regulatory deadline versus preferred business target | Gap | F-26 dates business rules, not requests. A request has no deadline, no reason for it, and no flag separating a regulatory date from a preferred one |
| ST-01-07 | Identify the affected business area | Covered | Touched nodes tagged at intake (design spec 6b) sit in department lanes, F-01 and F-22 |
| ST-01-08 | Identify potentially affected systems | Covered | F-09 impact traversal |
| ST-01-09 | Review existing documentation | Partial | F-02 ingests documents into the model at onboarding. There is no step for reviewing documents for a specific request |
| ST-01-10 | Review existing work: backlog, repository, Jira, Confluence, decision logs, previous initiatives | Partial | F-05 searches the graph and request history. Jira and Confluence are excluded for now by design spec section 9 |
| ST-01-11 | Understand the current environment: in production, migrating, being configured, or built from scratch | Partial | The Environment node type exists, F-01. Nothing records which of those four states a system is in |
| ST-01-12 | Identify known constraints: budget, dates, vendor limits, regulation, architecture standards, privacy, security, capacity | Gap | The taxonomy has Risk, Assumption, Issue and Dependency but no Constraint node type. F-28 RAID does not cover constraints |
| ST-01-13 | Identify initial stakeholders | Partial | Design spec section 8 lists a stakeholder map and RACI as an artifact derivable from the model, but no feature in traceability.md produces it |
| ST-01-14 | Identify missing information: assumptions, unknowns, conflicting statements, open questions | Partial | Assumptions via F-28, open questions via F-11. Conflicting statements between stakeholders have nowhere to go |
| ST-01-15 | Establish the BSA's role | Gap | Nothing records what the analyst owns on a request. May not apply while v1 is a solo user. Alireza's call |
| ST-01-16 | Agree on working arrangements: methodology, repository, channels, decision-makers, review process | Gap | Decision-makers partly exist as Roles with `approves` edges. Methodology, channels and review process are not modelled |
| ST-01-17 | Define an initial understanding of scope, marking anything unconfirmed | Partial | F-30 states out of scope explicitly, but only in generated documents. Nothing captures initial scope at intake, or marks it unconfirmed |
| ST-01-18 | Prepare the discovery approach: who to interview, which workshops, which documents and systems | Partial | F-11 generates the discovery questions in advance. Choosing interviewees, workshops and documents is not supported |

### Outputs

| ID | Source output | Status | Where, or what is missing |
|---|---|---|---|
| ST-01-O1 | Initial problem or opportunity statement | Partial | F-06 captures a problem as a Symptom. An opportunity, such as a new product (one of the F-35 triggers), has no symptom and nowhere to go |
| ST-01-O2 | Stakeholder list and preliminary RACI | Partial | Same as ST-01-13 |
| ST-01-O3 | Initial scope and constraints | Gap | Same as ST-01-12 and ST-01-17 |
| ST-01-O4 | Document and system inventory | Partial | Systems are nodes in the model, F-01. Nothing says documents uploaded through F-02 are kept and listed after extraction |
| ST-01-O5 | Preliminary risks, assumptions, dependencies and open questions | Covered | F-28 RAID and F-11 |
| ST-01-O6 | Discovery agenda and meeting invitations | Out of scope | Invitations are notifications, and v1 has none: design spec section 3, solo user. The agenda part is the F-11 question list |

### Checkpoint

| ID | Source checkpoint | Status | Where |
|---|---|---|---|
| ST-01-C | Can you explain why the initiative exists, who owns the outcome, which systems may be affected, and what you still need to learn? | Covered | This is the intake exit condition. Why: F-35 and F-06. Owner: sponsor named. Systems: F-09. Still to learn: F-11 |

### Decisions needed from PH-01

1. **ST-01-12 Constraints.** Add a Constraint node type to the taxonomy, or hold constraints another way?
2. **ST-01-06 Urgency.** Capture a deadline and its reason at intake, with a flag for regulatory versus preferred?
3. **ST-01-O1 Opportunities.** A new-product request has no symptom. What does intake capture instead?
4. **ST-01-01 Assigner.** Record who assigned the work, separately from the sponsor?
5. **ST-01-14 Conflicting statements.** Give them a home, for example as an Issue subtype?
6. **ST-01-15 and ST-01-16, role and working arrangements.** In scope for a solo v1, or Out of scope with a reason?

---

## PH-02 to PH-25

Not yet run. The Structure agent runs each phase before the roadmap phase that touches it.

Known limit: source section 29 arrived incomplete. Only its Discovery items came through, so the rest of that section cannot be registered until it is received.
