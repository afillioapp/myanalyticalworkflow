// The people board (plans/P4.md section 1b). Columns are departments and teams, cards are
// roles and people. Board edits change the model directly, as events, without a request:
// setting up who is who is setup, not a change to analyse (decision 8).

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client";
import type { ModelEventInput } from "@/model/events";
import { commit, type Actor } from "@/model/log";
import { readModel, type Model } from "@/model/read";

export class BoardError extends Error {}

export const COLUMN_TYPES = ["Department", "Team"] as const;
export const CARD_TYPES = ["Role", "Person"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];
export type CardType = (typeof CARD_TYPES)[number];

export interface Card {
  id: string;
  type: CardType;
  name: string;
  // The role this card reports to, if any. Only roles report (taxonomy: Role to Role).
  reportsTo: string | null;
  // Links the board does not manage (owns, performs and so on): removing the card would break them.
  otherLinks: number;
}

export interface Column {
  id: string;
  type: ColumnType;
  name: string;
  // For a team: the department it sits in.
  parent: string | null;
  cards: Card[];
  otherLinks: number;
}

export interface Board {
  columns: Column[];
  // Roles and people that belong to no department or team yet.
  unplaced: Card[];
}

const BOARD_EDGES = new Set(["member_of", "reports_to"]);

export function boardOf(model: Pick<Model, "nodes" | "edges">): Board {
  const nodes = new Map(model.nodes.map((n) => [n.id, n]));
  const isColumn = (id: string) => (COLUMN_TYPES as readonly string[]).includes(nodes.get(id)?.type ?? "");
  const otherLinks = (id: string) =>
    model.edges.filter((e) => (e.fromId === id || e.toId === id || e.viaId === id) && !BOARD_EDGES.has(e.type)).length;
  const byName = <T extends { name: string; id: string }>(a: T, b: T) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id);

  const columns: Column[] = model.nodes
    .filter((n) => isColumn(n.id))
    .map((n) => ({
      id: n.id,
      type: n.type as ColumnType,
      name: n.name,
      parent:
        n.type === "Team"
          ? (model.edges.find((e) => e.type === "member_of" && e.fromId === n.id && nodes.get(e.toId)?.type === "Department")?.toId ?? null)
          : null,
      cards: [],
      otherLinks: otherLinks(n.id),
    }));
  const column = new Map(columns.map((c) => [c.id, c]));
  const unplaced: Card[] = [];
  for (const n of model.nodes.filter((n) => (CARD_TYPES as readonly string[]).includes(n.type))) {
    const card: Card = {
      id: n.id,
      type: n.type as CardType,
      name: n.name,
      reportsTo: model.edges.find((e) => e.type === "reports_to" && e.fromId === n.id)?.toId ?? null,
      otherLinks: otherLinks(n.id),
    };
    const home = model.edges.find((e) => e.type === "member_of" && e.fromId === n.id && isColumn(e.toId));
    if (home) column.get(home.toId)!.cards.push(card);
    else unplaced.push(card);
  }
  for (const c of columns) c.cards.sort(byName);
  // Departments first, each followed by its teams; then teams with no department.
  const departments = columns.filter((c) => c.type === "Department").sort(byName);
  const ordered = departments.flatMap((d) => [d, ...columns.filter((c) => c.parent === d.id).sort(byName)]);
  const loose = columns.filter((c) => c.type === "Team" && !c.parent).sort(byName);
  return { columns: [...ordered, ...loose], unplaced: unplaced.sort(byName) };
}

const clean = (name: string) => {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) throw new BoardError("a name is needed");
  return n;
};

async function load(db: Db, actor: Actor) {
  const model = await readModel(db, actor.tenantId);
  return { model, board: boardOf(model) };
}

const edge = (edgeType: "member_of" | "reports_to", fromId: string, toId: string): ModelEventInput => ({
  type: "edge.created",
  payload: { id: randomUUID(), edgeType, fromId, toId, viaId: null },
});

export async function addColumn(db: Db, actor: Actor, type: string, name: string): Promise<string> {
  if (!(COLUMN_TYPES as readonly string[]).includes(type)) throw new BoardError(`a column is a Department or a Team, not ${type}`);
  const id = randomUUID();
  await commit(db, actor, [{ type: "node.created", payload: { id, nodeType: type as ColumnType, name: clean(name), source: "user_entered" } }]);
  return id;
}

