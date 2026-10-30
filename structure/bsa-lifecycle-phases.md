# BSA Lifecycle: Phases with IDs

Last updated: 2026-10-28
Source: research/Deep Research/chatgpt-research.md, sections 2 to 26. Phase names and content are from that document. Phase outcomes are from research/Deep Research/bsa-stage-outcomes.md. The PH IDs are assigned here so other files can reference them.

Use these IDs everywhere. A pain point says which phase it occurs in. A feature says which phase it serves. That is what makes the matrix in traceability.md work.

The steps inside each phase have their own IDs, in `structure/structure-coverage.md`. ST-01-02 is PH-01, step 2. That register records whether the app covers each step, and is owned by the Structure agent.

## The eleven stages

| Stage | Covers |
|---|---|
| S1 Initiation and preparation | PH-01 |
| S2 Discovery and elicitation | PH-02, PH-05 |
| S3 Analysis and problem definition | PH-03, PH-04 |
| S4 Solution assessment and design | PH-06, PH-07, PH-08, PH-09, PH-10 |
| S5 Requirements and documentation | PH-11, PH-12 |
| S6 Backlog and delivery planning | PH-13, PH-14 |
| S7 Refinement and solution validation | PH-14, PH-15 |
| S8 Build and implementation support | PH-16 |
| S9 Testing and defect management | PH-17, PH-18, PH-19, PH-20, PH-21 |
| S10 Release and deployment | PH-22, PH-23 |
| S11 Post-release validation | PH-24, PH-25 |

## The twenty-five phases

| ID | Phase | Core job | In v1 scope |
|---|---|---|---|
| PH-01 | Initiation and preparation | Understand the initiative before asking anyone for requirements | Yes |
| PH-02 | Early discovery session | Establish the actual problem before discussing solutions | Yes |
| PH-03 | Post-discovery analysis and validation | Turn notes into evidence-based understanding | Yes |
| PH-04 | Scope, objectives and success criteria | Define what the initiative must deliver and how success is measured | Yes |
| PH-05 | Stakeholder analysis and requirements elicitation | Close information gaps through the right people | Yes |
| PH-06 | Current-state and future-state process modelling | Make the work visible so the change is identifiable | Yes |
| PH-07 | Solution options and feasibility analysis | Compare real options before specifying one | Yes |
| PH-08 | System analysis and impact assessment | Trace what else changes because this changes | Yes |
| PH-09 | Data analysis and mapping | Define every data element, source and transformation | Yes |
| PH-10 | Integration and API analysis | Define the expected interaction, not just "an API is needed" | Yes |
| PH-11 | Requirements engineering | Define what the solution must do and the conditions it satisfies | Yes |
| PH-12 | UX, screens and interaction requirements | Make the design carry the business rules and constraints | Partial |
| PH-13 | Create the delivery backlog | Translate requirements into testable increments | No |
| PH-14 | Backlog refinement and estimation | Confirm shared understanding before build | No |
| PH-15 | Requirements traceability and change control | Connect business need to delivered solution | Yes |
| PH-16 | Build and implementation support | Keep intent and implementation aligned | No |
| PH-17 | Testing preparation and test design | Establish how requirements will be verified | Partial |
| PH-18 | System integration testing | Verify the integrated systems work together | No |
| PH-19 | Defect management | Track unexpected behaviour to resolution | No |
| PH-20 | User acceptance testing | Confirm the solution supports the business process | No |
| PH-21 | Non-functional validation and regression | Verify the solution is safe to release | No |
| PH-22 | Release readiness and deployment planning | Confirm the organisation can operate it | No |
| PH-23 | Production deployment and go-live support | Get it live and verified | No |
| PH-24 | Post-release monitoring and validation | Verify production behaviour and business outcome | No |
| PH-25 | Documentation, handover and closure | Let the organisation maintain it without the project team | Partial |

"In v1 scope" follows the locked decision that the lifecycle ends at approved documents and sign off. PH-13 onward sit outside it. They are listed anyway, because the model has to be able to represent them later and because PH-15 and PH-24 both reach back into v1.

## Every phase has an outcome

Rule 16, stated by Alireza 2026-10-28. A phase is done when its outcome exists, not when its activities have been performed. The questions are how the outcome is reached. The outcome is how the gate knows the phase is finished.

Sources: `research/Deep Research/bsa-stage-outcomes.md`. Part 1 gives an output per stage. Part 2 gives the questions per stage, numbered Q1 to Q10 below. The stage-to-phase mapping is an assessment made here, open to correction.

| ID | Outcome | Questions that produce it | Source |
|---|---|---|---|
| PH-01 | Problem statement, stakeholder list | Q1 | Part 1 Initiation. Also the guide's section 2 outputs and checkpoint |
| PH-02 | Discovery notes, current-state facts | Q1 | Part 1 Discovery. Also the guide's section 3 outputs |
| PH-03 | Validated problem statement | None mapped | Part 1 Analysis. Also the guide's section 4 key deliverable |
| PH-04 | Agreed scope, success metrics | None mapped | Part 1 Scope and success criteria |
| PH-05 | **Not stated in either source** | None mapped | Decision needed |
| PH-06 | Process flowcharts, AS-IS and TO-BE | Q2 | Part 1 Process modelling |
| PH-07 | Recommended approach | None mapped | Part 1 Solution options |
| PH-08 | Impact assessment | Q3 | Part 1 System and impact analysis |
| PH-09 | Data mapping | Q3, the data part | Part 1 Data analysis |
| PH-10 | Interface spec | Q3, the integrations part | Part 1 Integration analysis |
| PH-11 | Written requirements | Q4 | Part 1 Requirements |
| PH-12 | **Not stated in either source** | None mapped | Decision needed |
| PH-13 | Backlog of stories with acceptance criteria | Q5 | Part 1 Backlog. Source says "Jira backlog" |
| PH-14 | "Ready" stories | Q5 | Part 1 Refinement |
| PH-15 | Traceability chain | None mapped | Part 1 Traceability |
| PH-16 | Aligned implementation | Q6 | Part 1 Build support |
| PH-17 | Test evidence | Q7 | Part 1 Testing |
| PH-18 | Test evidence | Q7 | Part 1 Testing |
| PH-19 | Defect log | None mapped | Part 1 Testing |
| PH-20 | Business acceptance | Q8 | Part 1 UAT |
| PH-21 | **Not stated.** Q7 asks only whether regression scenarios were tested | Q7, the regression part | Partial. Decision needed |
| PH-22 | Release decision | Q9 | Part 1 Release |
| PH-23 | **Not stated.** Q10 asks whether it works in production | Q10 | Partial. Decision needed |
| PH-24 | Validated outcome, measured against the baseline | Q10 | Part 1 Post-release |
| PH-25 | **Not stated in either source** | None mapped | Decision needed |

**The 5 questions that apply at any phase**, from Part 2: What should happen? What happens today? What needs to change, and why? How do we prove it works? What could go wrong?

**The two tools that run across every phase**, from Part 1: AS-IS and TO-BE diagrams, and the traceability chain. In the app these are F-13, F-14 and F-25, and F-17.

Whether the app actually records each outcome is tracked per phase in `structure/structure-coverage.md`.

## Note on ordering

The spec deliberately runs impact analysis (PH-08) before the discovery session (PH-02), which inverts this document's order. Reason in design spec section 6b: the tool generates the questions before the analyst walks into the room. The phase IDs keep the source document's numbering so the two can be compared.
