// Review decisions and the P1 measurements (roadmap.md P1 acceptance criteria).

import type { ModelEventInput } from "@/model/events";
import type { Draft, DraftNode } from "./extract";

export type NodeDecision =
  | { verdict: "accepted" }
  | { verdict: "edited"; name: string }
  | { verdict: "rejected" };

export type EdgeDecision = { verdict: "accepted" } | { verdict: "rejected" };

export interface Review {
  nodes: Record<string, NodeDecision>;
  edges: Record<string, EdgeDecision>;
}

export const emptyReview = (): Review => ({ nodes: {}, edges: {} });

// DNA-03 and design spec section 3: one at a time, grouped by layer, lowest confidence first.
export function reviewOrder(draft: Draft): DraftNode[] {
  const passRank = new Map(["org", "systems", "data", "business", "process"].map((p, i) => [p, i]));
  return [...draft.nodes].sort(
    (a, b) => passRank.get(a.pass)! - passRank.get(b.pass)! || a.confidence - b.confidence,
  );
}

export interface Measures {
  nodesTotal: number;
  nodesReviewed: number;
  acceptedWithoutEdit: number;
  edited: number;
  rejected: number;
  // Criterion 1: accepted without edit, as a share of reviewed nodes. Gate: 70 percent.
  acceptedRate: number;
  // Criterion 2: rejected outright, as a share of reviewed nodes. Gate: under 10 percent.
  rejectedRate: number;
  // Criterion 3: kept nodes with at least one accepted edge. The roadmap says "large majority"
  // and names no number, so this is reported, not judged.
  keptNodesWithAcceptedEdge: number;
  keptNodes: number;
  edgeCoverageRate: number;
  // Criterion 5: anything a pass returned outside its own schema or the taxonomy.
  outOfSchema: number;
  gate: "continue" | "iterate" | "stop" | "incomplete";
}

export function measure(drafts: Draft[], review: Review): Measures {
  const nodes = drafts.flatMap((d) => d.nodes);
  const edges = drafts.flatMap((d) => d.edges);
  const decided = nodes.filter((n) => review.nodes[n.id]);
  const count = (v: NodeDecision["verdict"]) => decided.filter((n) => review.nodes[n.id].verdict === v).length;
  const kept = new Set(decided.filter((n) => review.nodes[n.id].verdict !== "rejected").map((n) => n.id));
  const withEdge = new Set<string>();
  for (const e of edges) {
    if (review.edges[e.id]?.verdict !== "accepted") continue;
    if (kept.has(e.fromId)) withEdge.add(e.fromId);
    if (kept.has(e.toId)) withEdge.add(e.toId);
  }
  const acceptedWithoutEdit = count("accepted");
  const rejected = count("rejected");
  const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b);
  const acceptedRate = ratio(acceptedWithoutEdit, decided.length);
  const rejectedRate = ratio(rejected, decided.length);
  const outOfSchema = drafts.flatMap((d) => d.dropped).filter((x) => x.reason.includes("outside") || x.reason.includes("schema")).length;

  // The go/no-go bands are from roadmap.md P1. Criterion 4 (injection) is reported separately.
  let gate: Measures["gate"];
  if (decided.length < nodes.length || nodes.length === 0) gate = "incomplete";
  else if (acceptedRate < 0.4) gate = "stop";
  else if (acceptedRate < 0.7 || rejectedRate >= 0.1 || outOfSchema > 0) gate = "iterate";
  else gate = "continue";

  return {
    nodesTotal: nodes.length,
    nodesReviewed: decided.length,
    acceptedWithoutEdit,
    edited: count("edited"),
    rejected,
    acceptedRate,
    rejectedRate,
    keptNodesWithAcceptedEdge: withEdge.size,
    keptNodes: kept.size,
    edgeCoverageRate: ratio(withEdge.size, kept.size),
    outOfSchema,
    gate,
  };
}

// Reviewed nodes and edges as events in the P0 log. Extracted nodes are never verified here:
// verification is a separate human event (rule 12, spec section 2.7).
export function toEvents(drafts: Draft[], review: Review): ModelEventInput[] {
  const kept = new Map<string, string>();
  const events: ModelEventInput[] = [];
  for (const n of drafts.flatMap((d) => d.nodes)) {
    const decision = review.nodes[n.id];
    if (!decision || decision.verdict === "rejected") continue;
    const name = decision.verdict === "edited" ? decision.name : n.name;
    kept.set(n.id, name);
    events.push({
      type: "node.created",
      payload: {
        id: n.id,
        nodeType: n.type,
        name,
        source: "ai_extracted",
        confidence: n.confidence,
        attributes: { quote: n.quote, extraction_pass: n.pass },
      },
    });
  }
  for (const e of drafts.flatMap((d) => d.edges)) {
    if (review.edges[e.id]?.verdict !== "accepted") continue;
    if (!kept.has(e.fromId) || !kept.has(e.toId) || (e.viaId && !kept.has(e.viaId))) continue;
    events.push({
      type: "edge.created",
      payload: { id: e.id, edgeType: e.type, fromId: e.fromId, toId: e.toId, viaId: e.viaId },
    });
  }
  return events;
}
