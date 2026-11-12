// Requests, answers and pending changes (plans/P3.md section 4, plans/P4.md section 4).
// Every function here takes the database and the current actor, so tests and the app run
// exactly the same code.
//
// The baseline model is never touched until signOff, which checks the quality gate, then
// commits the option's operations as ordinary events and closes the request, in one
// transaction.

import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { v5 as uuidv5 } from "uuid";
import type { Db, Executor } from "@/db/client";
import { answers, coverage, operations, REQUEST_MODES, requests, solutionOptions, TRIGGERS, workspaces } from "@/db/schema";
import type { ModelEventInput } from "@/model/events";
import { commit, type Actor } from "@/model/log";
import { readModel } from "@/model/read";
import { loadSeed } from "@/model/seed";
import { checkEdge, NODE_TYPE_NAMES, type NodeType } from "@/model/taxonomy";
import { edgeFor, findGaps, gapKey, GAP_RULES, MAX_QUESTIONS, type Gap } from "./gaps";
import { coverageItems, gateChecks, type Check, type CoverageItem, type CoverageState } from "./gate";
import { impact, type Affected } from "./impact";
import { mandateRegulation, nextIntakeStep, OPTIONAL_STEPS, skipKey, STEP_NODE, type IntakeStep } from "./intake";
import {
  workingModel,
  type AddEdgePayload,
  type AddNodePayload,
  type PendingOp,
  type UpdateNodePayload,
  type Working,
} from "./working";

export class RequestError extends Error {}

export type Trigger = (typeof TRIGGERS)[number];

const isIntake = (ruleId: string) => ruleId.startsWith("intake:");

// ---- Workspaces -------------------------------------------------------------------------

// A fresh copy of the sample company. Ids derive from the new tenant id, so copies never clash.
export async function startWorkspace(db: Db): Promise<Actor> {
  const actor: Actor = { tenantId: randomUUID(), userId: randomUUID() };
  await loadSeed(db, actor, (key) => uuidv5(key, actor.tenantId));
  await db.insert(workspaces).values({ id: randomUUID(), tenantId: actor.tenantId, userId: actor.userId });
  return actor;
}

export async function currentWorkspace(db: Executor): Promise<Actor | null> {
  const [row] = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt), desc(workspaces.id)).limit(1);
  return row ? { tenantId: row.tenantId, userId: row.userId } : null;
}

// ---- Reading a request -------------------------------------------------------------------

export interface PriorRequest {
  id: string;
  title: string;
  status: string;
  // The nodes it shares with this request's impact.
  shared: string[];
}

export interface RequestState {
  request: typeof requests.$inferSelect;
  optionId: string;
  ops: PendingOp[];
  // Answers to questions. Intake skips are kept apart, in `intakeSkips`.
  answered: (typeof answers.$inferSelect)[];
  intakeSkips: Set<string>;
  model: Working;
  affected: Affected[];
  // The next question, or null when there is nothing left to ask in this round.
  next: Gap | null;
  // True when the round is used up and more gaps remain: "ask more" opens the next round.
  moreQuestions: boolean;
  questionLimit: number;
  intakeStep: IntakeStep | null;
  coverage: CoverageItem[];
  nextCoverage: CoverageItem | null;
  priorRequests: PriorRequest[];
  // Requirements, decisions and open issues already in the model among the affected nodes.
  priorNodes: string[];
  gate: Check[];
}

export async function listRequests(db: Executor, actor: Actor) {
  return db
    .select()
    .from(requests)
    .where(eq(requests.tenantId, actor.tenantId))
    .orderBy(desc(requests.createdAt), desc(requests.id));
}

async function optionOf(db: Executor, actor: Actor, requestId: string) {
  const [option] = await db
    .select()
    .from(solutionOptions)
    .where(and(eq(solutionOptions.requestId, requestId), eq(solutionOptions.tenantId, actor.tenantId)))
    .orderBy(asc(solutionOptions.createdAt))
    .limit(1);
  if (!option) throw new RequestError("request has no option");
  return option;
}

