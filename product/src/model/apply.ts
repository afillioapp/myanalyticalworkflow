import { and, eq, inArray, or } from "drizzle-orm";
import type { Executor } from "@/db/client";
import { documentBlocks, documents, edges, nodes } from "@/db/schema";
import type { StoredEvent } from "./events";
import { checkEdge, EMPTY_EXTERNAL_REFS, layerOf, type NodeType } from "./taxonomy";

export class ModelError extends Error {}

// Projects one event onto the nodes, edges and documents tables. This is the only code
// that writes those tables, so live commits and replay share exactly one path.
// All timestamps come from the event, never from now(), so replay is identical.
export async function applyEvent(db: Executor, stored: StoredEvent): Promise<void> {
  const { event, tenantId, userId, createdAt } = stored;
  const nodeIn = (id: string) => and(eq(nodes.id, id), eq(nodes.tenantId, tenantId));

  const requireNode = async (id: string) => {
    const [row] = await db.select({ type: nodes.type }).from(nodes).where(nodeIn(id));
    if (!row) throw new ModelError(`node ${id} not found`);
    return row.type as NodeType;
  };

  switch (event.type) {
    case "node.created": {
      const p = event.payload;
      await db.insert(nodes).values({
        id: p.id,
        tenantId,
        createdBy: userId,
        type: p.nodeType,
        layer: layerOf(p.nodeType),
        name: p.name,
        attributes: p.attributes,
        source: p.source,
        confidence: p.confidence,
        externalRefs: EMPTY_EXTERNAL_REFS,
        createdAt,
        updatedAt: createdAt,
      });
      return;
    }
    case "node.updated": {
      const { id, ...changes } = event.payload;
      await requireNode(id);
      await db.update(nodes).set({ ...changes, updatedAt: createdAt }).where(nodeIn(id));
      return;
    }
    case "node.verified": {
      await requireNode(event.payload.id);
      await db
        .update(nodes)
        .set({ verifiedBy: userId, verifiedAt: createdAt, updatedAt: createdAt })
        .where(nodeIn(event.payload.id));
      return;
    }
    case "node.deleted": {
      const { id } = event.payload;
      await requireNode(id);
      const [edge] = await db
        .select({ id: edges.id })
        .from(edges)
        .where(or(eq(edges.fromId, id), eq(edges.toId, id), eq(edges.viaId, id)))
        .limit(1);
      if (edge) throw new ModelError(`node ${id} still has edges; delete them first`);
      await db.delete(nodes).where(nodeIn(id));
      return;
    }
    case "edge.created": {
      const p = event.payload;
      const fromType = await requireNode(p.fromId);
      const toType = await requireNode(p.toId);
      const viaType = p.viaId ? await requireNode(p.viaId) : null;
      const problem = checkEdge(p.edgeType, fromType, toType, viaType);
      if (problem) throw new ModelError(problem);
      await db.insert(edges).values({
        id: p.id,
        tenantId,
        createdBy: userId,
        type: p.edgeType,
        fromId: p.fromId,
        toId: p.toId,
        viaId: p.viaId,
        attributes: p.attributes,
        externalRefs: EMPTY_EXTERNAL_REFS,
        createdAt,
      });
      return;
    }
    case "edge.deleted": {
      const deleted = await db
        .delete(edges)
        .where(and(eq(edges.id, event.payload.id), eq(edges.tenantId, tenantId)))
        .returning({ id: edges.id });
      if (deleted.length === 0) throw new ModelError(`edge ${event.payload.id} not found`);
      return;
    }
    case "document.created": {
      const p = event.payload;
      await db.insert(documents).values({
        id: p.id,
        tenantId,
        createdBy: userId,
        kind: p.kind,
        title: p.title,
        externalRefs: EMPTY_EXTERNAL_REFS,
        createdAt,
        updatedAt: createdAt,
      });
      return;
    }
    case "document.blocks_set": {
      const { documentId, blocks } = event.payload;
      const docIn = and(eq(documents.id, documentId), eq(documents.tenantId, tenantId));
      const [doc] = await db.select({ id: documents.id }).from(documents).where(docIn);
      if (!doc) throw new ModelError(`document ${documentId} not found`);
      const referenced = [...new Set(blocks.flatMap((b) => (b.nodeId ? [b.nodeId] : [])))];
      if (referenced.length > 0) {
        const found = await db
          .select({ id: nodes.id })
          .from(nodes)
          .where(and(inArray(nodes.id, referenced), eq(nodes.tenantId, tenantId)));
        if (found.length !== referenced.length) throw new ModelError("block references a missing node");
      }
      await db.delete(documentBlocks).where(eq(documentBlocks.documentId, documentId));
      if (blocks.length > 0) {
        await db.insert(documentBlocks).values(
          blocks.map((b, position) => ({
            id: b.id,
            tenantId,
            createdBy: userId,
            documentId,
            position,
            kind: b.kind,
            text: b.text,
            nodeId: b.nodeId,
          })),
        );
      }
      await db.update(documents).set({ updatedAt: createdAt }).where(docIn);
      return;
    }
  }
}
