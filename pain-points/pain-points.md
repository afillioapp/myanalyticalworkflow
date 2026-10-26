# Pain Points with IDs

Last updated: 2026-10-26

Every pain point here has a named source. Nothing is invented, per project rule 2. Where a pain point is only one person's view rather than a recurring pattern, the source column says so.

Sources: RES = research/ba-web-research.md. DOC = research/Deep Research/chatgpt-research.md. OWN = bsa-practice-brief.md, Alireza's own experience.

Phase IDs refer to structure/bsa-lifecycle-phases.md.

## The job itself

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-01 | Doing transcription instead of thinking. One practitioner: a "glorified secretary" who takes notes and writes minutes | PH-02, PH-11 | RES, ModernAnalyst. One strong first-person account, not a measured pattern |
| PP-02 | Endless rework. Stakeholders revise the output and send it back, so the work never feels finished | PH-11, PH-15 | RES, ModernAnalyst |
| PP-03 | Stakeholders cannot state what they need | PH-02, PH-05 | RES. Appears in ModernAnalyst, BA Times and Dice independently |
| PP-04 | No time with the people who actually have the answers | PH-05 | RES, BA Times and Dice |
| PP-05 | Not understanding the domain well enough, and feeling inadequate for it | PH-01, PH-02 | RES, BA Times |
| PP-06 | Deadline pressure on dates that seem unrealistic | PH-04 | RES, BA Times |
| PP-07 | Having to justify the role and prove the impact of the work | PH-04, PH-24 | RES, Dice and IIBA |

## Documents

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-08 | Nobody reads long documents. People open them mid-meeting, scroll, and search for a keyword | PH-11 | RES, The Analyst Edge |
| PP-09 | Four readers with incompatible needs read the same document: sponsor, developer, tester, future author | PH-11 | RES, The Analyst Edge |
| PP-10 | Out of scope is not stated explicitly, so the argument happens later | PH-04 | RES, The Analyst Edge |
| PP-30 | Only the happy path gets documented. Exceptions carry the most important requirements and get missed | PH-02, PH-11 | DOC 3.7 |
| PP-31 | The same term means different things to different departments. "Quote completion" can mean calculated, saved, presented or bound | PH-02 | DOC 3.2. Independently confirmed by PP-36 |

## Traceability

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-11 | Trace links fall out of sync within weeks. Nothing updates linked items automatically | PH-15 | RES, Jama |
| PP-12 | False confidence. A matrix listing only requirement numbers without text looks complete even when the links were never validated. Gaps surface during audits | PH-15 | RES, Jama |
| PP-13 | Maintenance burden. A few hundred requirements becomes thousands of cells to keep current | PH-15 | RES, Jama |

## Tooling

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-14 | Jira has a flat structure. Hierarchies and dependencies between high-level and detailed requirements are hard to represent | PH-13, PH-15 | RES, Reqsuite. Vendor source |
| PP-15 | Jira has no native traceability, no dependency analysis, no version comparison, and no requirement versioning | PH-15 | RES, Reqsuite. Vendor source |
| PP-16 | No automated quality checks for gaps or contradictions in any mainstream tool | PH-11, PH-15 | RES, Reqsuite. Vendor source |

## Process modelling

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-17 | Process maps take days or weeks to create | PH-06 | RES, Analyst's Corner |
| PP-18 | Process maps describe the ideal process and rarely capture workarounds | PH-06 | RES, Analyst's Corner |
| PP-19 | Process maps go out of date quickly, often before the map is finished | PH-06 | RES, Analyst's Corner |

## The model going stale

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-20 | A significant portion of architecture documentation is outdated within a year | PH-06, PH-25 | RES, BlueDolphin. Underlying studies not named |
| PP-21 | Root cause: transformation teams keep changing systems without updating the central repository | PH-25 | RES, BlueDolphin |
| PP-22 | Documenting every process and application, including stable ones, makes the burden unsustainable | PH-06, PH-09 | RES, BlueDolphin |
| PP-23 | Ivory tower. The model drifts from day-to-day operations and the function is seen as academic | PH-06 | RES, BlueDolphin |
| PP-24 | Analysis paralysis. Heavy spend on models that rarely turn into action | PH-03, PH-06 | RES, BlueDolphin |

## Analysis quality

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-27 | 47 percent of unsuccessful projects fail to meet goals because of inaccurate requirements management | PH-11 | RES, PMI Pulse. Measures failed projects only, published 2014 |
| PP-28 | The proposed solution is assumed correct because a stakeholder requested it | PH-02, PH-07 | DOC 3.4 |
| PP-29 | Symptoms are confused with verified causes | PH-03 | DOC 3.4 |
| PP-32 | Related prior work, decisions and unresolved issues are not found before starting | PH-01 | DOC 2.10 |
| PP-33 | Delivering the feature is mistaken for achieving the business outcome | PH-04, PH-24 | DOC 5 |
| PP-34 | Rule effective dates, grandfathering and transition provisions get missed | PH-11 | DOC 3.7 and 12.4 |
| PP-35 | Transition requirements get missed. Work in progress at release time breaks | PH-11 | DOC 12.1 |

## AI and market

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-25 | AI output comes back irrelevant or inaccurate without enough background context | All | RES, Adaptive US. Training vendor source |
| PP-26 | AI has commoditised documentation output, so it no longer differentiates an analyst | PH-11 | RES, two promotional sources with overlapping claims. Weak evidence |

## From Alireza's own work

| ID | Pain point | Phase | Source |
|---|---|---|---|
| PP-36 | The analytics definition of a metric did not match the business definition. Funnel numbers failed to reconcile because the app was a single-page application and GA4 registered no page loads | PH-03, PH-24 | OWN |
| PP-37 | Compliance and legal constraints surfaced late. Three pop-ups seen as friction turned out to be regulatory requirements, learned only after pushback | PH-02, PH-07 | OWN |

## Gaps in the evidence

- No Reddit or practitioner-forum material. Both are unreachable from this environment and ModernAnalyst's forums need a login. See RES section 13.
- Only PP-27 traces to a named study, and that study is from 2013.
- PP-14 through PP-16 come from a vendor selling a competing tool. The specific limitations are checkable, the framing is not neutral.
- PP-26 rests on two promotional sources.
- PP-01, PP-02 and PP-30 would be much stronger with practitioner-forum corroboration.