export async function readRequest(db: Executor, actor: Actor, requestId: string): Promise<RequestState> {
  const [request] = await db
    .select()
    .from(requests)
    .where(and(eq(requests.id, requestId), eq(requests.tenantId, actor.tenantId)));
  if (!request) throw new RequestError("request not found");
  const option = await optionOf(db, actor, requestId);
  const opRows = await db.select().from(operations).where(eq(operations.optionId, option.id)).orderBy(asc(operations.position));
  const ops = opRows.map((o) => ({ id: o.id, kind: o.kind, payload: o.payload, answerId: o.answerId, position: o.position }) as PendingOp);
  const allAnswers = await db.select().from(answers).where(eq(answers.requestId, requestId)).orderBy(asc(answers.createdAt));
  const answered = allAnswers.filter((a) => !isIntake(a.ruleId));
  const intakeSkips = new Set(allAnswers.filter((a) => isIntake(a.ruleId)).map((a) => a.ruleId));
  const verdictRows = await db.select().from(coverage).where(eq(coverage.requestId, requestId));
  const verdicts = new Map(verdictRows.map((v) => [v.nodeId, { state: v.state as CoverageState, reason: v.reason }]));

  // A signed-off request's changes are already in the baseline, so it is read without them.
  const open = request.status === "open";
  const baseline = await readModel(db, actor.tenantId);
  const model = workingModel(baseline, open ? ops : []);
  const affected = impact(model, request.tagged);

  const questionLimit = MAX_QUESTIONS * request.questionRounds;
  let next: Gap | null = null;
  let moreQuestions = false;
  if (open) {
    // New things the BSA added come first, then the tagged nodes, then outward by distance.
    const pendingNodes = ops.filter((o) => o.kind === "add_node").map((o) => o.payload.id);
    const order = [...new Set([...pendingNodes, ...affected.map((a) => a.id)])];
    const skip = new Set(answered.map((a) => gapKey(a.ruleId, a.nodeId)));
    const gaps = findGaps(model, order, skip);
    if (answered.length < questionLimit) next = gaps[0] ?? null;
    else moreQuestions = gaps.length > 0;
  }

  const intakeStep = open
    ? nextIntakeStep({ mode: request.mode, sponsorId: request.sponsorId, tagged: request.tagged, ops, model, answeredRules: intakeSkips })
    : null;
  const items = coverageItems({ model, affected, ops: open ? ops : [], verdicts });

  // Prior work (F-05): earlier requests that tagged something this request affects, and the
  // requirements, decisions and open issues already in the model among the affected nodes.
  const affectedIds = new Set(affected.map((a) => a.id));
  const others = await db
    .select()
    .from(requests)
    .where(and(eq(requests.tenantId, actor.tenantId), ne(requests.id, requestId)))
    .orderBy(desc(requests.createdAt));
  const priorRequests = others
    .map((r) => ({ id: r.id, title: r.title, status: r.status, shared: r.tagged.filter((id) => affectedIds.has(id)) }))
    .filter((r) => r.shared.length > 0);
  const priorTypes = new Set(["Requirement", "Decision", "Issue"]);
  const priorNodes = affected
    .map((a) => model.nodes.find((n) => n.id === a.id)!)
    .filter((n) => n && !n.pending && priorTypes.has(n.type))
    .map((n) => n.id);

  const gate = gateChecks({
    trigger: request.trigger,
    mode: request.mode,
    sponsorId: request.sponsorId,
    tagged: request.tagged,
    ops: open ? ops : [],
    model,
    affected,
    verdicts,
  });

  return {
    request,
    optionId: option.id,
    ops,
    answered,
    intakeSkips,
    model,
    affected,
    next,
    moreQuestions,
    questionLimit,
    intakeStep,
    coverage: items,
    nextCoverage: items.find((i) => i.state === null) ?? null,
    priorRequests,
    priorNodes,
    gate,
  };
}

// ---- Changing a request -------------------------------------------------------------------

async function openRequest(db: Executor, actor: Actor, requestId: string) {
  const state = await readRequest(db, actor, requestId);
  if (state.request.status !== "open") throw new RequestError("this request is signed off and can no longer change");
  return state;
}

