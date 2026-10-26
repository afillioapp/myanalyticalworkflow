# The complete Business Systems Analyst (BSA) process: Discovery to Delivery

Source: provided by Alireza on 2026-10-26, produced in a ChatGPT session.
Saved verbatim apart from the cleanup noted at the bottom of this file.

A Business Systems Analyst's job is to turn a business problem into a clearly defined, technically feasible, testable, and deliverable solution, then verify that the solution works as intended.

The process is not simply gather requirements, write user stories, hand them to developers, test. A strong BSA maintains traceability between the original business need, stakeholder requirements, system behaviour, data, integrations, testing, and the final business outcome.

This walks through the process from the first discovery meeting to production release and post-implementation validation, including the small operational steps, deliverables, decisions, and responsibilities.

The examples lean toward Guidewire PolicyCenter and insurance systems, while keeping the underlying process applicable to other enterprise and financial systems.

## 1. The complete lifecycle at a glance

**01. Initiation and preparation.** Understand why the initiative exists and prepare for discovery.

**02. Discovery and elicitation.** Meet stakeholders, investigate the current state, uncover needs and constraints.

**03. Analysis and problem definition.** Validate evidence, identify root causes, define scope and desired outcomes.

**04. Solution assessment and design.** Evaluate options, map processes, systems, data, rules and integrations.

**05. Requirements and documentation.** Define business, functional, non-functional and system requirements.

**06. Backlog and delivery planning.** Create stories, acceptance criteria, dependencies, estimates and priorities.

**07. Refinement and solution validation.** Resolve ambiguity and confirm developers, QA and stakeholders share the same understanding.

**08. Build and implementation support.** Answer questions, assess changes, track decisions and validate the implementation.

**09. Testing and defect management.** Verify requirements through SIT, UAT and regression testing as applicable.

**10. Release and deployment.** Confirm readiness, coordinate approvals, migration, release and rollback planning.

**11. Post-release validation.** Verify production behaviour, monitor outcomes and close the feedback loop.

Important: Real projects are iterative. A BSA may return to discovery when testing reveals a missing business rule, or revisit design when a system limitation is discovered. Agile teams perform many of these activities repeatedly within each sprint rather than completing them once for the entire project.

## 2. Phase 1, Initiation and preparation

### Objective

Understand the initiative before asking stakeholders to explain their needs.

A BSA should not walk into a discovery session with no context and start asking, "What are your requirements?"

### Step-by-step

1. Receive the assignment. Understand who assigned the work: a product owner, project manager, business lead, program manager, architect, or another analyst.
2. Clarify the request. Establish what triggered the initiative: a customer problem, regulatory change, operational inefficiency, system replacement, new product, audit finding, or defect.
3. Identify the sponsor. Find out who owns the business outcome and can make or escalate key decisions.
4. Identify the product or system owner. Establish who is responsible for the affected application and its behaviour.
5. Review the intake material. Read the business request, project charter, intake ticket, email, incident report, enhancement request, or regulatory notice.
6. Understand the urgency. Capture the requested deadline and why it matters. Distinguish a genuine regulatory deadline from a preferred business target.
7. Identify the affected business area. For insurance, this might be underwriting, distribution, policy servicing, billing, or claims.
8. Identify potentially affected systems. For example, PolicyCenter, a customer-facing portal, a rating engine, a document service, a payment provider, or a reporting platform.
9. Review existing documentation. Locate process diagrams, business requirements documents, functional specifications, user stories, architecture diagrams, interface specifications, data dictionaries, test cases, and known defects.
10. Review existing work. Search the backlog, project repository, Jira, Confluence, decision logs, and previous initiatives for related requirements or unresolved issues.
11. Understand the current environment. Determine whether the system is already in production, undergoing a migration, being configured, or being built from scratch.
12. Identify known constraints. Consider budget, delivery dates, vendor limitations, regulatory requirements, architecture standards, data privacy, security, and team capacity.
13. Identify initial stakeholders. List business representatives, subject-matter experts, product owners, developers, QA, architects, UX, data teams, operations, compliance, and external vendors as relevant.
14. Identify missing information. Record assumptions, unknowns, conflicting statements, and questions that must be answered.
15. Establish the BSA's role. Clarify whether you own requirements, process modelling, systems analysis, data mapping, testing support, or some combination.
16. Agree on working arrangements. Identify the project methodology, documentation repository, communication channels, decision-makers, and expected review process.
17. Define an initial understanding of scope. Record what appears to be included and excluded, clearly marking anything that is not yet confirmed.
18. Prepare the discovery approach. Decide which stakeholders to interview, which workshops to conduct, what documents to review, and which existing processes or systems to inspect.

### Outputs

- Initial problem or opportunity statement
- Stakeholder list and preliminary RACI, where useful
- Initial scope and constraints
- Document and system inventory
- Preliminary risks, assumptions, dependencies and open questions
- Discovery agenda and meeting invitations

BSA checkpoint: Can you explain why the initiative exists, who owns the outcome, which systems may be affected, and what you still need to learn?

If not, discovery preparation is not complete.

## 3. Phase 2, Early discovery session

This is one of the most important stages because the quality of everything downstream depends on whether the team understands the actual problem.

### 3.1 Before the meeting

The BSA should prepare deliberately.

1. Confirm the meeting objective with the requester.
2. Identify the decisions the session needs to produce.
3. Confirm the participants and their responsibilities.
4. Include people who perform the work, not just their managers.
5. Include system or technical representatives when the request has a known technology impact.
6. Identify whether compliance, legal, security, privacy, architecture, or operations must participate.
7. Send the invitation with a clear purpose, agenda, and expected preparation.
8. Attach relevant existing documents rather than expecting attendees to find them.
9. Review the documents and highlight contradictions or missing details.
10. Prepare open-ended questions rather than leading questions.
11. Prepare a whiteboard or process-mapping template if appropriate.
12. Prepare a way to record decisions, assumptions, risks, requirements candidates, and action items separately.
13. Assign a note-taker if another team member can help.
14. Confirm whether the session will be recorded, if recording is permitted and useful.
15. Ensure confidential customer, policyholder, or production data will not be unnecessarily exposed.

### 3.2 Open the session

The BSA should establish a shared understanding before discussing solutions.

1. Introduce participants and their roles.
2. Identify the business owner and decision-maker.
3. Explain the purpose of the meeting.
4. Confirm the agenda and available time.
5. Explain that the objective is to understand the problem before committing to a solution.
6. Clarify that the session may identify questions requiring follow-up rather than resolve everything immediately.
7. Confirm terminology. For example, determine whether "quote completion" means a quote was calculated, saved, presented to the customer, or bound.
8. Establish how decisions and unresolved questions will be documented.
9. Ask whether there are any immediate constraints or deadlines that could change the discussion.

### 3.3 Understand the business problem

Start with the business situation, not the requested feature.

Ask questions such as:

- What are you trying to achieve?
- What is happening today?
- What is not working as expected?
- Who experiences the problem?
- How often does it happen?
- How do you know it is a problem?
- What is the impact on customers, employees, cost, risk, revenue, or compliance?
- What happens if nothing changes?
- Why does this need to be addressed now?
- What evidence supports the request?
- What would a successful outcome look like?

Then investigate each answer.

For example, if a stakeholder says, "We need a new address lookup field," the BSA should ask why. The actual problem may be invalid addresses, manual data entry, failed rating requests, or customer abandonment.

These are different problems and may require different solutions.

### 3.4 Separate symptoms, causes and proposed solutions

Capture three distinct things:

| Category | Example |
| --- | --- |
| Symptom | Customers abandon the quote journey after entering their address. |
| Possible cause | The address field is confusing or rejects valid addresses. |
| Proposed solution | Add an address autocomplete service. |

Do not assume the proposed solution is correct simply because a stakeholder requested it.

Investigate the cause through available evidence: customer feedback, analytics, system logs, process observation, interviews, and defect records.

A cause should remain a hypothesis until sufficient evidence supports it.

### 3.5 Understand the current business process

Ask the stakeholder to explain the process from beginning to end.

1. What triggers the process?
2. Who starts it?
3. What information is needed?
4. Where does the information come from?
5. What does the user do first?
6. What happens next?
7. Which system is used at each step?
8. What information is entered, retrieved, calculated, or transferred?
9. Which business rules apply?
10. What decisions are made?
11. What happens when information is missing or invalid?
12. What exceptions occur?
13. Who approves or reviews the work?
14. What happens when an approval is rejected?
15. Are there manual workarounds?
16. Does information need to be re-entered?
17. Which steps take the most time?
18. Where do errors occur?
19. What happens when a system or external service is unavailable?
20. What is the final output or business outcome?

