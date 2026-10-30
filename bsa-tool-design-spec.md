# BSA Tool: Design Spec

Status: brainstorm consolidated, pre-build
Last updated: 2026-10-30
Companion file: bsa-practice-brief.md (real-world practice input, separate source)

---

## 1. What it is

A web application that does the job of a Business Systems Analyst end to end.

It has two parts, and they are two different shapes of software.

**Part 1: the company model. A system of record.**
Set up once, maintained forever. Slow changing. One per company. Holds the org, roles, responsibilities, systems, integrations, processes, business rules, data entities and fields, products and coverages, forms, and external parties.

**Part 2: the request lifecycle. A workflow instance.**
One per request, many running at once, each with its own state. Discovery, impact, options, analysis, documents, sign off.

**The loop that makes it compound:** sign off writes back into Part 1. The chosen to-be becomes the new as-is. Process maps update, new rules land in the rule library, new integrations appear in the systems map. Every shipped request makes the company model more accurate, maintained as a side effect of real work instead of as a documentation chore nobody does.

---

## 2. Core principles

1. **No tab holds its own data.** There is one model underneath. Every tab is a view of it or an artifact generated from it.
2. **Nothing is drawn from scratch.** As-is is rendered from the model. To-be is a branch off as-is. Gap analysis is the computed diff. Traceability is a byproduct of shared node IDs, not a document anyone maintains.
3. **Questions come from structure, not from AI guessing.** The model knows what a node has (owner, rule, upstream feed, downstream consumer, error path, SLA, partner dependency), so the tool knows what has not been answered. AI drafts wording. AI does not decide impact.
4. **Completeness is computable.** Twelve nodes impacted, nine addressed, three untouched. You cannot reach sign off with open nodes. This is the single most valuable function in the product, because analysis fails when somebody did not know a question existed.
5. **Position carries meaning.** Not a force-directed cloud. Deterministic layout, every time.
6. **One thing at a time.** The governing product constraint. BSA is a broad job and the analyst is already overwhelmed, so the tool never presents a wall of fields or a backlog of questions. Progressive phased sequences, one decision per step. Full set in DNA/dna.md, which is binding, not advisory.
7. **Honesty about what the model knows.** Every node carries where it came from and whether a human verified it. Without that, the coverage indicator lies, which is worse than no indicator.

---

## 3. Decisions locked

| Decision | Choice |
|---|---|
| Primary user for v1 | Solo BSA, no org buy-in. No permissions, no approval engine, no notifications. Sign off is a recorded state, not a workflow. |
| How the model is seeded | Two paths into the same graph: upload documents and let AI extract a draft, or answer a guided question set. Mixable in either direction. |
| Where the lifecycle ends | Approved documents and sign off. No dev handoff, no UAT tracking in v1. |
| Industry scope | Insurance first, generalize later. Node types can be domain real. |
| Model depth | Down to data field level. Fields and business rules are nodes, not prose. |
| v1 purpose | A tool genuinely used on real work, from which the demo falls out. |
| Build path | Built by the owner with AI doing the coding. Spec must be implementation ready. |
| First build slice | Onboarding plus impact analysis only. |

Consequence of the solo-user choice: roughly 40 percent of a normal enterprise build drops out. Also freeing in a subtler way. The model is a private working picture, so it is allowed to be a best guess. Nobody has to validate it before it is useful.

Consequence of AI-seeded onboarding: **document ingest is the highest risk component in the product.** If the first draft of the company model is wrong or thin, the user quits during onboarding and never sees the good part. Prototype that single step before designing anything else.

### The two onboarding paths

Onboarding offers a choice, not a fixed route. Both paths write to the same graph and the same node types.

- **Upload path.** Drop in whatever exists: process documents, org charts, Confluence exports, system diagrams, spreadsheets. AI extracts nodes and edges into a draft. The user corrects it. Correcting a wrong draft is far faster than building from nothing.
- **Interview path.** A guided question set builds the graph question by question. Slower, more accurate, and it teaches the user the model as they go. The right path for someone with no documentation worth uploading, which is most small and mid-size companies.

**This path is never a form.** Per DNA-03 it is a progressive phased sequence: one question on screen, answered, then the next. No multi-section setup wizard, no page of fifteen fields, no "complete your company profile" screen. The user can stop at any point and the graph keeps what it has, because a model that is 40 percent complete is still useful while a half-filled form is not.

