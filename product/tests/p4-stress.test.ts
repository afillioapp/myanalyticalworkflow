// P4 acceptance criteria, roadmap.md and plans/P4.md section 9. One describe block per criterion.
import { v5 as uuidv5 } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connect, type Connection } from "@/db/client";
import { assignLanes } from "@/graph/lanes";
import type { Graph } from "@/graph/model";
import { replay, type Actor } from "@/model/log";
import { readModel } from "@/model/read";
import { checkEdge, EDGE_TYPE_NAMES } from "@/model/taxonomy";
import { addCard, addColumn, BoardError, boardOf, moveCard, remove, setReportsTo } from "@/people/board";
import { gateChecks } from "@/requests/gate";
import { impact } from "@/requests/impact";
import {
  addObligation,
  answer,
  askMore,
  clearCoverage,
  createRequest,
  readRequest,
  recordIntake,
  setCoverage,
  setMode,
  setSponsor,
  setTrigger,
  signOff,
  skipIntake,
  startWorkspace,
  tag,
} from "@/requests/store";
import { workingModel } from "@/requests/working";
import { syntheticModel } from "./fixtures/synthetic-model";
import { readyForSignOff } from "./helpers/ready";

let conn: Connection;
let actor: Actor;
const id = (key: string) => uuidv5(key, actor.tenantId);

beforeEach(async () => {
  conn = await connect("memory://");
  await conn.migrate();
  actor = await startWorkspace(conn.db);
});
afterEach(() => conn.close());

const model = async () => workingModel(await readModel(conn.db, actor.tenantId), []);

describe("P4-1: tagging only the SABS regulation surfaces the areas it touches, untold", () => {
  it("reaches coverages, rating, forms, claims adjudication and the broker channel, each with a path", async () => {
    const m = await model();
    const result = impact(m, [id("reg.sabs-2026")]);
    const reached = new Map(result.map((r) => [r.id, r]));
    const expected = {
      "income replacement coverage": "coverage.income-replacement",
      "medical and rehabilitation coverage": "coverage.med-rehab",
      "the rating engine": "sys.rating",
      "rating the quote": "step.rate-quote",
      "the OPCF 47R form": "form.opcf-47r",
      "claims adjudication": "step.adjudicate-rehab",
      "the broker channel": "channel.broker",
    };
    for (const [what, key] of Object.entries(expected)) {
      const r = reached.get(id(key));
      expect(r, `${what} is not reached`).toBeDefined();
      expect(r!.path.length, `${what} has no path`).toBeGreaterThan(0);
    }
  });
  it("does not pull a whole regulation in when one step is tagged", async () => {
    const result = impact(await model(), [id("step.rate-quote")]);
    const ids = new Set(result.map((r) => r.id));
    expect(ids).not.toContain(id("reg.sabs-2026"));
    expect(ids).not.toContain(id("obl.insurer-first-payor"));
  });
});

describe("P4-2: priority of payment shows as a claims and coordination-of-benefits impact", () => {
  it("reaches claims adjudication and the workplace benefits decision through the insurer-pays-first rule, in the Claims lane", async () => {
    const m = await model();
    const result = impact(m, [id("reg.sabs-2026")]);
    const graph: Graph = {
      nodes: m.nodes.map((n) => ({ id: n.id, type: n.type, layer: n.layer, name: n.name, source: "imported", confidence: null, verified: false })),
      edges: m.edges.map((e) => ({ id: e.id, type: e.type, from: e.from, to: e.to, via: e.via })),
    };
    const { laneOf } = assignLanes(graph);
    for (const key of ["step.adjudicate-rehab", "dp.workplace-benefits"]) {
      const r = result.find((x) => x.id === id(key));
      expect(r, key).toBeDefined();
      expect(r!.path.some((s) => s.to === id("rule.insurer-first-payor") || s.from === id("rule.insurer-first-payor")), key).toBe(true);
      expect(laneOf.get(id(key))).toBe(id("dept.claims"));
    }
  });
});

