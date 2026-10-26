import { z } from "zod";
import { BLOCK_KINDS } from "@/db/schema";
import { EDGE_TYPE_NAMES, NODE_TYPE_NAMES, SOURCES } from "./taxonomy";

// Every change to the model is one of these. IDs are chosen by the caller and carried
// in the payload, so replaying the log reproduces the same IDs.

const attributes = z.record(z.string(), z.unknown());

const nodeCreated = z.object({
  type: z.literal("node.created"),
  payload: z.object({
    id: z.uuid(),
    nodeType: z.enum(NODE_TYPE_NAMES),
    name: z.string().min(1),
    attributes: attributes.default({}),
    source: z.enum(SOURCES),
    confidence: z.number().min(0).max(1).nullable().default(null),
  }),
});

const nodeUpdated = z.object({
  type: z.literal("node.updated"),
  payload: z.object({
    id: z.uuid(),
    name: z.string().min(1).optional(),
    attributes: attributes.optional(),
    confidence: z.number().min(0).max(1).nullable().optional(),
  }),
});

// Verifier and time come from the event itself (user_id, created_at), not the payload.
const nodeVerified = z.object({
  type: z.literal("node.verified"),
  payload: z.object({ id: z.uuid() }),
});

const nodeDeleted = z.object({
  type: z.literal("node.deleted"),
  payload: z.object({ id: z.uuid() }),
});

const edgeCreated = z.object({
  type: z.literal("edge.created"),
  payload: z.object({
    id: z.uuid(),
    edgeType: z.enum(EDGE_TYPE_NAMES),
    fromId: z.uuid(),
    toId: z.uuid(),
    viaId: z.uuid().nullable().default(null),
    attributes: attributes.default({}),
  }),
});

const edgeDeleted = z.object({
  type: z.literal("edge.deleted"),
  payload: z.object({ id: z.uuid() }),
});

const documentCreated = z.object({
  type: z.literal("document.created"),
  payload: z.object({
    id: z.uuid(),
    kind: z.string().min(1),
    title: z.string().min(1),
  }),
});

const block = z.object({
  id: z.uuid(),
  kind: z.enum(BLOCK_KINDS),
  text: z.string().nullable().default(null),
  nodeId: z.uuid().nullable().default(null),
});

// Replaces the whole block list. Each call is one version of the document.
const documentBlocksSet = z.object({
  type: z.literal("document.blocks_set"),
  payload: z.object({ documentId: z.uuid(), blocks: z.array(block) }),
});

export const modelEvent = z.discriminatedUnion("type", [
  nodeCreated,
  nodeUpdated,
  nodeVerified,
  nodeDeleted,
  edgeCreated,
  edgeDeleted,
  documentCreated,
  documentBlocksSet,
]);

export type ModelEvent = z.infer<typeof modelEvent>;
export type ModelEventInput = z.input<typeof modelEvent>;

// What the apply step sees: the parsed event plus the envelope columns from the log row.
export interface StoredEvent {
  event: ModelEvent;
  tenantId: string;
  userId: string;
  createdAt: Date;
}
