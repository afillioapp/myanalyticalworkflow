import type { EdgeType, NodeType } from "@/model/taxonomy";

// A small hand-written model of a fictional Ontario personal auto carrier, built around
// the SABS change in bsa-tool-design-spec.md section 11. Generic and public only: no
// real carrier, system or person. The governance nodes (symptom, requirements, risks
// and so on) are illustrative fixtures, not findings.
//
// Keys are stable and turn into stable UUIDs, so the seed loads to the same IDs every time.

export interface SeedNode {
  key: string;
  type: NodeType;
  name: string;
  attributes?: Record<string, unknown>;
}

export interface SeedEdge {
  type: EdgeType;
  from: string;
  to: string;
  via?: string;
}

export interface SeedBlock {
  kind: "heading" | "text" | "node";
  text?: string;
  node?: string;
}

export interface SeedDocument {
  key: string;
  kind: string;
  title: string;
  blocks: SeedBlock[];
}

export const tenant = { key: "tenant.example", name: "Example Mutual (fictional)" };
export const user = { key: "user.owner", name: "Model owner" };

export const nodes: SeedNode[] = [
  // Organization
  { key: "dept.product", type: "Department", name: "Product" },
  { key: "dept.claims", type: "Department", name: "Claims" },
  { key: "dept.compliance", type: "Department", name: "Compliance" },
  { key: "team.auto-product", type: "Team", name: "Personal Auto Product" },
  { key: "team.ab-claims", type: "Team", name: "Accident Benefits Claims" },
  { key: "role.head-of-product", type: "Role", name: "Head of Product" },
  { key: "role.product-manager", type: "Role", name: "Product Manager" },
  { key: "role.ab-adjuster", type: "Role", name: "Accident Benefits Adjuster" },
  { key: "role.compliance-officer", type: "Role", name: "Compliance Officer" },
  { key: "person.analyst", type: "Person", name: "Example Analyst" },
  { key: "party.fsra", type: "ExternalParty", name: "FSRA", attributes: { kind: "regulator" } },
  { key: "party.broker", type: "ExternalParty", name: "Example Broker Network", attributes: { kind: "broker" } },

  // Process
  { key: "proc.quote-bind", type: "Process", name: "Quote and bind" },
  { key: "proc.ab-claim", type: "Process", name: "Accident benefits claim" },
  { key: "step.select-benefits", type: "ProcessStep", name: "Select optional benefits" },
  { key: "step.rate-quote", type: "ProcessStep", name: "Rate the quote" },
  { key: "step.adjudicate-rehab", type: "ProcessStep", name: "Adjudicate medical and rehabilitation expense" },
  { key: "dp.workplace-benefits", type: "DecisionPoint", name: "Does the claimant have workplace benefits?" },

  // Systems
  { key: "sys.policy-admin", type: "System", name: "Policy Administration System" },
  { key: "sys.rating", type: "System", name: "Rating Engine" },
  { key: "sys.claims", type: "System", name: "Claims System" },
  { key: "int.policy-rating", type: "Integration", name: "Policy admin to rating engine", attributes: { mode: "synchronous" } },
  { key: "env.production", type: "Environment", name: "Production" },

  // Data
  { key: "entity.policy", type: "DataEntity", name: "Policy" },
  { key: "entity.claim", type: "DataEntity", name: "Claim" },
  { key: "field.ir-selection", type: "DataField", name: "Income replacement selection" },
  { key: "field.payor-order", type: "DataField", name: "Payor order" },
  { key: "form.opcf-47r", type: "Form", name: "OPCF 47R" },

  // Business
  { key: "product.on-auto", type: "Product", name: "Ontario personal auto" },
  { key: "coverage.income-replacement", type: "Coverage", name: "Income replacement benefit", attributes: { mandatory: false } },
  { key: "coverage.med-rehab", type: "Coverage", name: "Medical and rehabilitation benefit", attributes: { mandatory: true } },
  {
    key: "rule.insurer-first-payor",
    type: "BusinessRule",
    name: "Insurer pays medical and rehabilitation first, except medication",
    attributes: {
      effective_date: "2026-07-01",
      transition: "In-force policies renew with existing benefits unless the customer chooses otherwise",
    },
  },
  {
    key: "rule.ir-optional",
    type: "BusinessRule",
    name: "Income replacement is an optional benefit",
    attributes: { effective_date: "2026-07-01" },
  },
  { key: "channel.broker", type: "Channel", name: "Broker" },
  { key: "channel.direct", type: "Channel", name: "Direct" },

  // Governance and output
  { key: "reg.sabs-2026", type: "Regulation", name: "SABS changes effective 2026-07-01", attributes: { effective_date: "2026-07-01" } },
  { key: "obl.insurer-first-payor", type: "Obligation", name: "Pay medical and rehabilitation expenses first, except medication, even where workplace benefits exist" },
  { key: "obl.offer-ir-optional", type: "Obligation", name: "Offer income replacement as an optional benefit" },
  { key: "symptom.rehab-held", type: "Symptom", name: "Rehabilitation invoices are held waiting for workplace benefit details" },
  { key: "hypothesis.old-payor-rule", type: "CauseHypothesis", name: "The claims system still applies the old payor order" },
  { key: "solution.update-payor-rule", type: "ProposedSolution", name: "Update the payor order rule in the claims system" },
  { key: "evidence.held-invoices", type: "Evidence", name: "Sample of held rehabilitation invoices" },
  {
    key: "measure.rehab-paid",
    type: "SuccessMeasure",
    name: "Rehabilitation invoices paid without a workplace benefits hold",
    attributes: { level: "process", baseline: null },
  },
  {
    key: "req.br-001",
    type: "Requirement",
    name: "BR-001 Claims adjudication applies insurer-first payor order from 2026-07-01",
    attributes: { subtype: "business" },
  },
  {
    key: "req.fr-001",
    type: "Requirement",
    name: "FR-001 Claims system sets payor order to insurer first for medical and rehabilitation, excluding medication",
    attributes: { subtype: "functional" },
  },
  { key: "uc.adjust-rehab", type: "UseCase", name: "Adjust a rehabilitation invoice for a claimant with workplace benefits" },
  { key: "ac.payor-order", type: "AcceptanceCriterion", name: "A rehabilitation invoice on an in-scope claim is paid insurer first" },
  { key: "test.rehab-with-workplace", type: "TestScenario", name: "Rehabilitation invoice, claimant with workplace benefits" },
  { key: "risk.renewal-carryover", type: "Risk", name: "Renewals carry old benefit selections into the new regime" },
  { key: "assumption.medication", type: "Assumption", name: "Workplace benefit details are still captured for medication claims" },
  { key: "issue.payor-no-date", type: "Issue", name: "Payor order field has no effective date" },
  { key: "dependency.form-before-rating", type: "Dependency", name: "OPCF 47R must be live before optional benefits can be rated" },
  { key: "decision.claims-change", type: "Decision", name: "Treat payor order as a claims change, not only a product change" },
  {
    key: "term.first-payor",
    type: "GlossaryTerm",
    name: "First payor",
    attributes: { definition: "The source that pays a benefit before any other source is asked" },
  },
  {
    key: "constraint.sabs-date",
    type: "Constraint",
    name: "Changes must be live for policies effective on or after 2026-07-01",
    attributes: { kind: "regulatory" },
  },
];

