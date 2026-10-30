# Outcomes for PH-05, PH-12 and PH-25

Date: 2026-10-30
Sources of truth, and only these: `structure/bsa-lifecycle-phases.md`, `structure/structure-coverage.md`, `bsa-tool-design-spec.md`.

---

## Answer first

**None of the three sources states an outcome for PH-05, PH-12 or PH-25.** All three say so outright:

- `bsa-lifecycle-phases.md`, outcome table: each is "**Not stated in either source** ... Decision needed".
- `structure-coverage.md`, phase outcomes table: each is "Gap. No outcome is defined for this phase. Decision needed". Decision 7 asks: "What does each one produce?"
- `bsa-tool-design-spec.md` section 12, open items: "Phase outcomes not stated in either source: PH-05 stakeholder analysis, PH-12 UX, PH-25 documentation and closure."

So this file does not define the outcomes. That is Alireza's decision (rule 2, no guessing; rule 16; coverage register: "Gaps are reported, never filled").

What the sources do give is enough evidence to make that decision quickly. For each phase, below: what the sources say, the candidate outcome the evidence points to, and what is still open. A candidate is marked as such. It is not an outcome until accepted.

---

## Summary

| Phase | Core job (lifecycle file) | v1 scope | Rail phase that covers it (spec 6b) | Candidate outcome the sources point to | Status |
|---|---|---|---|---|---|
| PH-05 Stakeholder analysis and requirements elicitation | Close information gaps through the right people | Yes | Discovery session (with PH-02) | Stakeholder map and RACI; generated questions answered; assumptions logged; glossary terms resolved | Candidate. Decision needed |
| PH-12 UX, screens and interaction requirements | Make the design carry the business rules and constraints | Partial | **None** | Nothing in the sources names a UX artifact | No candidate. Decision needed |
| PH-25 Documentation, handover and closure | Let the organisation maintain it without the project team | Partial | Sign off | The signed-off option promoted into the baseline (F-21 write-back), with a decision log | Candidate. Decision needed |

---

## PH-05 Stakeholder analysis and requirements elicitation

**What the sources say**

- Stage S2 Discovery and elicitation, shared with PH-02. PH-02's outcome is "Discovery notes, current-state facts" (lifecycle file).
- Rail: the Discovery session covers PH-02 and PH-05. It closes when "All generated questions answered, assumptions logged, glossary terms resolved" (spec 6b).
- The rail phase before it, Impact analysis, closes with "stakeholders identified" (spec 6b).
- Spec section 8 lists "**Stakeholder map and RACI.** Derivable from the model, but must be a visible output."
- The model already has the pieces: Role, Person, Department, Team, ExternalParty nodes; a "stakeholder" Requirement subtype; Assumption and GlossaryTerm nodes (spec section 4).
- Coverage register: ST-01-13 "Identify initial stakeholders", outcome "A stakeholder list", is Partial: "no feature produces it".

**Candidate outcome**

Two parts, both named in the sources:
1. Stakeholder map and RACI (spec 8). This is the "stakeholder analysis" half of the phase name.
2. The Discovery session exit condition: every generated question answered, assumptions logged, glossary terms resolved (spec 6b). This is the "elicitation" half.

**Open points**

- PH-01's outcome already includes a "stakeholder list". The sources do not say how PH-05's stakeholder map differs from it. One reading: PH-01 gives the initial list, PH-05 the full map with RACI. That reading is not stated anywhere.
- No feature ID produces the stakeholder map or RACI (coverage register, ST-01-13). If the map becomes PH-05's outcome, PH-05 stays a Gap until a feature does.
- The Discovery session exit condition is shared with PH-02, so it cannot alone show PH-05 is done.

---

## PH-12 UX, screens and interaction requirements

**What the sources say**

- Stage S5 Requirements and documentation, shared with PH-11 (outcome: written requirements). v1 scope: Partial (lifecycle file).
- **No rail phase covers PH-12.** It does not appear in the Covers column of spec 6b. (PH-03, PH-09 and PH-10 are also absent from that column. They are outside this file's scope.)
- Requirement subtypes are business, stakeholder, functional, non-functional, data, interface, transition. There is no UX or screen subtype (spec 4).
- The model has a Form node (spec 4), for example OPCF 47R. Forms are data, not screens.
- Spec section 7 "UI and UX direction" is about the **tool's own** interface, not the UX of the system being analysed. It is not evidence for PH-12.
- Spec section 11 (test case): UX is one of the teams involved, and "Compliance and legal hold sign-off authority on customer-facing flow elements".

**Candidate outcome**

None. No source names a UX deliverable (wireframe, screen spec, interaction requirement, or similar). Proposing one here would be a guess.

**Open points**

- What PH-12 produces.
- Whether it gets a rail phase, or is folded into an existing one. Today nothing on the rail can close it.
- Whether "Partial" v1 scope means the tool captures the rules a screen must carry (the core job) without producing designs. The sources do not say what the "Partial" covers.

---

## PH-25 Documentation, handover and closure

**What the sources say**

- Stage S11 Post-release validation, shared with PH-24 (outcome: "Validated outcome, measured against the baseline"). v1 scope: Partial (lifecycle file).
- Rail: Sign off covers PH-25. It closes when "Recorded". CTA: "Promote to baseline" (spec 6b).
- Spec section 1: "sign off writes back into Part 1. The chosen to-be becomes the new as-is. Process maps update, new rules land in the rule library, new integrations appear in the systems map."
- Spec section 6, step 10: "Sign off. Recorded state. Promotes the option into the baseline."
- Spec section 5: on sign off the chosen option is promoted and applied to the baseline.
- F-21 Write-back loop on sign-off serves PH-25 (traceability). Coverage register: "F-21 write-back is the nearest v1 feature".
- Spec section 8: the decision log, "what auditors ask for".

**Candidate outcome**

The signed-off SolutionOption promoted into the baseline, so the company model reflects the change. This matches the core job: the organisation can maintain it without the project team because the model is current. Named in spec sections 1, 5, 6 and 6b, and F-21.

**Open points**

- **Timing mismatch, not resolved by the sources.** The lifecycle file puts PH-25 in S11, after release (PH-22 to PH-24). The rail maps it to Sign off, which is before build, because v1 ends at sign off. The rail mapping is labelled "an assessment made 2026-10-28" (spec 6b). Both cannot describe the same moment. Needs a decision: is v1's PH-25 only the write-back part, with handover after go-live left for later?
- **"Recorded" is not an outcome as written.** Rule 16 says a phase closes when the outcome exists, not when an activity happened. "Recorded" does not name what exists. "Promoted into the baseline" would, but the spec puts that in the CTA, not the exit condition.
- Handover documentation for support teams, and closure itself, are not described anywhere in the three sources.

---

## Decisions needed

1. **PH-05.** Accept stakeholder map and RACI plus the Discovery session exit condition as the outcome? If yes, which feature produces the map?
2. **PH-12.** What does it produce, and which rail phase closes it?
3. **PH-25.** Accept "signed-off option promoted into the baseline" as v1's outcome, with post-release handover deferred?
4. **PH-25 rail exit condition.** Change "Recorded" to name the outcome?

These are the same three phases as decision 7 in `structure/structure-coverage.md`. Once decided, the outcome tables in `structure/bsa-lifecycle-phases.md` and `structure/structure-coverage.md` need updating.
