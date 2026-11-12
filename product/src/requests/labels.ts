// Plain-language words for what the screens show (DNA-01). No internal names on screen.

import type { TRIGGERS } from "@/db/schema";
import type { EdgeType, Layer, NodeType } from "@/model/taxonomy";
import type { Step } from "./impact";
import type { PendingOp, Working } from "./working";

export const TRIGGER_LABELS: Record<(typeof TRIGGERS)[number], string> = {
  customer_problem: "Customer problem",
  regulatory_change: "Regulatory change",
  operational_inefficiency: "Operational inefficiency",
  system_replacement: "System replacement",
  new_product: "New product",
  audit_finding: "Audit finding",
  defect: "Defect",
};

export const LAYER_LABELS: Record<Layer, string> = {
  org: "People",
  process: "Processes",
  system: "Systems",
  data: "Data and forms",
  business: "Products and rules",
  governance: "Regulation and decisions",
};

// "BusinessRule" -> "Business rule"
export const typeLabel = (t: NodeType) => t.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);

const EDGE_PHRASES: Record<EdgeType, string> = {
  reports_to: "reports to",
  member_of: "belongs to",
  owns: "is responsible for",
  approves: "approves",
  performed_by: "is done by",
  executed_in: "is done in",
  precedes: "comes before",
  part_of: "is part of",
  triggers: "starts",
  reads: "reads",
  writes: "writes",
  integrates_with: "connects to",
  belongs_to: "belongs to",
  renders_on: "appears on",
  governed_by: "follows",
  derived_from: "comes from",
  implements: "implements",
  traces_to: "traces to",
  constrains: "constrains",
};

export const edgePhrase = (t: EdgeType) => EDGE_PHRASES[t];

const nameIn = (model: Working) => {
  const names = new Map(model.nodes.map((n) => [n.id, n.name]));
  return (id: string) => names.get(id) ?? "something removed";
};

// "Change optional benefits is done in Policy Administration System"
export function stepText(model: Working, step: Step): string {
  const name = nameIn(model);
  return `${name(step.from)} ${edgePhrase(step.edgeType)} ${name(step.to)}`;
}

export function opText(model: Working, op: PendingOp): string {
  const name = nameIn(model);
  if (op.kind === "add_node") return `Add ${typeLabel(op.payload.nodeType).toLowerCase()}: ${op.payload.name}`;
  return `${name(op.payload.fromId)} ${edgePhrase(op.payload.edgeType)} ${name(op.payload.toId)}`;
}
