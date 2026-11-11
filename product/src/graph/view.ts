// What is on screen for a given set of toggles: which nodes, folded how, and which edges.
// Pure and deterministic, so the same model and state always give the same view.
//
// Zoom reveals, it does not shrink (design spec section 7). Company level shows each lane as
// one node. Expanding a lane shows its nodes, with process steps folded into their process.
// Expanding a process shows its steps.

import type { Layer } from "@/model/taxonomy";
import { assignLanes, type Lane } from "./lanes";
import { normalise, type Graph, type GraphNode } from "./model";

export interface ViewState {
  layers: Set<Layer>;
  expandedLanes: Set<string>;
  expandedProcesses: Set<string>;
}

export interface ViewNode {
  id: string;
  kind: "entity" | "lane-summary";
  lane: string;
  label: string;
  node?: GraphNode;
  // Nodes folded inside: steps in a process, or everything in a collapsed lane.
  folded: number;
  expandable: boolean;
  expanded: boolean;
}

export interface ViewEdge {
  id: string;
  from: string;
  to: string;
  types: string[];
  count: number;
  // An edge that crosses a department lane. Handoffs are where things break (spec section 4).
  handoff: boolean;
}

export interface View {
  lanes: Lane[];
  nodes: ViewNode[];
  edges: ViewEdge[];
}

const FOLDS_INTO_PROCESS = new Set(["ProcessStep", "DecisionPoint"]);
export const laneSummaryId = (laneId: string) => `summary:${laneId}`;

export function buildView(input: Graph, state: ViewState): View {
  const graph = normalise(input);
  const { lanes, laneOf } = assignLanes(graph);
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const processOf = new Map<string, string>();
  for (const e of graph.edges) {
    if (e.type === "part_of" && FOLDS_INTO_PROCESS.has(nodes.get(e.from)?.type ?? "") && !processOf.has(e.from)) {
      processOf.set(e.from, e.to);
    }
  }
  const stepsIn = new Map<string, number>();
  for (const [, p] of processOf) stepsIn.set(p, (stepsIn.get(p) ?? 0) + 1);

  // The visible stand-in for a node, or null when its layer is off. Departments are drawn as
  // their lane, never as a node of their own.
  const rep = (id: string): string | null => {
    const n = nodes.get(id);
    if (!n || n.type === "Department" || !state.layers.has(n.layer)) return null;
    const lane = laneOf.get(id)!;
    if (!state.expandedLanes.has(lane)) return laneSummaryId(lane);
    const process = processOf.get(id);
    if (process && !state.expandedProcesses.has(process)) return rep(process) ?? null;
    return id;
  };

  const viewNodes = new Map<string, ViewNode>();
  const foldedInLane = new Map<string, number>();
  for (const n of graph.nodes) {
    const r = rep(n.id);
    if (r === null) continue;
    const lane = laneOf.get(n.id)!;
    if (r === n.id) {
      const steps = n.type === "Process" ? (stepsIn.get(n.id) ?? 0) : 0;
      viewNodes.set(n.id, {
        id: n.id,
        kind: "entity",
        lane,
        label: n.name,
        node: n,
        folded: steps > 0 && !state.expandedProcesses.has(n.id) ? steps : 0,
        expandable: steps > 0,
        expanded: state.expandedProcesses.has(n.id),
      });
    } else if (!state.expandedLanes.has(lane)) {
      foldedInLane.set(lane, (foldedInLane.get(lane) ?? 0) + 1);
    }
  }
  for (const lane of lanes) {
    if (state.expandedLanes.has(lane.id)) continue;
    viewNodes.set(laneSummaryId(lane.id), {
      id: laneSummaryId(lane.id),
      kind: "lane-summary",
      lane: lane.id,
      label: lane.name,
      folded: foldedInLane.get(lane.id) ?? 0,
      expandable: true,
      expanded: false,
    });
  }

  const edges = new Map<string, ViewEdge>();
  for (const e of graph.edges) {
    const from = rep(e.from);
    const to = rep(e.to);
    if (!from || !to || from === to) continue;
    const id = `${from}->${to}`;
    const handoff = laneOf.get(e.from) !== laneOf.get(e.to);
    const existing = edges.get(id);
    if (existing) {
      existing.count += 1;
      existing.handoff ||= handoff;
      if (!existing.types.includes(e.type)) existing.types = [...existing.types, e.type].sort();
    } else {
      edges.set(id, { id, from, to, types: [e.type], count: 1, handoff });
    }
  }

  return {
    lanes,
    nodes: [...viewNodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

// Select-and-dim (spec section 7): the selected node and everything one edge away stays lit.
export function connectedSet(view: View, id: string): Set<string> {
  const lit = new Set([id]);
  for (const e of view.edges) {
    if (e.from === id) lit.add(e.to);
    if (e.to === id) lit.add(e.from);
  }
  return lit;
}

// What must be expanded for a node to become visible, so search can always reveal it.
export function reveal(input: Graph, id: string): { lanes: string[]; processes: string[] } {
  const graph = normalise(input);
  const { laneOf } = assignLanes(graph);
  const types = new Map(graph.nodes.map((n) => [n.id, n.type]));
  const lanes = new Set<string>();
  const processes: string[] = [];
  const lane = laneOf.get(id);
  if (lane) lanes.add(lane);
  if (FOLDS_INTO_PROCESS.has(types.get(id) ?? "")) {
    const p = graph.edges.find((e) => e.type === "part_of" && e.from === id)?.to;
    if (p) {
      processes.push(p);
      const pl = laneOf.get(p);
      if (pl) lanes.add(pl);
    }
  }
  return { lanes: [...lanes], processes };
}

export function search(graph: Graph, query: string): GraphNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return graph.nodes
    .filter((n) => n.name.toLowerCase().includes(q) || n.type.toLowerCase() === q)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
