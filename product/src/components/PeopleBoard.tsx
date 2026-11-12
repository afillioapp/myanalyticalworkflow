"use client";

// The people board (plans/P4.md section 1b). Drag a card to another column to move it
// (DNA-04). Open one card at a time to rename it, set who it reports to, or remove it
// (DNA-03). Every change is a server action that writes events, then the page reloads.

import { useState, useTransition } from "react";
import {
  boardAddCard,
  boardAddColumn,
  boardMoveCard,
  boardRemove,
  boardRename,
  boardReportsTo,
} from "@/app/people/actions";
import type { Board, Card, Column } from "@/people/board";

const UNPLACED = "";

export function PeopleBoard({ board, openId }: { board: Board; openId: string | null }) {
  const [open, setOpen] = useState<string | null>(openId);
  const [over, setOver] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const roles = board.columns.flatMap((c) => c.cards).concat(board.unplaced).filter((c) => c.type === "Role");
  const nameOf = new Map(roles.map((r) => [r.id, r.name]));

  const drop = (columnId: string, cardId: string) => {
    setOver(null);
    const form = new FormData();
    form.set("cardId", cardId);
    form.set("columnId", columnId);
    startTransition(() => boardMoveCard(form));
  };

  const columnProps = (columnId: string) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(columnId);
    },
    onDragLeave: () => setOver((o) => (o === columnId ? null : o)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("text/plain");
      if (cardId) drop(columnId, cardId);
    },
  });

  const renderCard = (card: Card) => {
    const isOpen = open === card.id;
    return (
      <li
        key={card.id}
        className={`b-card${isOpen ? " open" : ""}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", card.id);
          e.dataTransfer.effectAllowed = "move";
        }}
      >
        <button type="button" className="b-card-head" onClick={() => setOpen(isOpen ? null : card.id)} aria-expanded={isOpen}>
          <span>{card.name}</span>
          <span className="muted small">
            {card.type === "Person" ? "Person" : card.reportsTo ? `reports to ${nameOf.get(card.reportsTo) ?? "…"}` : "Role"}
          </span>
        </button>
        {isOpen && (
          <div className="b-card-body">
            <form action={boardRename} className="inline">
              <input type="hidden" name="nodeId" value={card.id} />
              <input name="name" defaultValue={card.name} aria-label="Name" required />
              <button>Rename</button>
            </form>
            {card.type === "Role" && (
              <form action={boardReportsTo} className="inline">
                <input type="hidden" name="cardId" value={card.id} />
                <label className="small muted" htmlFor={`rt-${card.id}`}>
                  Reports to
                </label>
                <select id={`rt-${card.id}`} name="managerId" defaultValue={card.reportsTo ?? ""}>
                  <option value="">No one</option>
                  {roles
                    .filter((r) => r.id !== card.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
                <button>Save</button>
              </form>
            )}
            <form action={boardRemove}>
              <input type="hidden" name="nodeId" value={card.id} />
              <button className="link">Remove</button>
            </form>
          </div>
        )}
      </li>
    );
  };

  const renderColumn = (column: Column) => (
    <section key={column.id} className={`b-col${over === column.id ? " over" : ""}`} {...columnProps(column.id)}>
      <header className="b-col-head">
        <button type="button" className="b-col-title" onClick={() => setOpen(open === column.id ? null : column.id)}>
          {column.name}
        </button>
        <span className="muted small">{column.cards.length}</span>
      </header>
      {column.type === "Team" && <p className="muted small b-sub">Team{column.parent ? "" : ", in no department"}</p>}
      {open === column.id && (
        <div className="b-card-body">
          <form action={boardRename} className="inline">
            <input type="hidden" name="nodeId" value={column.id} />
            <input name="name" defaultValue={column.name} aria-label="Name" required />
            <button>Rename</button>
          </form>
          <form action={boardRemove}>
            <input type="hidden" name="nodeId" value={column.id} />
            <button className="link">Remove column</button>
          </form>
        </div>
      )}
      <ul className="b-cards">{column.cards.map(renderCard)}</ul>
      <form action={boardAddCard} className="b-add">
        <input type="hidden" name="columnId" value={column.id} />
        <input name="name" placeholder="Add a role" aria-label={`Add to ${column.name}`} required />
        <select name="type" aria-label="Kind" defaultValue="Role">
          <option value="Role">Role</option>
          <option value="Person">Person</option>
        </select>
        <button aria-label="Add">+</button>
      </form>
    </section>
  );

  return (
    <div className={`board${pending ? " busy" : ""}`}>
      {board.columns.map(renderColumn)}
      {board.unplaced.length > 0 && (
        <section className={`b-col unplaced${over === UNPLACED ? " over" : ""}`} {...columnProps(UNPLACED)}>
          <header className="b-col-head">
            <span className="b-col-title">Not placed yet</span>
            <span className="muted small">{board.unplaced.length}</span>
          </header>
          <ul className="b-cards">{board.unplaced.map(renderCard)}</ul>
        </section>
      )}
      <section className="b-col add-col">
        <form action={boardAddColumn} className="stack">
          <input name="name" placeholder="Add a department" aria-label="New column name" required />
          <div className="inline">
            <select name="type" aria-label="Kind" defaultValue="Department">
              <option value="Department">Department</option>
              <option value="Team">Team</option>
            </select>
            <button className="primary">Add</button>
          </div>
        </form>
      </section>
    </div>
  );
}
