// Deterministic swimlane layout (design spec section 7). ELK's layered algorithm decides the
// left-to-right flow position. Each node's lane then fixes its vertical band, and nodes in a
// lane are packed into rows by flow position. The same view always gives the same picture.

import ELK from "elkjs/lib/elk.bundled.js";
import type { View } from "./view";

export const NODE_W = 184;
export const NODE_H = 48;
const LANE_HEADER = 30;
const ROW_H = NODE_H + 18;
const LANE_PAD = 14;
const LEFT = 24;
const GAP_X = 24;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  nodes: Record<string, Box>;
  lanes: Record<string, Box>;
  width: number;
  height: number;
}

const elk = new ELK();

export async function layoutView(view: View): Promise<Layout> {
  const laneRank = new Map(view.lanes.map((l, i) => [l.id, i]));
  const ordered = [...view.nodes].sort(
    (a, b) => laneRank.get(a.lane)! - laneRank.get(b.lane)! || a.label.localeCompare(b.label) || a.id.localeCompare(b.id),
  );
  const result = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "24",
      "elk.layered.spacing.nodeNodeBetweenLayers": "64",
      // Determinism comes from the sorted input and the fixed seed. considerModelOrder was
      // tried and dropped: about 40 times slower at 300 nodes (9.3s against 0.25s).
      "elk.randomSeed": "1",
      "elk.layered.thoroughness": "1",
      "elk.layered.nodePlacement.strategy": "SIMPLE",
    },
    children: ordered.map((n) => ({ id: n.id, width: NODE_W, height: NODE_H })),
    edges: view.edges.map((e) => ({ id: e.id, sources: [e.from], targets: [e.to] })),
  });
  const flow = new Map((result.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));

  const nodes: Record<string, Box> = {};
  const lanes: Record<string, Box> = {};
  let y = 0;
  let width = LEFT + NODE_W;
  for (const lane of view.lanes) {
    const members = ordered
      .filter((n) => n.lane === lane.id)
      .sort((a, b) => flow.get(a.id)!.x - flow.get(b.id)!.x || flow.get(a.id)!.y - flow.get(b.id)!.y || a.id.localeCompare(b.id));
    // Greedy rows: a node goes in the first row it fits without overlapping, left to right.
    const rowEnds: number[] = [];
    for (const n of members) {
      const x = LEFT + flow.get(n.id)!.x;
      let row = rowEnds.findIndex((end) => end + GAP_X <= x);
      if (row === -1) row = rowEnds.push(-Infinity) - 1;
      rowEnds[row] = x + NODE_W;
      nodes[n.id] = { x, y: y + LANE_HEADER + row * ROW_H, w: NODE_W, h: NODE_H };
      width = Math.max(width, x + NODE_W);
    }
    const h = LANE_HEADER + Math.max(1, rowEnds.length) * ROW_H + LANE_PAD - 18;
    lanes[lane.id] = { x: 0, y, w: 0, h };
    y += h;
  }
  width += LEFT;
  for (const box of Object.values(lanes)) box.w = width;
  return { nodes, lanes, width, height: y };
}