**The review queue follows the same rule.** AI extraction can produce hundreds of candidate nodes. They are reviewed in small batches grouped by layer and by confidence, lowest confidence first, never as one long list to work through.

**They are not alternatives so much as two ends of one process.** The realistic flow is upload what exists, then let the tool interview you for what is missing. That makes the question set a gap-filling engine, not a form.

**Design consequence worth noting:** those onboarding questions come from the same place the impact-analysis questions do. The taxonomy in section 4 says a System node should have an owner, an environment, integrations and the data it reads and writes. Any of those missing is a gap, and a gap is a question. So this is one question engine with two uses: pointed at the model it completes onboarding, pointed at a change it drives impact analysis. Build it once.

---

## 4. The meta-model

This is the foundational decision. Everything generated downstream is wrong in the same way if this is wrong.

### Node types

**Organization**
- Department
- Team
- Role
- Person (optional, a role can stay unassigned)
- ExternalParty (regulator, partner, vendor, broker)

**Process**
- Process
- ProcessStep
- DecisionPoint

**Systems**
- System
- Integration
- Environment

**Data**
- DataEntity
- DataField
- Form (example: OPCF 47R, OEF 47R)

**Business**
- Product
- Coverage
- BusinessRule (carries an effective date, and any grandfathering or transition provision)
- Channel (direct, broker, embedded partner)

**Governance and output**
- Regulation
- Obligation (a single derived duty from a Regulation)
- Symptom (what is observed)
- CauseHypothesis (why it may be happening; stays a hypothesis until evidence supports it)
- ProposedSolution (what someone asked for; never assumed correct)
- Evidence (what supports a Symptom, a CauseHypothesis or a claim)
- SuccessMeasure (with its baseline, and its level: business, process, system or delivery)
- Requirement (subtypes: business, stakeholder, functional, non-functional, data, interface, transition)
- UseCase
- AcceptanceCriterion
- TestScenario
- Risk, Assumption, Issue, Dependency
- Decision
- GlossaryTerm
- Constraint (budget, date, vendor, regulatory, architecture, privacy, security, capacity). Added 2026-10-30, from structure item ST-01-12

### Edge types

| Edge | From | To |
|---|---|---|
| reports_to | Role | Role |
| member_of | Person, Team | Team, Department |
| owns | Role | any node |
| approves | Role | any node or artifact |
| performed_by | ProcessStep | Role |
| executed_in | ProcessStep | System |
| precedes | ProcessStep | ProcessStep |
| part_of | ProcessStep, DecisionPoint, Process | Process. Added 2026-10-30: places a step in its process, and a sub-process in its parent |
| triggers | any node | Process |
| reads / writes | System, ProcessStep | DataEntity, DataField |
| integrates_with | System | System (via Integration) |
| belongs_to | DataField, Coverage | DataEntity, Product |
| renders_on | DataField | Form, ProcessStep |
| governed_by | any node | BusinessRule |
| derived_from | BusinessRule, Requirement, Obligation | Obligation, Regulation. Obligation as a source added 2026-10-30 |
| implements | Requirement | change on a node |
| traces_to | AcceptanceCriterion, TestScenario | Requirement |
| constrains | Constraint | any node. Added 2026-10-30 |
| impacts | computed at query time, never stored |

A **handoff** is not a node or a stored edge. It is any edge crossing a department lane. Handoffs are where things break, so the UI should surface them automatically.

### Node metadata, every node

- `id` (immutable, internal)
- `tenant_id`, `created_by`
- `external_refs` object: `jira_key`, `confluence_page_id`, `azure_work_item`. Null forever in v1.
- `source`: ai_extracted, user_entered, imported
- `verified_by`, `verified_at`, `confidence`
- `layer`: org, process, system, data, business, governance

---

## 4c. Node attributes and their question sets

The question engine from section 2 needs each node type to declare what it should have. A missing attribute is a gap, and a gap is a question. These two node types are the ones with real material behind them.

### Integration

Attributes, from the BSA process document section 11:

timeout behaviour, retry rules and limits, idempotency, partial-failure handling, synchronous or asynchronous, expected latency, rate limits and quotas, version management, correlation IDs, logging and monitoring, fallback when the service is unavailable, interface owner, incident-resolution owner.

Additional attributes from a working systems analyst's published API discovery questions, which the BSA process document misses and which are the ones that actually cause incidents (see research/ba-web-research.md section 14 for all twenty):

