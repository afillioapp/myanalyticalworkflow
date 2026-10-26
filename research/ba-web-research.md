# BSA / BA Research: Web Pass

Date: 2026-10-26
Scope: public web only. Reddit not included, see "Not covered" at the end.
Sources: 14 pages read in full. Full list at the bottom.

---

## How to read this file

Most writing about business analysis is produced by people selling training, certifications or tools. That does not make it wrong, but it does mean the statistics need checking and the enthusiasm needs discounting. This file separates what is sourced from what is merely repeated, and names the commercial interest where one exists.

---

## 1. Numbers that trace to a primary source

**47 percent.** Of *unsuccessful* projects, nearly half fail to meet goals because of inaccurate requirements management. From PMI's Pulse of the Profession, published August 2014 as part of "The High Cost of Low Performance 2013."

Two cautions. It is the share of already-failed projects, not of all projects, and it is twelve years old. PMI does not state the sample size or method on the page. Use it, but date it.

**Pay context.** US Bureau of Labor Statistics 2025 median pay: management analysts $101,860, financial analysts $103,570, budget analysts $91,640, market research analysts $78,760. BLS has no "business systems analyst" category, so none of these is a direct match. BLS projects business and financial occupations overall to grow faster than average from 2025 to 2035 but gives no occupation-specific rate on the page read.

**Architecture documentation goes stale within a year.** BlueDolphin states "studies show that a significant portion of architecture documentation becomes outdated within a year." The underlying studies are not named, so treat the direction as credible and the precision as unverified. BlueDolphin sells an EA tool.

## 2. Numbers to distrust

MoldStud's article on BA challenges cites roughly twenty precise percentages with no studies behind any of them. Examples: "scope creep affects 52% of projects negatively," "ignoring input can lead to project failure in 70% of cases," "interviews can uncover 60% more requirements than surveys."

These are the numbers that circulate. They appear sourceless, so do not put them in a pitch deck. Named here only so they are recognisable when they turn up elsewhere.

The widely quoted "70 percent of software projects fail" figure appears across many pages in this space with no consistent origin. Same treatment.

## 3. What the job actually feels like

The most useful source here is not an article. It is a practitioner post on ModernAnalyst titled "Is it just me or do I really dislike BA work," by DMLeVoir, with one comment from Karin. Verbatim complaints:

- "boring, tedious, uninspiring"
- "I feel unappreciated and undervalued"
- a "glorified secretary" who takes notes and writes minutes
- "everyone dumps on the work I've done"
- stakeholders "revise it and make me do it over again"
- "There is no way I can know what people want if they don't tell me"
- never gets "the satisfaction of doing something well and having it be 'done'"
- previously did technical systems analyst work, now gets only traditional BA assignments

Karin disagrees with the framing, arguing BAs should contribute their own thinking rather than record what people say, but concedes "some of the work can be tedious."

**BA Times names four stress factors:** not understanding the area of study well enough and feeling inadequate for it; large complex projects with many stakeholders in unfamiliar departments; elicitation, because stakeholders vary in how forthcoming they are and no single method fits all; and pressure from deadlines that seem unrealistic.

**Dice names five challenges:** keeping up with changing technology, balancing stakeholder expectations against scope creep, data quality and access, adapting to Agile and balancing documentation against iteration, and having to prove the business impact of their own work to secure budget.

Recurring across sources, in rough order of how often it appears: stakeholders who cannot state what they need; no time with the people who have the answers; requirements that change after agreement; being treated as a scribe; and having to justify the role itself.

**IIBA, which represents the profession, frames three of these as the BA's own fault:** being more process-focused than people-focused, appearing dismissive of others' ideas (its fix is replacing "yes, but" with "yes, and"), and underestimating the role, which leaves BAs feeling like outsiders. Worth noting that the professional body locates the problem in the analyst's behaviour while practitioners locate it in the organisation.

## 4. Documentation pain

The sharpest piece found: "Nobody read your 40-page BRD. They read page one and the table," from The Analyst Edge.

