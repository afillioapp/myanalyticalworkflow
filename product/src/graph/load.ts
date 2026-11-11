// Loads the graph for the page. With a database it reads the seed tenant's model. Without one,
// or while that tenant is still empty, it draws the hand-written sample model straight from
// the seed file, so nothing is written to production just to have something to show.

import { connect, type Connection } from "@/db/client";
import { readModel } from "@/model/read";
import { seedActor, seedId } from "@/model/seed";
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

let connection: Promise<Connection> | undefined;

export async function loadGraph(): Promise<LoadedGraph> {
  if (!process.env.DATABASE_URL) return { graph: sampleGraph(), origin: "sample" };
  try {
    connection ??= connect(process.env.DATABASE_URL);
    const model = await readModel((await connection).db, seedActor.tenantId);
    if (model.nodes.length === 0) return { graph: sampleGraph(), origin: "sample" };
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
  } catch (error) {
    connection = undefined;
    throw error;
  }
}
