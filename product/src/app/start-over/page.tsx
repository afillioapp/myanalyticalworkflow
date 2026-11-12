// One decision: start over or not. Nothing is deleted: the event log is append-only, so a
// fresh copy of the sample company becomes the current one and the old one is set aside.
import Link from "next/link";
import { startOver } from "../actions";

export default function StartOver() {
  return (
    <main className="page">
      <nav className="crumbs" aria-label="Where you are">
        <Link href="/">Requests</Link> <span aria-hidden>›</span> <span>Start over</span>
      </nav>
      <section className="card active">
        <h1>Start over?</h1>
        <p className="lead">
          You get a fresh copy of the sample company with no requests. Your current requests and every change signed off
          in them are set aside, not shown again.
        </p>
        <form action={startOver} className="inline">
          <button className="primary">Start over</button>
          <Link href="/" className="button">
            Keep working
          </Link>
        </form>
      </section>
    </main>
  );
}
