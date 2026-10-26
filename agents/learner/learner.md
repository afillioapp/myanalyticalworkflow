# Agent: Learner

Last updated: 2026-10-26
Status: pattern decided. Scope and storage not yet decided.

---

## Stated purpose

Updates all the learnings encountered along the way, and prevents the same mistake being made again.

Source: stated directly by Alireza, project rule 6.

---

## Pattern

This is the Reflexion pattern combined with procedural memory.

After a failure, the agent writes a short reflection on what went wrong and stores it. On the next attempt, the reflections are in context. Behaviour improves across attempts with no retraining.

Procedural memory is the memory type this uses: how to do things, instructions, examples that improve over time. Distinct from episodic memory (what happened) and semantic memory (facts).

Source: Agentic Design Patterns 3.2 and 3.5. Adopted 2026-10-26.

## Learnings are visible and editable by the user

The decided rule, and the answer to who approves a learning.

Most memory bugs are write bugs: saving everything, or saving nothing useful. So nothing is persisted silently. Every learning is shown to the user, editable by the user, and the user approves what starts influencing behaviour.

A learning that proves durable may be promoted into `rules/rules.md`. The promotion is a user decision, not an automatic one.

## Scope, settled 2026-10-26

Learnings about **building this app**. Project-level, stored in the repo. Not per-tenant learnings about a customer's business, since all five agents build the product rather than running inside it. See rules rule 4.

## Inputs

- Findings from Quality Gate Control. Every caught failure is a candidate learning.
- User corrections. A node the user fixed after AI extraction got it wrong is the highest signal input in the system, because it says exactly where extraction is weak.
- Rejected or overridden outputs.

---

## Still open

- Where learnings are stored. Scope itself is now settled: see below.
- How a learning is applied. Injected into a prompt, converted into a deterministic check in Quality Gate Control, or promoted to a rule. The strongest option is converting a learning into a deterministic check, because that removes it from the model's judgment entirely.
- Whether learnings expire or get retired when proven wrong.
- How conflicting learnings are resolved.
