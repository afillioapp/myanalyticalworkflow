// Loads the graph for the model page: the current workspace's model, or, before anyone has
// loaded the sample company, the hand-written sample drawn straight from the seed file.

import { getDb } from "@/db/server";
import { readModel } from "@/model/read";
import { seedId } from "@/model/seed";
import { currentWorkspace } from "@/requests/store";
import { layerOf, type EdgeType, type Layer, type NodeType, type Source } from "@/model/taxonomy";
import * as seed from "../../seed/company-model";
import type { Graph } from "./model";

export interface LoadedGraph {
  graph: Graph;
  origin: "database" | "sample";
}

export function sampleGraph(): Graph {
  return {
    nodes: seed.nodes.map((n) => ({
      id: seedId(n.key),
      type: n.type,
      layer: layerOf(n.type),
      name: n.name,
      source: "imported" as const,
      confidence: null,
      verified: false,
    })),
    edges: seed.edges.map((e) => ({
      id: seedId(`edge:${e.type}:${e.from}:${e.to}`),
      type: e.type,
      from: seedId(e.from),
      to: seedId(e.to),
      via: e.via ? seedId(e.via) : null,
    })),
  };
}

// The current workspace's model. With no workspace yet, the sample model from the seed file.
export async function loadGraph(): Promise<LoadedGraph> {
  const db = await getDb();
  const actor = await currentWorkspace(db);
  if (!actor) return { graph: sampleGraph(), origin: "sample" };
  const model = await readModel(db, actor.tenantId);
  return {
    origin: "database",
    graph: {
      nodes: model.nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        layer: n.layer as Layer,
        name: n.name,
        source: n.source as Source,
        confidence: n.confidence,
        verified: n.verifiedAt !== null,
      })),
      edges: model.edges.map((e) => ({ id: e.id, type: e.type as EdgeType, from: e.fromId, to: e.toId, via: e.viaId })),
    },
  };
}
