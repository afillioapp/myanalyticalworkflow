// P1 extraction passes. Rule 13: one small, flat schema per layer, never one call for the
// whole taxonomy. The business pass was added 2026-10-30 because the SABS material is mostly
// business content that the four passes in rule 13 would not pick up.
//
// Passes run in this order. Each later pass sees the nodes found so far, so it can draw
// edges to them (a process step performed_by a Role from the org pass).

import type { EdgeType, NodeType } from "@/model/taxonomy";

export interface Pass {
  name: "org" | "systems" | "data" | "business" | "process";
  nodeTypes: readonly NodeType[];
  edgeTypes: readonly EdgeType[];
  focus: string;
}

export const PASSES: readonly Pass[] = [
  {
    name: "org",
    nodeTypes: ["Department", "Team", "Role", "Person", "ExternalParty"],
    edgeTypes: ["reports_to", "member_of"],
    focus:
      "Who is involved: departments, teams, roles, named people, and outside parties such as regulators, partners, vendors and brokers.",
  },
  {
    name: "systems",
    nodeTypes: ["System", "Integration", "Environment"],
    edgeTypes: ["integrates_with"],
    focus:
      "Software systems, the integrations between them, and environments. integrates_with goes System to System and names the Integration node as via.",
  },
  {
    name: "data",
    nodeTypes: ["DataEntity", "DataField", "Form"],
    edgeTypes: ["belongs_to", "renders_on", "reads", "writes"],
    focus:
      "Data entities, individual data fields, and forms. Fields belong_to an entity and render_on a form. Systems read and write data.",
  },
  {
    name: "business",
    nodeTypes: ["Product", "Coverage", "BusinessRule", "Channel", "Regulation", "Obligation"],
    edgeTypes: ["belongs_to", "governed_by", "derived_from", "owns"],
    focus:
      "Products, coverages, business rules, distribution channels, regulations, and the specific duties (obligations) a regulation imposes. Coverages belong_to a product. Rules and obligations are derived_from a regulation.",
  },
  {
    name: "process",
    nodeTypes: ["Process", "ProcessStep", "DecisionPoint"],
    edgeTypes: ["part_of", "precedes", "performed_by", "executed_in", "reads", "writes", "triggers", "governed_by"],
    focus:
      "Business processes, their steps and decision points, in order. Steps are part_of a process, precede each other, are performed_by a Role and executed_in a System.",
  },
] as const;