Ask the stakeholder to walk through a real or representative case. This often reveals details that people forget when describing a process from memory.

### 3.6 Identify users and affected parties

For each user group, establish:

- Their role and responsibilities
- Their objective in the process
- Their permissions and access
- Their current pain points
- Their level of technical familiarity
- Their information needs
- Their approval or decision authority
- How the change may affect their work
- Whether they require training or operational support

Also consider people who may not use the interface directly but are affected by the change, such as finance, compliance, customer support, reporting, and downstream system owners.

### 3.7 Understand business rules and exceptions

Ask what determines whether a process can proceed.

For example:

- Which fields are mandatory?
- What values are permitted?
- Are there eligibility conditions?
- What thresholds apply?
- Who can override a rule?
- Are there different rules by product, jurisdiction, customer type, or transaction?
- What happens when two rules conflict?
- Are rules configurable or hard-coded?
- What happens when a customer changes previously entered information?
- What is the effective date of the rule?
- Are there grandfathering or transition provisions?

Do not document only the happy path. Exceptions frequently contain the most important requirements.

### 3.8 Establish the desired future state

Once the current state is understood, ask:

- What should be different?
- Which steps should be removed, simplified, automated, or retained?
- What must the user be able to do?
- What information must the system display, capture, calculate, or transfer?
- What must happen automatically?
- What decisions still require a human?
- What should happen when the process fails?
- What must remain unchanged?
- What would make the solution unacceptable?
- How will the business measure success?

Avoid jumping straight to screens or technical implementation. Define the desired behaviour first.

### 3.9 Close the discovery session

Before the meeting ends:

1. Summarize the problem in plain English.
2. Recap the current-state process.
3. Summarize the desired outcomes.
4. Identify the initial scope and exclusions.
5. Read back critical rules and constraints.
6. Highlight conflicting stakeholder statements.
7. Confirm which facts remain unverified.
8. Identify missing stakeholders or subject-matter experts.
9. Record decisions made during the meeting.
10. Assign each follow-up action to a named owner.
11. Agree on a due date for each action.
12. Confirm whether a second discovery session is needed.
13. Explain the next step: analysis and validation, not automatic approval to build.

### Outputs from discovery

- Discovery notes
- Problem statement
- Current-state process
- Initial future-state objectives
- Stakeholder needs
- Initial business rules
- Scope candidates
- Assumptions and constraints
- Open questions and action log
- Initial risks and dependencies

A discovery session is successful when the team has a shared understanding of the problem and knows what must be investigated next. It is not necessarily successful because everyone has agreed on a feature.

## 4. Phase 3, Post-discovery analysis and validation

This is where the BSA turns meeting notes into a coherent, evidence-based understanding.

The meeting itself is only one input. The BSA must consolidate and validate what was learned.

### Step-by-step

1. Organize the notes by topic: problem, process, users, rules, systems, data, constraints, and outcomes.
2. Separate confirmed facts from stakeholder opinions and assumptions.
3. Separate business needs from proposed solutions.
4. Resolve ambiguous terminology.
5. Identify conflicting statements between stakeholders.
6. Identify duplicated or overlapping needs.
7. Identify information that has not been provided.
8. Follow up with action owners.
9. Request supporting evidence where the problem is based on a reported trend or incident.
10. Review relevant tickets, reports, analytics, system logs, and historical documentation.
11. Observe users performing the existing process where practical.
12. Walk through representative examples or test cases.
13. Document the current-state process using a flowchart, BPMN diagram, or another agreed format.
14. Identify handoffs between departments and systems.
15. Identify manual steps, delays, rework, errors, and control weaknesses.
16. Record business rules separately from process steps.
17. Identify the data required at each step.
18. Identify the systems that create, store, transform, and consume the data.
19. Identify affected downstream processes and reports.
20. Document known constraints and dependencies.
21. Identify potential regulatory, privacy, security, accessibility, and operational implications.
22. Identify root-cause hypotheses and the evidence supporting each.
23. Distinguish symptoms from verified causes.
24. Identify which issues can be solved through process changes versus system changes.
25. Prepare a concise problem statement and supporting evidence.
26. Validate the consolidated findings with the relevant stakeholders.
27. Update the documentation based on feedback.
28. Obtain confirmation that the problem and current state have been represented accurately.

### Example: quote abandonment

Suppose the business reports that customers are abandoning insurance quotes.

The BSA investigates:

- Where in the journey do customers leave?
- Are the events tracked correctly?
- Are customers experiencing validation errors?
- Does the page fail on particular devices?
- Are customers being asked for the same information twice?
- Is a third-party lookup service slow or unavailable?
- Are users abandoning the journey for unrelated reasons?
- Does the analytics definition of "completed quote" match the business definition?

If tracking is incomplete, the BSA must account for that limitation before drawing conclusions.

Key deliverable: a validated problem statement, supported by evidence, rather than a feature request presented as a fact.

## 5. Phase 4, Scope, objectives and success criteria

Before detailed solution design, establish what the initiative is expected to deliver.

### Step-by-step

1. Define the business objective.
2. Identify the desired business outcome.
3. Establish the baseline where data is available.
4. Define measurable success indicators.
5. Identify the users and business processes in scope.
6. Identify the systems and interfaces in scope.
7. Define the functionality that must be included.
8. Document explicit exclusions.
9. Identify dependencies on other teams, vendors, projects, or releases.
10. Identify assumptions that could affect the scope.
11. Identify constraints such as regulatory dates, platform limitations, and funding.
12. Determine whether the change is mandatory, discretionary, or a mix.
13. Assess the impact of delaying or not delivering.
14. Identify the minimum viable scope, if relevant.
15. Separate must-have requirements from enhancements that can be deferred.
16. Identify what constitutes acceptance of the initiative.
17. Review the proposed scope with the business owner and delivery team.
18. Record scope decisions and obtain approval through the project's agreed governance process.
19. Establish how future scope changes will be assessed and approved.

### Write measurable objectives

Weak objective: "Improve the quote process."

Stronger objective: "Increase the proportion of eligible customers who complete the quote journey by reducing address-entry friction, while maintaining existing underwriting and validation rules."

A target percentage should only be added when the business has established a defensible baseline and agreed on a realistic target.

### Distinguish the different levels of success

- Business outcome: more eligible customers complete quotes.
- Process outcome: fewer customers encounter address-entry problems.
- System outcome: valid addresses are retrieved and validated reliably.
- Delivery outcome: the approved functionality is implemented and passes the agreed tests.

These are related but not interchangeable. Delivering a feature does not prove that the intended business benefit was achieved.

## 6. Phase 5, Stakeholder analysis and requirements elicitation

Discovery does not end after one meeting. The BSA uses interviews, workshops, document analysis, observation, system analysis, surveys, and prototypes as appropriate to close information gaps.

### Step-by-step

1. Build a stakeholder register.
2. Identify who provides business knowledge.
3. Identify who owns business rules.
4. Identify who approves requirements.
5. Identify who owns the affected systems.
6. Identify who understands integrations and data.
7. Identify who will test the solution.
8. Identify who will support it after release.
9. Identify who can approve regulatory, security, privacy, or operational controls.
10. Assess which stakeholder groups have conflicting objectives.
11. Schedule targeted interviews for topics requiring deeper investigation.
12. Prepare questions specific to each stakeholder's expertise.
13. Conduct interviews and record evidence, examples, and unresolved questions.
14. Facilitate cross-functional workshops where decisions require multiple groups.
15. Review existing policies, procedures, contracts, regulations, and system documentation.
16. Observe actual work where practical.
17. Examine representative cases, including failures and exceptions.
18. Use prototypes or process models to clarify ambiguous needs.
19. Record requirements candidates in a central repository or backlog.
20. Link each requirement to its source, business rationale, and relevant stakeholders.
21. Validate interpretations with the people who supplied the information.
22. Resolve conflicts through the designated decision-maker rather than silently choosing one stakeholder's preference.
23. Update the stakeholder and requirements records.
24. Confirm that no material stakeholder group has been overlooked.

### What to ask different stakeholders