export const edges: SeedEdge[] = [
  { type: "reports_to", from: "role.product-manager", to: "role.head-of-product" },
  { type: "member_of", from: "person.analyst", to: "team.auto-product" },
  { type: "member_of", from: "team.auto-product", to: "dept.product" },
  { type: "member_of", from: "team.ab-claims", to: "dept.claims" },
  { type: "owns", from: "role.product-manager", to: "product.on-auto" },
  { type: "owns", from: "role.compliance-officer", to: "obl.insurer-first-payor" },
  { type: "approves", from: "role.compliance-officer", to: "form.opcf-47r" },
  { type: "performed_by", from: "step.adjudicate-rehab", to: "role.ab-adjuster" },
  { type: "executed_in", from: "step.select-benefits", to: "sys.policy-admin" },
  { type: "executed_in", from: "step.rate-quote", to: "sys.rating" },
  { type: "executed_in", from: "step.adjudicate-rehab", to: "sys.claims" },
  { type: "precedes", from: "step.select-benefits", to: "step.rate-quote" },
  { type: "part_of", from: "step.select-benefits", to: "proc.quote-bind" },
  { type: "part_of", from: "step.rate-quote", to: "proc.quote-bind" },
  { type: "part_of", from: "step.adjudicate-rehab", to: "proc.ab-claim" },
  { type: "part_of", from: "dp.workplace-benefits", to: "proc.ab-claim" },
  { type: "triggers", from: "channel.broker", to: "proc.quote-bind" },
  { type: "triggers", from: "channel.direct", to: "proc.quote-bind" },
  { type: "reads", from: "sys.rating", to: "field.ir-selection" },
  { type: "reads", from: "step.adjudicate-rehab", to: "field.payor-order" },
  { type: "writes", from: "sys.policy-admin", to: "entity.policy" },
  { type: "writes", from: "sys.claims", to: "entity.claim" },
  { type: "integrates_with", from: "sys.policy-admin", to: "sys.rating", via: "int.policy-rating" },
  { type: "belongs_to", from: "field.ir-selection", to: "entity.policy" },
  { type: "belongs_to", from: "field.payor-order", to: "entity.claim" },
  { type: "belongs_to", from: "coverage.income-replacement", to: "product.on-auto" },
  { type: "belongs_to", from: "coverage.med-rehab", to: "product.on-auto" },
  { type: "renders_on", from: "field.ir-selection", to: "form.opcf-47r" },
  { type: "governed_by", from: "coverage.med-rehab", to: "rule.insurer-first-payor" },
  { type: "governed_by", from: "step.adjudicate-rehab", to: "rule.insurer-first-payor" },
  { type: "governed_by", from: "coverage.income-replacement", to: "rule.ir-optional" },
  { type: "derived_from", from: "rule.insurer-first-payor", to: "obl.insurer-first-payor" },
  { type: "derived_from", from: "rule.ir-optional", to: "obl.offer-ir-optional" },
  { type: "derived_from", from: "rule.insurer-first-payor", to: "reg.sabs-2026" },
  { type: "derived_from", from: "req.br-001", to: "obl.insurer-first-payor" },
  { type: "derived_from", from: "obl.insurer-first-payor", to: "reg.sabs-2026" },
  { type: "derived_from", from: "obl.offer-ir-optional", to: "reg.sabs-2026" },
  { type: "implements", from: "req.fr-001", to: "field.payor-order" },
  { type: "traces_to", from: "ac.payor-order", to: "req.fr-001" },
  { type: "traces_to", from: "test.rehab-with-workplace", to: "req.fr-001" },
  { type: "constrains", from: "constraint.sabs-date", to: "rule.ir-optional" },
];

export const documents: SeedDocument[] = [
  {
    key: "doc.brd-sabs",
    kind: "brd",
    title: "BRD: SABS 2026 payor order",
    blocks: [
      { kind: "heading", text: "Business requirements" },
      { kind: "text", text: "Requirements are nodes. This document only points at them." },
      { kind: "node", node: "req.br-001" },
    ],
  },
];
