// Requests, answers and pending changes (plans/P3.md section 4). Every function here takes
// the database and the current actor, so tests and the app run exactly the same code.
//
// The baseline model is never touched until signOff, which commits the option's operations
// as ordinary events and closes the request, in one transaction.

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { v5 as uuidv5 } from "uuid";
import type { Db, Executor } from "@/db/client";
import { answers, operations, requests, solutionOptions, TRIGGERS, workspaces } from "@/db/schema";
import type { ModelEventInput } from "@/model/events";
import { commit, type Actor } from "@/model/log";
import { readModel } from "@/model/read";
import { loadSeed } from "@/model/seed";
import { checkEdge, NODE_TYPE_NAMES, type NodeType } from "@/model/taxonomy";
import { edgeFor, findGaps, gapKey, GAP_RULES, MAX_QUESTIONS, type Gap } from "./gaps";
import { impact, type Affected } from "./impact";
import { workingModel, type AddEdgePayload, type AddNodePayload, type PendingOp, type Working } from "./working";

export class RequestError extends Error {}

export type Trigger = (typeof TRIGGERS)[number];

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

export interface RequestState {
  request: typeof requests.$inferSelect;
  optionId: string;
  ops: PendingOp[];
  answered: (typeof answers.$inferSelect)[];
  model: Working;
  affected: Affected[];
  // The next question, or null when there is nothing left to ask or the limit is reached.
  next: Gap | null;
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
  const answered = await db.select().from(answers).where(eq(answers.requestId, requestId)).orderBy(asc(answers.createdAt));

  // A signed-off request's changes are already in the baseline, so it is read without them.
  const baseline = await readModel(db, actor.tenantId);
  const model = workingModel(baseline, request.status === "open" ? ops : []);
  const affected = impact(model, request.tagged);

  let next: Gap | null = null;
  if (request.status === "open" && answered.length < MAX_QUESTIONS) {
    // New things the BSA added come first, then the tagged nodes, then outward by distance.
    const pendingNodes = ops.filter((o) => o.kind === "add_node").map((o) => o.payload.id);
    const order = [...new Set([...pendingNodes, ...affected.map((a) => a.id)])];
    const skip = new Set(answered.map((a) => gapKey(a.ruleId, a.nodeId)));
    next = findGaps(model, order, skip)[0] ?? null;
  }
  return { request, optionId: option.id, ops, answered, model, affected, next };
}

// ---- Changing a request -------------------------------------------------------------------

async function openRequest(db: Executor, actor: Actor, requestId: string) {
  const state = await readRequest(db, actor, requestId);
  if (state.request.status !== "open") throw new RequestError("this request is signed off and can no longer change");
  return state;
}

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
  await db.update(requests).set({ trigger }).where(and(eq(requests.id, requestId), eq(requests.tenantId, actor.tenantId)));
}

export async function tag(db: Db, actor: Actor, requestId: string, nodeId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  if (!state.model.nodes.some((n) => n.id === nodeId)) throw new RequestError("no such node in the model");
  if (state.request.tagged.includes(nodeId)) return;
  await db
    .update(requests)
    .set({ tagged: [...state.request.tagged, nodeId] })
    .where(eq(requests.id, requestId));
}

export async function untag(db: Db, actor: Actor, requestId: string, nodeId: string): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  await db
    .update(requests)
    .set({ tagged: state.request.tagged.filter((id) => id !== nodeId) })
    .where(eq(requests.id, requestId));
}

const cleanName = (name: string) => {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) throw new RequestError("a name is needed");
  return n;
};

async function appendOps(
  db: Executor,
  actor: Actor,
  optionId: string,
  existing: PendingOp[],
  items: { kind: PendingOp["kind"]; payload: AddNodePayload | AddEdgePayload }[],
  answerId: string | null,
) {
  let position = existing.reduce((max, o) => Math.max(max, o.position), -1);
  for (const item of items) {
    position += 1;
    await db.insert(operations).values({
      id: randomUUID(),
      tenantId: actor.tenantId,
      optionId,
      position,
      kind: item.kind,
      payload: item.payload,
      answerId,
    });
  }
}