- **Licence gating.** Is this endpoint available on our tier, or does it need a paid module or add-on?
- **Configuration gating.** Is the behaviour we rely on hidden unless a specific configuration setting is enabled?
- **Deletion detection.** How do we learn that a record was deleted upstream when the API exposes no deleted flag?
- **Version drift.** Could a provider version upgrade silently change field names or formats?
- **Call pricing.** Is usage metered or unlimited?
- **Batch support.** Batch insert and update, or record by record only?
- **Relational completeness.** Does a response return linked records, or do we need extra queries?
- **Record limits.** Maximum records per request.
- **Error catalogue.** Can we get the full list of error codes?
- **Deprecation.** Any endpoint scheduled for removal, and what replaces it?

The first three generalise well past ERP and belong in every Integration node's question set.

### DataField

Attributes and questions, from the BSA process document section 10 and its "easy to miss" list:

authoritative source, owning system, how the value arrives (entered, retrieved, derived, calculated, defaulted), type and format, mandatory, optional or conditional, valid values and ranges, code sets and reference data, transformation rules, null and blank and unknown handling, defaulting rules, validation behaviour, duplicate and conflict handling, date, time, timezone, currency and precision rules, sensitivity classification, retention and masking, historical migration need, backward compatibility, reconciliation checks.

The questions that catch real defects:

- Can this field be null even though the UI makes it mandatory?
- Can the same request be submitted twice?
- What happens when the data changes between retrieval and submission?
- Which source wins when two systems disagree?
- Does the target retain the original value, or is it rounded or truncated?
- What happens to historical records?
- Can a business transaction be traced across every system it touches?

### Modelling note

Field mapping versus a canonical data model is the first architectural choice in any integration, and direct field mapping is simple but fragile. Worth deciding how DataField edges represent mappings before the schema is fixed.

---

## 5. Versioning and branching

Build on an append-only event log. One build, four payoffs: the branching engine, document version history, the decision log, and the change feed any future integration needs in order to push updates rather than only initial creates.

- The **baseline graph** is the as-is. It is the result of all applied events.
- A **Request** opens one or more **SolutionOptions**. There is never only one to-be. Real BSA work presents two or three options with trade-offs, then one is picked. A SolutionOption is a branch: an ordered set of change operations (add, modify, remove, on nodes and edges).
- **Gap analysis** is the diff between baseline and a SolutionOption. Computed, not written.
- On sign off, the chosen option is **promoted** and applied to the baseline.
- Multiple live requests means multiple branches against one baseline, and whichever ships first changes the baseline for the others. This is version control for business processes. It is the hardest part of the build and the thing no competitor has.

Build single-branch now and adding options later means rewriting the diff engine. Build the option concept in from the start even if the UI only shows one.

---

## 6. The flow

1. **Onboarding.** Either upload documents and have AI extract nodes and edges, or answer a guided question set, or both. User reviews and corrects in an approval queue. The question set is generated from taxonomy gaps, so it only ever asks what is actually missing.
2. **Intake.** Opens with a prior-work check: query the graph and the request history for related requirements, prior decisions and unresolved issues on the nodes this request touches. Has this been asked before, and what was decided.

   Then one question: **what triggered this request?** One choice from seven: customer problem, regulatory change, operational inefficiency, system replacement, new product, audit finding, defect. Source: the BSA structure document, PH-01 step 2 (ST-01-02). Feature F-35. It is a single decision on its own screen, per DNA-03.

   Then two modes, and the modes matter.

   Intake captures three separate things, never one: the **Symptom** observed, the **CauseHypothesis** behind it, and the **ProposedSolution** someone asked for. The hypothesis stays a hypothesis until Evidence supports it, and the proposed solution is never assumed correct because a stakeholder requested it. Most bad analysis starts by collapsing these three into "the ask".
   - *Business request:* a stakeholder wants something. Intake asks which parts of the existing graph it touches, not for a description of the world.
   - *External mandate:* nobody asked for it. The input is a legal or regulatory document. The job is to derive obligations, then map each obligation to nodes. Harder, and probably more valuable, because this is where compliance risk lives.
