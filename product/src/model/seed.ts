import { v5 as uuidv5 } from "uuid";
import type { Db } from "@/db/client";
import { tenants, users } from "@/db/schema";
import * as seed from "../../seed/company-model";
import type { ModelEventInput } from "./events";
import { commit, type Actor } from "./log";

const NAMESPACE = "665647a0-ec16-4fc8-9707-ac7d667f46d8";
export const seedId = (key: string) => uuidv5(key, NAMESPACE);

export const seedActor: Actor = { tenantId: seedId(seed.tenant.key), userId: seedId(seed.user.key) };

// Turns the hand-written model into events and commits them, so the seed goes through
// the same log as every other change. Seeded nodes are marked "imported", unverified.
export function seedEvents(): ModelEventInput[] {
  const nodeEvents: ModelEventInput[] = seed.nodes.map((n) => ({
    type: "node.created",
    payload: {
      id: seedId(n.key),
      nodeType: n.type,
      name: n.name,
      attributes: n.attributes ?? {},
      source: "imported",
    },
  }));
  const edgeEvents: ModelEventInput[] = seed.edges.map((e) => ({
    type: "edge.created",
    payload: {
      id: seedId(`edge:${e.type}:${e.from}:${e.to}`),
      edgeType: e.type,
      fromId: seedId(e.from),
      toId: seedId(e.to),
      viaId: e.via ? seedId(e.via) : null,
    },
  }));
  const documentEvents: ModelEventInput[] = seed.documents.flatMap((d): ModelEventInput[] => [
    { type: "document.created", payload: { id: seedId(d.key), kind: d.kind, title: d.title } },
    {
      type: "document.blocks_set",
      payload: {
        documentId: seedId(d.key),
        blocks: d.blocks.map((b, i) => ({
          id: seedId(`${d.key}:block:${i}`),
          kind: b.kind,
          text: b.text ?? null,
          nodeId: b.node ? seedId(b.node) : null,
        })),
      },
    },
  ]);
  return [...nodeEvents, ...edgeEvents, ...documentEvents];
}

export async function loadSeed(db: Db): Promise<Actor> {
  await db.insert(tenants).values({ id: seedActor.tenantId, name: seed.tenant.name });
  await db.insert(users).values({ id: seedActor.userId, tenantId: seedActor.tenantId, name: seed.user.name });
  await commit(db, seedActor, seedEvents());
  return seedActor;
}
