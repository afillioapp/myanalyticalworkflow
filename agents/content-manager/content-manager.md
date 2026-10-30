# Agent: Content Manager

Last updated: 2026-10-28
Status: named only. Not defined.

---

## Stated

Named as an agent by Alireza on 2026-10-26, under project rule 4.

**Purpose, stated 2026-10-26: owns the MD files.** Keeps the spec, rules, roadmap, traceability matrix, pain points, structure and research files current and consistent with each other as decisions change.

**Scope: builds the product.** Not a product feature. Per rules rule 4.

### What that implies

The documentation set now cross-references itself: PP ids in pain-points, PH ids in structure, F ids in traceability, phase gates in the spec, decisions in the roadmap. A decision changed in one place goes stale in four others. That drift is this agent's job.

Concretely, it should catch: a feature in traceability.md with no pain point id and no ST id; a phase with no outcome; a pain point with no source; a spec decision that contradicts the roadmap; an open item that a later decision already closed; a rule adopted but never applied in the spec.

### Boundary with the Structure agent

Added 2026-10-28. The Structure agent checks the app against the external BSA structure document and writes only `structure/structure-coverage.md`. This agent keeps the project's own files consistent with each other. When Alireza accepts a gap the Structure agent raised, this agent writes the decision into the spec, traceability and roadmap. See `agents/structure/structure.md`.

---

## To define

- **Purpose.** What this agent is for, in one sentence.
- **Scope.** Which of the two systems it belongs to. See the open question below.
- **Inputs.** What it reads.
- **Outputs.** What it produces.
- **Authority.** Whether it can block, decide, or only advise.
- **When it runs.** Triggered by a phase, by another agent, or continuously.
- **Relationship to Quality Gate Control.** Whether its output is gated by QGC, which is the default assumption for anything published.
- **What it must never do.**

---

## Open question that applies to all agents

Two different systems are being described by the same word.

1. **Agents that build the product.** A Tech Lead and a Developer agent read most naturally as this: they write and review the application's own code.
2. **Agents inside the product.** Agents that run for a user doing BSA work on their company model.

These need different storage, different lifecycles, and different rules. Which one this agent belongs to is not yet stated. The same ambiguity is already flagged for the Learner agent in `agents/learner/learner.md`.