| Stakeholder | Main focus |
| --- | --- |
| Business owner | Outcomes, priorities, business value |
| End users | Actual workflow, usability, exceptions |
| Product owner | Scope, backlog priorities, acceptance |
| Architect | Solution boundaries, architecture, constraints |
| Developer | System behaviour, implementation implications |
| QA / tester | Testability, scenarios, edge cases |
| Data / integration team | Data ownership, mappings, interfaces |
| Security / privacy | Access, sensitive data, controls |
| Operations / support | Monitoring, incident handling, support readiness |
| Compliance / legal | Applicable obligations and evidence |

The BSA facilitates the conversation, but does not independently decide matters outside their authority. For example, the architect owns architecture decisions, the business owner approves business policy, and the appropriate compliance or legal authority interprets applicable obligations.

## 7. Phase 6, Current-state and future-state process modelling

The purpose of process modelling is to make the work visible so the team can identify exactly what must change.

### 7.1 Build the current-state model (AS-IS)

1. Define the start event and end event.
2. Identify each activity in sequence.
3. Identify the person, role, department, or system performing each activity.
4. Identify decision points.
5. Document the conditions that determine each decision.
6. Identify inputs and outputs for each activity.
7. Identify system interactions.
8. Identify manual handoffs and approvals.
9. Document exception and failure paths.
10. Identify rework loops and repeated data entry.
11. Identify wait times, queues, and dependencies.
12. Identify controls, validations, and audit steps.
13. Validate the model with actual process participants.
14. Correct gaps between the documented process and actual practice.

### 7.2 Design the future-state model (TO-BE)

1. Start from the business outcome rather than copying the existing process.
2. Identify unnecessary steps.
3. Identify activities that can be automated.
4. Identify activities that must remain manual.
5. Identify where users need guidance or feedback.
6. Define decision points and business rules.
7. Define required inputs and outputs.
8. Define system responsibilities.
9. Define error and exception handling.
10. Define fallback procedures when dependent services are unavailable.
11. Identify changes to roles, permissions, approvals, and controls.
12. Identify downstream process changes.
13. Identify transition or migration requirements.
14. Compare the AS-IS and TO-BE models.
15. Document what changes, what remains unchanged, and why.
16. Validate feasibility with architecture and delivery teams.
17. Review the future-state process with business stakeholders.
18. Record approval and unresolved decisions.

### Example: address entry in PolicyCenter

Current state (illustrative):

1. Customer manually enters address
2. System validates entered fields
3. Invalid address? If yes, show error and re-enter. If no, continue quote.

Possible future state:

1. Customer enters partial address
2. Address service returns suggestions
3. Customer selects an address
4. System validates, maps and stores address

The future state is a design hypothesis until business rules, integration behaviour, and fallback requirements are confirmed.

The diagram alone is not enough. The BSA must also establish what happens when the service returns no matches, times out, returns an incomplete address, or is unavailable.

## 8. Phase 7, Solution options and feasibility analysis

A BSA should understand the available solution options before turning requirements into detailed specifications.

### Step-by-step

1. Identify the capabilities needed to resolve the business problem.
2. Determine whether existing system functionality can satisfy the need.
3. Review existing configuration and reusable components.
4. Determine whether the issue is caused by a configuration gap, process issue, defect, missing integration, or genuinely new capability.
5. Identify possible options, including process change, configuration, extension, third-party service, or custom development.
6. Compare options against business requirements.
7. Assess impacts on existing functionality.
8. Assess integration and data implications.
9. Assess security, privacy, accessibility, compliance, and operational implications.
10. Assess maintainability and upgrade compatibility.
11. Assess cost, delivery time, complexity, and dependencies.
12. Identify vendor or licensing constraints.
13. Assess risks and limitations of each option.
14. Identify what requires proof of concept or technical investigation.
15. Work with the architect and developers to establish technical feasibility.
16. Document options, trade-offs, assumptions, and recommendations.
17. Present the options to the appropriate decision-makers.
18. Record the selected approach and the rationale.
19. Update scope, risks, dependencies, and estimates as needed.

### Example: three possible solutions

| Option | Advantages | Trade-offs |
| --- | --- | --- |
| Improve existing validation | Lower complexity; uses current system | May not solve address-entry friction |
| Integrate an address lookup service | Potentially better data quality and usability | External dependency, cost, latency, fallback behaviour |
| Replace the full address-entry journey | Greater design flexibility | Broader scope, regression risk, longer delivery |

The BSA facilitates this analysis; the appropriate business and technical owners make decisions within their respective authority.

## 9. Phase 8, System analysis and impact assessment

This is where a Business Systems Analyst goes beyond general business analysis: the BSA investigates how a change affects the behaviour and interactions of the existing technology.

### 9.1 Identify the system boundaries

1. Identify the system where the change originates.
2. Identify the systems that receive information.
3. Identify external services and vendors.
4. Identify systems that supply reference data.
5. Identify the system of record for each affected data element.
6. Identify shared components that may be reused.
7. Identify interfaces and integration points.
8. Identify batch jobs, scheduled processes, and asynchronous events.
9. Identify reporting and analytics dependencies.
10. Identify administrative tools and operational processes that may also be affected.

### 9.2 Trace the end-to-end system flow

For every important business action, establish:

- Which user or system initiates it?
- Which screen, API, event, or process receives the request?
- What validations run?
- What data is read or written?
- What business rules execute?
- Which systems are called?
- What response comes back?
- What happens when the response is invalid?
- What happens when the operation fails?
- Is the operation retried?
- Can the operation be repeated safely?
- What is logged?
- What information is presented to the user?
- What downstream processes are triggered?

### 9.3 Examine the existing implementation

Depending on access and the project's working model, review:

- Application screens and field behaviour
- Configuration and product rules
- API documentation and interface contracts
- Data models and field definitions
- Integration mappings
- Existing requirements and acceptance criteria
- Logs, defect records, and error messages
- Existing test cases and test results
- Vendor documentation and known limitations

The BSA does not necessarily inspect source code or configure the system personally. The responsibility is to understand system behaviour sufficiently to analyse the requirement, ask the right technical questions, and document the agreed solution accurately.

### 9.4 Perform impact analysis

For each proposed change, assess the following.

| Impact area | Questions to resolve |
| --- | --- |
| UI / UX | Which screens, fields, messages, and user journeys change? |
| Business logic | Which rules, calculations, eligibility conditions, or validations change? |
| Data | Which fields, structures, formats, and mappings change? |
| Integrations | Which APIs, events, endpoints, or external services are affected? |
| Security | Do authentication, authorization, roles, or sensitive data handling change? |
| Reporting | Are dashboards, extracts, metrics, or reports affected? |
| Existing functionality | Could other products, workflows, or user groups be affected? |
| Operations | Does monitoring, support, configuration, or incident handling change? |
| Testing | Which existing tests need updating or repeating? |
| Deployment | Are configuration changes, data migrations, sequencing, or feature flags required? |

### 9.5 Produce an impact assessment

Document:

1. Proposed change
2. Business reason
3. Affected applications and components
4. Affected users and processes
5. Data and integration impacts
6. Dependencies and constraints
7. Risks and potential side effects
8. Required testing and regression coverage
9. Deployment considerations
10. Outstanding technical questions
11. Recommended next actions
12. Relevant decision-makers and approvals

The important distinction: impact analysis is not simply listing the screen being changed. It is tracing what else may change because that screen or function changes.

## 10. Phase 9, Data analysis and mapping

Data requirements often determine whether an otherwise well-designed feature actually works.

### Step-by-step

1. Identify every data element required by the process.
2. Identify where each value originates.
3. Establish the authoritative source for each value.
4. Identify which system owns the data.
5. Determine whether the value is entered, retrieved, derived, calculated, or defaulted.
6. Confirm data types and formats.
7. Confirm mandatory, optional, and conditional fields.
8. Define valid values and permitted ranges.
9. Define code sets and reference data.
10. Identify unique identifiers and keys.
11. Define relationships between entities.
12. Document source-to-target field mappings.
13. Define transformation and normalization rules.
14. Define how null, blank, unknown, and not-applicable values are treated.
15. Define defaulting rules.
16. Define validation behaviour.
17. Define handling for duplicates and conflicting values.
18. Confirm date, time, timezone, currency, and precision rules where relevant.
19. Identify sensitive or personal information.
20. Confirm access, retention, masking, and logging requirements with the appropriate owners.
21. Determine whether historical data requires migration or transformation.
22. Identify backward-compatibility requirements.
23. Define reconciliation checks where data moves between systems.
24. Review mappings with the source and target system owners.
25. Record unresolved mapping decisions and obtain approval from the relevant owners.

### Example: source-to-target mapping

