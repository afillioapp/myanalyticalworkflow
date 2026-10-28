# Traceability: Feature to Pain Point to Phase to Area

Last updated: 2026-10-28

This is the file that answers the question: which feature addresses which pain point, in which part of the app, and how.

It is deliberately the same pattern the product itself uses. Features are objects with IDs, pain points are objects with IDs, and this is the matrix. If a feature has no pain point, it needs justifying or cutting. If a pain point has no feature, it is unaddressed and that should be a deliberate choice.

References: PP from pain-points/pain-points.md. PH from structure/bsa-lifecycle-phases.md. ST from structure/structure-coverage.md. Design detail in bsa-tool-design-spec.md.

The structure coverage register is the reverse view of this file. This file asks which pain point each feature answers. The register asks whether every step of the BSA process has a feature. Owned by the Structure agent, `agents/structure/structure.md`.

## App areas

| Area | What it is |
|---|---|
| MODEL | The company model, Part 1 |
| INTAKE | Request capture |
| IMPACT | Impact traversal and questions |
| DISCOVERY | The session support layer |
| OPTIONS | Solution options and branching |
| TOBE | Target-state editing |
| GAP | Computed diff |
| DOCS | Generated artifacts |
| TRACE | Traceability and decision log |
| SIGNOFF | Approval and write-back |
| UI | The graph and visual layer |
| OVERVIEW | Cross-request landing surface |
| ANALYTICS | Metrics on the analysis work |
| PLATFORM | Architecture, storage, export |

## The matrix

| Feature | Area | Phase | Pain points | How it addresses them |
|---|---|---|---|---|
| F-01 Company model graph | MODEL | PH-06, PH-08 | PP-18, PP-23 | One live model instead of static diagrams. Workarounds and real behaviour are nodes, not omissions |
| F-02 Document ingest and AI extraction | MODEL | PH-01, PH-06 | PP-17, PP-22 | Removes the days-or-weeks cost of building the first model by hand |
| F-03 Guided interview, gap-driven | MODEL | PH-01, PH-05 | PP-22, PP-03 | Asks only for what is missing, so nobody documents stable things for completeness |
| F-04 Node confidence and freshness | MODEL | PH-03 | PP-12, PP-20, PP-29 | Shows what was verified versus assumed, so the coverage signal cannot lie |
| F-05 Prior-work check at intake | INTAKE | PH-01 | PP-32 | Queries the graph and request history for related requirements and prior decisions before work starts |
| F-06 Symptom, cause, evidence, solution captured separately | INTAKE | PH-02, PH-03 | PP-28, PP-29 | Stops the three collapsing into "the ask". Cause stays a hypothesis until evidence supports it |
| F-07 Two intake modes: request and mandate | INTAKE | PH-01 | PP-37 | A regulation is an input with obligations to derive, not a feature request |
| F-08 Obligation extraction and mapping | INTAKE | PH-01, PH-08 | PP-37, PP-34 | Each legal duty becomes a node that must trace to a requirement |
| F-09 Impact traversal | IMPACT | PH-08 | PP-15, PP-16 | Traces what else changes, automatically, from the graph |
| F-10 Coverage indicator | IMPACT | PH-08, PH-15 | PP-30, PP-16 | Impacted nodes not yet addressed are countable, so nothing is silently skipped |
| F-11 Structure-derived question engine | IMPACT, DISCOVERY | PH-02, PH-09, PH-10 | PP-03, PP-30, PP-01, PP-25 | The graph supplies the questions. The analyst arrives with them instead of leaving the session having missed three |
| F-12 Solution options and branching | OPTIONS | PH-07 | PP-28 | Forces more than one option, so the requested solution competes rather than wins by default |
| F-13 To-be branch editing | TOBE | PH-06 | PP-17, PP-19 | Edits an existing model rather than redrawing a diagram |
| F-14 Computed gap analysis | GAP | PH-06, PH-08 | PP-17, PP-19 | The diff is calculated, so it cannot be out of date relative to the two states |
| F-15 Generated documents | DOCS | PH-11 | PP-01, PP-26 | Removes the transcription work. The differentiator becomes the analysis, not the typing |
| F-16 Requirements as objects with IDs | DOCS, PLATFORM | PH-11, PH-15 | PP-12, PP-14 | Addressable requirements, real hierarchy, and trace links to text rather than to numbers |
| F-17 Traceability as byproduct | TRACE | PH-15 | PP-11, PP-13, PP-15 | Shared node IDs mean no matrix to maintain and no links to fall out of sync |
| F-18 Decision log | TRACE | PH-15, PH-16 | PP-02, PP-32 | Records what was decided and why, so the same ground is not re-argued |
| F-19 Phase rail with gates | ALL | All | PP-30, PP-10, PP-16 | Each phase has an exit condition. The next action does not unlock until it is met |
| F-20 Teaching panels | ALL | All | PP-05, PP-07 | Explains why each phase exists and what gets missed there |
| F-21 Write-back loop on sign-off | SIGNOFF | PH-25 | PP-20, PP-21, PP-23 | The model is maintained as a side effect of shipped work. This is the answer to the staleness problem |
| F-22 Deterministic swimlane graph | UI | PH-06 | PP-18, PP-19 | Position carries meaning and the picture is stable, so people build spatial memory of their own business |
| F-23 Select and dim | UI | PH-08 | PP-15 | Impact analysis made visual with no extra interface |
| F-24 Layer toggles and zoom | UI | PH-06, PH-08 | PP-22 | Detail on demand instead of one unreadable mega-diagram |
| F-25 As-is to to-be diff in place | UI, GAP | PH-06 | PP-19 | One diagram changing, not two to compare and keep in sync |
| F-26 Effective-dated business rules | MODEL | PH-11 | PP-34 | The same rule can hold two states by date, which regulatory work requires |
| F-27 Glossary | MODEL | PH-02 | PP-31, PP-36 | One definition per term, shared across departments |
| F-28 RAID | DOCS | PH-03 | PP-29 | Assumptions and open issues are tracked rather than absorbed into prose |
| F-29 Success measures with baseline | INTAKE | PH-04, PH-24 | PP-33, PP-07 | Captured before the change, at four levels, so outcome can later be separated from delivery |
| F-30 Readable document shape | DOCS | PH-11 | PP-08, PP-09, PP-10 | Page one stands alone, rules in tables, numbered IDs, explicit out of scope |
| F-31 Export to Word, PDF, Confluence | PLATFORM | PH-11, PH-25 | PP-09 | The rest of the organisation reads it where they already work |
| F-32 Workaround capture in as-is | MODEL | PH-06 | PP-18 | The model holds how work actually happens, not only the official process |
| F-33 Overview tab | OVERVIEW | All | PP-02 | One place showing every active request, its phase and its next action, so nothing is rediscovered |
| F-34 Analytical tab | ANALYTICS | PH-04, PH-24 | PP-07 | Cycle time, questions caught before build, coverage at sign off. Gives the analyst evidence of their own impact |
| F-35 Request trigger selection | INTAKE | PH-01 | None. Justified by ST-01-02, see below | One question at intake: what triggered this? The analyst picks one of seven: customer problem, regulatory change, operational inefficiency, system replacement, new product, audit finding, defect |