Its argument is that BRDs fail because they are unreadable, not because they are wrong. "Most BRDs are written like they'll be read cover to cover by a patient, caffeinated person with a highlighter." In reality people open them mid-meeting, scroll, and search for a keyword.

It identifies four readers with incompatible needs:
- **Sponsor:** scope, cost, in or out. Likely reads page one only.
- **Developer:** the rules and the edge cases.
- **Tester:** what done means, in testable conditions.
- **Future author:** why a decision was made, found by keyword search.

Its recommendations:
- Page one must stand alone: problem statement, in scope, out of scope, top three decisions, open questions with owners. The sponsor should be able to approve or object from that page alone.
- State out of scope explicitly. The author calls it where "arguments go to die quietly."
- Put business rules in tables, not paragraphs. Condition, rule, example, as rows.
- Number requirements. IDs like BR-01 let everyone refer to the same line.
- Keep a decision log: date, decision, decision maker, reasoning.
- Cut company background, glossaries of terms nobody finds confusing, duplicated process descriptions, and paragraphs that repeat a nearby table.

Its test: pick three questions a stakeholder might ask, then time how long it takes to find each answer using only headings and search. Over thirty seconds means stakeholders will struggle.

On regulated industries it recommends layering rather than cutting: readable summary at the front, detailed tables in the middle, traceability and appendices at the back. Auditors get full detail, everyone else stops earlier.

Its conclusion: "Long isn't the problem. Long and shapeless is."

## 5. Tooling pain

### Jira is not a requirements tool

From Reqsuite, which sells a requirements management tool, so discount accordingly. The specific limitations named are concrete and checkable:

- **Flat structure.** Jira "primarily works with a flat list structure in which requirements exist as individual tickets." Hierarchies and dependencies between high-level and detailed requirements are hard to represent and maintain.
- **Traceability is manual.** Links to tests, designs or implementation "can be realized with manual links and plugins, but the functionality is not natively integrated."
- **No dependency analysis and no version comparison.**
- **No requirement versioning.** Only per-ticket change history.
- **No automated quality checks** for gaps or contradictions.
- **Documentation requires Confluence plus add-ons**, which "requires additional effort and is not as integrated and automated as in dedicated RM tools."

### Traceability matrices

From Jama Software, a requirements tool vendor, and the most detailed practitioner-grounded account found:

- Spreadsheet matrices produce "static, often outdated information" with no proactive notifications.
- Each requirement links to sub-requirements, test cases, design elements and verification steps, so trace relationships multiply fast. Each requirement also carries attributes such as version, approval status and risk rating. A few hundred requirements becomes thousands of cells to keep current.
- Changes to requirements, design or tests require separate manual edits. Nothing updates linked items automatically. **Links fall out of sync within weeks.**
- No native version control or governance for concurrent editing.
- **False confidence.** A matrix listing only requirement numbers, without requirement text, "can look complete even when its links were never validated." Gaps surface during audits, when teams have the least capacity to fix them.
- A matrix that cannot stay current "may become a compliance liability rather than an engineering asset."
- In manual medical device development, traceability is "often described as complex and burdensome."

### Process maps

From the Analyst's Corner piece "Beyond Process Maps":

- They take days or weeks to create.
- **They describe the ideal process, not how work actually happens, and rarely capture workarounds.**
- They go out of date quickly, often before the map is finished.
- They do not show which problems are most urgent.
- Core claim: teams are "trying to capture a living, changing system in a static document."

Its proposed alternative is a friction-point workshop (gather friction points, sort into workarounds, inefficiencies, misalignment and bottlenecks, place by severity in concentric circles, fix the centre first). Presented as a complement, not a replacement, since maps still serve training, compliance and end-to-end visibility.

## 6. The staleness problem, which is the big one

The most important finding in this pass, because it is the known killer of exactly the kind of model-based product being designed.

BlueDolphin's account of why enterprise architecture fails:

1. **Stale repository.** A significant portion of architecture documentation becomes outdated within a year, and without near-real-time updates the repository loses value and becomes unreliable.
2. **The root cause is update gaps.** "The primary reason architecture repositories become outdated is that transformation teams continuously make changes" to systems without updating the central repository.
3. **Data maintenance burden.** Keeping it current demands heavy documentation and cross-department coordination. Made worse by trying to document every process and application, including stable ones, and by building very detailed process hierarchies that slow decisions. Its remedy is to pull data automatically from ITSM, data governance and process mining tools instead of relying on manual updates.
4. **Lack of adoption, the ivory tower problem.** EA teams drift from day-to-day operations, their frameworks have little effect on actual projects, and the function is seen as academic.
5. **Analysis paralysis.** Heavy spend on analysing the landscape and building models that rarely turn into action.
6. **Over-focus on current state.** Documenting the present limits what the team achieves.

Every one of these six is a direct risk to the product. Section 11 maps them.

## 7. What separates strong analysts

**CIO, on elite versus average, with named practitioners:**

1. **They know their data,** including how it was collected. Marcio Tabach of ISG: "invoices are not an appropriate dataset for forecasting demand," since they reflect only what the company could supply.
2. **They know their business.** Alan Jacobson of Alteryx: "the most impactful analysts tend to have two differentiated skills: domain knowledge and problem formulation."
3. **They communicate well,** asking good questions and bridging IT and the business. Anton Derkach of Intellectsoft: a strong analyst "really listens to the clients and their needs."
4. **They do not make themselves indispensable.** Kyle Crawford of Bowling Green State University: "a great analyst will create solutions that will be used long after they are gone."
5. **They adjust when things go wrong.** Alex Melchenko of Orangesoft: "Correction of an error found in the requirement specification costs zero."

**Bridging the Gap, on high performers:** strong core skills; resourcefulness, seeking answers rather than waiting and finding alternative routes through the organisation; a broad toolkit chosen by outcome rather than habit; making sure the business owns the solution; **aiming for "buy-in, not just sign-off" rather than long documents approved for formality**; active stakeholder engagement with kept commitments; and managing their own work, dependencies and scope.

That phrase, buy-in not just sign-off, is the clearest articulation found of what the documentation is actually for.

## 8. AI in BA work

**What AI is credited with**, from Adaptive US, a training provider selling GenAI courses, so discount the enthusiasm: summarising long documents, extracting business rules, drafting interview questions per stakeholder group, suggesting probing and what-if questions during sessions, proposing alternative features and user stories, turning meeting material into user stories, use cases and traceability matrices, and flagging ambiguities, conflicts and gaps against best practice or regulation.

No measurements are offered for any of it.

**Where it falls short**, same source: privacy and security when sending sensitive requirements to external platforms; over-reliance, where analysts accept outputs without checking; bias and unrealistic outputs; and **missing context, where without enough background the output is irrelevant or inaccurate.**

Its framing: "treat GenAI as a co-pilot, not an autopilot."

That last failure mode, missing context, is the one that matters most for this product. See section 11.

## 9. The 2026 hiring market

Both substantial sources here are promotional (one sells training, one sells certifications), and neither provides data beyond a single hiring-trend chart. Their claims overlap heavily, which is weak evidence but not nothing.

Common claims across both:

- **AI has commoditised documentation.** BRDs, functional specs, user stories, acceptance criteria and process diagrams can be generated quickly, so documentation output no longer differentiates a candidate.
- **Roles are consolidating.** Companies prefer one multi-skilled product professional over separate BA, Product Owner, Product Manager and Delivery Coordinator roles. Said to be most visible in startups and AI-first companies. Hybrid titles such as Product Analyst and Data Product Manager are replacing BA postings.
- **Oversupply at entry level.** Bootcamps and certifications have produced many similar candidates for few openings.
- **Global remote competition** raises the bar for specialisation and reduces demand for generalists.
- **Expectations shifted, not reduced.** Analysts are now expected to use AI daily, validate its outputs, interpret business logic and guide decisions. One source: companies are "paying for decision-making" rather than documentation.
- **Skills now expected:** product thinking and customer discovery, data and product analytics including SQL and dashboarding, technical fluency around APIs and data pipelines, experimentation and prioritisation, commercial awareness, and demonstrated experience through portfolios and case studies rather than certifications alone.

