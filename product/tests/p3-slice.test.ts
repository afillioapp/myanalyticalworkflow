// P3 acceptance criteria, roadmap.md and plans/P3.md section 9. One describe block per criterion.
import { v5 as uuidv5 } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connect, type Connection } from "@/db/client";
import type { Actor } from "@/model/log";
import { readModel } from "@/model/read";
import { replay } from "@/model/log";
import { checkEdge, NODE_TYPE_NAMES, type NodeType } from "@/model/taxonomy";
import { GAP_RULES, MAX_QUESTIONS } from "@/requests/gaps";
import { impact } from "@/requests/impact";
import {
  addNode,
  answer,
  createRequest,
  currentWorkspace,
  readRequest,
  removeOperation,
  setTrigger,
  signOff,
  startWorkspace,
  tag,
} from "@/requests/store";
import { workingModel } from "@/requests/working";

let conn: Connection;
let actor: Actor;
const id = (key: string) => uuidv5(key, actor.tenantId);

beforeEach(async () => {
  conn = await connect("memory://");
  await conn.migrate();
  actor = await startWorkspace(conn.db);
});
afterEach(() => conn.close());

const RIDESHARE =
  "FSRA updated its Q&A: if we remove or reduce optional accident benefits on a rideshare fleet policy, we have to tell them. Can you make sure we do?";

describe("the gap rules", () => {
  it("only ever ask for links the taxonomy allows", () => {
    for (const rule of GAP_RULES) {
      for (const applies of rule.appliesTo) {
        for (const ans of rule.answer) {
          const [from, to] = rule.direction === "out" ? [applies, ans] : [ans, applies];
          expect(checkEdge(rule.edge, from as NodeType, to as NodeType, null), `${rule.id}: ${from} -> ${to}`).toBeNull();
        }
      }
    }
  });
});

describe("P3-1: loads with the starter template, no interview or upload", () => {
  it("holds the main departments and the delivery roles", async () => {
    const model = await readModel(conn.db, actor.tenantId);
    const names = new Set(model.nodes.map((n) => n.name));
    for (const d of ["Product", "Underwriting", "Claims", "Distribution", "Finance", "Compliance", "IT"]) expect(names).toContain(d);
    for (const r of ["Sponsor", "Product Owner", "Business Systems Analyst", "QA Analyst", "Developer", "Architect", "Release Authority"])
      expect(names).toContain(r);
  });
  it("starts over as a fresh copy that leaves the old one untouched", async () => {
    const first = actor;
    const requestId = await createRequest(conn.db, first, "Something");
    const second = await startWorkspace(conn.db);
    expect(await currentWorkspace(conn.db)).toEqual(second);
    expect((await readModel(conn.db, second.tenantId)).nodes.length).toBe((await readModel(conn.db, first.tenantId)).nodes.length);
    await expect(readRequest(conn.db, second, requestId)).rejects.toThrow();
  });
});

describe("P3-2: a request is recorded with its trigger", () => {
  it("records the text, a title and one of the seven triggers", async () => {
    const requestId = await createRequest(conn.db, actor, RIDESHARE);
    await setTrigger(conn.db, actor, requestId, "regulatory_change");
    const { request } = await readRequest(conn.db, actor, requestId);
    expect(request.body).toBe(RIDESHARE);
    expect(request.title.length).toBeLessThanOrEqual(80);
    expect(request.trigger).toBe("regulatory_change");
    await expect(setTrigger(conn.db, actor, requestId, "because")).rejects.toThrow();
  });
});

describe("P3-3: the same tags always give the same impact, each with its path", () => {
  it("is deterministic whatever order the model arrives in", async () => {
    const model = workingModel(await readModel(conn.db, actor.tenantId), []);
    const tags = [id("step.change-optional-benefits"), id("product.rideshare-fleet")];
    const a = impact(model, tags);
    const b = impact({ nodes: [...model.nodes].reverse(), edges: [...model.edges].reverse() }, [...tags].reverse());
    expect(b).toEqual(a);
  });
  it("gives every affected node a path from a tagged node", async () => {
    const model = workingModel(await readModel(conn.db, actor.tenantId), []);
    const tags = [id("step.change-optional-benefits")];
    const result = impact(model, tags);
    const ids = new Set(result.map((r) => r.id));
    expect(ids).toContain(id("sys.policy-admin"));
    expect(ids).toContain(id("role.underwriter"));
    for (const r of result) {
      expect(r.path).toHaveLength(r.depth);
      if (r.depth > 0) {
        const first = r.path[0];
        expect([first.from, first.to]).toContain(tags[0]);
        const last = r.path[r.path.length - 1];
        expect([last.from, last.to]).toContain(r.id);
      }
    }
  });
  it("does not spread through a department to everyone in it", async () => {
    const model = workingModel(await readModel(conn.db, actor.tenantId), []);
    const result = impact(model, [id("role.underwriter")]);
    const ids = new Set(result.map((r) => r.id));
    expect(ids).toContain(id("dept.underwriting"));
    // Release Authority sits in IT, reached only through a department: not affected.
    expect(ids).not.toContain(id("role.release-authority"));
  });
});

