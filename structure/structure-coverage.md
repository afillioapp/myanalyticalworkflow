# Structure Coverage Register

Last updated: 2026-10-28
Owner: Structure agent, `agents/structure/structure.md`
Sources: `research/Deep Research/chatgpt-research.md` (the guide, steps and outputs), and `research/Deep Research/bsa-stage-outcomes.md` (an outcome and a question set per stage). Phase IDs and phase outcomes from `structure/bsa-lifecycle-phases.md`. Feature IDs from `traceability.md`.

Every step, output and checkpoint in the guide gets a row here, and every row names its **outcome**: what exists once the step is done (rule 16). A row with no status or no outcome is the one thing this file must never contain.

**Covered means the app records the outcome**, not merely that a related feature exists.

Statuses are the Structure agent's assessment, not decisions. Alireza can overrule any of them. Gaps are reported, never filled: each one waits for a decision.

ID scheme: `ST-<phase>-<item>`. Steps keep the guide's numbering. Outputs are O1, O2 in the guide's order. The checkpoint is C.

## Progress

| Phase | Items | Covered | Partial | Gap | Out of scope | Run |
|---|---|---|---|---|---|---|
| PH-01 Initiation and preparation | 25 | 6 | 12 | 6 | 1 | 2026-10-28 |
| PH-02 to PH-25 | - | - | - | - | - | Not yet run |

---

## Phase outcomes in v1 scope

Does the app record each phase's outcome? Outcomes from `structure/bsa-lifecycle-phases.md`. Phases outside v1 are not assessed until they come into scope.

| Phase | Outcome | Status | Where, or what is missing |
|---|---|---|---|
| PH-01 | Problem statement, stakeholder list | Partial | A problem is a Symptom, F-06. An opportunity with no symptom has nowhere to go. No feature produces the stakeholder list |
| PH-02 | Discovery notes, current-state facts | Partial | Answers to F-11 questions update the model, which holds the facts. Discovery notes are not stored as such |
| PH-03 | Validated problem statement | Covered | F-06 keeps the cause a hypothesis until Evidence nodes support it |
| PH-04 | Agreed scope, success metrics | Partial | F-29 records success measures with a baseline. Agreed scope is an artifact in design spec section 8 with no F ID |
| PH-05 | Not stated | Gap | No outcome is defined for this phase. Decision needed |
| PH-06 | AS-IS and TO-BE process flowcharts | Covered | F-01 as-is, F-13 to-be, F-25 the diff shown in place |
| PH-07 | Recommended approach | Covered | F-12. The Options gate needs one option recommended, design spec 6b |
| PH-08 | Impact assessment | Covered | F-09 traversal, F-10 coverage indicator |
| PH-09 | Data mapping | Partial | DataField nodes and the 4c question set exist. How a mapping is represented is still open: design spec section 4c modelling note |
| PH-10 | Interface spec | Partial | The Integration node's 4c attributes cover the content. No document produces the spec |
| PH-11 | Written requirements | Covered | F-15 generated documents, F-16 requirements as objects |
| PH-12 | Not stated | Gap | No outcome is defined for this phase. Decision needed |
| PH-15 | Traceability chain | Covered | F-17 |
| PH-17 | Test evidence | Partial | Test scenarios are generated (design spec section 8). Test evidence comes after v1's end point |
| PH-25 | Not stated | Gap | No outcome is defined. F-21 write-back is the nearest v1 feature. Decision needed |

---

## PH-01 Initiation and preparation

Guide section 2. Phase outcome: problem statement, stakeholder list. Questions: Q1.

### Steps