One source argues some "AI efficiency" layoffs are overstated and that BAs remain valuable for questioning, stakeholder politics and alignment. That is the author's opinion, presented without evidence, from someone selling BA training.

## 10. The gap in the market, restated with evidence

Three tool categories exist and none connects the model to the documents.

- **Enterprise architecture** tools model the org, capabilities, applications and data flows and can run impact analysis. The model is the product and documents are an afterthought. Their documented failure mode is the repository going stale within a year.
- **Requirements management** tools (Jama, DOORS, Visure, Modern Requirements) handle traceability, baselines and approvals, built for regulated hardware. No discovery help, no model of the business.
- **Process mapping** tools produce as-is and to-be diagrams that describe the ideal rather than the real, and go stale before they are finished.
- **What most people actually use:** Jira plus Confluence plus Word plus Visio plus Excel, glued by hand. Jira's own gaps are enumerated in section 5 and read almost exactly like a feature list for this product.

## 11. What this means for the product

Design implications, mapped to findings.

**The staleness problem is the existential risk, and the write-back loop is the answer.** Section 6 says repositories die because transformation teams change systems without updating the repository. The design already closes that loop by promoting a signed-off to-be into the baseline, so the model is maintained as a side effect of real work rather than as a documentation chore. This is the single strongest validation of the core bet found in this pass, and it is also the thing to be most honest about: if the loop is weak, the product becomes another stale repository.

**Do not try to document everything.** BlueDolphin names documenting every process including stable ones, and over-detailed hierarchies, as what makes the burden unsustainable. Onboarding should capture what requests actually touch, and depth should follow use, not completeness.

**Pull rather than ask, wherever possible.** The named remedy for maintenance burden is automatic ingestion from existing systems. The upload path and the future Jira and Confluence integrations are the equivalent here. Every fact a user types by hand is a fact that will go stale.

**Never let the model become a project.** Analysis paralysis and the ivory tower problem both come from modelling work detached from delivery. The design already ties the model to live requests. Resist any feature that lets someone model for its own sake.

**The as-is must record workarounds.** Process maps fail partly because they describe the ideal and miss how work actually happens. If the model only holds the official process it inherits that failure. Workarounds and exceptions need somewhere to live as first-class content.

**Jira's gaps are the positioning.** Flat structure, manual traceability, no dependency analysis, no version comparison, no requirement versioning, no automated gap or contradiction checks. The design answers every one of those by construction. That is the comparison to make, and it comes from a source that is not this product.

**Requirements-as-objects is validated twice.** The Analyst Edge recommends numbering requirements so everyone refers to the same line. Jama shows that a traceability matrix listing only numbers without text produces false confidence. Both point the same way: discrete, addressable, individually renderable requirements, which the architecture already requires for future Jira integration.

**Generated documents should default to the readable shape.** Page one standing alone with scope, top decisions and open questions. Business rules as tables with condition, rule and example. Numbered IDs. A decision log with date, decision, owner and reasoning. Layering for regulated work: summary, then detail, then traceability. The thirty-second findability test is a usable acceptance criterion for document generation.

**"Buy-in, not just sign-off" is the sign-off phase's real job.** Worth remembering that the product's sign-off state is recorded approval, which is the weaker of the two. The questions and coverage indicator are what produce actual buy-in.

**The "glorified secretary" complaint is the emotional pitch.** The most cited frustration is doing transcription instead of thinking. That is precisely what the tool removes. It is a better message than any efficiency claim.

