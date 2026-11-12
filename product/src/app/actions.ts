"use server";

// Every button and form on the request screens posts to one of these. Each does one thing,
// then sends the browser back to the page with the right card open.

import { redirect } from "next/navigation";
import { getDb } from "@/db/server";
import {
  addNode,
  answer,
  createRequest,
  currentWorkspace,
  removeOperation,
  RequestError,
  setTrigger,
  signOff,
  startWorkspace,
  tag,
  untag,
} from "@/requests/store";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

async function context() {
  const db = await getDb();
  const actor = await currentWorkspace(db);
  if (!actor) redirect("/");
  return { db, actor };
}

// Runs one change to a request. A RequestError becomes a message on the page, not a crash.
async function onRequest(form: FormData, card: string, change: (requestId: string) => Promise<unknown>) {
  const requestId = field(form, "requestId");
  let error = "";
  try {
    await change(requestId);
  } catch (e) {
    if (!(e instanceof RequestError)) throw e;
    error = e.message;
  }
  const query = new URLSearchParams({ card });
  if (error) query.set("error", error);
  redirect(`/requests/${requestId}?${query}`);
}

export async function startOver() {
  await startWorkspace(await getDb());
  redirect("/");
}

export async function newRequest(form: FormData) {
  const { db, actor } = await context();
  let id = "";
  try {
    id = await createRequest(db, actor, field(form, "body"));
  } catch (e) {
    if (!(e instanceof RequestError)) throw e;
    redirect(`/?error=${encodeURIComponent(e.message)}`);
  }
  redirect(`/requests/${id}`);
}

export async function chooseTrigger(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "touches", (id) => setTrigger(db, actor, id, field(form, "trigger")));
}

export async function tagNode(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "touches", (id) => tag(db, actor, id, field(form, "nodeId")));
}

export async function untagNode(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "touches", (id) => untag(db, actor, id, field(form, "nodeId")));
}

export async function addNewNode(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "touches", (id) => addNode(db, actor, id, field(form, "nodeType"), field(form, "name")));
}

export async function answerPick(form: FormData) {
  const { db, actor } = await context();
  const picks = form.getAll("pick").map(String);
  await onRequest(form, "questions", (id) =>
    answer(db, actor, id, field(form, "ruleId"), field(form, "nodeId"), { kind: "pick", nodeIds: picks }),
  );
}

export async function answerNew(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "questions", (id) =>
    answer(db, actor, id, field(form, "ruleId"), field(form, "nodeId"), {
      kind: "new",
      nodeType: field(form, "nodeType"),
      name: field(form, "name"),
    }),
  );
}

export async function answerUnknown(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "questions", (id) =>
    answer(db, actor, id, field(form, "ruleId"), field(form, "nodeId"), { kind: "unknown", note: field(form, "note") }),
  );
}

export async function removeChange(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "changes", (id) => removeOperation(db, actor, id, field(form, "operationId")));
}

export async function signOffRequest(form: FormData) {
  const { db, actor } = await context();
  await onRequest(form, "signoff", (id) => signOff(db, actor, id));
}