| Source field | Target field | Rule |
| --- | --- | --- |
| Address service: street number | PolicyCenter address field | Map according to the agreed address model |
| Address service: postal code | PolicyCenter postal code | Normalize and validate using applicable rules |
| User-selected address | PolicyCenter address record | Store only after required validation |
| Address service status | UI validation state | Display the agreed success, no-match, or error response |

This is illustrative; actual mappings must follow the system's data model and integration contract.

### Data questions that are easy to miss

- Can a field be null even when the UI makes it mandatory?
- Can an external system return a different format than expected?
- Can the same request be submitted twice?
- What happens when data changes between retrieval and submission?
- Which system wins when two sources disagree?
- Does the target system retain the original value?
- Are values rounded or truncated?
- What happens to historical records?
- Are failed transactions reconciled?
- Is there a way to trace a business transaction across multiple systems?

## 11. Phase 10, Integration and API analysis

When systems communicate, the BSA must define the expected interaction, not merely state that "an API is required."

### Step-by-step

1. Identify the source and target systems.
2. Identify the business event that triggers the interaction.
3. Identify the relevant API, event, or interface.
4. Confirm the interface's purpose and owner.
5. Review the API specification or interface contract.
6. Identify the HTTP method and endpoint, where applicable.
7. Define the request fields and required headers.
8. Define the response structure.
9. Confirm authentication and authorization requirements with the technical team.
10. Identify data transformations.
11. Define required validations before sending the request.
12. Define validations after receiving the response.
13. Document expected success responses.
14. Document expected error responses.
15. Define timeout behaviour.
16. Define retry rules and limits.
17. Determine whether retries could create duplicate transactions.
18. Confirm idempotency requirements where applicable.
19. Define handling for partial failures.
20. Determine whether the operation is synchronous or asynchronous.
21. Define expected performance and latency.
22. Identify rate limits and service quotas.
23. Confirm how version changes are managed.
24. Define logging, correlation IDs, and monitoring requirements.
25. Confirm that sensitive information is not unnecessarily exposed in logs.
26. Identify external service availability and fallback expectations.
27. Document integration dependencies and sequencing.
28. Review the interaction with the architect and integration team.
29. Define test scenarios for successful and unsuccessful interactions.
30. Confirm ownership for interface changes and incident resolution.

### Example: address lookup

A simplified flow might be:

1. The customer enters an address fragment.
2. The frontend validates basic input.
3. The frontend requests address suggestions.
4. The address service returns suggestions or an error.
5. The customer selects a suggestion.
6. The application maps the selected address into its internal model.
7. The application performs the required validation.
8. The address is submitted to the appropriate backend service.
9. The backend applies its own business and data validation.
10. The application receives the result.
11. The UI displays the next step or the appropriate error.
12. The transaction is logged and monitored according to the agreed design.

The BSA must confirm which components actually perform each step. A browser may call a backend that calls the external service; the browser may not call the external provider directly.

## 12. Phase 11, Requirements engineering

At this point, the BSA should have enough understanding to define what the solution must do and the conditions it must satisfy.

Requirements are not all the same. Confusing their levels leads to incomplete specifications and unclear ownership.

### 12.1 Understand the requirement hierarchy

| Type | What it defines | Example |
| --- | --- | --- |
| Business requirement | The business outcome or capability needed | Reduce address-related friction in the quote journey. |
| Stakeholder requirement | What a particular stakeholder needs | Customers need to enter an address without unnecessary manual effort. |
| Functional requirement | What the system must do | The system must display address suggestions matching the entered text. |
| Non-functional requirement | How well the solution must operate | Suggestions must meet an agreed response-time target under defined conditions. |
| Data requirement | What data is needed and how it is handled | The selected address must map to the agreed address fields. |
| Interface requirement | How systems interact | The integration must handle the defined success and failure responses. |
| Business rule | A policy or condition governing behaviour | An address must meet the applicable eligibility and validation rules before the quote proceeds. |
| Transition requirement | What is needed to move to the new solution | Existing in-progress quotes must remain usable after release. |

Some requirements overlap these categories. For example, an interface requirement may also impose a non-functional constraint. The purpose of classification is clarity, not creating unnecessary paperwork.

### 12.2 Write functional requirements

For each requirement:

1. Give it a unique identifier.
2. Use clear, unambiguous wording.
3. State the required system behaviour.
4. Identify the triggering condition.
5. Identify the relevant actor or system.
6. Specify the necessary inputs.
7. Define the expected outputs.
8. Document applicable business rules.
9. Define validation and error behaviour.
10. Define exceptions and alternate flows.
11. Identify relevant permissions and security restrictions.
12. Identify dependencies.
13. Identify constraints.
14. Define how the requirement can be verified.
15. Link it to its business objective and source.
16. Review it with the appropriate stakeholders.
17. Update it based on technical and business feedback.

Avoid vague wording such as "user-friendly," "fast," "seamless," "appropriate," and "as required" unless the terms are explicitly defined.

### 12.3 Write non-functional requirements

Check the relevant categories for the solution:

- Performance and response times
- Availability and resilience
- Capacity and scalability
- Security and access control
- Privacy and data protection
- Accessibility
- Usability
- Compatibility across supported devices and browsers
- Auditability and logging
- Maintainability
- Recoverability and backup
- Data integrity
- Operational supportability
- Regulatory and contractual compliance

Not every initiative needs a separate requirement for every category. The BSA should assess applicability and obtain measurable targets from the appropriate technical or business owners.

### 12.4 Define business rules explicitly

For each rule, document:

- Rule ID
- Description
- Business rationale
- Applicable product or transaction
- Conditions under which it applies
- Required inputs
- Decision or outcome
- Exceptions
- Effective date
- Source or authority
- Rule owner
- Related requirements
- Verification method

A rule such as "valid addresses only" is insufficient if the team has not defined what constitutes a valid address and which system is authoritative.

### 12.5 Validate requirements for quality

A practical review checklist:

- Necessary to meet an identified business need
- Clear and understandable
- Unambiguous
- Consistent with other requirements
- Feasible within the system and project constraints
- Specific enough to implement
- Testable or otherwise verifiable
- Traceable to its source
- Free of unnecessary implementation assumptions
- Complete for relevant success and failure scenarios
- Reviewed by the right stakeholders
- Assigned an owner and appropriate priority

Requirements may live in a BRD, FRD, specification, Jira backlog, modelling tool, or combination of these. The right format depends on the project's governance and delivery approach.

## 13. Phase 12, UX, screens and interaction requirements

Where a change affects the user experience, the BSA works with UX and product design to ensure that the design reflects the business rules and system constraints.

### Step-by-step

1. Identify affected screens and user journeys.
2. Review the existing design and current behaviour.
3. Confirm the intended user actions.
4. Identify required fields and optional fields.
5. Define labels, help text, defaults, and placeholders where relevant.
6. Define validation messages.
7. Define loading states.
8. Define empty states.
9. Define success and confirmation states.
10. Define error states.
11. Define retry and recovery actions.
12. Consider keyboard navigation and accessibility.
13. Consider mobile and responsive behaviour where supported.
14. Confirm how the interface behaves when a service is slow.
15. Confirm what happens if the user navigates away or refreshes.
16. Define whether data is preserved after validation errors.
17. Identify any consent, disclosure, or confirmation requirements.
18. Review prototypes or Figma designs with stakeholders.
19. Confirm that the designs represent all relevant process paths.
20. Validate that the UI can communicate backend outcomes correctly.
21. Record design decisions and unresolved questions.
22. Update requirements and acceptance criteria to match the agreed design.

A design is not a substitute for a requirement. It can show the layout while leaving important business rules, data behaviour, and exception handling undefined.

## 14. Phase 13, Create the delivery backlog

In an Agile environment, the BSA often translates the analysed requirements into epics, features, user stories, acceptance criteria, and supporting technical or testing tasks.

### 14.1 Structure the backlog

A common structure is:

- Epic: a large business capability or outcome.
- Feature: a coherent part of that capability.
- User story: a small, valuable piece of functionality.
- Task: a discrete activity required to deliver the work.
- Defect: behaviour that fails to meet an agreed requirement or expected result.
- Enabler / technical story: work that supports delivery, such as integration foundations or technical investigation.

The exact hierarchy depends on the organization's delivery framework and Jira configuration.

### 14.2 Break down requirements