const setOnRequest = (db: Executor, requestId: string, values: Partial<typeof requests.$inferInsert>) =>
  db.update(requests).set(values).where(eq(requests.id, requestId));

export async function createRequest(db: Db, actor: Actor, body: string): Promise<string> {
  const text = body.trim();
  if (!text) throw new RequestError("a request needs some text");
  const firstLine = text.split("\n")[0].trim();
  const title = firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(requests).values({ id, tenantId: actor.tenantId, createdBy: actor.userId, title, body: text });
    await tx.insert(solutionOptions).values({ id: randomUUID(), tenantId: actor.tenantId, requestId: id, name: "Option 1" });
  });
  return id;
}

export async function setTrigger(db: Db, actor: Actor, requestId: string, trigger: string): Promise<void> {
  if (!(TRIGGERS as readonly string[]).includes(trigger)) throw new RequestError(`unknown trigger: ${trigger}`);
  await openRequest(db, actor, requestId);
  await setOnRequest(db, requestId, { trigger });
}

// Business request or external mandate (F-07). Pre-selected on screen from the trigger.
export async function setMode(db: Db, actor: Actor, requestId: string, mode: string): Promise<void> {
  if (!(REQUEST_MODES as readonly string[]).includes(mode)) throw new RequestError(`unknown mode: ${mode}`);
  await openRequest(db, actor, requestId);
  await setOnRequest(db, requestId, { mode });
}

export async function setSponsor(db: Db, actor: Actor, requestId: string, roleId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (state.model.nodes.find((n) => n.id === roleId)?.type !== "Role") throw new RequestError("the sponsor is a role in the model");
  await setOnRequest(db, requestId, { sponsorId: roleId });
}

export async function tag(db: Db, actor: Actor, requestId: string, nodeId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (!state.model.nodes.some((n) => n.id === nodeId)) throw new RequestError("no such node in the model");
  if (state.request.tagged.includes(nodeId)) return;
  await setOnRequest(db, requestId, { tagged: [...state.request.tagged, nodeId] });
}

export async function untag(db: Db, actor: Actor, requestId: string, nodeId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  await setOnRequest(db, requestId, { tagged: state.request.tagged.filter((id) => id !== nodeId) });
}

// "Ask more": opens the next round of questions, once this round is used up.
export async function askMore(db: Db, actor: Actor, requestId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (!state.moreQuestions) throw new RequestError("there is nothing more to ask");
  await setOnRequest(db, requestId, { questionRounds: state.request.questionRounds + 1 });
}

const cleanName = (name: string) => {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) throw new RequestError("a name is needed");
  return n;
};

type NewOp =
  | { kind: "add_node"; payload: AddNodePayload }
  | { kind: "add_edge"; payload: AddEdgePayload }
  | { kind: "update_node"; payload: UpdateNodePayload };

// Appends operations and returns their ids, in order.
async function appendOps(db: Executor, actor: Actor, optionId: string, existing: PendingOp[], items: NewOp[], answerId: string | null) {
  let position = existing.reduce((max, o) => Math.max(max, o.position), -1);
  const ids: string[] = [];
  for (const item of items) {
    position += 1;
    const id = randomUUID();
    ids.push(id);
    await db.insert(operations).values({ id, tenantId: actor.tenantId, optionId, position, kind: item.kind, payload: item.payload, answerId });
  }
  return ids;
}

const nodePayload = (nodeType: NodeType, name: string, attributes: Record<string, unknown> = {}): AddNodePayload => ({
  id: randomUUID(),
  nodeType,
  name: cleanName(name),
  attributes,
  source: "user_entered",
  confidence: null,
});

const withPending = (model: Working, node: AddNodePayload): Working => ({
  nodes: [...model.nodes, { id: node.id, type: node.nodeType, layer: "org", name: node.name, attributes: node.attributes, pending: true }],
  edges: model.edges,
});

