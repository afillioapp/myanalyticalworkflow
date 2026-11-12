"use server";

// The people board's edits. Each one commits events straight to the model (plans/P4.md
// decision 8), then sends the browser back to the board.

import { redirect } from "next/navigation";
import { getDb } from "@/db/server";
import { addCard, addColumn, BoardError, moveCard, remove, rename, setReportsTo } from "@/people/board";
import { currentWorkspace } from "@/requests/store";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

async function run(change: (db: Awaited<ReturnType<typeof getDb>>, actor: NonNullable<Awaited<ReturnType<typeof currentWorkspace>>>) => Promise<unknown>, open = "") {
  const db = await getDb();
  const actor = await currentWorkspace(db);
  if (!actor) redirect("/");
  let error = "";
  try {
    await change(db, actor);
  } catch (e) {
    if (!(e instanceof BoardError)) throw e;
    error = e.message;
  }
  const query = new URLSearchParams();
  if (error) query.set("error", error);
  if (open) query.set("open", open);
  redirect(`/people${query.size ? `?${query}` : ""}`);
}

export async function boardAddColumn(form: FormData) {
  await run((db, a) => addColumn(db, a, field(form, "type"), field(form, "name")));
}

export async function boardAddCard(form: FormData) {
  await run((db, a) => addCard(db, a, field(form, "columnId"), field(form, "type"), field(form, "name")));
}

export async function boardMoveCard(form: FormData) {
  const to = field(form, "columnId");
  await run((db, a) => moveCard(db, a, field(form, "cardId"), to || null));
}

export async function boardReportsTo(form: FormData) {
  const to = field(form, "managerId");
  await run((db, a) => setReportsTo(db, a, field(form, "cardId"), to || null), field(form, "cardId"));
}

export async function boardRename(form: FormData) {
  await run((db, a) => rename(db, a, field(form, "nodeId"), field(form, "name")), field(form, "nodeId"));
}

export async function boardRemove(form: FormData) {
  await run((db, a) => remove(db, a, field(form, "nodeId")));
}