| ID | Guide step | Outcome when done | Status | Where, or what is missing |
|---|---|---|---|---|
| ST-01-01 | Receive the assignment | Who assigned the work is known | Gap | Intake names a sponsor but not who assigned the work. Not the same person |
| ST-01-02 | Clarify the request: what triggered it | The trigger is recorded: customer problem, regulatory change, operational inefficiency, system replacement, new product, audit finding, or defect | Covered | F-35, accepted by Alireza 2026-10-28. Not yet built: lands in P4 intake |
| ST-01-03 | Identify the sponsor | A named sponsor who owns the outcome | Covered | Intake exit condition "sponsor named", design spec 6b. Enforced by F-19 |
| ST-01-04 | Identify the product or system owner | Each affected system has a named owner | Partial | The `owns` edge holds ownership in the model, F-01. Intake does not ask for it. An unowned system is caught only by the Quality Gate Control "no owner" check |
| ST-01-05 | Review the intake material | The intake material is attached to the request | Partial | A regulatory notice is uploaded in mandate mode, F-07 and F-08. No other kind of intake material can be attached |
| ST-01-06 | Understand the urgency | A deadline, the reason for it, and whether it is regulatory or preferred | Gap | F-26 dates business rules, not requests. A request has no deadline, reason or flag |
| ST-01-07 | Identify the affected business area | Affected departments are known | Covered | Touched nodes tagged at intake sit in department lanes, F-01 and F-22 |
| ST-01-08 | Identify potentially affected systems | A list of systems possibly affected | Covered | F-09 impact traversal |
| ST-01-09 | Review existing documentation | The relevant existing documents are listed | Partial | F-02 ingests documents at onboarding. No per-request review step |
| ST-01-10 | Review existing work | Related prior requirements, decisions and open issues are found | Partial | F-05 searches the graph and request history. Jira and Confluence are excluded by design spec section 9 |
| ST-01-11 | Understand the current environment | Each system's state is known: in production, migrating, being configured, or built from scratch | Partial | The Environment node type exists, F-01. Nothing records which of the four states a system is in |
| ST-01-12 | Identify known constraints | A list of constraints: budget, dates, vendor, regulation, architecture, privacy, security, capacity | Gap | No Constraint node type. F-28 RAID does not cover constraints |
| ST-01-13 | Identify initial stakeholders | A stakeholder list | Partial | Design spec section 8 lists a stakeholder map and RACI as derivable, but no feature produces it |
| ST-01-14 | Identify missing information | Assumptions, unknowns, conflicts and open questions are recorded | Partial | Assumptions via F-28, questions via F-11. Conflicting statements have nowhere to go |
| ST-01-15 | Establish the BSA's role | What the analyst owns on this request | Gap | Not recorded. May not apply while v1 is a solo user. Alireza's call |
| ST-01-16 | Agree on working arrangements | Methodology, repository, channels, decision-makers and review process are agreed | Gap | Decision-makers partly exist as Roles with `approves` edges. The rest is not modelled |
| ST-01-17 | Define an initial understanding of scope | Initial in and out of scope, with unconfirmed items marked | Partial | F-30 states out of scope explicitly, but only in generated documents. Nothing at intake |
| ST-01-18 | Prepare the discovery approach | Who to interview, which workshops, which documents and systems | Partial | F-11 generates the questions in advance. Choosing interviewees, workshops and documents is not supported |

### Outputs

| ID | Guide output | Status | Where, or what is missing |
|---|---|---|---|
| ST-01-O1 | Initial problem or opportunity statement | Partial | F-06 captures a problem as a Symptom. An opportunity, such as a new product (one of the F-35 triggers), has no symptom and nowhere to go |
| ST-01-O2 | Stakeholder list and preliminary RACI | Partial | Same as ST-01-13 |
| ST-01-O3 | Initial scope and constraints | Gap | Same as ST-01-12 and ST-01-17 |
| ST-01-O4 | Document and system inventory | Partial | Systems are nodes in the model, F-01. Nothing says documents uploaded through F-02 are kept and listed after extraction |
| ST-01-O5 | Preliminary risks, assumptions, dependencies and open questions | Covered | F-28 RAID and F-11 |
| ST-01-O6 | Discovery agenda and meeting invitations | Out of scope | Invitations are notifications, and v1 has none: design spec section 3, solo user. The agenda part is the F-11 question list |

For outputs, the output is itself the outcome, so there is no separate outcome column.

### Checkpoint

| ID | Guide checkpoint | Status | Where |
|---|---|---|---|
| ST-01-C | Can you explain why the initiative exists, who owns the outcome, which systems may be affected, and what you still need to learn? | Covered | This is the intake exit condition. Why: F-35 and F-06. Owner: sponsor named. Systems: F-09. Still to learn: F-11 |

### Decisions needed from PH-01

1. **ST-01-12 Constraints.** Add a Constraint node type to the taxonomy, or hold constraints another way?
2. **ST-01-06 Urgency.** Capture a deadline and its reason at intake, with a flag for regulatory versus preferred?
3. **ST-01-O1 Opportunities.** A new-product request has no symptom. What does intake capture instead?
4. **ST-01-01 Assigner.** Record who assigned the work, separately from the sponsor?
5. **ST-01-14 Conflicting statements.** Give them a home, for example as an Issue subtype?
6. **ST-01-15 and ST-01-16, role and working arrangements.** In scope for a solo v1, or Out of scope with a reason?

### Decisions needed from phase outcomes

7. **PH-05, PH-12, PH-25.** Neither source states an outcome for these phases. What does each one produce?
8. **PH-21 and PH-23.** Outside v1. Record an outcome now, or when they come into scope?

---

## PH-02 to PH-25

Not yet run at step level. The Structure agent runs each phase before the roadmap phase that touches it.

Known limit: guide section 29 arrived incomplete. Only its Discovery items came through, so the rest of that section cannot be registered until it is received.
