import { asc, eq } from "drizzle-orm";
import type { Executor } from "@/db/client";
import { documentBlocks, documents, edges, nodes } from "@/db/schema";

// The whole model for one tenant, in a stable order so two reads can be compared.
export async function readModel(db: Executor, tenantId: string) {
  const [nodeRows, edgeRows, documentRows, blockRows] = await Promise.all([
    db.select().from(nodes).where(eq(nodes.tenantId, tenantId)).orderBy(asc(nodes.id)),
    db.select().from(edges).where(eq(edges.tenantId, tenantId)).orderBy(asc(edges.id)),
    db.select().from(documents).where(eq(documents.tenantId, tenantId)).orderBy(asc(documents.id)),
    db
      .select()
      .from(documentBlocks)
      .where(eq(documentBlocks.tenantId, tenantId))
      .orderBy(asc(documentBlocks.documentId), asc(documentBlocks.position)),
  ]);
  return { nodes: nodeRows, edges: edgeRows, documents: documentRows, blocks: blockRows };
}

export type Model = Awaited<ReturnType<typeof readModel>>;