1. Start with the business outcome.
2. Identify the major capabilities needed.
3. Group related capabilities into features.
4. Break features into independently testable increments.
5. Separate unrelated user outcomes.
6. Identify dependencies between stories.
7. Identify work requiring technical investigation.
8. Identify integration, data, configuration, UX, testing, and migration work.
9. Identify stories that require coordination across teams.
10. Confirm that the proposed stories collectively satisfy the relevant requirements.
11. Avoid splitting work so narrowly that individual stories have no meaningful outcome.
12. Avoid stories so large that they cannot be estimated or delivered predictably.

### 14.3 Write a good user story

A common format is:

> As a [user or actor], I want [capability], so that [business value].

Example:

> As a customer obtaining an insurance quote, I want to select a suggested address so that I can enter accurate address information with less manual effort.

A user story is not the complete specification. The acceptance criteria, business rules, data requirements, and supporting references define the expected behaviour in greater detail.

### 14.4 Write acceptance criteria

Acceptance criteria describe the conditions that must be satisfied for the story to be accepted.

A common format is Given / When / Then.

Example: Address suggestions

AC1, successful lookup:
Given the customer has entered enough text to initiate a lookup,
When the address service returns matching suggestions,
Then the system displays the returned suggestions according to the agreed design.

AC2, no matching results:
Given the address lookup returns no matches,
When the results are displayed,
Then the customer receives the agreed no-results message and can follow the permitted next step.

AC3, service unavailable:
Given the address service is unavailable or times out,
When the customer requests suggestions,
Then the system handles the failure according to the agreed fallback and error-handling rules.

AC4, valid selection:
Given the service has returned address suggestions,
When the customer selects an address,
Then the selected values are mapped to the agreed fields and subjected to the required validation before the process continues.

These are illustrative criteria. The real story must specify the lookup trigger, minimum input, response-time expectation, permitted fallback, validation rules, and any other necessary details.

### 14.5 Check for missing scenarios

For each story, consider:

- Normal successful path
- Missing mandatory input
- Invalid input
- Boundary values
- No results
- Duplicate action
- Service timeout
- Service error
- Partial response
- Unauthorized access
- Conflicting or stale data
- Interrupted workflow
- Retry and recovery
- Existing functionality that must remain unchanged
- Supported browsers and devices, where relevant

Not every scenario belongs in every story. The BSA determines which are relevant and avoids duplicating requirements unnecessarily.

### 14.6 Add supporting information to the story

A well-prepared story may include:

- Story ID and title
- Business value
- Description
- Acceptance criteria
- Linked business and functional requirements
- Relevant process diagrams
- UX designs
- API and data mapping references
- Business rules
- Dependencies
- Assumptions and constraints
- Test data needs
- Priority
- Definition of Done
- Open questions
- Relevant stakeholders or reviewers

The goal is not to create the longest ticket. It is to provide enough information that the team can implement and verify the correct behaviour without repeatedly rediscovering the requirement.

## 15. Phase 14, Backlog refinement and estimation

Backlog refinement is where the BSA, product owner, developers, QA, and other relevant participants test whether the work is understood and sufficiently prepared.

### Before refinement

1. Confirm the backlog item has a clear business purpose.
2. Check that the story is appropriately sized.
3. Review acceptance criteria.
4. Confirm relevant business rules.
5. Attach the latest design and supporting specifications.
6. Identify dependencies and blockers.
7. Identify unresolved questions.
8. Confirm that required stakeholders can attend.
9. Highlight any decision needed during the meeting.

### During refinement

1. Explain the business problem and desired outcome.
2. Walk through the user story.
3. Explain the expected system behaviour.
4. Review acceptance criteria one by one.
5. Walk through success and failure scenarios.
6. Clarify field behaviour, data mappings, and business rules.
7. Discuss integration contracts and dependencies.
8. Ask developers to identify implementation constraints.
9. Ask QA to identify missing scenarios and testability concerns.
10. Confirm the expected behaviour for exceptions.
11. Resolve questions where possible.
12. Record questions requiring further investigation.
13. Assign an owner and due date for each unresolved question.
14. Revise the story and acceptance criteria where necessary.
15. Identify whether additional technical or UX work is required.
16. Estimate effort using the team's agreed approach.
17. Identify dependencies on other stories or teams.
18. Confirm priority with the product owner.
19. Decide whether the story is ready for sprint planning or needs more work.

### After refinement

1. Update the backlog item.
2. Link related requirements, designs, and technical documentation.
3. Record decisions.
4. Follow up on outstanding actions.
5. Update dependencies and delivery risks.
6. Confirm that changes are reflected in the source of truth.
7. Revisit the story when new information materially changes its scope.

### What does "ready" mean?

A Definition of Ready, if the team uses one, commonly checks that the story has a clear objective, understandable acceptance criteria, sufficient supporting information, known dependencies, and a manageable scope.

It does not mean every technical detail must be predetermined. Some teams deliberately leave implementation decisions to developers as long as the required behaviour is clear.

### Who estimates?

The delivery team estimates the work according to its agreed method. The BSA clarifies scope and requirements but should not unilaterally estimate development effort or promise a delivery date.

## 16. Phase 15, Requirements traceability and change control

Traceability connects the original business need to the delivered solution.

Without it, a team may build a technically correct feature that does not satisfy the original business objective.

### Step-by-step

1. Assign identifiers to important requirements.
2. Link each business requirement to the relevant stakeholder needs.
3. Link stakeholder needs to functional and non-functional requirements.
4. Link requirements to business rules, process models, and system components.
5. Link requirements to backlog items.
6. Link backlog items to acceptance criteria.
7. Link acceptance criteria to test cases.
8. Link test cases to test results and defects.
9. Link defects to their affected requirements and stories.
10. Link released functionality to the relevant release record.
11. Maintain the relationships as requirements change.
12. Identify requirements that have no implementing work.
13. Identify stories that cannot be traced to an approved need or justified technical requirement.
14. Identify requirements with no verification method.
15. Identify failed or unexecuted tests.
16. Assess the impact of proposed changes across linked items.
17. Update the affected documentation and tests.
18. Record approvals and decisions according to project governance.

A simple traceability chain is:

Business objective, business requirement, functional requirement / business rule, user story and acceptance criteria, implementation, test case and test result, release and production verification.

### When a requirement changes

1. Capture the requested change.
2. Identify the requester and rationale.
3. Determine whether it corrects a defect, clarifies an existing requirement, or introduces new scope.
4. Identify affected requirements, stories, designs, interfaces, data mappings, and tests.
5. Assess cost, timeline, risk, compliance, and dependency impacts.
6. Obtain technical input where needed.
7. Present the impact to the appropriate decision-maker.
8. Obtain approval or rejection through the agreed change process.
9. Update the authoritative requirements and backlog.
10. Update test cases and supporting documentation.
11. Communicate the decision to affected stakeholders.
12. Confirm that the implementation team is working from the approved version.

In Agile, change control does not necessarily mean a formal change request for every adjustment. It means changes are evaluated, prioritized, communicated, and reflected in the delivery record.

## 17. Phase 16, Build and implementation support

Once the work is prioritized and ready, development begins. The BSA's role does not stop at handoff.

### Before development starts

1. Confirm the story's current approved version.
2. Confirm that the developers can access the relevant documentation.
3. Ensure acceptance criteria are available and understandable.
4. Confirm that required UX designs and interface contracts are accessible.
5. Confirm that key dependencies have owners.
6. Check that unresolved questions will not block implementation.
7. Confirm the relevant product owner or business decision-maker is available for questions.
8. Identify any decisions that must be made before implementation can proceed.

### During development

1. Attend relevant daily stand-ups or delivery discussions when useful.
2. Answer questions about business intent and expected behaviour.
3. Clarify ambiguous requirements.
4. Validate interpretations against the agreed source material.
5. Consult the business owner when a policy decision is needed.
6. Consult the architect or technical owner when an implementation decision is outside the BSA's authority.
7. Update acceptance criteria if a legitimate clarification is approved.
8. Record new decisions and assumptions.
9. Review implementation demonstrations where appropriate.
10. Check that the delivered behaviour aligns with the requirements.
11. Identify gaps between the agreed design and implementation.
12. Assess any proposed deviations.
13. Identify whether deviations require approval.
14. Track dependencies and blockers.
15. Communicate risks to the appropriate delivery lead.
16. Update traceability and documentation as the solution evolves.

### When a developer asks a question

A useful BSA response process is:

1. Understand the exact question.
2. Identify the affected requirement or rule.
3. Check the existing specification and prior decisions.
4. Determine whether the answer is already documented.
5. If it is not, identify the correct decision-maker.
6. Obtain the necessary business or technical clarification.
7. Assess whether the answer changes the requirement.
8. Document the decision.
9. Update the story, specification, or decision log.
10. Communicate the answer to everyone affected.