3. **Impact analysis.** Traversal outward from the touched nodes. Systems, teams, rules, fields, forms and partners light up. Coverage indicator starts here.
4. **Generated questions.** Per impacted node, derived from its type and its edges. **Delivered one at a time in priority order, never as a list.** One traversal can generate dozens, and a list of dozens is the overwhelm this product exists to remove. Priority follows blast radius: a question whose answer changes which other nodes are impacted comes before one that only adds detail. Each question must stand alone, since the user sees it without the others for context. Example: the change touches a payment integration, so the tool already knows that node has a partner owner, an error path and a downstream accounting system, and asks who approves on the partner side, what happens on timeout, whether the accounting feed changes, which existing rule governs refunds. The graph remembered the question so the analyst did not have to.
5. **Options.** Two or three SolutionOptions with trade-offs.
6. **To-be.** Edit nodes on the chosen branch. Never a blank canvas.
7. **Gap analysis.** The diff, shown in place.
8. **Documents.** BRD, FRD, use cases, edge cases, acceptance criteria, business rules, test scenarios. Generated from changed nodes and their paths.
9. **Traceability.** Free. Everything already points at the same node IDs.
10. **Sign off.** Recorded state. Promotes the option into the baseline.

---

## 6b. The rail: phase gates and next actions

The app is a rail, not a toolbox. Tabs let a user wander and skip. A rail shows where you are, what closes the current phase, and the single next action. No phase can be quietly overlooked.

Each phase has an **exit condition**. The CTA stays locked until it is met. The gate is the coverage indicator from section 2.

**Every exit condition is an outcome** (rules rule 16). A phase closes when the outcome exists, not when the activity has happened. The Covers column links each rail phase to the BSA phases whose outcomes it must produce. Outcomes per BSA phase are in `structure/bsa-lifecycle-phases.md`. The mapping is an assessment made 2026-10-28.

| Phase | Covers | Closes when | CTA |
|---|---|---|---|
| Intake | PH-01, PH-04 | Prior-work check run; trigger recorded; request classified as business request or mandate; sponsor named; touched nodes tagged; symptom, cause hypothesis and proposed solution recorded separately; success measures named with their baseline where one exists | Run impact analysis |
| Impact analysis | PH-08 | Every impacted node addressed or marked not applicable, stakeholders identified | Prepare discovery |
| Discovery session | PH-02, PH-05 | All generated questions answered, assumptions logged, glossary terms resolved | Define solution options |
| Options | PH-07 | Two or more options with trade-offs, one recommended | Build the to-be |
| To-be | PH-06 | Every impacted node has a defined target state | Generate gap analysis |
| Gap analysis | PH-06, PH-08 | Diff reviewed, each gap has an owner | Write the BRD |
| BRD | PH-11 | Every business requirement traces to an obligation or business driver | Write the FRD |
| FRD | PH-11 | Every business requirement has at least one functional requirement | Write use cases |
| Use cases and edge cases | PH-11 | Every decision point has a path, every happy path has a failure path | Write acceptance criteria |
| Acceptance criteria | PH-11, PH-17 | Every functional requirement has testable criteria | Generate test scenarios |
| Traceability review | PH-15 | No orphan requirements, no unaddressed obligations | Send for sign off |
| Sign off | PH-25 | Recorded | Promote to baseline |

### Impact analysis sits before the discovery session

This is a deliberate reordering of how the job is done today, and it is the product's best trick. The tool tells you what to ask **before** you walk into the room. You arrive with a question list derived from what the change actually touches, rather than leaving the session and realising three things were missed. The session becomes where questions get answered, not where someone tries to think of them.

### Two rules that stop the rail becoming a rigid wizard

1. **One next action, never a menu.** Per DNA-03 each phase presents a single CTA. If more than one thing could sensibly happen next, that is a design problem to resolve, not a choice to hand the user.
2. **Navigation stays free, only the CTA is gated.** Real BSA work loops. Discovery reopens after gap analysis. Movement between phases is unrestricted. The rail advises, the gate enforces, neither traps the user.
3. **The escape hatch has a cost.** Marking an item not applicable is allowed but requires a reason, and that reason lands in the decision log. That is how "we cannot afford to overlook" survives contact with the one request where a step genuinely does not apply.

### Teaching layer

Every phase carries a short panel: why this phase exists, what a good one looks like, what gets missed here most often. This is a deliberate feature, not a side effect. It serves the owner while interviewing for BSA roles, and later it is the reason a company buys seats for junior analysts.

---

## 6c. Authority: who analyses and who decides

