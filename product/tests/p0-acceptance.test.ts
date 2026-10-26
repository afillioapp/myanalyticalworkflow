// P0 acceptance criteria, roadmap.md. One describe block per criterion.
import { eq, sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connect, resetSchema, type Connection } from "@/db/client";
import { documentBlocks, documents, events, nodes, tenants, users } from "@/db/schema";
import { commit, replay } from "@/model/log";
import { readModel } from "@/model/read";
import { loadSeed, seedActor, seedId } from "@/model/seed";
import { EDGE_TYPE_NAMES, NODE_TYPE_NAMES } from "@/model/taxonomy";
import * as seed from "../seed/company-model";

let conn: Connection;

beforeEach(async () => {
  conn = await connect("memory://");
  await conn.migrate();
});
afterEach(() => conn.close());

const columnsOf = async (table: string) => {
  const result = (await conn.db.execute(
    sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = ${table}`,
  )) as unknown as { rows: { column_name: string }[] };
  return result.rows.map((r) => r.column_name).sort();
};

describe("AC1: seed loads and reads back with every node type and edge type", () => {
  it("represents all node and edge types from spec section 4", async () => {
    await loadSeed(conn.db);
    const model = await readModel(conn.db, seedActor.tenantId);

    expect(new Set(model.nodes.map((n) => n.type))).toEqual(new Set(NODE_TYPE_NAMES));
    expect(new Set(model.edges.map((e) => e.type))).toEqual(new Set(EDGE_TYPE_NAMES));
    expect(model.nodes).toHaveLength(seed.nodes.length);
    expect(model.edges).toHaveLength(seed.edges.length);
  });

  it("stores no impacts edge, because impacts is computed", async () => {
    await loadSeed(conn.db);
    expect(EDGE_TYPE_NAMES).not.toContain("impacts");
    await expect(
      commit(conn.db, seedActor, [
        {
          type: "edge.created",
          payload: {
            id: crypto.randomUUID(),
            edgeType: "impacts" as never,
            fromId: seedId("sys.claims"),
            toId: seedId("entity.claim"),
          },
        },
      ]),
    ).rejects.toThrow();
  });
});

describe("AC2: replaying the event log from empty reproduces the identical graph", () => {
  // Some history beyond the seed, so replay covers update, verify and delete too.
  const editHistory = async () => {
    const extra = crypto.randomUUID();
    await commit(conn.db, seedActor, [
      { type: "node.updated", payload: { id: seedId("sys.claims"), attributes: { vendor: "unknown" } } },
      { type: "node.verified", payload: { id: seedId("rule.insurer-first-payor") } },
      { type: "node.created", payload: { id: extra, nodeType: "Team", name: "Temporary", source: "user_entered" } },
      { type: "node.deleted", payload: { id: extra } },
    ]);
  };

  it("replays in place to the same model", async () => {
    await loadSeed(conn.db);
    await editHistory();
    const before = await readModel(conn.db, seedActor.tenantId);
    await replay(conn.db);
    expect(await readModel(conn.db, seedActor.tenantId)).toEqual(before);
  });

  it("replays into a fresh database holding only the log", async () => {
    await loadSeed(conn.db);
    await editHistory();
    const original = await readModel(conn.db, seedActor.tenantId);
    const log = await conn.db.select().from(events);

    const fresh = await connect("memory://");
    try {
      await fresh.migrate();
      await fresh.db.insert(tenants).values(await conn.db.select().from(tenants));
      await fresh.db.insert(users).values(await conn.db.select().from(users));
      await fresh.db.insert(events).values(log);
      expect(await readModel(fresh.db, seedActor.tenantId)).toEqual({ nodes: [], edges: [], documents: [], blocks: [] });

      await replay(fresh.db);
      expect(await readModel(fresh.db, seedActor.tenantId)).toEqual(original);
    } finally {
      await fresh.close();
    }
  });

  it("refuses to edit or delete the log", async () => {
    await loadSeed(conn.db);
    await expect(conn.db.update(events).set({ type: "x" })).rejects.toThrow();
    await expect(conn.db.delete(events)).rejects.toThrow();
    await expect(conn.db.execute(sql`truncate events`)).rejects.toThrow();
  });

  it("writes nothing when one event in a commit is invalid", async () => {
    await loadSeed(conn.db);
    const before = await conn.db.select().from(events);
    await expect(
      commit(conn.db, seedActor, [
        { type: "node.created", payload: { id: crypto.randomUUID(), nodeType: "Team", name: "Ok", source: "user_entered" } },
        // performed_by must end at a Role, not a System.
        {
          type: "edge.created",
          payload: {
            id: crypto.randomUUID(),
            edgeType: "performed_by",
            fromId: seedId("step.rate-quote"),
            toId: seedId("sys.rating"),
          },
        },
      ]),
    ).rejects.toThrow("performed_by cannot end at System");
    expect(await conn.db.select().from(events)).toEqual(before);
  });
});

describe("AC3: a node carries the required metadata", () => {
  it("has the columns on every node", async () => {
    const columns = await columnsOf("nodes");
    for (const c of ["id", "tenant_id", "created_by", "source", "verified_by", "verified_at", "confidence", "external_refs", "layer"]) {
      expect(columns).toContain(c);
    }
  });

  it("starts with an empty external_refs and fills verification from the event", async () => {
    await loadSeed(conn.db);
    const id = seedId("coverage.med-rehab");
    const [node] = await conn.db.select().from(nodes).where(eq(nodes.id, id));
    expect(node).toMatchObject({
      id,
      tenantId: seedActor.tenantId,
      source: "imported",
      verifiedBy: null,
      verifiedAt: null,
      confidence: null,
      layer: "business",
      externalRefs: { jira_key: null, confluence_page_id: null, azure_work_item: null },
    });

    await commit(conn.db, seedActor, [{ type: "node.verified", payload: { id } }]);
    const [verified] = await conn.db.select().from(nodes).where(eq(nodes.id, id));
    expect(verified.verifiedBy).toBe(seedActor.userId);
    expect(verified.verifiedAt).toBeInstanceOf(Date);
  });

  it("puts tenant_id and a user column on every model table", async () => {
    for (const table of ["events", "nodes", "edges", "documents", "document_blocks"]) {
      const columns = await columnsOf(table);
      expect(columns).toContain("tenant_id");
      expect(columns.some((c) => c === "user_id" || c === "created_by")).toBe(true);
    }
  });
});

describe("AC4: a requirement is a row, not a paragraph inside a document", () => {
  it("stores requirements as nodes that documents only reference", async () => {
    await loadSeed(conn.db);
    const requirementId = seedId("req.br-001");
    const [requirement] = await conn.db.select().from(nodes).where(eq(nodes.id, requirementId));
    expect(requirement.type).toBe("Requirement");

    const blocks = await conn.db
      .select()
      .from(documentBlocks)
      .where(eq(documentBlocks.documentId, seedId("doc.brd-sabs")));
    const ref = blocks.find((b) => b.kind === "node");
    expect(ref).toMatchObject({ nodeId: requirementId, text: null });
    expect(blocks.some((b) => b.text?.includes(requirement.name))).toBe(false);
  });

  it("gives documents no column that could hold rendered output", async () => {
    expect(await columnsOf("documents")).toEqual(
      ["created_at", "created_by", "external_refs", "id", "kind", "tenant_id", "title", "updated_at"],
    );
  });

  it("rejects a node block that carries text", async () => {
    await loadSeed(conn.db);
    await expect(
      conn.db.insert(documentBlocks).values({
        id: crypto.randomUUID(),
        tenantId: seedActor.tenantId,
        createdBy: seedActor.userId,
        documentId: seedId("doc.brd-sabs"),
        position: 99,
        kind: "node",
        nodeId: seedId("req.br-001"),
        text: "BR-001 pasted in as prose",
      }),
    ).rejects.toThrow();
  });
});

describe("AC5: the schema drops and rebuilds from migrations in one command", () => {
  it("resetSchema leaves an empty, fully migrated database", async () => {
    await loadSeed(conn.db);
    await resetSchema(conn);
    for (const table of [tenants, users, events, nodes, documents]) {
      expect(await conn.db.select().from(table)).toEqual([]);
    }
    // And it is usable straight away.
    await loadSeed(conn.db);
    expect((await readModel(conn.db, seedActor.tenantId)).nodes).toHaveLength(seed.nodes.length);
  });
});