const edgePayload = (model: Working, edgeType: AddEdgePayload["edgeType"], fromId: string, toId: string): AddEdgePayload => {
  const from = model.nodes.find((n) => n.id === fromId);
  const to = model.nodes.find((n) => n.id === toId);
  if (!from || !to) throw new RequestError("the link points at something that does not exist");
  const problem = checkEdge(edgeType, from.type, to.type, null);
  if (problem) throw new RequestError(problem);
  return { id: randomUUID(), edgeType, fromId, toId, viaId: null, attributes: {} };
};

// Adds something the model does not have yet, as a pending change, and tags it.
export async function addNode(db: Db, actor: Actor, requestId: string, nodeType: string, name: string): Promise<string> {
  if (!(NODE_TYPE_NAMES as readonly string[]).includes(nodeType)) throw new RequestError(`unknown type: ${nodeType}`);
  const state = await openRequest(db, actor, requestId);
  const payload = nodePayload(nodeType as NodeType, name);
  await db.transaction(async (tx) => {
    await appendOps(tx, actor, state.optionId, state.ops, [{ kind: "add_node", payload }], null);
    await setOnRequest(tx, requestId, { tagged: [...state.request.tagged, payload.id] });
  });
  return payload.id;
}

// ---- Intake (P4) ---------------------------------------------------------------------------

// Records the current text step: a symptom, cause hypothesis, evidence, proposed solution or
// success measure, each a separate pending node (F-06). Evidence supports the hypothesis.
export async function recordIntake(
  db: Db,
  actor: Actor,
  requestId: string,
  step: IntakeStep,
  text: string,
  extra: { baseline?: string } = {},
): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (state.intakeStep !== step) throw new RequestError("that is not the intake step being asked");
  const nodeType = STEP_NODE[step];
  if (!nodeType) throw new RequestError("that step is not answered with text");
  const attributes: Record<string, unknown> = { request: requestId };
  if (step === "measure") attributes.baseline = extra.baseline?.trim() || null;
  const node = nodePayload(nodeType, text, attributes);
  const items: NewOp[] = [{ kind: "add_node", payload: node }];
  if (step === "evidence") {
    // What it supports: the cause hypothesis recorded in this request, else the symptom.
    const find = (t: NodeType) => state.ops.find((o) => o.kind === "add_node" && o.payload.nodeType === t)?.payload.id;
    const target = find("CauseHypothesis") ?? find("Symptom");
    if (target) items.push({ kind: "add_edge", payload: edgePayload(withPending(state.model, node), "supports", node.id, target) });
  }
  await appendOps(db, actor, state.optionId, state.ops, items, null);
}

// Skips an optional step, or finishes the open-ended "duties" step. Recorded, so it is not offered again.
export async function skipIntake(db: Db, actor: Actor, requestId: string, step: IntakeStep): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (state.intakeStep !== step) throw new RequestError("that is not the intake step being asked");
  if (!OPTIONAL_STEPS.has(step) && step !== "obligations") throw new RequestError("this step cannot be skipped");
  if (step === "obligations") {
    const regulation = mandateRegulation({ tagged: state.request.tagged, model: state.model });
    const hasDuty = regulation && state.model.edges.some((e) => e.type === "derived_from" && e.to === regulation);
    if (!hasDuty) throw new RequestError("record at least one duty first");
  }
  await db.insert(answers).values({
    id: randomUUID(),
    tenantId: actor.tenantId,
    requestId,
    createdBy: actor.userId,
    ruleId: skipKey(step),
    nodeId: requestId,
    kind: "unknown",
  });
}

// Mandate: one duty the regulation imposes, as an Obligation derived from it (F-08).
// Entered by hand in P4; AI extraction plugs in here once P1 resumes.
export async function addObligation(db: Db, actor: Actor, requestId: string, name: string): Promise<string> {
  const state = await openRequest(db, actor, requestId);
  const regulation = mandateRegulation({ tagged: state.request.tagged, model: state.model });
  if (!regulation) throw new RequestError("choose the regulation first");
  const node = nodePayload("Obligation", name);
  await appendOps(
    db,
    actor,
    state.optionId,
    state.ops,
    [
      { kind: "add_node", payload: node },
      { kind: "add_edge", payload: edgePayload(withPending(state.model, node), "derived_from", node.id, regulation) },
    ],
    null,
  );
  return node.id;
}

