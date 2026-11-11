// P2 acceptance criteria, roadmap.md. One describe block per criterion.
import { describe, expect, it } from "vitest";
import { assignLanes, EXTERNAL, UNASSIGNED } from "@/graph/lanes";
import { layoutView, type Layout } from "@/graph/layout";
import { sampleGraph } from "@/graph/load";
import type { Graph, GraphNode } from "@/graph/model";
import { provenance } from "@/graph/provenance";
import { syntheticModel } from "./fixtures/synthetic-model";
import { buildView, connectedSet, laneSummaryId, reveal, search, type ViewState } from "@/graph/view";
import { seedId } from "@/model/seed";
import { LAYERS, NODE_TYPE_NAMES, type Layer } from "@/model/taxonomy";

const all = new Set<Layer>(LAYERS);
const everything = (g: Graph): ViewState => {
  const { lanes } = assignLanes(g);
  return {
    layers: all,
    expandedLanes: new Set(lanes.map((l) => l.id)),
    expandedProcesses: new Set(g.nodes.filter((n) => n.type === "Process").map((n) => n.id)),
  };
};

const shuffle = <T>(xs: T[]): T[] => {
  const out = [...xs];
  let seed = 7;
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const overlaps = (layout: Layout) => {
  const boxes = Object.entries(layout.nodes);
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const [, a] = boxes[i];
      const [, b] = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) return [boxes[i][0], boxes[j][0]];
    }
  return null;
};

describe("lanes", () => {
  const g = sampleGraph();
  const { laneOf, lanes } = assignLanes(g);
  it("places roles, steps, systems and processes in their department's lane", () => {
    expect(laneOf.get(seedId("role.ab-adjuster"))).toBe(seedId("dept.claims"));
    expect(laneOf.get(seedId("step.adjudicate-rehab"))).toBe(seedId("dept.claims"));
    expect(laneOf.get(seedId("sys.rating"))).toBe(seedId("dept.product"));
    expect(laneOf.get(seedId("proc.quote-bind"))).toBe(seedId("dept.product"));
    expect(laneOf.get(seedId("dp.workplace-benefits"))).toBe(seedId("dept.claims"));
    expect(laneOf.get(seedId("party.fsra"))).toBe(EXTERNAL);
  });
  it("puts nodes with no owner in an Unassigned lane, last", () => {
    expect(laneOf.get(seedId("entity.policy"))).toBe(UNASSIGNED);
    expect(lanes[lanes.length - 1].id).toBe(UNASSIGNED);
  });
});

describe("P2-1: the same model renders identically on every reload", () => {
  it("gives identical positions on repeat runs and whatever order the model arrives in", async () => {
    const g = sampleGraph();
    const shuffled: Graph = { nodes: shuffle(g.nodes), edges: shuffle(g.edges) };
    for (const state of [
      { layers: new Set<Layer>(["org", "process", "system"]), expandedLanes: new Set<string>(), expandedProcesses: new Set<string>() },
      everything(g),
    ]) {
      const a = await layoutView(buildView(g, state));
      const b = await layoutView(buildView(g, state));
      const c = await layoutView(buildView(shuffled, state));
      expect(b).toEqual(a);
      expect(c).toEqual(a);
    }
  });
});

describe("P2-2: every node type has a visual treatment and is findable", () => {
  const g = sampleGraph();
  it.each(NODE_TYPE_NAMES)("%s can be found and revealed", (type) => {
    const [hit] = search(g, type);
    expect(hit, `no ${type} in the sample model`).toBeDefined();
    expect(LAYERS).toContain(hit.layer);
    if (type === "Department") {
      const view = buildView(g, { layers: all, expandedLanes: new Set(), expandedProcesses: new Set() });
      expect(view.nodes.map((n) => n.id)).toContain(laneSummaryId(hit.id));
      return;
    }
    const need = reveal(g, hit.id);
    const view = buildView(g, { layers: all, expandedLanes: new Set(need.lanes), expandedProcesses: new Set(need.processes) });
    expect(view.nodes.map((n) => n.id)).toContain(hit.id);
  });
});

describe("P2-3: selecting a node dims exactly the unconnected remainder", () => {
  it("keeps the node and its direct neighbours, and nothing else", () => {
    const g = sampleGraph();
    const view = buildView(g, everything(g));
    for (const n of view.nodes) {
      const expected = new Set([n.id]);
      for (const e of view.edges) {
        if (e.from === n.id) expected.add(e.to);
        if (e.to === n.id) expected.add(e.from);
      }
      expect(connectedSet(view, n.id)).toEqual(expected);
    }
    const step = seedId("step.adjudicate-rehab");
    const lit = connectedSet(view, step);
    expect(lit.has(seedId("role.ab-adjuster"))).toBe(true);
    expect(lit.has(seedId("sys.claims"))).toBe(true);
    expect(lit.has(seedId("channel.broker"))).toBe(false);
  });
});

describe("P2-4: a 300-node model stays legible and interactive", () => {
  const g = syntheticModel();
  it("is about 300 nodes", () => {
    expect(g.nodes.length).toBeGreaterThanOrEqual(290);
  });
  it("shows one node per lane at company level", () => {
    const view = buildView(g, { layers: all, expandedLanes: new Set(), expandedProcesses: new Set() });
    expect(view.nodes).toHaveLength(view.lanes.length);
  });
  it("lays out fully expanded with no overlapping nodes, each inside its lane, in under 3 seconds", async () => {
    const view = buildView(g, everything(g));
    const start = performance.now();
    const layout = await layoutView(view);
    expect(performance.now() - start).toBeLessThan(3000);
    expect(overlaps(layout)).toBeNull();
    for (const n of view.nodes) {
      const box = layout.nodes[n.id];
      const lane = layout.lanes[n.lane];
      expect(box.y).toBeGreaterThanOrEqual(lane.y);
      expect(box.y + box.h).toBeLessThanOrEqual(lane.y + lane.h);
    }
  });
  it("surfaces the cross-department steps as handoffs", () => {
    const view = buildView(g, everything(g));
    const handoffs = view.edges.filter((e) => e.handoff);
    expect(handoffs.length).toBeGreaterThan(0);
    // The step done by the next department sits in that department's lane, so the links on
    // either side of it are the ones that cross.
    const crossStep = /\.s(3|7)$/;
    expect(handoffs.every((e) => crossStep.test(e.from) || crossStep.test(e.to))).toBe(true);
  });
});

describe("P2-5: an AI-extracted, never-verified node looks different from a confirmed one", () => {
  const base: GraphNode = { id: "x", type: "System", layer: "system", name: "X", source: "ai_extracted", confidence: 0.62, verified: false };
  it("marks AI nodes with their confidence and confirmed nodes with a tick", () => {
    expect(provenance(base)).toMatchObject({ className: "ai", tag: "AI 62%" });
    expect(provenance({ ...base, verified: true })).toMatchObject({ className: "verified", tag: "✓" });
    expect(provenance({ ...base, source: "user_entered" }).className).toBe("unverified");
  });
});
