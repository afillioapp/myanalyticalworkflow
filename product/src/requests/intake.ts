// The intake steps (plans/P4.md section 1, design spec section 6 step 2). One step at a time.
// Pure: the next step follows from the request and its pending changes.

import type { NodeType } from "@/model/taxonomy";
import type { PendingOp, Working } from "./working";

export type IntakeStep =
  // Business request: the four things kept apart, then who sponsors it and how success is measured.
  | "symptom"
  | "cause"
  | "evidence"
  | "solution"
  | "sponsor"
  | "measure"
  // External mandate: which regulation, then the duties it imposes, then the sponsor.
  | "regulation"
  | "obligations";

export const REQUEST_STEPS: readonly IntakeStep[] = ["symptom", "cause", "evidence", "solution", "sponsor", "measure"];
export const MANDATE_STEPS: readonly IntakeStep[] = ["regulation", "obligations", "sponsor"];

// The node type each text step adds as a pending change.
export const STEP_NODE: Partial<Record<IntakeStep, NodeType>> = {
  symptom: "Symptom",
  cause: "CauseHypothesis",
  evidence: "Evidence",
  solution: "ProposedSolution",
  measure: "SuccessMeasure",
};

// Steps that may be skipped. A skip is recorded, so the step is not offered again.
export const OPTIONAL_STEPS: ReadonlySet<IntakeStep> = new Set(["evidence", "measure"]);

export const skipKey = (step: IntakeStep) => `intake:${step}`;

export interface IntakeInput {
  mode: string | null;
  sponsorId: string | null;
  tagged: string[];
  ops: PendingOp[];
  model: Working;
  // ruleIds of answers recorded on this request (skips are stored as answers).
  answeredRules: ReadonlySet<string>;
}

// The regulation a mandate is about: the first tagged Regulation.
export function mandateRegulation(input: Pick<IntakeInput, "tagged" | "model">): string | null {
  const types = new Map(input.model.nodes.map((n) => [n.id, n.type]));
  return input.tagged.find((id) => types.get(id) === "Regulation") ?? null;
}

// The obligations derived from that regulation, in the baseline or pending.
export function obligationsOf(model: Working, regulationId: string): string[] {
  const types = new Map(model.nodes.map((n) => [n.id, n.type]));
  return model.edges.filter((e) => e.type === "derived_from" && e.to === regulationId && types.get(e.from) === "Obligation").map((e) => e.from);
}

export function stepDone(step: IntakeStep, input: IntakeInput): boolean {
  if (input.answeredRules.has(skipKey(step))) return true;
  const node = STEP_NODE[step];
  if (node) return input.ops.some((o) => o.kind === "add_node" && o.payload.nodeType === node);
  if (step === "sponsor") return input.sponsorId !== null;
  if (step === "regulation") return mandateRegulation(input) !== null;
  if (step === "obligations") return false; // finished only by "That is all" (a recorded skip)
  return false;
}

export function intakeSteps(mode: string | null): readonly IntakeStep[] {
  return mode === "mandate" ? MANDATE_STEPS : mode === "request" ? REQUEST_STEPS : [];
}

export function nextIntakeStep(input: IntakeInput): IntakeStep | null {
  return intakeSteps(input.mode).find((s) => !stepDone(s, input)) ?? null;
}
