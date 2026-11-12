// Impact traversal (F-09, plans/P3.md section 4, plans/P4.md section 3).
//
// From the tagged nodes, along edges in both directions, up to a fixed distance. Every
// affected node keeps the path that reached it, so the reason is shown, never guessed.
//
// P4: a regulation's effect runs down a chain, so walking DOWN it is free: from a
// Regulation or Obligation to what is derived from it, and from a BusinessRule to what
// follows it (governed_by). Every other step costs 1. Walking up the chain still costs,
// so tagging one process step does not pull in a whole regulation's footprint.
//
// Pure and deterministic: a 0-1 breadth-first search over sorted neighbours.

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
  via?: string | null;
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
  // The distance counted: free chain steps add nothing. 0 for a tagged node.
  depth: number;
  // From a tagged node to this one. Empty for a tagged node.
  path: Step[];
}

const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// Walking `edge` away from `at`: free when it goes down a regulation's chain.
export function isFreeStep(edge: Pick<IEdge, "type" | "to">, at: string): boolean {
  return (edge.type === "derived_from" || edge.type === "governed_by") && edge.to === at;
}

interface Hop {
  other: string;
  edge: IEdge;
  step: Step;
  cost: number;
}

export function impact(graph: { nodes: INode[]; edges: IEdge[] }, tagged: string[], maxDepth = IMPACT_DEPTH): Affected[] {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const hops = new Map<string, Hop[]>();
  const add = (at: string, other: string, edge: IEdge, cost: number, step?: Step) => {
    const s: Step = step ?? { edgeId: edge.id, edgeType: edge.type, from: edge.from, to: edge.to };
    hops.set(at, [...(hops.get(at) ?? []), { other, edge, step: s, cost }]);
  };
  for (const e of [...graph.edges].sort((a, b) => byId(a.id, b.id))) {
    if (!nodes.has(e.from) || !nodes.has(e.to)) continue;
    add(e.from, e.to, e, isFreeStep(e, e.from) ? 0 : 1);
    add(e.to, e.from, e, isFreeStep(e, e.to) ? 0 : 1);
    // An integration sits on the edge between two systems (via), so it is next to both.
    // The step names the system and the integration, so the reason reads true.
    if (e.via && nodes.has(e.via)) {
      for (const end of [e.from, e.to]) {
        const step: Step = { edgeId: e.id, edgeType: e.type, from: end, to: e.via };
        add(e.via, end, e, 1, step);
        add(end, e.via, e, 1, step);
      }
    }
  }
  for (const list of hops.values()) {
    list.sort((a, b) => a.cost - b.cost || byId(a.edge.type, b.edge.type) || byId(a.other, b.other) || byId(a.edge.id, b.edge.id));
  }

  const starts = new Set(tagged.filter((id) => nodes.has(id)));
  const best = new Map<string, Affected>();
  const done = new Set<string>();
  // A deque: free steps go to the front, costed steps to the back.
  const queue: string[] = [];
  for (const id of [...starts].sort(byId)) {
    best.set(id, { id, depth: 0, path: [] });
    queue.push(id);
  }
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (done.has(id)) continue;
    done.add(id);
    const here = best.get(id)!;
    if (!starts.has(id) && NOT_EXPANDED.has(nodes.get(id)!.type)) continue;
    for (const hop of hops.get(id) ?? []) {
      const depth = here.depth + hop.cost;
      if (depth > maxDepth || done.has(hop.other)) continue;
      const known = best.get(hop.other);
      if (known && known.depth <= depth) continue;
      best.set(hop.other, { id: hop.other, depth, path: [...here.path, hop.step] });
      if (hop.cost === 0) queue.unshift(hop.other);
      else queue.push(hop.other);
    }
  }

  const layerRank = (id: string) => LAYERS.indexOf(nodes.get(id)!.layer);
  return [...best.values()].sort(
    (a, b) =>
      a.depth - b.depth ||
      layerRank(a.id) - layerRank(b.id) ||
      nodes.get(a.id)!.name.localeCompare(nodes.get(b.id)!.name) ||
      byId(a.id, b.id),
  );
}