const nodePayload = (nodeType: NodeType, name: string, attributes: Record<string, unknown> = {}): AddNodePayload => ({
  id: randomUUID(),
  nodeType,
  name: cleanName(name),
  attributes,
  source: "user_entered",
  confidence: null,
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
    await tx.update(requests).set({ tagged: [...state.request.tagged, payload.id] }).where(eq(requests.id, requestId));
  });
  return payload.id;
}

export type Answer =
  | { kind: "pick"; nodeIds: string[] }
  | { kind: "new"; nodeType: string; name: string }
  | { kind: "unknown"; note: string };

// Answers the question currently being asked. Only that one: one question at a time.
export async function answer(db: Db, actor: Actor, requestId: string, ruleId: string, nodeId: string, value: Answer): Promise<void> {
  const state = await openRequest(db, actor, requestId);
  const gap = state.next;
  if (!gap || gap.rule.id !== ruleId || gap.nodeId !== nodeId) throw new RequestError("that question is not the one being asked");
  const rule = GAP_RULES.find((r) => r.id === ruleId)!;
  const answerId = randomUUID();
  const items: { kind: PendingOp["kind"]; payload: AddNodePayload | AddEdgePayload }[] = [];
  let note: string | null = null;

  if (value.kind === "pick") {
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
    const withNode: Working = {
      nodes: [...state.model.nodes, { id: node.id, type: node.nodeType, layer: "org", name: node.name, attributes: {}, pending: true }],
      edges: state.model.edges,
    };
    const { from, to } = edgeFor(rule, nodeId, node.id);
    items.push({ kind: "add_node", payload: node }, { kind: "add_edge", payload: edgePayload(withNode, rule.edge, from, to) });
  } else {
    // "Don't know yet": recorded as an open Issue about the node, never a guess (rule 2).
    note = value.note.trim() || null;
    items.push({
      kind: "add_node",
      payload: nodePayload("Issue", `Open question: ${gap.question}`, { about: nodeId, rule: ruleId, note }),
    });
  }

  await db.transaction(async (tx) => {
    await tx.insert(answers).values({
      id: answerId,
      tenantId: actor.tenantId,
      requestId,
      createdBy: actor.userId,
      ruleId,
      nodeId,
      kind: value.kind,
      note,
    });
    await appendOps(tx, actor, state.optionId, state.ops, items, answerId);
  });
}

// Removes a pending change. Removing a new node also removes the links to it and its tag.
// If an answer is left with no changes, the answer goes too, so its question comes back.
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
    await tx.delete(operations).where(inArray(operations.id, [...doomed]));
    if (orphanAnswers.length > 0) await tx.delete(answers).where(inArray(answers.id, orphanAnswers));
    if (op.kind === "add_node") {
      await tx
        .update(requests)
        .set({ tagged: state.request.tagged.filter((id) => id !== op.payload.id) })
        .where(eq(requests.id, requestId));
    }
  });
}

// ---- Sign off -----------------------------------------------------------------------------

// Promotes the option: its operations become events in the baseline, nodes before links,
// and the request closes. One transaction, so it all happens or none of it does.
export async function signOff(db: Db, actor: Actor, requestId: string): Promise<number> {
  const state = await openRequest(db, actor, requestId);
  const ordered = [...state.ops.filter((o) => o.kind === "add_node"), ...state.ops.filter((o) => o.kind === "add_edge")];
  const events: ModelEventInput[] = ordered.map((o) =>
    o.kind === "add_node" ? { type: "node.created", payload: o.payload } : { type: "edge.created", payload: o.payload },
  );
  await db.transaction(async (tx) => {
    if (events.length > 0) await commit(tx, actor, events);
    const now = new Date();
    await tx.update(solutionOptions).set({ promotedAt: now }).where(eq(solutionOptions.id, state.optionId));
    await tx.update(requests).set({ status: "signed_off", signedOffAt: now }).where(eq(requests.id, requestId));
  });
  return events.length;
}