**Missing context is AI's named failure mode, and the model is the fix.** The documented reason AI output comes back irrelevant is insufficient background. A populated company graph is that background. This is the argument for why this product's AI output will be better than a generic chatbot's, and it is worth stating in exactly those terms.

**The market timing cuts both ways.** Documentation generation is being commoditised, which means a tool that only generates BRDs has no moat. The defensible part is the model, the impact traversal and the structure-derived questions, none of which a general-purpose model can do without the graph.

## 12. Not covered

- **Reddit.** Not reachable through the research tools used here. The search index excludes it and domain filtering was rejected. A separate prompt exists for running this through the Chrome extension, which can reach it with a logged-in session.
- **ModernAnalyst forums.** Login-gated. Only the public community blog was readable. The forums are likely the richest practitioner source available and are worth a logged-in pass.
- **BA Times archive.** Several relevant pieces identified but not all read.
- **Primary statistics.** Only the PMI figure traces to a named study, and that study is from 2013. No current primary-sourced numbers on requirements-related failure were found in this pass. Worth a dedicated search if a figure is needed for a pitch.
- **Direct practitioner interviews.** No substitute for them, and one BSA from a non-insurance domain remains the most valuable missing input for keeping the meta-model general.

---

## Sources

1. PMI, Requirements Management: Core Competency for Project and Program Success. https://www.pmi.org/learning/thought-leadership/pulse/core-competency-project-program-success
2. BlueDolphin, Why Enterprise Architecture Fails (And How to Fix It). https://bluedolphin.io/blog/why-enterprise-architecture-fails-and-how-to-fix-it/
3. Jama Software, Requirements Traceability Matrix Pros and Cons. https://www.jamasoftware.com/requirements-management-guide/requirements-traceability/requirements-traceability-matrix-pros-and-cons/
4. Reqsuite, Why Jira Is Not a Requirements Management Tool. https://www.reqsuite.io/en/blog/jira-is-not-a-requirements-management-tool
5. The Analyst Edge, Nobody read your 40-page BRD. https://theanalystedge.substack.com/p/nobody-read-your-40-page-brd-they
6. Analyst's Corner, Beyond Process Maps. https://medium.com/analysts-corner/beyond-process-maps-a-simpler-way-to-spot-whats-breaking-ba1dd2a61cef
7. ModernAnalyst, Is it just me or do I really dislike BA work. https://modernanalyst.com/Community/CommunityBlog/tabid/182/ID/3157/Is-it-just-me-or-do-I-really-dislike-BA-work.aspx
8. BA Times, Deconstructing the Stress Factors in the Business Analyst Role. https://www.batimes.com/?p=10883
9. Dice, Business Analyst Challenges. https://www.dice.com/career-advice/business-analyst-challenges-what-to-keep-in-mind
10. IIBA, 3 bad habits business analysts should avoid. https://www.iiba.org/business-analysis-blogs/3-bad-habits-business-analysts-should-avoid/
11. CIO, 5 essential traits of elite business analysts. https://www.cio.com/article/189108/essential-traits-of-elite-business-analysts.html
12. Bridging the Gap, The 7 Secrets of Good and Great Business Analysts. https://www.bridging-the-gap.com/good-business-analysts/
13. Adaptive US, Requirements Elicitation Using Generative AI Tools. https://www.adaptiveus.com/blog/requirements-elicitation-with-generative-ai-tools/
14. US BLS, Business and Financial Occupations, Occupational Outlook Handbook. https://www.bls.gov/ooh/business-and-financial/
15. MoldStud, Common challenges faced by business analysts. Cited only as an example of unsourced statistics. https://moldstud.com/articles/p-common-challenges-faced-by-business-analysts-and-how-to-overcome-them
16. Karaleise, Why Business Analysts Are Struggling to Get Jobs in 2026. Promotional. https://karaleise.com/why-business-analysts-are-struggling-to-get-jobs-in-2026/
17. The Agile Forum, Business Analyst Jobs in 2026. Promotional. https://dev.to/theagileforum/business-analyst-jobs-in-2026-why-bas-struggle-to-get-hired-2fmf

