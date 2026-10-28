# BSA Lifecycle: Phases with IDs

Last updated: 2026-10-28
Source: research/Deep Research/chatgpt-research.md, sections 2 to 26. Phase names and content are from that document. The PH IDs are assigned here so other files can reference them.

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

## Note on ordering

The spec deliberately runs impact analysis (PH-08) before the discovery session (PH-02), which inverts this document's order. Reason in design spec section 6b: the tool generates the questions before the analyst walks into the room. The phase IDs keep the source document's numbering so the two can be compared.
