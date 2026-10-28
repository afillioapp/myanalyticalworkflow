# Agent: Quality Gate Control

Last updated: 2026-10-28
Status: shape decided. Check list not yet complete.

---

## Stated purpose

The hardest and most sophisticated agent in the system.

It checks everything before anything is published. QA, but applied to every kind of output rather than only to code. Its core job is to ensure the work is not heading in the wrong direction.

Source: stated directly by Alireza, project rule 5.

---

## Pattern

This is the evaluator-optimizer pattern, also called reflection or critic. A generator produces a draft, a critic evaluates it against explicit criteria, and on failure the draft plus the specific issues go back to the generator for revision.

Source: Agentic Design Patterns 2.3 and 3.1. Adopted 2026-10-26.

## Deterministic first

The most important design decision. A model critic given the same prompt as the generator will mostly agree with itself. Deterministic checks are stronger critics than model critics.

Most of what this agent checks is a graph query, not a judgment. Run those first.

**Deterministic checks, run first, can hard block:**

- Orphan requirements. A requirement with no parent business driver or obligation.
- Unaddressed obligations. An obligation from a regulation with no requirement tracing to it.
- Impacted nodes not addressed. From the coverage indicator.
- Nodes with no owner.
- Acceptance criteria with no parent functional requirement.
- Functional requirements with no acceptance criteria.
- Business requirements with no functional requirement beneath them.
- Decision points in a process with no failure path.
- Phase exit conditions not met. Design spec section 6b.
- Nodes marked not applicable with no reason recorded.
- Nodes relied on that are AI-extracted and never human-verified.
- Broken trace links. A reference to a node ID that no longer exists.
- Structure coverage. Added 2026-10-28, rule 15. A row in `structure/structure-coverage.md` for a phase being exited has no status, or is a gap with no decision recorded. The Structure agent produces the register; this agent enforces it.

**Model critic, runs only after the deterministic checks pass:**

Only for things that genuinely need judgment. Prose quality, whether a requirement is actually testable as written, whether a business rule is stated unambiguously, whether a use case is a use case or a restated requirement.

Requirements for the model critic:
- A written rubric with numbered criteria, and nothing else in its prompt.
- A different prompt from the generator. Ideally a different model.
- Structured verdict: pass or fail, plus specific issues and a score.

## Block or advise

Both, split by check type.

- **Deterministic failure: blocks.** The CTA does not unlock.
- **Model critic failure: advises.** Returns findings. The user decides.
- **Retry cap of two or three.** On hitting the cap, escalate to the user and return the best-scored attempt with a flag. Never loop indefinitely.

## When it runs

At every phase transition, against that phase's exit conditions, and before any artifact leaves the tool.

## The limit on its authority

Settled. Source: the BSA process document section 28, adopted into design spec section 6c.

The pattern throughout real BSA practice is that the analyst elicits, analyses, models, traces and facilitates, while someone else decides.

**This agent may block on completeness, traceability and internal contradiction.**

**It may never decide business policy, approve scope, or make an architectural call.** Those are gaps it reports, not gaps it fills. A missing decision is a finding addressed to a named owner, never a decision the agent makes to clear its own gate.

## Feeds the Learner

Every failure this agent catches is a candidate learning. The findings are written in a form the Learner agent can read. See `agents/learner/learner.md`.

---

## Still open

- The full deterministic check list. The list above is a start, not complete.
- The model critic's rubric text.
- What "published" covers beyond sign off and export.
- Whether the user can override a deterministic block, and what that costs. Suggested parallel: the not-applicable escape hatch in design spec section 6b, which requires a recorded reason.