---

# Addendum, 2026-10-26: practitioner-source access and one real find

## 13. What is and is not reachable

Tested directly, not assumed.

- **Reddit: blocked at policy level.** Absent from the search index, refused by WebFetch, refused outright by the built-in browser pane ("not allowed due to safety restrictions"). No Chrome extension was connected to the account at the time, so that route could not be tested. Reddit therefore requires the user to read and paste threads manually.
- **ModernAnalyst forums: fully login-gated.** Both the thread URLs and the forum index redirect to a registration page. This is the richest practitioner source identified and it needs a logged-in account.
- **ModernAnalyst community blog: open and readable.** Mostly contributor-written professional-development content rather than candid complaints. The one candid post found earlier ("Is it just me or do I really dislike BA work") appears to be an outlier, not the norm for this blog.
- Worth knowing for any later attempt: Reddit's own search does not surface comment text well, but Google indexes full Reddit thread pages including comments, so site:reddit.com searches on Google reach comment-level material that Reddit search cannot.

## 14. A real practitioner question bank for Integration nodes

From a ModernAnalyst community blog post by a working systems analyst, listing the questions actually asked of clients during API and ERP connector discovery. Quoted as written. This is the single most directly reusable artifact found in the whole research pass, because it is a ready-made question set for an Integration node rather than advice about asking questions.

1. "What's the minimum required ERP version to support all AR/AP endpoints?"
2. "Could upgrading the ERP version change the API behavior (fields, formats)?"
3. "Are there any heavy or slow API methods under load? Recommended workarounds?"
4. "Does the ERP provider charge for API calls, or is usage unlimited?"
5. "Can we get a list of possible API error codes?"
6. "Any record count limits per request? (e.g., max 1000 records in GET)"
7. "What type of authentication is used, Basic Auth, OAuth2, or token-based?"
8. "What's the average response time of the API?"
9. "Are there any debug/logging tools if something goes wrong with the call?"
10. "Any breaking changes in recent patches that could affect us?"
11. "Does the API support batch insert/update or only record-by-record?"
12. "In what format are dates returned? Full datetime or date-only?"
13. "How are balances returned (positive/negative for credit memos)?"
14. "Can documents be posted without updating the 'last modified' date?"
15. "Can an account include multiple subsidiaries? How to filter by them in the API?"
16. "Are any API methods planned for deprecation? What will replace them?"
17. "Are some API endpoints available only with paid ERP modules or add-ons?"
18. "Are some fields or features hidden unless specific ERP configuration settings are enabled?"
19. "Does the ERP API return full relational data (e.g., linked documents, GL splits), or do we need extra queries?"
20. "How can we detect deleted records if the API doesn't expose a deleted flag or status?"

Source: https://modernanalyst.com/Community/CommunityBlog/tabid/182/ID/7077/For-BusinessSystem-Analysts-who-work-with-ERP-integrations.aspx

### Why this matters to the product

Several of these are not in the BSA process document's integration checklist, and they are the ones that bite: licensing gates on endpoints (17), features hidden behind configuration flags (18), detecting deletions when the API has no deleted flag (20), version upgrades silently changing field behaviour (2), and per-call pricing (4).

Three of them generalise beyond ERP and belong in the Integration node's question set directly:

- Is this endpoint available on our licence tier, or does it need a paid module?
- Is the behaviour we are relying on gated behind a configuration setting?
- How do we learn that a record was deleted upstream?

Cross-reference: design spec open item on Integration node attributes.

### Also found, lower value

- **Field mapping versus canonical data model** is framed as the first architectural choice in any integration, with direct field mapping called simple but fragile. Relevant to how DataField edges are modelled.
- **Definition of Ready and Definition of Done** are treated by practitioners as the standard clarity gates in Agile delivery. Independent support for the phase-gate design in spec section 6b.
- The rest of the readable community blog is professional-development content and contributes nothing to the product.