describe("P4-3: Integration questions cover licence gating, configuration gating and deletion detection", () => {
  it("asks all three about an integration, and keeps every answer", async () => {
    const r = await createRequest(conn.db, actor, "Change the policy admin to rating link");
    await tag(conn.db, actor, r, id("int.policy-rating"));
    const asked: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { next } = await readRequest(conn.db, actor, r);
      expect(next?.nodeId).toBe(id("int.policy-rating"));
      asked.push(next!.rule.id);
      await answer(conn.db, actor, r, next!.rule.id, next!.nodeId, { kind: "text", value: `answer ${i}` });
    }
    expect(asked).toEqual(["integration-licence", "integration-configuration", "integration-deletion"]);
    const node = (await readRequest(conn.db, actor, r)).model.nodes.find((n) => n.id === id("int.policy-rating"))!;
    expect(node.attributes).toMatchObject({ licence_gating: "answer 0", configuration_gating: "answer 1", deletion_detection: "answer 2", mode: "synchronous" });
  });
  it("reaches an integration through the systems it connects", async () => {
    const result = impact(await model(), [id("sys.rating")]);
    const r = result.find((x) => x.id === id("int.policy-rating"));
    expect(r).toBeDefined();
    expect([r!.path.at(-1)!.from, r!.path.at(-1)!.to]).toContain(id("int.policy-rating"));
  });
});

describe("P4-4: coverage cannot reach complete while anything is unaddressed or blocked", () => {
  it("fails until every counted item has a verdict, and fails while one is blocked", async () => {
    const r = await createRequest(conn.db, actor, "Something");
    await tag(conn.db, actor, r, id("step.rate-quote"));
    let s = await readRequest(conn.db, actor, r);
    const counted = s.coverage.length;
    expect(counted).toBeGreaterThan(1);
    expect(s.gate.find((c) => c.id === "coverage")!.pass).toBe(false);
    const [first, ...rest] = s.coverage;
    await setCoverage(conn.db, actor, r, first.nodeId, "blocked", "Waiting on the pricing team");
    for (const item of rest) await setCoverage(conn.db, actor, r, item.nodeId, "addressed", "");
    s = await readRequest(conn.db, actor, r);
    expect(s.gate.find((c) => c.id === "coverage")!.pass).toBe(false);
    await clearCoverage(conn.db, actor, r, first.nodeId);
    await setCoverage(conn.db, actor, r, first.nodeId, "addressed", "");
    s = await readRequest(conn.db, actor, r);
    expect(s.gate.find((c) => c.id === "coverage")!.pass).toBe(true);
    // Clearing the blocked verdict removed the Issue it added.
    expect(s.ops.some((o) => o.kind === "add_node" && o.payload.nodeType === "Issue")).toBe(false);
  });
  it("counts processes, systems, data and business, not people or regulation", async () => {
    const r = await createRequest(conn.db, actor, "Something");
    await tag(conn.db, actor, r, id("reg.sabs-2026"));
    const s = await readRequest(conn.db, actor, r);
    const layers = new Set(s.coverage.map((i) => s.model.nodes.find((n) => n.id === i.nodeId)!.layer));
    expect(layers.has("org")).toBe(false);
    expect(layers.has("governance")).toBe(false);
  });
});

describe("P4-5: not applicable needs a reason, and the reason lands in the decision log", () => {
  it("refuses an empty reason and adds a Decision with the reason", async () => {
    const r = await createRequest(conn.db, actor, "Something");
    await tag(conn.db, actor, r, id("step.rate-quote"));
    const item = (await readRequest(conn.db, actor, r)).coverage[0];
    await expect(setCoverage(conn.db, actor, r, item.nodeId, "not_applicable", "  ")).rejects.toThrow();
    await setCoverage(conn.db, actor, r, item.nodeId, "not_applicable", "Rating is not affected by this change");
    const s = await readRequest(conn.db, actor, r);
    const decision = s.ops.find((o) => o.kind === "add_node" && o.payload.nodeType === "Decision");
    expect(decision).toBeDefined();
    expect(decision!.kind === "add_node" && decision!.payload.attributes).toMatchObject({ about: item.nodeId, reason: "Rating is not affected by this change" });
  });
});

describe("P4-6: the quality gate blocks on deterministic failures only", () => {
  it("names each failing check, refuses sign-off, then allows it once all pass", async () => {
    const r = await createRequest(conn.db, actor, "A broker reports quotes failing");
    await tag(conn.db, actor, r, id("step.rate-quote"));
    let s = await readRequest(conn.db, actor, r);
    expect(s.gate.filter((c) => !c.pass).map((c) => c.id)).toEqual(expect.arrayContaining(["trigger", "mode", "sponsor", "coverage"]));
    await expect(signOff(conn.db, actor, r)).rejects.toThrow(/Not ready to sign off/);
    await readyForSignOff(conn.db, actor, r);
    s = await readRequest(conn.db, actor, r);
    expect(s.gate.every((c) => c.pass)).toBe(true);
    await expect(signOff(conn.db, actor, r)).resolves.toBeGreaterThan(0);
  });
  it("is a pure function: the same state gives the same checks", async () => {
    const m = await model();
    const input = { trigger: "defect", mode: "request", sponsorId: null, tagged: [], ops: [], model: m, affected: [], verdicts: new Map() };
    expect(gateChecks(input)).toEqual(gateChecks(input));
    expect(gateChecks(input).find((c) => c.id === "intake-three")!.label).toMatch(/symptom, cause hypothesis, proposed solution/);
  });
});

