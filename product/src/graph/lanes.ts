// Which department lane each node sits in (design spec section 7: "a node's lane tells you
// who owns it"). Fully derived from edges, so the same model always gives the same lanes.
//
// Rules, first match wins:
//   Department          its own lane
//   ExternalParty       the External lane
//   Team, Person, Role  follow member_of up to a Department
//   ProcessStep         the lane of the Role it is performed_by, else of its process
//   DecisionPoint       the lane of its process
//   anything else       the lane of the Role that owns it; a Process with no owner falls back
//                       to its parent process
//   none of the above   the Unassigned lane, which makes missing ownership visible

import type { Graph, GraphNode } from "./model";

export const EXTERNAL = "lane:external";
export const UNASSIGNED = "lane:unassigned";

export interface Lane {
  id: string;
  name: string;
}

export interface Lanes {
  lanes: Lane[];
  laneOf: Map<string, string>;
}

export function assignLanes(graph: Graph): Lanes {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const out = (type: string) => {
    const m = new Map<string, string[]>();
    for (const e of graph.edges) if (e.type === type) m.set(e.from, [...(m.get(e.from) ?? []), e.to].sort());
    return m;
  };
  const into = (type: string) => {
    const m = new Map<string, string[]>();
    for (const e of graph.edges) if (e.type === type) m.set(e.to, [...(m.get(e.to) ?? []), e.from].sort());
    return m;
  };
  const memberOf = out("member_of");
  const performedBy = out("performed_by");
  const partOf = out("part_of");
  const ownedBy = into("owns");

  const laneOf = new Map<string, string>();
  const resolving = new Set<string>();

  const resolve = (id: string): string => {
    const known = laneOf.get(id);
    if (known) return known;
    if (resolving.has(id)) return UNASSIGNED;
    resolving.add(id);
    const lane = rule(nodes.get(id)!);
    resolving.delete(id);
    laneOf.set(id, lane);
    return lane;
  };

  const firstAssigned = (ids: string[] | undefined, filter?: (n: GraphNode) => boolean) => {
    for (const id of ids ?? []) {
      const node = nodes.get(id);
      if (!node || (filter && !filter(node))) continue;
      const lane = resolve(id);
      if (lane !== UNASSIGNED) return lane;
    }
    return UNASSIGNED;
  };
  const isRole = (n: GraphNode) => n.type === "Role";

  const rule = (n: GraphNode): string => {
    switch (n.type) {
      case "Department":
        return n.id;
      case "ExternalParty":
        return EXTERNAL;
      case "Team":
      case "Person":
      case "Role":
        return firstAssigned(memberOf.get(n.id));
      case "ProcessStep": {
        const byRole = firstAssigned(performedBy.get(n.id));
        return byRole !== UNASSIGNED ? byRole : firstAssigned(partOf.get(n.id));
      }
      case "DecisionPoint":
        return firstAssigned(partOf.get(n.id));
      default: {
        const byOwner = firstAssigned(ownedBy.get(n.id), isRole);
        if (byOwner !== UNASSIGNED || n.type !== "Process") return byOwner;
        return firstAssigned(partOf.get(n.id));
      }
    }
  };

  for (const n of graph.nodes) resolve(n.id);

  const departments = graph.nodes
    .filter((n) => n.type === "Department")
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    .map((n) => ({ id: n.id, name: n.name }));
  const used = new Set(laneOf.values());
  const lanes = [
    ...departments,
    ...(used.has(EXTERNAL) ? [{ id: EXTERNAL, name: "External" }] : []),
    ...(used.has(UNASSIGNED) ? [{ id: UNASSIGNED, name: "Unassigned" }] : []),
  ];
  return { lanes, laneOf };
}
