// The model a request sees: the baseline plus the request's pending changes, marked as
// pending. Pure: the same baseline and the same operations always give the same result.

import type { Model } from "@/model/read";
import { layerOf, type EdgeType, type Layer, type NodeType } from "@/model/taxonomy";

export interface WNode {
  id: string;
  type: NodeType;
  layer: Layer;
  name: string;
  attributes: Record<string, unknown>;
  pending: boolean;
}

export interface WEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  via: string | null;
  pending: boolean;
}

export interface Working {
  nodes: WNode[];
  edges: WEdge[];
}

// What an operation row carries. The payload is exactly the event payload it becomes.
export type AddNodePayload = {
  id: string;
  nodeType: NodeType;
  name: string;
  attributes: Record<string, unknown>;
  source: "user_entered";
  confidence: null;
};
export type AddEdgePayload = {
  id: string;
  edgeType: EdgeType;
  fromId: string;
  toId: string;
  viaId: null;
  attributes: Record<string, unknown>;
};
// P4: fills attributes on a node. It carries the merged attributes, so it becomes a plain
// node.updated event and two answers on one node do not overwrite each other.
export type UpdateNodePayload = { id: string; attributes: Record<string, unknown> };
export type PendingOp =
  | { id: string; kind: "add_node"; payload: AddNodePayload; answerId: string | null; position: number }
  | { id: string; kind: "add_edge"; payload: AddEdgePayload; answerId: string | null; position: number }
  | { id: string; kind: "update_node"; payload: UpdateNodePayload; answerId: string | null; position: number };

// The node ids an operation touches, for coverage: a node touched by a pending change is addressed.
export function touchedBy(op: PendingOp): string[] {
  if (op.kind === "add_node") return [op.payload.id];
  if (op.kind === "update_node") return [op.payload.id];
  return [op.payload.fromId, op.payload.toId];
}

export function workingModel(baseline: Pick<Model, "nodes" | "edges">, ops: PendingOp[]): Working {
  const nodes: WNode[] = baseline.nodes.map((n) => ({
    id: n.id,
    type: n.type as NodeType,
    layer: n.layer as Layer,
    name: n.name,
    attributes: n.attributes,
    pending: false,
  }));
  const edges: WEdge[] = baseline.edges.map((e) => ({
    id: e.id,
    type: e.type as EdgeType,
    from: e.fromId,
    to: e.toId,
    via: e.viaId,
    pending: false,
  }));
  for (const op of [...ops].sort((a, b) => a.position - b.position)) {
    if (op.kind === "add_node") {
      const p = op.payload;
      nodes.push({ id: p.id, type: p.nodeType, layer: layerOf(p.nodeType), name: p.name, attributes: p.attributes, pending: true });
    } else if (op.kind === "update_node") {
      const node = nodes.find((n) => n.id === op.payload.id);
      if (node) node.attributes = op.payload.attributes;
    } else {
      const p = op.payload;
      edges.push({ id: p.id, type: p.edgeType, from: p.fromId, to: p.toId, via: null, pending: true });
    }
  }
  return { nodes, edges };
}
