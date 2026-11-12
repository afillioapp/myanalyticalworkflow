// Impact traversal (F-09, plans/P3.md section 4). Breadth-first from the tagged nodes, both
// edge directions, up to a fixed depth. Every affected node keeps the path that reached it,
// so the reason it is affected is shown, never guessed. Pure and deterministic.

import { LAYERS, type EdgeType, type Layer, type NodeType } from "@/model/taxonomy";

export const IMPACT_DEPTH = 2;

// Containers: reaching one is shown, but the traversal does not spread through it, or every
// member of a department would count as affected by anything one member touches.
const NOT_EXPANDED: ReadonlySet<NodeType> = new Set(["Department", "Team"]);

interface INode {
  id: string;
  type: NodeType;
  layer: Layer;
  name: string;
}
interface IEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
}

// One edge walked, in its stored direction (from -> to), whichever way it was walked.
export interface Step {
  edgeId: string;
  edgeType: EdgeType;
  from: string;
  to: string;
}

export interface Affected {
  id: string;
  depth: number;
  // From a tagged node to this one. Empty for a tagged node.
  path: Step[];
}

const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function impact(graph: { nodes: INode[]; edges: IEdge[] }, tagged: string[], maxDepth = IMPACT_DEPTH): Affected[] {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const neighbours = new Map<string, { other: string; edge: IEdge }[]>();
  for (const e of [...graph.edges].sort((a, b) => byId(a.id, b.id))) {
    if (!nodes.has(e.from) || !nodes.has(e.to)) continue;
    neighbours.set(e.from, [...(neighbours.get(e.from) ?? []), { other: e.to, edge: e }]);
    neighbours.set(e.to, [...(neighbours.get(e.to) ?? []), { other: e.from, edge: e }]);
  }
  for (const list of neighbours.values()) {
    list.sort((a, b) => byId(a.edge.type, b.edge.type) || byId(a.other, b.other) || byId(a.edge.id, b.edge.id));
  }

  const starts = [...new Set(tagged)].filter((id) => nodes.has(id)).sort(byId);
  const found = new Map<string, Affected>(starts.map((id) => [id, { id, depth: 0, path: [] }]));
  let frontier = starts;
  for (let depth = 1; depth <= maxDepth; depth++) {
    const next: string[] = [];
    for (const id of frontier) {
      const isStart = depth === 1;
      if (!isStart && NOT_EXPANDED.has(nodes.get(id)!.type)) continue;
      for (const { other, edge } of neighbours.get(id) ?? []) {
        if (found.has(other)) continue;
        const step: Step = { edgeId: edge.id, edgeType: edge.type, from: edge.from, to: edge.to };
        found.set(other, { id: other, depth, path: [...found.get(id)!.path, step] });
        next.push(other);
      }
    }
    frontier = next.sort(byId);
  }

  const layerRank = (id: string) => LAYERS.indexOf(nodes.get(id)!.layer);
  return [...found.values()].sort(
    (a, b) =>
      a.depth - b.depth ||
      layerRank(a.id) - layerRank(b.id) ||
      nodes.get(a.id)!.name.localeCompare(nodes.get(b.id)!.name) ||
      byId(a.id, b.id),
  );
}