Avoid making up business rules simply to unblock development. If a decision is unknown, document the uncertainty and escalate it to the appropriate owner.

### When implementation differs from the requirement

The BSA should determine whether:

- The implementation is incorrect.
- The requirement was misunderstood.
- The requirement is incomplete.
- The approved design has changed.
- A system constraint requires a different solution.
- The difference is intentional and approved.

Then document the outcome and ensure that the implementation and requirements are aligned before acceptance.

## 18. Phase 17, Testing preparation and test design

Testing should not begin with the assumption that QA will figure out what to test. The BSA helps establish how the requirements will be verified.

### 18.1 Define the testing approach

1. Identify the testing levels relevant to the change.
2. Identify which team owns each test level.
3. Identify the environments available.
4. Confirm the requirements and acceptance criteria to be tested.
5. Identify test data requirements.
6. Identify dependencies on external systems and test services.
7. Identify required test accounts and access.
8. Identify applicable test tools.
9. Confirm environment readiness.
10. Identify test execution and defect-reporting procedures.
11. Define expected evidence and reporting.
12. Identify any requirements that need specialist testing, such as security, accessibility, or performance testing.
13. Agree on the entry and exit criteria for each testing stage.

### 18.2 Understand the testing levels

| Test type | Main purpose | Typical owner |
| --- | --- | --- |
| Unit testing | Verify individual code units or components | Developers |
| Component testing | Verify a component's behaviour | Developers / QA |
| Integration testing | Verify interactions between systems | QA / integration team |
| System testing | Verify the application against its requirements | QA |
| Regression testing | Ensure existing functionality still works | QA / delivery team |
| User acceptance testing (UAT) | Confirm the solution meets business needs | Business users, with BSA support |
| Performance testing | Verify performance under defined conditions | Performance specialists / QA |
| Security testing | Identify security weaknesses | Security specialists |
| Accessibility testing | Assess accessibility requirements | UX / QA / specialists |

These are not always separate phases. Organizations combine or subdivide them according to their delivery model and risk.

### 18.3 Derive test scenarios from requirements

For every requirement and acceptance criterion:

1. Identify the condition being tested.
2. Identify the necessary preconditions.
3. Identify the test data.
4. Identify the actions to perform.
5. Identify the expected result.
6. Identify the evidence required.
7. Identify whether the scenario is positive, negative, boundary, or exception-based.
8. Identify relevant integration dependencies.
9. Identify whether existing functionality needs regression coverage.
10. Link the scenario to the requirement or acceptance criterion.

### 18.4 Design detailed test cases

A useful test case contains:

- Test case ID
- Test objective
- Linked requirement or story
- Preconditions
- Test environment
- Test data
- Execution steps
- Expected result for each important step
- Actual result
- Pass/fail status
- Evidence or screenshots, where appropriate
- Defect reference, if the test fails
- Tester and execution date

For example, "Test address lookup" is a test scenario, not a complete test case. The detailed test case must specify the input, steps, expected suggestions, and the expected behaviour under the tested conditions.

### 18.5 Cover the less obvious cases

For an address lookup feature, the test design may include:

- Valid address
- Partial address
- No matching address
- Empty input
- Input below the minimum required length
- Special characters
- Long input
- International or unsupported address formats
- Invalid response from the service
- Slow response
- Service timeout
- Service unavailable
- Duplicate request
- Customer selecting a different suggestion
- Address edited after selection
- Required field missing
- Data mapped to the wrong field
- Invalid address submitted directly to the backend
- Unauthorized request
- Unexpected response structure
- Browser refresh during the interaction
- Existing saved quote opened after the change

The BSA and QA team should tailor these to the actual requirements, supported use cases, and system architecture.

## 19. Phase 18, System integration testing (SIT)

SIT verifies that the integrated components and systems work together correctly.

### Before SIT

1. Confirm the relevant build is deployed to the test environment.
2. Confirm the environment configuration.
3. Verify that required services and integrations are available.
4. Confirm interface versions and endpoints.
5. Confirm authentication and permissions.
6. Prepare test data.
7. Confirm that test data is valid and suitable.
8. Confirm that external services use the intended test or sandbox configuration.
9. Verify that logs and monitoring are accessible.
10. Confirm the test cases and execution plan.
11. Identify known environment issues.
12. Confirm defect triage and escalation arrangements.

### During SIT

1. Execute the agreed test cases.
2. Record actual results.
3. Compare actual results with expected results.
4. Capture evidence of failures.
5. Record defects with clear reproduction steps.
6. Identify the affected system or interface.
7. Record request and response details where permitted and safe.
8. Use correlation IDs or other trace identifiers when available.
9. Identify whether a failure originates in the UI, backend, integration, data, configuration, or environment.
10. Route defects to the appropriate team.
11. Retest fixes.
12. Execute regression tests where needed.
13. Record blocked tests separately from failed tests.
14. Maintain the test execution status.
15. Escalate critical defects and unresolved blockers.

### After SIT

1. Confirm which planned tests were executed.
2. Identify passed, failed, blocked, and not-run cases.
3. Review open defects and severity.
4. Confirm whether critical integration issues remain.
5. Assess regression results.
6. Document residual risks.
7. Confirm whether SIT exit criteria have been met.
8. Obtain the appropriate test or delivery sign-off.
9. Update traceability and test evidence.
10. Communicate readiness for UAT, or identify what must be resolved first.

SIT is not necessarily complete when all tests have passed. The team must also assess the significance of unexecuted tests, unresolved defects, and residual risk against its agreed exit criteria.

## 20. Phase 19, Defect management

Defect management is a continuous activity from testing through production support.

### 20.1 Log a defect properly

A useful defect report contains:

1. Unique defect ID.
2. Clear summary.
3. Environment and build version.
4. Preconditions.
5. Test data, using safe and appropriate data.
6. Steps to reproduce.
7. Expected result.
8. Actual result.
9. Reproducibility.
10. Evidence, logs, or screenshots where appropriate.
11. Related requirement, story, or test case.
12. Business impact.
13. Severity and priority, following the team's definitions.
14. Affected system or component.
15. Current owner and status.

### 20.2 Triage the defect

1. Confirm that the reported behaviour is reproducible or otherwise supported by evidence.
2. Determine whether it is a defect, requirement gap, environment issue, data issue, or expected behaviour.
3. Identify the affected business process.
4. Assess the severity and impact.
5. Determine whether the issue blocks other testing.
6. Assign it to the appropriate team.
7. Agree on the next action.
8. Record any workarounds.
9. Assess whether the issue affects scope or release readiness.
10. Escalate where necessary.

### 20.3 Verify the fix

1. Confirm the fix is available in the correct environment.
2. Review the developer's explanation if needed.
3. Reproduce the original scenario.
4. Execute the failed test again.
5. Verify the actual result.
6. Execute relevant regression tests.
7. Record the evidence.
8. Close the defect if the agreed conditions are satisfied.
9. Reopen it if the defect persists or the fix introduces another issue.
10. Update related documentation and traceability.

A BSA may help with triage and verification, but the exact ownership of defect severity, code fixes, and closure varies by organization.

## 21. Phase 20, User acceptance testing (UAT)

UAT determines whether the solution supports the business process and meets the agreed business needs. It is not simply another round of technical testing.

### 21.1 Prepare UAT

1. Confirm the business requirements and acceptance criteria.
2. Identify the business representatives who will test.
3. Confirm that testers represent the relevant user roles.
4. Identify the business processes to validate.
5. Select realistic business scenarios.
6. Prepare test cases and expected outcomes.
7. Prepare suitable test data.
8. Confirm user access and permissions.
9. Ensure the environment is ready.
10. Confirm the business process and relevant training material.
11. Explain how to execute tests.
12. Explain how to record results and report defects.
13. Agree on the UAT schedule.
14. Agree on entry criteria.
15. Agree on exit criteria and the approval process.
16. Confirm who can approve UAT and who can authorize release.

### 21.2 Execute UAT

1. Explain the business scenario and intended outcome.
2. Allow the business tester to execute the process.
3. Observe the actual workflow.
4. Confirm that the behaviour matches the expected business outcome.
5. Check that the rules are applied correctly.
6. Confirm the information displayed to the user.
7. Verify that relevant information is stored correctly.
8. Verify downstream outcomes where required.
9. Capture the actual result.
10. Record failures and unexpected behaviour.
11. Clarify whether the issue is a defect or an incomplete requirement.
12. Route defects for resolution.
13. Retest fixes.
14. Execute regression scenarios affected by the fixes.
15. Record outstanding issues and business workarounds.
16. Maintain the overall UAT status.

