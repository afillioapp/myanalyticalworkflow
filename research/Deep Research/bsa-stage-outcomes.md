# BSA stages: outcomes and questions

Source: provided by Alireza on 2026-10-28, in two parts in the same conversation. Origin of the text not stated. Saved verbatim apart from the cleanup noted at the bottom.

Why it was provided: to show what Alireza means by "each step has to have an outcome". Part 1 gives the outcome of each stage. Part 2 gives the questions whose answers produce it. Adopted as project rule 16.

---

## Part 1: Stages and their outputs

| Stage | What happens | Key technique/tool | Output |
|---|---|---|---|
| Initiation | Understand why the work exists before talking to stakeholders | Reviewing intake docs, stakeholder/RACI mapping | Problem statement, stakeholder list |
| Discovery | Meet stakeholders, learn the current process and pain points | Interviews, workshops, open-ended questions | Discovery notes, current-state facts |
| Analysis | Turn raw notes into a validated problem, separate fact from opinion | Root-cause analysis, evidence review | Validated problem statement |
| Scope & success criteria | Define what's in/out and how success is measured | Scope statement, measurable objectives | Agreed scope, success metrics |
| Process modeling | Make the actual workflow visible | AS-IS diagram (current state) → TO-BE diagram (target state) | Process flowcharts |
| Solution options | Compare ways to solve it before committing | Options table (configuration vs. integration vs. custom build), feasibility analysis | Recommended approach |
| System/impact analysis | Trace what else changes when this changes | Impact assessment table (UI, data, integrations, security, reporting) | Impact assessment doc |
| Data analysis | Confirm the data itself works | Source-to-target field mapping | Data mapping doc |
| Integration analysis | Define exactly how systems talk to each other | API/interface spec (request, response, errors, retries) | Interface spec |
| Requirements | Define what the system must do | BRD/FRD, business rules catalogue | Written requirements |
| Backlog | Break requirements into buildable, testable pieces | User stories, Given/When/Then acceptance criteria | Jira backlog |
| Refinement | Confirm everyone understands the story before building it | Backlog refinement session, estimation | "Ready" stories |
| Traceability | Keep every piece linked back to the original need | Requirements Traceability Matrix (RTM) | Traceability chain |
| Build support | Answer questions while developers build | Ongoing clarification, decision log | Aligned implementation |
| Testing | Verify it actually works | Test cases, SIT, defect management | Test evidence, defect log |
| UAT | Business confirms it meets their real need | Business-run scenarios, sign-off | Business acceptance |
| Release | Confirm it's safe to go live | Go/no-go checklist, rollback plan | Release decision |
| Post-release | Confirm it worked in the real world | Monitoring, metric comparison vs. baseline | Validated outcome |

The two tools that show up constantly across stages: AS-IS/TO-BE diagrams (to see the process) and the traceability chain (to prove every requirement got built, tested, and delivered).

---

## Part 2: Questions to ask at each stage

Using the SABS insurance project as an example, these are the key questions a BSA should ask at each stage.

| Stage | Questions to ask |
|---|---|
| 1. Discovery | What problem are we solving? Why is this change needed? What is the deadline? Who are the stakeholders? |
| 2. Current-state analysis | How does the process work today? Who does what? Which systems are involved? Where are the pain points or exceptions? |
| 3. Impact analysis | Which systems, business rules, data, integrations, and reports will be affected? What existing functionality could break? |
| 4. Requirements | What exactly must change? What are the business rules? Who and what does the rule apply to? What are the exceptions? |
| 5. User stories and refinement | What should the system do? What does success look like? What are the acceptance criteria? Are there unresolved questions or dependencies? |
| 6. Development | Does the solution meet the requirements? Have any assumptions or technical limitations emerged? Does a proposed change affect other functionality? |
| 7. SIT and QA | Does the system work as expected? Are integrations working? Have edge cases, exceptions, and regression scenarios been tested? |
| 8. UAT | Can business users complete their real-world tasks? Are the results correct? Are there defects or gaps? Is the business ready to accept the solution? |
| 9. Release readiness | Are critical defects resolved? Is testing complete? Are approvals, deployment steps, support plans, and rollback plans ready? |
| 10. Go-live and monitoring | Is the solution working in production? Are transactions processing correctly? Are there errors, unexpected outcomes, or user issues? |

### The 5 questions to remember

At almost any stage, a BSA can ask:

1. What should happen?
2. What happens today?
3. What needs to change, and why?
4. How do we prove it works?
5. What could go wrong?

Key insight: A BSA keeps asking questions until the business need, expected system behaviour, and definition of success are clear.

---

## Cleanup notes

1. Part 1 was received second and Part 2 first. Part 1 is placed first because it defines the outcomes the questions serve.
2. Table padding whitespace in Part 2 was collapsed. No wording changed.
