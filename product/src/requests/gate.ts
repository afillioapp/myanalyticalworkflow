// Quality Gate Control for a request (plans/P4.md section 4, design spec section 6b, the
// Intake row). Every check is a pure yes or no over the request's state. The gate blocks on
// a deterministic failure and never on a judgement call (agents/quality-gate-control).

import type { Layer } from "@/model/taxonomy";
import type { Affected } from "./impact";
import { mandateRegulation, obligationsOf } from "./intake";
import { touchedBy, type PendingOp, type Working } from "./working";

// Coverage counts these layers (plans/P4.md decision 4). People and regulation nodes are
// shown, but not counted: otherwise every role two links away would need a verdict.
export const COUNTED_LAYERS: ReadonlySet<Layer> = new Set(["process", "system", "data", "business"]);

export type CoverageState = "addressed" | "not_applicable" | "blocked";

export interface CoverageItem {
  nodeId: string;
  // "changed": a pending change touches it, so it is addressed without a verdict.
  state: CoverageState | "changed" | null;
  reason: string | null;
}

export interface GateInput {
  trigger: string | null;
  mode: string | null;
  sponsorId: string | null;
  tagged: string[];
  ops: PendingOp[];
  model: Working;
  affected: Affected[];
  verdicts: ReadonlyMap<string, { state: CoverageState; reason: string | null }>;
}

export function coverageItems(input: Pick<GateInput, "model" | "affected" | "ops" | "verdicts">): CoverageItem[] {
  const nodes = new Map(input.model.nodes.map((n) => [n.id, n]));
  const changed = new Set(input.ops.flatMap(touchedBy));
  return input.affected
    .map((a) => nodes.get(a.id)!)
    .filter((n) => n && !n.pending && COUNTED_LAYERS.has(n.layer))
    .map((n) => {
      const v = input.verdicts.get(n.id);
      if (v) return { nodeId: n.id, state: v.state, reason: v.reason };
      return { nodeId: n.id, state: changed.has(n.id) ? "changed" : null, reason: null };
    });
}

export interface Check {
  id: string;
  label: string;
  pass: boolean;
  // The card that fixes it.
  card: string;
}

export function gateChecks(input: GateInput): Check[] {
  const has = (type: string) => input.ops.some((o) => o.kind === "add_node" && o.payload.nodeType === type);
  const items = coverageItems(input);
  const open = items.filter((i) => i.state === null).length;
  const blocked = items.filter((i) => i.state === "blocked").length;
  const checks: Check[] = [
    { id: "trigger", label: "The trigger is recorded", pass: input.trigger !== null, card: "trigger" },
    { id: "mode", label: "The mode is chosen", pass: input.mode !== null, card: "mode" },
    { id: "tagged", label: "Something is tagged as touched", pass: input.tagged.length > 0, card: "touches" },
  ];
  if (input.mode === "request") {
    const missing = [
      ["Symptom", "symptom"],
      ["CauseHypothesis", "cause hypothesis"],
      ["ProposedSolution", "proposed solution"],
    ].filter(([t]) => !has(t)).map(([, label]) => label);
    checks.push({
      id: "intake-three",
      label: missing.length ? `Still to record separately: ${missing.join(", ")}` : "Symptom, cause hypothesis and proposed solution are recorded separately",
      pass: missing.length === 0,
      card: "intake",
    });
  }
  if (input.mode === "mandate") {
    const regulation = mandateRegulation(input);
    const obligations = regulation ? obligationsOf(input.model, regulation) : [];
    const types = new Map(input.model.nodes.map((n) => [n.id, n.type]));
    const unmet = obligations.filter(
      (o) => !input.model.edges.some((e) => e.type === "derived_from" && e.to === o && types.get(e.from) === "BusinessRule"),
    ).length;
    checks.push({
      id: "obligations",
      label:
        obligations.length === 0
          ? "The regulation has at least one duty recorded"
          : unmet
            ? `${unmet} ${unmet === 1 ? "duty is" : "duties are"} not met by a business rule yet`
            : "Every duty is met by a business rule",
      pass: obligations.length > 0 && unmet === 0,
      card: obligations.length === 0 ? "intake" : "questions",
    });
  }
  checks.push(
    { id: "sponsor", label: "A sponsor is named", pass: input.sponsorId !== null, card: "intake" },
    {
      id: "coverage",
      label:
        open || blocked
          ? [open && `${open} affected ${open === 1 ? "item has" : "items have"} no verdict`, blocked && `${blocked} blocked`].filter(Boolean).join(", ")
          : "Coverage is complete",
      pass: open === 0 && blocked === 0,
      card: "coverage",
    },
    {
      id: "reasons",
      label: "Every \"not applicable\" has a reason",
      pass: items.every((i) => i.state !== "not_applicable" || (i.reason ?? "").trim() !== ""),
      card: "coverage",
    },
  );
  return checks;
}