describe("P3-5: questions come one at a time, at most five, never already answered", () => {
  it("asks about what is missing, and an answered question does not come back", async () => {
    const requestId = await createRequest(conn.db, actor, RIDESHARE);
    const obligation = await addNode(conn.db, actor, requestId, "Obligation", "Notify FSRA when optional accident benefits are removed or reduced under a rideshare fleet policy");
    let state = await readRequest(conn.db, actor, requestId);
    expect(state.next?.rule.id).toBe("obligation-owner");
    expect(state.next?.nodeId).toBe(obligation);
    await answer(conn.db, actor, requestId, "obligation-owner", obligation, { kind: "pick", nodeIds: [id("role.compliance-officer")] });
    state = await readRequest(conn.db, actor, requestId);
    expect(state.next?.rule.id).not.toBe("obligation-owner");
  });
  it("refuses to answer a question that is not the one being asked", async () => {
    const requestId = await createRequest(conn.db, actor, RIDESHARE);
    const obligation = await addNode(conn.db, actor, requestId, "Obligation", "Notify FSRA");
    await expect(
      answer(conn.db, actor, requestId, "obligation-met-by", obligation, { kind: "unknown", note: "" }),
    ).rejects.toThrow();
  });
  it("stops after five questions", async () => {
    const requestId = await createRequest(conn.db, actor, "Many gaps");
    for (let i = 0; i < 3; i++) await addNode(conn.db, actor, requestId, "Obligation", `Obligation ${i}`);
    for (let i = 0; i < MAX_QUESTIONS; i++) {
      const { next } = await readRequest(conn.db, actor, requestId);
      expect(next).not.toBeNull();
      await answer(conn.db, actor, requestId, next!.rule.id, next!.nodeId, { kind: "unknown", note: "" });
    }
    expect((await readRequest(conn.db, actor, requestId)).next).toBeNull();
  });
  it("does not ask again, in a later request, what was recorded as not known yet", async () => {
    const first = await createRequest(conn.db, actor, "First");
    await tag(conn.db, actor, first, id("step.renew-existing"));
    const { next } = await readRequest(conn.db, actor, first);
    expect(next?.rule.id).toBe("step-performer");
    await answer(conn.db, actor, first, "step-performer", next!.nodeId, { kind: "unknown", note: "Ask the renewal team" });
    await signOff(conn.db, actor, first);
    const second = await createRequest(conn.db, actor, "Second");
    await tag(conn.db, actor, second, id("step.renew-existing"));
    const again = await readRequest(conn.db, actor, second);
    expect(again.next === null || again.next.rule.id !== "step-performer" || again.next.nodeId !== id("step.renew-existing")).toBe(true);
  });
});

describe("P3-6: answers become pending changes, traced, nothing applied before sign-off", () => {
  it("leaves the baseline untouched and links every change to its answer", async () => {
    const before = await readModel(conn.db, actor.tenantId);
    const requestId = await createRequest(conn.db, actor, RIDESHARE);
    const obligation = await addNode(conn.db, actor, requestId, "Obligation", "Notify FSRA");
    await answer(conn.db, actor, requestId, "obligation-owner", obligation, { kind: "pick", nodeIds: [id("role.compliance-officer")] });
    expect(await readModel(conn.db, actor.tenantId)).toEqual(before);
    const state = await readRequest(conn.db, actor, requestId);
    expect(state.ops).toHaveLength(2);
    const fromAnswer = state.ops.filter((o) => o.answerId !== null);
    expect(fromAnswer).toHaveLength(1);
    expect(state.answered.map((a) => a.id)).toContain(fromAnswer[0].answerId);
  });
  it("removing a new node removes its links, and the question comes back", async () => {
    const requestId = await createRequest(conn.db, actor, RIDESHARE);
    const obligation = await addNode(conn.db, actor, requestId, "Obligation", "Notify FSRA");
    await answer(conn.db, actor, requestId, "obligation-owner", obligation, { kind: "new", nodeType: "Role", name: "Regulatory Reporting Lead" });
    let state = await readRequest(conn.db, actor, requestId);
    const newRole = state.ops.find((o) => o.kind === "add_node" && o.payload.nodeType === "Role")!;
    await removeOperation(conn.db, actor, requestId, newRole.id);
    state = await readRequest(conn.db, actor, requestId);
    expect(state.ops).toHaveLength(1);
    expect(state.next?.rule.id).toBe("obligation-owner");
  });
});

