// How a node shows where it came from (design spec section 2.7, roadmap P2 criterion 5).
// Three looks: confirmed by a person, extracted by AI and not yet confirmed, and anything
// else not yet confirmed.

import type { GraphNode } from "./model";

export interface Provenance {
  className: "verified" | "ai" | "unverified";
  tag: string | null;
  title: string;
}

export function provenance(n: GraphNode): Provenance {
  if (n.verified) return { className: "verified", tag: "✓", title: "Confirmed by a person" };
  if (n.source === "ai_extracted") {
    const pct = n.confidence === null ? "" : ` ${Math.round(n.confidence * 100)}%`;
    return { className: "ai", tag: `AI${pct}`, title: "Extracted by AI, not yet confirmed" };
  }
  return { className: "unverified", tag: null, title: `${n.source.replace("_", " ")}, not yet confirmed` };
}
