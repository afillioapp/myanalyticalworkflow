import { sql, type SQL } from "drizzle-orm";
import {
  bigserial,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  EDGE_TYPE_NAMES,
  EMPTY_EXTERNAL_REFS,
  LAYERS,
  NODE_TYPE_NAMES,
  SOURCES,
  type ExternalRefs,
} from "../model/taxonomy";

// Values come from taxonomy constants, never from input, so raw is safe here.
const oneOf = (column: string, values: readonly string[]): SQL =>
  sql.raw(`${column} in (${values.map((v) => `'${v}'`).join(", ")})`);

const externalRefs = () =>
  jsonb("external_refs").$type<ExternalRefs>().notNull().default(EMPTY_EXTERNAL_REFS);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

// The append-only log. Every change to the model is a row here, and nodes, edges and
// documents below are projections rebuilt from it. UPDATE, DELETE and TRUNCATE are
// rejected by a trigger (see the custom migration).
export const events = pgTable(
  "events",
  {
    seq: bigserial("seq", { mode: "number" }).primaryKey(),
    id: uuid("id").notNull().unique(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    // Null is the baseline graph. SolutionOption branches (spec section 5) write here
    // with a branch id; the column exists now so the diff engine needs no migration later.
    branchId: uuid("branch_id"),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("events_tenant_seq_idx").on(t.tenantId, t.seq)],
);

export const nodes = pgTable(
  "nodes",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    type: text("type").notNull(),
    layer: text("layer").notNull(),
    name: text("name").notNull(),
    attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),
    source: text("source").notNull(),
    verifiedBy: uuid("verified_by").references(() => users.id),
    verifiedAt: ts("verified_at"),
    confidence: real("confidence"),
    externalRefs: externalRefs(),
    createdAt: ts("created_at").notNull(),
    updatedAt: ts("updated_at").notNull(),
  },
  (t) => [
    index("nodes_tenant_type_idx").on(t.tenantId, t.type),
    check("nodes_type_check", oneOf("type", NODE_TYPE_NAMES)),
    check("nodes_layer_check", oneOf("layer", LAYERS)),
    check("nodes_source_check", oneOf("source", SOURCES)),
    check("nodes_confidence_check", sql`confidence is null or (confidence >= 0 and confidence <= 1)`),
    check("nodes_verified_check", sql`(verified_by is null) = (verified_at is null)`),
  ],
);

export const edges = pgTable(
  "edges",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    type: text("type").notNull(),
    fromId: uuid("from_id").notNull().references(() => nodes.id),
    toId: uuid("to_id").notNull().references(() => nodes.id),
    viaId: uuid("via_id").references(() => nodes.id),
    attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),
    externalRefs: externalRefs(),
    createdAt: ts("created_at").notNull(),
  },
  (t) => [
    index("edges_from_idx").on(t.fromId),
    index("edges_to_idx").on(t.toId),
    check("edges_type_check", oneOf("type", EDGE_TYPE_NAMES)),
  ],
);

// Documents are structured blocks, never rendered output (spec section 9.3).
// A requirement is a node row; a document only points at it.
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  externalRefs: externalRefs(),
  createdAt: ts("created_at").notNull(),
  updatedAt: ts("updated_at").notNull(),
});

export const BLOCK_KINDS = ["heading", "text", "node"] as const;

export const documentBlocks = pgTable(
  "document_blocks",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    documentId: uuid("document_id").notNull().references(() => documents.id),
    position: integer("position").notNull(),
    kind: text("kind").notNull(),
    text: text("text"),
    nodeId: uuid("node_id").references(() => nodes.id),
  },
  (t) => [
    unique("document_blocks_position_unique").on(t.documentId, t.position),
    check("document_blocks_kind_check", oneOf("kind", BLOCK_KINDS)),
    // A node block references a node and carries no text of its own; other blocks are text.
    check(
      "document_blocks_shape_check",
      sql`(kind = 'node') = (node_id is not null) and (kind = 'node') = (text is null)`,
    ),
  ],
);