// ---- Questions ----------------------------------------------------------------------------

export type Answer =
  | { kind: "pick"; nodeIds: string[] }
  | { kind: "new"; nodeType: string; name: string }
  | { kind: "text"; value: string }
  | { kind: "unknown"; note: string };

// Answers the question currently being asked. Only that one: one question at a time.
export async function answer(db: Db, actor: Actor, requestId: string, ruleId: string, nodeId: string, value: Answer): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  const gap = state.next;
  if (!gap || gap.rule.id !== ruleId || gap.nodeId !== nodeId) throw new RequestError("that question is not the one being asked");
  const rule = GAP_RULES.find((r) => r.id === ruleId)!;
  const answerId = randomUUID();
  const items: NewOp[] = [];
  let note: string | null = null;

  if (value.kind === "unknown") {
    // "Don't know yet": recorded as an open Issue about the node, never a guess (rule 2).
    note = value.note.trim() || null;
    items.push({ kind: "add_node", payload: nodePayload("Issue", `Open question: ${gap.question}`, { about: nodeId, rule: ruleId, note }) });
  } else if (rule.kind === "attribute") {
    if (value.kind !== "text") throw new RequestError("this question is answered in words");
    const text = value.value.trim();
    if (!text) throw new RequestError("an answer is needed, or choose don't know yet");
    const node = state.model.nodes.find((n) => n.id === nodeId)!;
    items.push({ kind: "update_node", payload: { id: nodeId, attributes: { ...node.attributes, [rule.attribute]: text } } });
  } else if (value.kind === "pick") {
    const picks = [...new Set(value.nodeIds)];
    if (picks.length === 0) throw new RequestError("pick at least one");
    for (const pick of picks) {
      const type = state.model.nodes.find((n) => n.id === pick)?.type;
      if (!type || !rule.answer.includes(type)) throw new RequestError("that is not a valid answer to this question");
      const { from, to } = edgeFor(rule, nodeId, pick);
      items.push({ kind: "add_edge", payload: edgePayload(state.model, rule.edge, from, to) });
    }
  } else if (value.kind === "new") {
    if (!rule.answer.includes(value.nodeType as NodeType)) throw new RequestError("that type is not a valid answer here");
    const node = nodePayload(value.nodeType as NodeType, value.name);
    const { from, to } = edgeFor(rule, nodeId, node.id);
    items.push({ kind: "add_node", payload: node }, { kind: "add_edge", payload: edgePayload(withPending(state.model, node), rule.edge, from, to) });
  } else {
    throw new RequestError("this question is answered by picking from the model");
  }

  await db.transaction(async (tx) => {
    await tx.insert(answers).values({ id: answerId, tenantId: actor.tenantId, requestId, createdBy: actor.userId, ruleId, nodeId, kind: value.kind, note });
    await appendOps(tx, actor, state.optionId, state.ops, items, answerId);
  });
}

// ---- Coverage (P4, F-10) -------------------------------------------------------------------

// A verdict on one affected node. "Not applicable" needs a reason and lands in the decision
// log as a Decision node. "Blocked" needs what it waits on, and adds an Issue.
export async function setCoverage(db: Db, actor: Actor, requestId: string, nodeId: string, state: string, reason: string): Promise<void> {
  const s = await openRequest(db, actor, requestId);
  const item = s.coverage.find((i) => i.nodeId === nodeId);
  if (!item) throw new RequestError("that is not an affected item this request counts");
  if (item.state !== null) throw new RequestError("that item already has a verdict");
  const why = reason.trim();
  if (state !== "addressed" && !why) {
    throw new RequestError(state === "not_applicable" ? "say why it does not apply" : "say what it is waiting on");
  }
  const name = s.model.nodes.find((n) => n.id === nodeId)!.name;
  let operationId: string | null = null;
  await db.transaction(async (tx) => {
    if (state === "not_applicable" || state === "blocked") {
      const payload =
        state === "not_applicable"
          ? nodePayload("Decision", `Not applicable: ${name}`, { about: nodeId, reason: why, request: requestId })
          : nodePayload("Issue", `Blocked: ${name}`, { about: nodeId, reason: why, blocked: true, request: requestId });
      [operationId] = await appendOps(tx, actor, s.optionId, s.ops, [{ kind: "add_node", payload }], null);
    } else if (state !== "addressed") {
      throw new RequestError(`unknown verdict: ${state}`);
    }
    await tx.insert(coverage).values({
      id: randomUUID(),
      tenantId: actor.tenantId,
      requestId,
      nodeId,
      state,
      reason: why || null,
      operationId,
    });
  });
}