Adopted from the BSA process document, section 28. The pattern holds throughout that document: the BSA elicits, analyses, models, traces and facilitates. Someone else decides.

| Area | The tool's job | Whose decision it stays |
|---|---|---|
| Business problem | Elicit, structure, validate | Business sponsor |
| Scope and priority | Surface options and impacts | Product owner or sponsor |
| Business rules | Elicit, model, trace, version | The rule's owner |
| Architecture | Analyse business and system impact | Architect |
| Implementation | Clarify required behaviour | Developers |
| Test strategy | Make requirements verifiable | QA |
| Release | Supply readiness evidence | Release authority |
| Benefits | Define the measures, show the numbers | Business owner |

This settles the open limit on Quality Gate Control. **It may block on completeness, traceability and internal contradiction. It may never decide business policy, approve scope, or make an architectural call.** Those are gaps it reports, not gaps it fills.

## 6d. Success has four levels

Also from that document, section 5, and it contradicts a scoping decision worth revisiting.

- **Business outcome.** The thing the business actually wanted.
- **Process outcome.** The process got better.
- **System outcome.** The system behaves correctly.
- **Delivery outcome.** The approved functionality shipped and passed its tests.

The source's line: delivering a feature does not prove the intended business benefit was achieved.

The locked scope ends the lifecycle at approved documents and sign off, which is the delivery outcome only. That stays the v1 boundary, but the model must still **capture the success measures and their baseline at intake**, because a measure not recorded before the change cannot be compared after it. Recording them is cheap now. Reconstructing a baseline later is impossible.

---

## 6e. Overview and Analytical tabs

Stated 2026-10-26. Two tabs that sit outside the request rail, because they are about the state of things rather than the next step in one piece of work.

### Overview

The landing surface. What is going on right now, across everything.

Candidate content, not yet decided: active requests and their phase, what is blocked and on whom, what is waiting on an answer, the next action on each, and a way into the company model.

The rail answers "what do I do next on this request." Overview answers "what is going on across all of them." Different question, so a different surface.

### Analytical

**Analytics about the analysis work, not about the model.** Decided. Model health is a separate concern and does not live here.

Candidate metrics, not yet decided:
- Open requests by phase, so bottleneck phases are visible.
- Unanswered generated questions, and how long they have been open.
- Blocked items and what is blocking them.
- Cycle time per phase, and per request end to end.
- Questions generated versus questions that changed the outcome. This one is the honest measure of whether the question engine earns its place.
- Requests shipped, and what the write-back added to the model each time.

### Why this matters more than it looks

Pain point PP-07 is that analysts have to justify the role and prove the impact of their work. Until now the only feature touching it was F-20, the teaching panels, which explain the job rather than evidence it. This tab is the first feature that produces evidence. An analyst who can show cycle time, questions caught before build, and coverage at sign off has an answer to a question the profession currently struggles with.

### DNA tension

Both tabs are dashboards, and a dashboard is many things at once, which runs against DNA-03. Resolution: these are the two places in the product where showing many things is the job, because their purpose is orientation rather than action. The rule still holds everywhere the user is being asked to do something. Neither tab may ask for more than one decision.

### Open

- Whether Overview is the app's landing surface or a peer tab.
- Which metrics make the first cut. Six candidates listed, probably three should ship.
- Whether cycle-time data is meaningful for a solo user with few concurrent requests.

---

## 7. UI and UX direction

The reference point is Obsidian's graph aesthetic, but Obsidian is force directed, which means position means nothing. For analysis, position has to carry meaning. The right model is a swimlane diagram rendered with graph aesthetics.

- **Horizontal axis is flow.** Left to right is sequence, time, handoff.
- **Vertical bands are departments.** A node's lane tells you who owns it.
- **Deterministic layout.** Same model, same picture every time. People build spatial memory of their own business and a graph that reshuffles on reload destroys it.
- **Select a node, dim everything not connected to it.** Obsidian's best interaction, and it is impact analysis made visual with zero extra UI.
- **Layers you toggle, not one mega-graph.** Same nodes, different edge sets. Org, process, system, data, business. One at a time, or two overlaid.
- **Zoom reveals, it does not shrink.** Company level shows departments as single nodes. Zoom in and a department expands into its processes, then into steps. Never render 400 nodes and call it visual.
- **As-is versus to-be is one diagram changing, not two side by side.** Added nodes glow, removed nodes ghost out, changed nodes outlined.
- Minimalist. Everything on screen earns its place. Minimal is not low contrast: what remains must be immediately legible (DNA-02).
- **One decision per screen.** More than one needs justifying (DNA-03).
- **Direct manipulation is the primary path** (DNA-04). Drag a node into a lane to change its owner. Drag between nodes to connect them. Drag to group. A properties form is the fallback, not the default, for any change that could be made by dragging.
- **Dragging changes meaning, not coordinates.** This resolves the conflict between direct manipulation and deterministic layout: the user drags to say which lane a node belongs to or what connects to what, and the layout engine still decides exact positions. A drag is an edit to the model, never a move of a pixel.