describe("P4-7: impact on a 300-node model returns in under two seconds", () => {
  it("is fast on the synthetic 300-node model", () => {
    const g = syntheticModel();
    expect(g.nodes.length).toBeGreaterThanOrEqual(290);
    const start = performance.now();
    impact(g, g.nodes.filter((n) => n.type === "Department").map((n) => n.id));
    impact(g, g.nodes.slice(0, 20).map((n) => n.id));
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe("P4-8: the taxonomy holds without insurance-only changes", () => {
  it("adds only supports, from evidence to a symptom or cause hypothesis", () => {
    expect(EDGE_TYPE_NAMES).toContain("supports");
    expect(checkEdge("supports", "Evidence", "CauseHypothesis", null)).toBeNull();
    expect(checkEdge("supports", "Evidence", "Symptom", null)).toBeNull();
    expect(checkEdge("supports", "Coverage", "Symptom", null)).not.toBeNull();
  });
});

describe("Intake: mandate and business request", () => {
  it("mandate: pick the regulation, record duties, and the gate wants each duty met by a rule", async () => {
    const r = await createRequest(conn.db, actor, "FSRA SABS changes");
    await setTrigger(conn.db, actor, r, "regulatory_change");
    await setMode(conn.db, actor, r, "mandate");
    let s = await readRequest(conn.db, actor, r);
    expect(s.intakeStep).toBe("regulation");
    await tag(conn.db, actor, r, id("reg.sabs-2026"));
    s = await readRequest(conn.db, actor, r);
    expect(s.intakeStep).toBe("obligations");
    const duty = await addObligation(conn.db, actor, r, "Insurers file under the optionality filing specifications");
    await skipIntake(conn.db, actor, r, "obligations");
    s = await readRequest(conn.db, actor, r);
    expect(s.intakeStep).toBe("sponsor");
    expect(s.gate.find((c) => c.id === "obligations")!.pass).toBe(false);
    // The new duty's first questions: who owns it, then which rule meets it.
    expect(s.next?.nodeId).toBe(duty);
    await answer(conn.db, actor, r, "obligation-owner", duty, { kind: "pick", nodeIds: [id("role.compliance-officer")] });
    s = await readRequest(conn.db, actor, r);
    expect(s.next?.rule.id).toBe("obligation-met-by");
    await answer(conn.db, actor, r, "obligation-met-by", duty, { kind: "new", nodeType: "BusinessRule", name: "File optionality changes before they go live" });
    s = await readRequest(conn.db, actor, r);
    expect(s.gate.find((c) => c.id === "obligations")!.pass).toBe(true);
  });
  it("business request: four separate things, evidence supports the hypothesis, then sponsor and measure", async () => {
    const r = await createRequest(conn.db, actor, "Rehab invoices are held");
    await setMode(conn.db, actor, r, "request");
    await recordIntake(conn.db, actor, r, "symptom", "Rehabilitation invoices are held");
    await recordIntake(conn.db, actor, r, "cause", "The claims system applies the old payor order");
    await expect(recordIntake(conn.db, actor, r, "solution", "Out of order")).rejects.toThrow();
    await recordIntake(conn.db, actor, r, "evidence", "Twelve held invoices from last month");
    await recordIntake(conn.db, actor, r, "solution", "Update the payor order rule");
    let s = await readRequest(conn.db, actor, r);
    expect(s.intakeStep).toBe("sponsor");
    const types = s.ops.filter((o) => o.kind === "add_node").map((o) => (o.kind === "add_node" ? o.payload.nodeType : ""));
    expect(types).toEqual(["Symptom", "CauseHypothesis", "Evidence", "ProposedSolution"]);
    const support = s.ops.find((o) => o.kind === "add_edge" && o.payload.edgeType === "supports");
    const hypothesis = s.ops.find((o) => o.kind === "add_node" && o.payload.nodeType === "CauseHypothesis")!;
    expect(support?.kind === "add_edge" && support.payload.toId).toBe(hypothesis.kind === "add_node" && hypothesis.payload.id);
    await setSponsor(conn.db, actor, r, id("role.claims-manager"));
    await recordIntake(conn.db, actor, r, "measure", "Invoices paid without a hold", { baseline: "40 held a month" });
    s = await readRequest(conn.db, actor, r);
    expect(s.intakeStep).toBeNull();
    expect(s.gate.find((c) => c.id === "intake-three")!.pass).toBe(true);
  });
});

describe("Questions come in rounds of five", () => {
  it("stops at five, then ask more opens five more", async () => {
    const r = await createRequest(conn.db, actor, "Many gaps");
    for (let i = 0; i < 3; i++) await addObligation(conn.db, actor, r, `Duty ${i}`).catch(() => undefined);
    await setMode(conn.db, actor, r, "request");
    await tag(conn.db, actor, r, id("int.policy-rating"));
    await tag(conn.db, actor, r, id("field.ir-selection"));
    await tag(conn.db, actor, r, id("step.renew-existing"));
    for (let i = 0; i < 5; i++) {
      const { next } = await readRequest(conn.db, actor, r);
      await answer(conn.db, actor, r, next!.rule.id, next!.nodeId, { kind: "unknown", note: "" });
    }
    let s = await readRequest(conn.db, actor, r);
    expect(s.next).toBeNull();
    expect(s.moreQuestions).toBe(true);
    await askMore(conn.db, actor, r);
    s = await readRequest(conn.db, actor, r);
    expect(s.next).not.toBeNull();
    expect(s.questionLimit).toBe(10);
  });
});

describe("Prior work", () => {
  it("shows an earlier request that touched what this one affects", async () => {
    const first = await createRequest(conn.db, actor, "Earlier change to rating");
    await tag(conn.db, actor, first, id("sys.rating"));
    const second = await createRequest(conn.db, actor, "Now the quote step");
    await tag(conn.db, actor, second, id("step.rate-quote"));
    const s = await readRequest(conn.db, actor, second);
    expect(s.priorRequests.map((p) => p.id)).toContain(first);
  });
});

describe("The people board (plans/P4.md section 1b)", () => {
  it("adds a department and a role in it, moves it, links it, and replays", async () => {
    const dept = await addColumn(conn.db, actor, "Department", "Pricing");
    const vp = await addCard(conn.db, actor, dept, "Role", "VP Pricing");
    const manager = await addCard(conn.db, actor, dept, "Role", "Pricing Manager");
    await setReportsTo(conn.db, actor, manager, vp);
    let board = boardOf(await readModel(conn.db, actor.tenantId));
    const pricing = board.columns.find((c) => c.id === dept)!;
    expect(pricing.cards.map((c) => c.name)).toEqual(["Pricing Manager", "VP Pricing"]);
    expect(pricing.cards.find((c) => c.id === manager)!.reportsTo).toBe(vp);

    await moveCard(conn.db, actor, manager, id("dept.finance"));
    board = boardOf(await readModel(conn.db, actor.tenantId));
    expect(board.columns.find((c) => c.id === dept)!.cards.map((c) => c.id)).toEqual([vp]);
    expect(board.columns.find((c) => c.id === id("dept.finance"))!.cards.map((c) => c.id)).toContain(manager);

    const before = await readModel(conn.db, actor.tenantId);
    await replay(conn.db);
    expect(await readModel(conn.db, actor.tenantId)).toEqual(before);
  });
  it("refuses a reporting loop, and refuses to remove what is linked elsewhere", async () => {
    const dept = await addColumn(conn.db, actor, "Department", "Pricing");
    const a = await addCard(conn.db, actor, dept, "Role", "A");
    const b = await addCard(conn.db, actor, dept, "Role", "B");
    await setReportsTo(conn.db, actor, a, b);
    await expect(setReportsTo(conn.db, actor, b, a)).rejects.toThrow(BoardError);
    // The Compliance Officer owns obligations and approves forms: removing it would break those.
    await expect(remove(conn.db, actor, id("role.compliance-officer"))).rejects.toThrow(BoardError);
    await remove(conn.db, actor, b);
    const board = boardOf(await readModel(conn.db, actor.tenantId));
    expect(board.columns.find((c) => c.id === dept)!.cards.find((c) => c.id === a)!.reportsTo).toBeNull();
  });
  it("leaves a request's sign-off path untouched: board edits are events, not pending changes", async () => {
    const r = await createRequest(conn.db, actor, "Something");
    await addColumn(conn.db, actor, "Team", "Pricing analytics");
    const s = await readRequest(conn.db, actor, r);
    expect(s.ops).toHaveLength(0);
  });
});