### 21.3 Complete UAT

1. Review all planned UAT scenarios.
2. Confirm which passed, failed, were blocked, or were not executed.
3. Review open defects.
4. Assess unresolved risks with the business owner.
5. Confirm that the agreed exit criteria have been met or formally dispositioned.
6. Document any accepted limitations or workarounds.
7. Obtain business acceptance from the authorized approver.
8. Record the decision and its conditions.
9. Update the release-readiness assessment.
10. Escalate any unresolved issue that could affect the release decision.

Important distinction: UAT sign-off means the business has accepted the solution against the agreed acceptance criteria, subject to any explicitly documented exceptions. It does not automatically authorize production deployment.

## 22. Phase 21, Non-functional validation and regression

Functional tests alone may not establish that a solution is safe to release.

### Step-by-step

1. Review applicable non-functional requirements.
2. Confirm that each has an agreed verification approach.
3. Confirm the relevant environment and configuration.
4. Coordinate with the appropriate specialists.
5. Verify performance against agreed thresholds.
6. Verify access control and permissions.
7. Verify privacy and sensitive-data handling.
8. Verify audit logging where required.
9. Verify accessibility requirements where applicable.
10. Verify resilience and failure recovery where required.
11. Verify compatibility with supported platforms.
12. Verify that existing workflows continue to work.
13. Run regression tests based on the impact assessment.
14. Review results and outstanding issues.
15. Record evidence.
16. Assess residual risk.
17. Confirm which findings block release and which require documented risk acceptance.
18. Obtain the relevant approvals.

A BSA does not have to perform every specialist test personally. The BSA helps ensure that applicable requirements are identified, owners are assigned, evidence is obtained, and results are understood.

## 23. Phase 22, Release readiness and deployment planning

This is the transition from "the solution works in testing" to "the organization is ready to operate it in production."

### 23.1 Confirm release scope

1. Identify the exact stories, defects, configuration changes, and components included.
2. Confirm the target release and deployment window.
3. Identify dependencies on other releases or teams.
4. Confirm that the correct versions are being deployed.
5. Confirm that deferred functionality is excluded.
6. Review outstanding changes and ensure they are authorized.
7. Confirm that the release scope matches the tested solution.

### 23.2 Review deployment prerequisites

1. Confirm the deployment plan.
2. Confirm the required environments and configuration.
3. Identify required database or data migrations.
4. Identify reference-data changes.
5. Confirm configuration values and environment-specific settings.
6. Confirm credentials and secrets are managed appropriately.
7. Identify feature flags or staged rollout controls, where used.
8. Confirm deployment sequencing.
9. Identify dependencies that must be available first.
10. Confirm third-party service readiness.
11. Confirm access and operational permissions.
12. Identify required downtime or customer-impact windows.
13. Confirm backups or recovery measures where applicable.
14. Confirm rollback or forward-fix strategy.
15. Define how deployment success will be verified.

### 23.3 Review business readiness

1. Confirm UAT acceptance.
2. Review outstanding defects and accepted risks.
3. Confirm business approval and change authorization.
4. Confirm that affected users have been informed.
5. Confirm training and communication materials.
6. Confirm updated procedures and support documentation.
7. Confirm customer communications or disclosures, if required.
8. Confirm operational support ownership.
9. Confirm monitoring and alerting.
10. Confirm incident escalation arrangements.
11. Confirm any regulatory or compliance approvals that are required.
12. Confirm that the business knows what to expect after release.

### 23.4 Establish go/no-go criteria

The project should define its release criteria in advance. These commonly include:

- Required tests completed with acceptable results
- No unresolved release-blocking defects
- Required approvals obtained
- Deployment plan reviewed
- Rollback or recovery arrangements established
- Monitoring and support ready
- Required communications and training completed
- Dependencies available
- Residual risks reviewed and accepted by authorized owners

The release authority makes the go/no-go decision according to the organization's governance. The BSA supplies evidence and explains business implications; the BSA does not independently authorize a release unless that authority is explicitly part of the role.

## 24. Phase 23, Production deployment and go-live support

The BSA may be involved directly or may support the release manager and operations teams.

### During deployment

1. Confirm the deployment has started according to the plan.
2. Remain available to clarify business behaviour.
3. Track issues and decisions.
4. Confirm that the expected components are deployed.
5. Verify critical configuration or reference-data changes where appropriate.
6. Confirm that dependent services are available.
7. Coordinate business verification with the responsible team.
8. Monitor the agreed release communications.
9. Record deviations from the plan.
10. Escalate issues that could affect customers or business operations.
11. Support the release authority in assessing whether to continue, pause, or roll back.
12. Record the actual deployment outcome.

### After deployment

1. Confirm application availability.
2. Execute agreed smoke tests.
3. Verify critical business journeys.
4. Confirm that integrations are responding as expected.
5. Verify that key data is being processed correctly.
6. Confirm that monitoring and logging are functioning.
7. Check for unexpected errors or spikes in failures.
8. Confirm that critical user groups can access the functionality.
9. Record verification results.
10. Escalate issues using the agreed incident process.
11. Support the rollback or recovery process if the release criteria are no longer satisfied.
12. Communicate the release outcome to relevant stakeholders.

Smoke testing should be focused on essential production behaviour. It is not a substitute for the full testing cycle.

## 25. Phase 24, Post-release monitoring and validation

A release can pass every planned test and still fail to deliver the intended business outcome. Production behaviour, real data, customer usage, and operational conditions may differ from the test environment.

### Step-by-step

1. Confirm that the release is stable.
2. Review production error logs and alerts.
3. Review application and integration availability.
4. Monitor response times and failure rates.
5. Check for unexpected increases in validation failures.
6. Confirm that transactions are being created and processed correctly.
7. Verify that data is reaching downstream systems.
8. Check for duplicate, missing, or incorrectly mapped records.
9. Review support tickets and customer complaints.
10. Ask business users whether the new workflow behaves as expected.
11. Verify that any temporary workarounds have been removed or documented.
12. Compare actual behaviour against the acceptance criteria.
13. Monitor the business metrics agreed during discovery.
14. Compare post-release results against the baseline, accounting for differences in traffic, timing, and other factors.
15. Identify unexpected side effects.
16. Log production defects and route incidents to the appropriate teams.
17. Assess whether an immediate fix, configuration change, rollback, or further investigation is needed.
18. Track each issue to resolution.
19. Confirm that the required business outcome is being achieved, or document why it cannot yet be established.
20. Communicate findings to the product owner and business stakeholders.

### Example: measuring quote completion

Suppose the business introduced address autocomplete to reduce friction in an insurance quote journey.

The BSA could help compare:

- Quote starts before and after release
- Address validation failures
- Address lookup errors and timeouts
- Progression from address entry to the next step
- Overall quote completion
- Customer support contacts related to addresses

The BSA should ensure the metrics have consistent definitions, the analytics instrumentation works, and the comparison accounts for other changes that might affect the results.

A feature going live is a delivery milestone. Demonstrating that it improved the business outcome is a separate achievement.

## 26. Phase 25, Documentation, handover and closure

The final phase ensures that the organization can maintain the solution without depending on the project team to explain everything.

### Step-by-step

1. Update requirements to reflect the final approved behaviour.
2. Update process diagrams where necessary.
3. Update system and integration documentation.
4. Update data mappings and business rules.
5. Confirm that configuration and interface documentation is current.
6. Ensure unresolved limitations are documented.
7. Confirm that known defects have owners and agreed dispositions.
8. Update user guides and operating procedures.
9. Update support documentation and troubleshooting instructions.
10. Confirm that relevant support teams have received the handover.
11. Confirm that ownership of ongoing maintenance is clear.
12. Transfer outstanding actions to the appropriate owners.
13. Archive or retain project evidence according to organizational policy.
14. Ensure decisions, approvals, and test evidence are accessible.
15. Confirm that the release record reflects the final deployment.
16. Review whether the original business objectives have been met or require further measurement.
17. Identify lessons learned.
18. Document improvements for future delivery.
19. Obtain formal project or work-item closure where required.
20. Confirm that post-release monitoring has a defined end point or transitions into normal operational monitoring.

A project may be administratively closed before sufficient time has elapsed to measure long-term business benefits. If so, record who will measure those benefits and when.