---

## 8. Artifacts the tool must produce

Already in scope: BRD, FRD, use cases, edge cases, acceptance criteria, business rules, process maps as-is and to-be, gap analysis, system impact analysis, requirement traceability.

Added after the completeness review, previously missing:

- **RAID.** Risks, assumptions, issues, dependencies.
- **Glossary.** Critical in insurance where one word means three things to three departments. Also improves AI extraction accuracy.
- **Non-functional requirements.** Performance, security, audit, retention, accessibility. BSAs own these and they never appear in a process map.
- **Stakeholder map and RACI.** Derivable from the model, but must be a visible output.
- **Scope and prioritization.** In this release versus deferred.
- **Decision log.** What was decided, when, why, by whom. For regulatory work this is what auditors ask for.
- **Test scenarios.** Generated from acceptance criteria. Lifecycle stops before UAT, but the scenarios are a sign-off deliverable.
- **Phasing.** Regulatory changes almost never ship in one release.

---

## 9. Architecture constraints to honor now

Integration with Jira, Confluence and similar is explicitly out of scope for this phase. These six things are cheap today and expensive to retrofit, so decide them now.

1. **Stable internal IDs plus an empty slot for external refs** on every object.
2. **Requirements are objects, not paragraphs.** If the BRD is a block of text, FR-012 can never be pushed to Jira as a story. If requirements are discrete objects that the BRD renders, the push is trivial.
3. **Documents stored as structured blocks** that reference node IDs, rendered to Word, Confluence storage format or Markdown on demand. Store the rendered output and you are locked to one destination.
4. **Append-only event log.** See section 5.
5. **tenant_id and user_id on every row** from day one, even with one user. Retrofitting multi-tenancy is the worst migration in SaaS.
6. **A direction-of-truth field per integration-facing attribute.** Not implemented, just allowed. Later: status comes from Jira and is not overwritten, text comes from us and is.

The realistic future integration shape, which is why 2 and 3 matter: **this tool is upstream.** It pushes requirements into Jira and publishes documents into Confluence. The only thing coming back is status. Resist anyone asking for two-way sync.

**Where AI is allowed to act** (write this down, it is the trust story):
- Allowed: extract the model from uploaded documents, derive obligations from a regulation, map obligations to nodes, draft document prose, suggest question wording.
- Not allowed: decide impact, generate the question set, compute the gap, determine coverage. Those come from the graph.

Also not yet decided, and needed before build: model import and export. Nobody puts their whole company into a tool they cannot get it out of.

---

## 10. First build slice

Onboarding plus impact analysis. Nothing after it.

In scope:
1. Document upload and AI extraction into nodes and edges, with a review and correction queue.
   1b. The guided interview path, generating questions from taxonomy gaps in the current graph. Same engine later reused for impact questions.
2. Model store with the append-only event log and the full node and edge taxonomy from section 4.
3. Graph view: layered deterministic layout, department lanes, layer toggles, zoom levels, select-and-dim.
4. Request intake, both modes, including regulation upload and obligation extraction.
5. Impact traversal from touched nodes, with the coverage indicator and structure-derived questions.

Out of scope for this slice: options, to-be editing, gap diff, document generation, traceability views, sign off.

The test of this slice: upload a set of documents, input the SABS change, and have the right things light up without being told.

---

## 11. Test case: Ontario SABS changes

Effective **July 1, 2026**, already in force. Note the date is July 1, not June 1.

Still live work for carriers, because in-force contracts renew with their existing benefits unless the customer chooses otherwise, so the renewal cycle runs through to mid-2027.

