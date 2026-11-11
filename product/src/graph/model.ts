// The graph the view draws: a plain, serialisable copy of the company model.

import type { EdgeType, Layer, NodeType, Source } from "@/model/taxonomy";

export interface GraphNode {
  id: string;
  type: NodeType;
  layer: Layer;
  name: string;
  source: Source;
  confidence: number | null;
  verified: boolean;
}

export interface GraphEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  via: string | null;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Ids sort first so every consumer sees the same order whatever the input order was.
export function normalise(graph: Graph): Graph {
  const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return { nodes: [...graph.nodes].sort(byId), edges: [...graph.edges].sort(byId) };
}
