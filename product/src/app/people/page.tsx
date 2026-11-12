// The people board: departments and teams as columns, roles and people as cards.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/db/server";
import { readModel } from "@/model/read";
import { boardOf } from "@/people/board";
import { currentWorkspace } from "@/requests/store";
import { PeopleBoard } from "@/components/PeopleBoard";

export const dynamic = "force-dynamic";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ error?: string; open?: string }> }) {
  const { error, open } = await searchParams;
  const db = await getDb();
  const actor = await currentWorkspace(db);
  if (!actor) redirect("/");
  const board = boardOf(await readModel(db, actor.tenantId));
  return (
    <main className="board-page">
      <nav className="crumbs" aria-label="Where you are">
        <Link href="/">Requests</Link> <span aria-hidden>›</span> <strong>People</strong>
      </nav>
      <p className="muted small board-help">
        Add a department, then its people. Drag a card to move it. Open a card to say who it reports to.
      </p>
      {error && <p className="error">{error}</p>}
      <PeopleBoard board={board} openId={open ?? null} />
    </main>
  );
}