**What changed:** income replacement, caregiver, housekeeping and home maintenance, dependent care, and death and funeral benefits moved from mandatory to optional. Medical, rehabilitation, attendant care and cost of examinations stay mandatory. Insurers became first payor for most medical and rehabilitation expenses, except medication, even where the claimant has workplace benefits. New forms OPCF 47R and OEF 47R. Insurers must file under FSRA's SABS Optionality Filing Specifications.

**Why it is the right first case:**
- It touches nearly every node type the insurance starter model needs: coverages, rating, quote and bind, renewal, forms, claims adjudication, broker channel, regulatory filings, partner integrations.
- It is externally imposed with a hard deadline, so there is no scope ambiguity about whether to do it.
- It spans compliance, legal, product, pricing, UX, development, QA and PM.
- The priority of payment change is exactly what the tool exists to catch: a claims adjudication and coordination-of-benefits change buried inside what looks like a product optionality project. Easy to miss at intake, expensive to miss at delivery.
- The outcome is known, so it works as a test fixture. Run the tool and check whether it surfaces what the real project surfaced, including what got missed.

**Caution:** build the demo from public regulatory material and a generic carrier model. Nothing proprietary.

**Real systems context available** (from bsa-practice-brief.md section 5, the best-evidenced part of that file): Guidewire PolicyCenter for quote to bind, a Digital/Jutro front-end layer calling PolicyCenter's Cloud API, the PolicyCenter rating engine pricing on postal code and territory, Canada Post AddressComplete for address lookup, GA4 and Hotjar and GTM for analytics. Teams: product, compliance, legal, development, QA, UX. Compliance and legal hold sign-off authority on customer-facing flow elements and on SABS changes. Partners: Ford, VW, Audi, Duuo.

---

## 12. Open items

- Model import and export format.
- What the AI extraction prompt and output schema look like. This is the highest risk piece, so it needs its own design pass.
- The starter model for a P and C insurance carrier. How much ships pre-built versus gets extracted.
- Node confidence scoring. How confidence is calculated and how it is shown without cluttering the graph.
- How the coverage indicator handles nodes a user deliberately marks as not applicable.
- Insurance-first risk: the node taxonomy in section 4 is domain real, which is the point, but it needs a second domain tested against it before any claim of being general.
- Whether SuccessMeasure tracking stays out of v1 or earns its way in. Section 6d records the measures but does nothing with them.
- Whether field mapping or a canonical data model represents DataField mappings. See section 4c.
- Request trigger (F-35): can a request have more than one trigger, for example a regulatory change that also exposes a defect? Is there an "other" choice? Does a regulatory change route straight to mandate mode, and does an audit finding?
- Phase outcomes not stated in either source: PH-05 stakeholder analysis, PH-12 UX, PH-25 documentation and closure. The rail's Discovery session and Sign off phases depend on PH-05 and PH-25.
- Whether the five any-phase questions (rules rule 16) become a standing question set in F-11, or content for the F-20 teaching panels.
- PH-01 gaps raised by the Structure agent, listed in `structure/structure-coverage.md`: no request deadline or urgency, no home for an opportunity that has no symptom, no record of who assigned the work, nowhere for conflicting stakeholder statements.
- Coverage indicator states. Addressed, not applicable and blocked are three states, not two. The BSA process document tracks blocked tests separately from failed ones for the same reason.

---

## 13. Competitive position

No existing tool connects the org and systems model to the documents.

- **Enterprise architecture (Ardoq, LeanIX, Bizzdesign):** closest to the onboarding model. You model the org, capabilities, apps and data flows, then run impact analysis. The model is the product and documents are an afterthought. Expensive, slow to populate, sold to EA teams rather than analysts.
- **Process mapping (Signavio, Blueworks Live, Bizagi, ARIS):** good at diagrams and as-is to to-be. Nothing about BRDs or requirements.
- **Requirements traceability (Jama Connect, DOORS, Visure, Modern Requirements):** traceability, baselines, approvals. Built for regulated hardware and aerospace. Heavy, and no discovery help.
- **In practice:** most BSAs use Confluence templates plus Jira plus Visio, glued together by hand.

Salesforce does not do this. It models customers' org charts as CRM data. It has nothing that models your own business and drives requirements work off it.

**The bet:** the model is what makes the downstream work smart, because system impact analysis, gap analysis and traceability are all just queries against a well-built model of the business.

**The commercial shape, for later:** Part 2 is what people pay for on day one because it saves time. Part 1 is what stops them leaving, because by month six the model is their only accurate picture of how the business actually works.
