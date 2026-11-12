// Home: the requests list (plans/P3.md section 5). Start a request here, open one, or start over.
import Link from "next/link";
import { getDb } from "@/db/server";
import { TRIGGER_LABELS } from "@/requests/labels";
import { currentWorkspace, listRequests } from "@/requests/store";
import { newRequest, startOver } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const db = await getDb();
  const actor = await currentWorkspace(db);

  if (!actor) {
    return (
      <main className="page">
        <nav className="crumbs" aria-label="Where you are">
          <span>Requests</span>
        </nav>
        <section className="card active">
          <h1>Start with the sample company</h1>
          <p className="lead">
            A fictional Ontario auto insurer: its departments, roles, systems, processes and rules. Load it, then open a
            request against it.
          </p>
          <form action={startOver}>
            <button className="primary">Load the sample company</button>
          </form>
        </section>
      </main>
    );
  }

  const all = await listRequests(db, actor);
  return (
    <main className="page">
      <nav className="crumbs" aria-label="Where you are">
        <span>Requests</span>
      </nav>

      <section className="card active">
        <h1>New request</h1>
        <p className="lead">What is being asked? Paste it or write it in your own words.</p>
        {error && <p className="error">{error}</p>}
        <form action={newRequest} className="stack">
          <textarea name="body" rows={4} required aria-label="The request" />
          <div>
            <button className="primary">Start</button>
          </div>
        </form>
      </section>

      <section className="list" aria-label="Requests">
        {all.length === 0 && <p className="muted">No requests yet.</p>}
        {all.map((r) => (
          <Link key={r.id} href={`/requests/${r.id}`} className="row">
            <span className="row-title">{r.title}</span>
            <span className="muted">
              {r.trigger ? TRIGGER_LABELS[r.trigger as keyof typeof TRIGGER_LABELS] : "No trigger yet"} ·{" "}
              {r.status === "signed_off" ? "Signed off" : "Open"}
            </span>
          </Link>
        ))}
      </section>

      <p className="muted small">
        <Link href="/start-over">Start over with a fresh sample company</Link>
      </p>
    </main>
  );
}