export async function addCard(db: Db, actor: Actor, columnId: string, type: string, name: string): Promise<string> {
  if (!(CARD_TYPES as readonly string[]).includes(type)) throw new BoardError(`a card is a Role or a Person, not ${type}`);
  const { board } = await load(db, actor);
  if (!board.columns.some((c) => c.id === columnId)) throw new BoardError("no such column");
  const id = randomUUID();
  await commit(db, actor, [
    { type: "node.created", payload: { id, nodeType: type as CardType, name: clean(name), source: "user_entered" } },
    edge("member_of", id, columnId),
  ]);
  return id;
}

// Dragging a card to another column moves its member_of link. Dragging changes meaning, not coordinates.
export async function moveCard(db: Db, actor: Actor, cardId: string, columnId: string | null): Promise<void> {
  const { model, board } = await load(db, actor);
  const card = [...board.columns.flatMap((c) => c.cards), ...board.unplaced].find((c) => c.id === cardId);
  if (!card) throw new BoardError("no such card");
  if (columnId !== null && !board.columns.some((c) => c.id === columnId)) throw new BoardError("no such column");
  const columnIds = new Set(board.columns.map((c) => c.id));
  const current = model.edges.filter((e) => e.type === "member_of" && e.fromId === cardId && columnIds.has(e.toId));
  if (columnId !== null && current.some((e) => e.toId === columnId)) return;
  await commit(db, actor, [
    ...current.map((e): ModelEventInput => ({ type: "edge.deleted", payload: { id: e.id } })),
    ...(columnId ? [edge("member_of", cardId, columnId)] : []),
  ]);
}

// "Link them together": who this role reports to. Null removes the link.
export async function setReportsTo(db: Db, actor: Actor, cardId: string, managerId: string | null): Promise<void> {
  const { model } = await load(db, actor);
  const type = (id: string) => model.nodes.find((n) => n.id === id)?.type;
  if (type(cardId) !== "Role") throw new BoardError("only a role can report to another role");
  if (managerId !== null && type(managerId) !== "Role") throw new BoardError("a role reports to a role");
  if (managerId === cardId) throw new BoardError("a role cannot report to itself");
  // No loops: walking up from the manager must never reach this card.
  for (let at = managerId, steps = 0; at && steps < 1000; steps++) {
    if (at === cardId) throw new BoardError("that would make a reporting loop");
    at = model.edges.find((e) => e.type === "reports_to" && e.fromId === at)?.toId ?? null;
  }
  const current = model.edges.filter((e) => e.type === "reports_to" && e.fromId === cardId);
  if (managerId !== null && current.some((e) => e.toId === managerId)) return;
  await commit(db, actor, [
    ...current.map((e): ModelEventInput => ({ type: "edge.deleted", payload: { id: e.id } })),
    ...(managerId ? [edge("reports_to", cardId, managerId)] : []),
  ]);
}

export async function rename(db: Db, actor: Actor, nodeId: string, name: string): Promise<void> {
  const { board } = await load(db, actor);
  const known = [...board.columns, ...board.columns.flatMap((c) => c.cards), ...board.unplaced].some((x) => x.id === nodeId);
  if (!known) throw new BoardError("not on the board");
  await commit(db, actor, [{ type: "node.updated", payload: { id: nodeId, name: clean(name) } }]);
}

// Removes a card or a column, with its board links. A column's cards become unplaced.
// Refused when the node has links the board does not manage, so nothing breaks silently.
export async function remove(db: Db, actor: Actor, nodeId: string): Promise<void> {
  const { model, board } = await load(db, actor);
  const item = [...board.columns, ...board.columns.flatMap((c) => c.cards), ...board.unplaced].find((x) => x.id === nodeId);
  if (!item) throw new BoardError("not on the board");
  if (item.otherLinks > 0) {
    throw new BoardError(
      `“${item.name}” is linked to ${item.otherLinks} other ${item.otherLinks === 1 ? "thing" : "things"} in the model, such as what it owns or performs. It stays, so those links do not break.`,
    );
  }
  const links = model.edges.filter((e) => BOARD_EDGES.has(e.type) && (e.fromId === nodeId || e.toId === nodeId));
  await commit(db, actor, [
    ...links.map((e): ModelEventInput => ({ type: "edge.deleted", payload: { id: e.id } })),
    { type: "node.deleted", payload: { id: nodeId } },
  ]);
}