describe("P3-7: sign-off writes events, the next request sees them, replay reproduces", () => {
  it("runs the rideshare request end to end, then a second request picks it up", async () => {
    // Request 1: the FSRA rideshare notification.
    const first = await createRequest(conn.db, actor, RIDESHARE);
    await setTrigger(conn.db, actor, first, "regulatory_change");
    await tag(conn.db, actor, first, id("product.rideshare-fleet"));
    await tag(conn.db, actor, first, id("step.change-optional-benefits"));
    const obligation = await addNode(
      conn.db,
      actor,
      first,
      "Obligation",
      "Notify FSRA when optional accident benefits are removed or reduced under a rideshare fleet policy",
    );

    const ask = async () => (await readRequest(conn.db, actor, first)).next!;
    let q = await ask();
    expect(q.rule.id).toBe("obligation-owner");
    await answer(conn.db, actor, first, q.rule.id, q.nodeId, { kind: "pick", nodeIds: [id("role.compliance-officer")] });
    q = await ask();
    expect(q.rule.id).toBe("obligation-source");
    await answer(conn.db, actor, first, q.rule.id, q.nodeId, { kind: "pick", nodeIds: [id("reg.fsra-qa")] });
    q = await ask();
    expect(q.rule.id).toBe("obligation-met-by");
    await answer(conn.db, actor, first, q.rule.id, q.nodeId, {
      kind: "new",
      nodeType: "BusinessRule",
      name: "Removing or reducing optional accident benefits on a rideshare fleet policy triggers an FSRA notification",
    });
    q = await ask();
    expect(q.rule.id).toBe("rule-applies-to");
    await answer(conn.db, actor, first, q.rule.id, q.nodeId, {
      kind: "pick",
      nodeIds: [id("step.change-optional-benefits"), id("step.renew-existing")],
    });
    q = await ask();
    // C-02 does not say how or when FSRA is notified: the honest answer is "don't know yet".
    await answer(conn.db, actor, first, q.rule.id, q.nodeId, { kind: "unknown", note: "C-02 does not say. Ask the FSRA relationship manager." });

    const pending = (await readRequest(conn.db, actor, first)).ops.length;
    const written = await signOff(conn.db, actor, first);
    expect(written).toBe(pending);

    const after = await readModel(conn.db, actor.tenantId);
    expect(after.nodes.some((n) => n.id === obligation && n.type === "Obligation")).toBe(true);
    await expect(setTrigger(conn.db, actor, first, "defect")).rejects.toThrow();

    // Request 2: tag only the renewal step. The FSRA rule and obligation now come up.
    const second = await createRequest(conn.db, actor, "A broker asks to drop the caregiver benefit for a rideshare fleet client at renewal");
    await tag(conn.db, actor, second, id("step.renew-existing"));
    const state = await readRequest(conn.db, actor, second);
    const names = state.affected.map((a) => state.model.nodes.find((n) => n.id === a.id)!.name);
    expect(names).toContain("Removing or reducing optional accident benefits on a rideshare fleet policy triggers an FSRA notification");
    expect(names).toContain("Notify FSRA when optional accident benefits are removed or reduced under a rideshare fleet policy");

    // Replay from the log reproduces the model, sign-off included.
    const model = await readModel(conn.db, actor.tenantId);
    await replay(conn.db);
    expect(await readModel(conn.db, actor.tenantId)).toEqual(model);
  });

  it("only offers node types the taxonomy has", () => {
    for (const rule of GAP_RULES) for (const t of rule.answer) expect(NODE_TYPE_NAMES).toContain(t);
  });
});