// Takes a verdict back, with the Decision or Issue it added.
export async function clearCoverage(db: Db, actor: Actor, requestId: string, nodeId: string): Promise<void> {
  await openRequest(db, actor, requestId);
  const [row] = await db.select().from(coverage).where(and(eq(coverage.requestId, requestId), eq(coverage.nodeId, nodeId)));
  if (!row) return;
  await db.transaction(async (tx) => {
    await tx.delete(coverage).where(eq(coverage.id, row.id));
    if (row.operationId) await tx.delete(operations).where(eq(operations.id, row.operationId));
  });
}

// ---- Removing a pending change -------------------------------------------------------------

// Removes a pending change. Removing a new node also removes the links to it and its tag.
// If an answer is left with no changes, the answer goes too, so its question comes back.
// A coverage verdict whose Decision or Issue is removed goes with it.
export async function removeOperation(db: Db, actor: Actor, requestId: string, operationId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  const op = state.ops.find((o) => o.id === operationId);
  if (!op) throw new RequestError("no such pending change");
  const doomed = new Set([op.id]);
  if (op.kind === "add_node") {
    for (const o of state.ops) {
      if (o.kind === "add_edge" && (o.payload.fromId === op.payload.id || o.payload.toId === op.payload.id)) doomed.add(o.id);
    }
  }
  const remaining = state.ops.filter((o) => !doomed.has(o.id));
  const orphanAnswers = state.answered
    .filter((a) => state.ops.some((o) => doomed.has(o.id) && o.answerId === a.id))
    .filter((a) => !remaining.some((o) => o.answerId === a.id))
    .map((a) => a.id);
  await db.transaction(async (tx) => {
    await tx.delete(coverage).where(and(eq(coverage.requestId, requestId), inArray(coverage.operationId, [...doomed])));
    await tx.delete(operations).where(inArray(operations.id, [...doomed]));
    if (orphanAnswers.length > 0) await tx.delete(answers).where(inArray(answers.id, orphanAnswers));
    if (op.kind === "add_node") {
      await setOnRequest(tx, requestId, { tagged: state.request.tagged.filter((id) => id !== op.payload.id) });
    }
  });
}

// ---- Sign off -----------------------------------------------------------------------------

// Promotes the option: its operations become events in the baseline, nodes first, then
// updates, then links, and the request closes. Refused while any quality gate check fails.
// One transaction, so it all happens or none of it does.
export async function signOff(db: Db, actor: Actor, requestId: string): Promise<number> {
  const state = await openRequest(db, actor, requestId);
  const failing = state.gate.filter((c) => !c.pass);
  if (failing.length > 0) throw new RequestError(`Not ready to sign off: ${failing.map((c) => c.label).join("; ")}.`);
  const byKind = (k: PendingOp["kind"]) => state.ops.filter((o) => o.kind === k);
  const ordered = [...byKind("add_node"), ...byKind("update_node"), ...byKind("add_edge")];
  const events: ModelEventInput[] = ordered.map((o) =>
    o.kind === "add_node"
      ? { type: "node.created", payload: o.payload }
      : o.kind === "update_node"
        ? { type: "node.updated", payload: o.payload }
        : { type: "edge.created", payload: o.payload },
  );
  await db.transaction(async (tx) => {
    if (events.length > 0) await commit(tx, actor, events);
    const now = new Date();
    await tx.update(solutionOptions).set({ promotedAt: now }).where(eq(solutionOptions.id, state.optionId));
    await setOnRequest(tx, requestId, { status: "signed_off", signedOffAt: now });
  });
  return events.length;
}
