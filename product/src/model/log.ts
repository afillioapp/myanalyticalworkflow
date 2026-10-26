import { asc, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client";
import { documentBlocks, documents, edges, events, nodes } from "@/db/schema";
import { applyEvent } from "./apply";
import { modelEvent, type ModelEventInput } from "./events";

export interface Actor {
  tenantId: string;
  userId: string;
}

// The only way to change the model: append events and project them, in one transaction.
// If any event is invalid, nothing is written.
export async function commit(db: Db, actor: Actor, inputs: ModelEventInput[]): Promise<void> {
  const parsed = inputs.map((input) => modelEvent.parse(input));
  await db.transaction(async (tx) => {
    for (const event of parsed) {
      const [row] = await tx
        .insert(events)
        .values({
          id: randomUUID(),
          tenantId: actor.tenantId,
          userId: actor.userId,
          type: event.type,
          payload: event.payload,
        })
        .returning({ createdAt: events.createdAt });
      await applyEvent(tx, { event, ...actor, createdAt: row.createdAt });
    }
  });
}

// Empties the projections and rebuilds them from the baseline log, in log order.
export async function replay(db: Db): Promise<number> {
  return db.transaction(async (tx) => {
    await tx.delete(documentBlocks);
    await tx.delete(documents);
    await tx.delete(edges);
    await tx.delete(nodes);
    const log = await tx.select().from(events).where(isNull(events.branchId)).orderBy(asc(events.seq));
    for (const row of log) {
      const event = modelEvent.parse({ type: row.type, payload: row.payload });
      await applyEvent(tx, { event, tenantId: row.tenantId, userId: row.userId, createdAt: row.createdAt });
    }
    return log.length;
  });
}
