// The question engine (F-11, plans/P3.md section 2). A question exists because an edge the
// taxonomy expects is missing on an affected node. Each rule is a row of data: which node
// types it applies to, the edge it expects, which way, what the answer may be, and the
// question. Adding a question type means adding a row.

import type { EdgeType, NodeType } from "@/model/taxonomy";
import type { Working } from "./working";

// A missing link. The answer is a pick from the model, or something new.
export interface EdgeGapRule {
  kind: "edge";
  id: string;
  appliesTo: readonly NodeType[];
  edge: EdgeType;
  // "out": the affected node is the edge's from end. "in": it is the to end.
  direction: "out" | "in";
  // The node types an answer may pick. Also what counts as the gap being filled.
  answer: readonly NodeType[];
  question: (name: string) => string;
}

// P4: a missing attribute (design spec section 4c). The answer is text, stored on the node.
export interface AttributeGapRule {
  kind: "attribute";
  id: string;
  appliesTo: readonly NodeType[];
  attribute: string;
  question: (name: string) => string;
}

export type GapRule = EdgeGapRule | AttributeGapRule;

// In priority order: the first gap found by the earliest rule is asked first.
export const GAP_RULES: readonly GapRule[] = [
  {
    kind: "edge",
    id: "obligation-owner",
    appliesTo: ["Obligation"],
    edge: "owns",
    direction: "in",
    answer: ["Role"],
    question: (n) => `Who is responsible for “${n}”?`,
  },
  {
    kind: "edge",
    id: "obligation-source",
    appliesTo: ["Obligation"],
    edge: "derived_from",
    direction: "out",
    answer: ["Regulation", "Obligation"],
    question: (n) => `Which regulation or guidance does “${n}” come from?`,
  },
  {
    kind: "edge",
    id: "obligation-met-by",
    appliesTo: ["Obligation"],
    edge: "derived_from",
    direction: "in",
    answer: ["BusinessRule"],
    question: (n) => `Which business rule meets “${n}”?`,
  },
  {
    kind: "edge",
    id: "rule-source",
    appliesTo: ["BusinessRule"],
    edge: "derived_from",
    direction: "out",
    answer: ["Obligation", "Regulation"],
    question: (n) => `Where does the rule “${n}” come from?`,
  },
  {
    kind: "edge",
    id: "rule-applies-to",
    appliesTo: ["BusinessRule"],
    edge: "governed_by",
    direction: "in",
    answer: ["ProcessStep", "Process", "Coverage", "Product"],
    question: (n) => `Which steps or coverages does the rule “${n}” apply to?`,
  },
  {
    kind: "edge",
    id: "owner",
    appliesTo: ["Process", "System", "Product", "Regulation"],
    edge: "owns",
    direction: "in",
    answer: ["Role"],
    question: (n) => `Who is responsible for “${n}”?`,
  },
  {
    kind: "edge",
    id: "step-performer",
    appliesTo: ["ProcessStep"],
    edge: "performed_by",
    direction: "out",
    answer: ["Role"],
    question: (n) => `Who does “${n}”?`,
  },
  {
    kind: "edge",
    id: "step-system",
    appliesTo: ["ProcessStep"],
    edge: "executed_in",
    direction: "out",
    answer: ["System"],
    question: (n) => `In which system is “${n}” done?`,
  },
  {
    kind: "edge",
    id: "step-process",
    appliesTo: ["ProcessStep"],
    edge: "part_of",
    direction: "out",
    answer: ["Process"],
    question: (n) => `Which process is “${n}” part of?`,
  },
  // Design spec section 4c: the three Integration questions that belong on every integration,
  // and two DataField questions that catch real defects.
  {
    kind: "attribute",
    id: "integration-licence",
    appliesTo: ["Integration"],
    attribute: "licence_gating",
    question: (n) => `Is “${n}” available on the licence tier we have, or does it need a paid module or add-on?`,
  },
  {
    kind: "attribute",
    id: "integration-configuration",
    appliesTo: ["Integration"],
    attribute: "configuration_gating",
    question: (n) => `Does “${n}” rely on anything that only works when a specific configuration setting is switched on?`,
  },
  {
    kind: "attribute",
    id: "integration-deletion",
    appliesTo: ["Integration"],
    attribute: "deletion_detection",
    question: (n) => `How do we find out through “${n}” that a record was deleted on the other side, if it shows no deleted flag?`,
  },
  {
    kind: "attribute",
    id: "field-source",
    appliesTo: ["DataField"],
    attribute: "authoritative_source",
    question: (n) => `Which system is the authoritative source for “${n}”, the one that wins when two disagree?`,
  },
  {
    kind: "attribute",
    id: "field-empty",
    appliesTo: ["DataField"],
    attribute: "empty_handling",
    question: (n) => `Can “${n}” be empty even when the screen makes it mandatory, and what happens then?`,
  },
  {
    kind: "edge",
    id: "process-trigger",
    appliesTo: ["Process"],
    edge: "triggers",
    direction: "in",
    answer: ["ProcessStep", "Process", "Channel", "ExternalParty"],
    question: (n) => `What starts “${n}”?`,
  },
  {
    kind: "edge",
    id: "role-home",
    appliesTo: ["Role"],
    edge: "member_of",
    direction: "out",
    answer: ["Team", "Department"],
    question: (n) => `Which team or department does “${n}” belong to?`,
  },
];

// Questions come in rounds of this many (plans/P4.md decision 7). "Ask more" opens the next round.
export const MAX_QUESTIONS = 5;

export interface Gap {
  rule: GapRule;
  nodeId: string;
  question: string;
}

export const gapKey = (ruleId: string, nodeId: string) => `${ruleId}:${nodeId}`;

// Gaps on the given nodes, in the order the nodes are given, then by rule priority.
// `skip` holds gaps already answered in this request. A gap with an open Issue recorded
// against it ("don't know yet", in an earlier request) is not asked again either.
export function findGaps(model: Working, nodeIds: string[], skip: ReadonlySet<string>): Gap[] {
  const nodes = new Map(model.nodes.map((n) => [n.id, n]));
  const recorded = new Set(
    model.nodes
      .filter((n) => n.type === "Issue" && typeof n.attributes.about === "string" && typeof n.attributes.rule === "string")
      .map((n) => gapKey(n.attributes.rule as string, n.attributes.about as string)),
  );
  const gaps: Gap[] = [];
  for (const id of nodeIds) {
    const node = nodes.get(id);
    if (!node) continue;
    for (const rule of GAP_RULES) {
      if (!rule.appliesTo.includes(node.type)) continue;
      const key = gapKey(rule.id, id);
      if (skip.has(key) || recorded.has(key)) continue;
      const filled =
        rule.kind === "attribute"
          ? String(node.attributes[rule.attribute] ?? "").trim() !== ""
          : model.edges.some((e) => {
              if (e.type !== rule.edge) return false;
              const other = rule.direction === "out" ? (e.from === id ? e.to : null) : e.to === id ? e.from : null;
              return other !== null && rule.answer.includes(nodes.get(other)?.type as NodeType);
            });
      if (!filled) gaps.push({ rule, nodeId: id, question: rule.question(node.name) });
    }
  }
  return gaps;
}

// The edge an answer creates: from the affected node to the pick, or the other way round.
export function edgeFor(rule: EdgeGapRule, nodeId: string, pickId: string): { from: string; to: string } {
  return rule.direction === "out" ? { from: nodeId, to: pickId } : { from: pickId, to: nodeId };
}