## Unaddressed pain points

Deliberate, with the reason.

| Pain point | Why no feature |
|---|---|
| PP-04 No time with the right people | Organisational, not a tool problem. F-11 reduces the cost of each session but cannot create access |
| PP-06 Unrealistic deadlines | Outside the tool's authority |
| PP-13 partially | F-17 removes the matrix maintenance burden but not the volume of requirements themselves |
| PP-24 Analysis paralysis | Addressed structurally rather than by a feature: the model is only ever built in service of a live request |
| PP-27 | A statistic, not a pain point a feature can fix. Kept for the pitch, not the backlog |

## Features with no pain point behind them

A feature with no pain point is justified when it covers a step of the BSA process in the structure register. That is the second valid justification, alongside a pain point ID.

| Feature | Justification |
|---|---|
| F-35 Request trigger selection | ST-01-02. The source makes establishing the trigger the second step of initiation. Proposed by Alireza 2026-10-28 while reading PH-01 |

Any other feature that can name neither a pain point ID nor an ST ID needs justifying or cutting.

## How to use this file

1. New pain point found: add it to pain-points/pain-points.md with a source, then check whether any feature covers it.
2. New feature proposed: it must name at least one PP ID or ST ID here, or go in the unjustified list. Then the Structure agent updates any register rows it covers.
3. Build prioritisation: count pain points per feature, weighted by how well evidenced each one is. F-21, F-11 and F-17 carry the most weight on that basis.
4. Pitching: the pain point IDs give every claim a citation, which matters because most published statistics in this space have no source.
