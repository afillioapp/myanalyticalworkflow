import type { Graph, GraphNode } from "@/graph/model";
import { layerOf } from "@/model/taxonomy";

// A synthetic carrier with roughly 300 nodes: 6 departments, each with teams, roles,
// processes of 9 steps, systems and data.
export function syntheticModel(): Graph {
  const nodes: GraphNode[] = [];
  const edges: Graph["edges"] = [];
  const node = (id: string, type: GraphNode["type"], name: string) =>
    nodes.push({ id, type, layer: layerOf(type), name, source: "imported", confidence: null, verified: false });
  const edge = (type: Graph["edges"][number]["type"], from: string, to: string) =>
    edges.push({ id: `${type}:${from}:${to}`, type, from, to, via: null });
  for (let d = 0; d < 6; d++) {
    const dept = `d${d}`;
    node(dept, "Department", `Department ${d}`);
    node(`${dept}.team`, "Team", `Team ${d}`);
    edge("member_of", `${dept}.team`, dept);
    for (let r = 0; r < 3; r++) {
      node(`${dept}.r${r}`, "Role", `Role ${d}.${r}`);
      edge("member_of", `${dept}.r${r}`, `${dept}.team`);
    }
    node(`${dept}.sys`, "System", `System ${d}`);
    edge("owns", `${dept}.r0`, `${dept}.sys`);
    for (let p = 0; p < 4; p++) {
      const proc = `${dept}.p${p}`;
      node(proc, "Process", `Process ${d}.${p}`);
      edge("owns", `${dept}.r0`, proc);
      for (let s = 0; s < 9; s++) {
        const step = `${proc}.s${s}`;
        node(step, "ProcessStep", `Step ${d}.${p}.${s}`);
        edge("part_of", step, proc);
        // Every fourth step is done by the next department's role: a handoff.
        edge("performed_by", step, s % 4 === 3 ? `d${(d + 1) % 6}.r1` : `${dept}.r${s % 3}`);
        edge("executed_in", step, `${dept}.sys`);
        if (s > 0) edge("precedes", `${proc}.s${s - 1}`, step);
      }
      node(`${proc}.entity`, "DataEntity", `Entity ${d}.${p}`);
      edge("owns", `${dept}.r0`, `${proc}.entity`);
      edge("writes", `${dept}.sys`, `${proc}.entity`);
    }
  }
  return { nodes, edges };
}

