// The meta-model from bsa-tool-design-spec.md section 4.
// This file is the single source of truth for node and edge types. The database
// CHECK constraints are generated from it, so adding a type is: edit here, then
// `npm run db:generate` to produce the migration.

export const LAYERS = ["org", "process", "system", "data", "business", "governance"] as const;
export type Layer = (typeof LAYERS)[number];

export const NODE_TYPES = {
  // Organization
  Department: "org",
  Team: "org",
  Role: "org",
  Person: "org",
  ExternalParty: "org",
  // Process
  Process: "process",
  ProcessStep: "process",
  DecisionPoint: "process",
  // Systems
  System: "system",
  Integration: "system",
  Environment: "system",
  // Data
  DataEntity: "data",
  DataField: "data",
  Form: "data",
  // Business
  Product: "business",
  Coverage: "business",
  BusinessRule: "business",
  Channel: "business",
  // Governance and output
  Regulation: "governance",
  Obligation: "governance",
  Symptom: "governance",
  CauseHypothesis: "governance",
  ProposedSolution: "governance",
  Evidence: "governance",
  SuccessMeasure: "governance",
  Requirement: "governance",
  UseCase: "governance",
  AcceptanceCriterion: "governance",
  TestScenario: "governance",
  Risk: "governance",
  Assumption: "governance",
  Issue: "governance",
  Dependency: "governance",
  Decision: "governance",
  GlossaryTerm: "governance",
  // Added 2026-10-30 (ST-01-12). Attribute `kind`: budget, date, vendor, regulatory,
  // architecture, privacy, security or capacity.
  Constraint: "governance",
} as const satisfies Record<string, Layer>;

export type NodeType = keyof typeof NODE_TYPES;
export const NODE_TYPE_NAMES = Object.keys(NODE_TYPES) as NodeType[];

export const layerOf = (type: NodeType): Layer => NODE_TYPES[type];

export const SOURCES = ["ai_extracted", "user_entered", "imported"] as const;
export type Source = (typeof SOURCES)[number];

// "*" means any node type. A pair is allowed when from is in `from` and to is in `to`,
// which is the literal reading of the spec's edge table.
type Endpoint = readonly NodeType[] | "*";

export interface EdgeRule {
  from: Endpoint;
  to: Endpoint;
  // integrates_with is System to System "via Integration": the Integration node is
  // carried on the edge as via_id, and must be present.
  via?: NodeType;
}

// `impacts` is deliberately absent: the spec says it is computed at query time, never stored.
export const EDGE_TYPES = {
  reports_to: { from: ["Role"], to: ["Role"] },
  member_of: { from: ["Person", "Team"], to: ["Team", "Department"] },
  owns: { from: ["Role"], to: "*" },
  // Spec says "any node or artifact". Artifacts (documents) are not nodes, so P0 covers nodes only.
  approves: { from: ["Role"], to: "*" },
  performed_by: { from: ["ProcessStep"], to: ["Role"] },
  executed_in: { from: ["ProcessStep"], to: ["System"] },
  precedes: { from: ["ProcessStep"], to: ["ProcessStep"] },
  // Added 2026-10-30. Places a step or decision point in its process, and a sub-process
  // in its parent, which is what lets the graph view zoom from process into steps.
  part_of: { from: ["ProcessStep", "DecisionPoint", "Process"], to: ["Process"] },
  triggers: { from: "*", to: ["Process"] },
  reads: { from: ["System", "ProcessStep"], to: ["DataEntity", "DataField"] },
  writes: { from: ["System", "ProcessStep"], to: ["DataEntity", "DataField"] },
  integrates_with: { from: ["System"], to: ["System"], via: "Integration" },
  belongs_to: { from: ["DataField", "Coverage"], to: ["DataEntity", "Product"] },
  renders_on: { from: ["DataField"], to: ["Form", "ProcessStep"] },
  governed_by: { from: "*", to: ["BusinessRule"] },
  // Obligation added 2026-10-30: an obligation is a duty derived from a regulation.
  derived_from: { from: ["BusinessRule", "Requirement", "Obligation"], to: ["Obligation", "Regulation"] },
  // Spec target is "change on a node". Changes arrive with SolutionOptions in a later
  // phase; until then the target is the node being changed. Open item, not a decision.
  implements: { from: ["Requirement"], to: "*" },
  traces_to: { from: ["AcceptanceCriterion", "TestScenario"], to: ["Requirement"] },
  // Added 2026-10-30 (ST-01-12).
  constrains: { from: ["Constraint"], to: "*" },
} as const satisfies Record<string, EdgeRule>;

export type EdgeType = keyof typeof EDGE_TYPES;
export const EDGE_TYPE_NAMES = Object.keys(EDGE_TYPES) as EdgeType[];

const allows = (endpoint: Endpoint, type: NodeType) => endpoint === "*" || endpoint.includes(type);

export function checkEdge(
  edgeType: EdgeType,
  fromType: NodeType,
  toType: NodeType,
  viaType: NodeType | null,
): string | null {
  const rule: EdgeRule = EDGE_TYPES[edgeType];
  if (!allows(rule.from, fromType)) return `${edgeType} cannot start at ${fromType}`;
  if (!allows(rule.to, toType)) return `${edgeType} cannot end at ${toType}`;
  if (rule.via && viaType !== rule.via) return `${edgeType} needs a ${rule.via} as via`;
  if (!rule.via && viaType !== null) return `${edgeType} does not take a via node`;
  return null;
}

export const EMPTY_EXTERNAL_REFS = {
  jira_key: null,
  confluence_page_id: null,
  azure_work_item: null,
} as const;
export type ExternalRefs = { [K in keyof typeof EMPTY_EXTERNAL_REFS]: string | null };