## 27. The BSA's core deliverables across the lifecycle

Not every project requires every document. The following table shows the common artifacts and when they are useful.

| Deliverable | Main purpose | Typical timing |
| --- | --- | --- |
| Intake / problem statement | Explain the need for the initiative | Initiation |
| Stakeholder register | Identify contributors and decision-makers | Initiation / discovery |
| Discovery notes and action log | Capture findings and outstanding questions | Discovery |
| AS-IS process model | Document existing behaviour | Analysis |
| TO-BE process model | Define the intended workflow | Analysis / design |
| Scope statement | Define inclusions and exclusions | Early analysis |
| Business requirements document (BRD) | Describe business needs and objectives | Requirements |
| Functional requirements document (FRD) | Specify system behaviour where a separate document is used | Requirements / design |
| Business rules catalogue | Define governing conditions and decisions | Analysis / requirements |
| Impact assessment | Identify affected systems and processes | Solution analysis |
| Data dictionary / mapping | Define data elements and transformations | System analysis |
| Interface specification | Define system interactions | System analysis / design |
| UX designs and annotations | Describe screen behaviour and interactions | Design |
| User stories and acceptance criteria | Define deliverable, testable work | Backlog preparation |
| Requirements traceability matrix (RTM) | Link requirements to implementation and verification | Throughout delivery |
| Test scenarios and cases | Define how requirements will be verified | Test preparation |
| Defect log | Track unexpected behaviour and resolution | Testing / production |
| UAT evidence and sign-off | Record business acceptance | UAT |
| Release readiness checklist | Confirm deployment readiness | Before release |
| Release and rollback plan | Guide deployment and recovery | Release planning |
| Support / operational handover | Enable ongoing support | Before / after release |
| Post-release assessment | Measure stability and business results | After release |

In Agile delivery, these artifacts may be distributed across Jira, Confluence, a modelling tool, test management software, API documentation, and release-management systems. They do not necessarily need to be separate Word or Excel files.

## 28. How the BSA works with the rest of the team

A common source of confusion is assuming the BSA personally owns every activity. The BSA connects the work across disciplines while respecting each role's authority.

| Activity | BSA's contribution | Typical decision / execution owner |
| --- | --- | --- |
| Business problem | Elicit, analyse, document and validate | Business sponsor / owner |
| Scope and priorities | Clarify options and impacts | Product owner / sponsor |
| Business rules | Elicit, model and trace | Authorized business rule owner |
| Solution architecture | Analyse business and system impacts | Solution architect / technical authority |
| Detailed implementation | Clarify requirements and expected behaviour | Developers / technical leads |
| UX design | Define user needs and behaviour | UX designer / product team |
| Test strategy | Ensure requirements are verifiable | QA / test lead |
| SIT | Support analysis and defect triage | QA / integration team |
| UAT | Prepare scenarios and facilitate validation | Business testers / authorized approver |
| Release | Supply readiness evidence and support coordination | Release authority / change management |
| Production operations | Investigate business impacts and support resolution | Operations / support / engineering |
| Benefits realization | Define measures and assess outcomes | Business owner, supported by the BSA |

One person may perform several of these roles in a smaller organization. The essential distinction is between doing the analysis, executing the technical work, and having the authority to approve decisions.

## 29. The smallest details that are most often overlooked

These are the checks that distinguish a superficial requirements process from a disciplined one.

**Discovery**

- Who actually performs each step, not just who owns the department?
- What happens in unusual cases and manual workarounds?
- Are reported problems supported by evidence?
- Which terminology has multiple meanings?
- Who has authority to resolve disagreements?

**Requirements**

Not received. The source document listed this heading with no content.

**Systems and data**

Not received. The source document listed this heading with no content.

**Delivery**

Not received. The source document listed this heading with no content.

**Testing and release**

Not received. The source document listed this heading with no content.

## 30. Complete worked example: from discovery to delivery

Connecting the phases using one hypothetical Guidewire PolicyCenter initiative.

Business request: Improve address entry in an insurance quote journey because customers are having difficulty entering valid addresses.

The following is an example of how a BSA could manage the initiative end to end. It is illustrative, not a claim about any specific production implementation.

**1. Discovery.** The BSA interviews the product owner, customer journey representatives, underwriting, UX, QA, and system owners. The team identifies reports of address-entry problems and agrees to investigate the source.

Output: validated problem statement, stakeholder needs, initial scope and action log.

**2. Analysis.** The BSA maps the existing journey and examines analytics, error reports, and representative cases. The team determines whether the problem involves usability, validation, data quality, service failures, or multiple causes.

Output: AS-IS model, evidence, root-cause findings and success measures.

**3. Solution assessment.** The BSA works with the architect and developers to evaluate existing validation, an address lookup service, and possible interface changes. Data mappings, system boundaries, service failures, and fallback behaviour are discussed.

Output: impact assessment, solution decisions, interface and data requirements.

**4. Requirements and backlog.** The BSA documents the agreed behaviour, business rules, acceptance criteria, and relevant error paths. The product owner prioritizes the stories, and the team refines and estimates them.

Output: approved or agreed requirements, refined stories and testable criteria.

**5. Build and testing.** Developers implement the agreed change. The BSA clarifies behaviour. QA tests normal, invalid, and failure scenarios. SIT verifies integration behaviour, and business representatives validate the journey during UAT.

Output: tested functionality, defect records, traceability and business acceptance.

**6. Release and validation.** The team confirms release readiness, deploys the approved change, runs smoke tests, monitors production, and checks whether address-related errors and quote progression have improved.

Output: release evidence, operational handover and post-release outcome assessment.

Notice what the BSA contributes at every stage: not merely documents, but a reliable chain of understanding between business intent, system behaviour, delivery decisions, and verified results.

## 31. Practical BSA operating checklist

Use this as a working checklist on an actual project. Not every item applies to every initiative, so mark non-applicable items rather than completing paperwork for its own sake.

**Initiation**

- Understand the request and business sponsor
- Review existing documentation and systems
- Identify stakeholders, constraints and dependencies
- Prepare the discovery session

**Discovery**

- Understand the problem and business impact
- Map current process and exceptions
- Identify users, rules and desired outcomes
- Record decisions, assumptions and open questions

**Analysis**

- Validate findings and root causes
- Define scope, exclusions and success measures
- Model AS-IS and TO-BE processes
- Assess solution options, systems and data impacts

**Requirements**

- Document business and system requirements
- Define rules, interfaces, data mappings and error handling
- Validate UX and non-functional requirements
- Review requirements with the relevant owners

**Planning**

- Create and link stories and acceptance criteria
- Identify dependencies and unresolved questions
- Refine and estimate with the delivery team
- Maintain traceability and change control

**Build and test**

- Clarify implementation questions
- Monitor scope and requirement changes
- Prepare test scenarios and data
- Support SIT, defect triage, regression and UAT

**Release**

- Confirm test evidence and business acceptance
- Review defects, risks and release dependencies
- Verify deployment, recovery and support plans
- Confirm authorized go/no-go decision

**Post-release**

- Execute smoke tests and monitor production
- Verify data, integrations and business behaviour
- Measure agreed success indicators
- Complete handover, documentation and closure

## The key insight

The most important responsibility of a BSA is to maintain alignment from the original business problem to the behaviour delivered and the outcome measured.

A strong BSA can answer six questions at any point in the lifecycle:

1. Why are we doing this?
2. Who needs it, and who decides?
3. What must the business and system do?
4. How will the change affect existing systems, data, and processes?
5. How will we prove the solution works?
6. How will we know the change delivered the intended value?

If you can answer those questions with evidence, clear documentation, traceable decisions, and the right stakeholder involvement, you are doing the core work of a BSA from discovery through delivery.

---

## Cleanup notes

Saved as provided, with these changes only. No content was added, removed or reworded beyond this list.

1. Broken inline image links from the source were removed. They pointed to expiring openai.com asset URLs and did not resolve.
2. Interface artifacts from the source rendering were removed: a "0/32" progress counter and a "Copy checklist / Reset" control in section 31.
3. ASCII flow fragments in section 7 and section 16 that arrived as loose lines were rendered as numbered steps. The step text is unchanged.
4. Acceptance criteria in 14.4 arrived as separate loose lines and were grouped under their AC labels. The wording is unchanged.
5. Em dashes were replaced with commas or colons, per project formatting rules.
6. Section 29 arrived incomplete. Only the Discovery items came through. The four remaining headings are marked "not received" rather than filled in, since inventing them would breach project rule 2.
