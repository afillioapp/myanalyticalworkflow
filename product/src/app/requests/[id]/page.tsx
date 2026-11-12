// One request, one page (design/visual-identity.md, plans/P3.md section 5). Cards in the order
// of the loop. One card is active and takes input; the others show one line and open on click.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db/server";
import { TRIGGERS } from "@/db/schema";
import { search } from "@/graph/view";
import { LAYERS, NODE_TYPE_NAMES, type Layer } from "@/model/taxonomy";
import { MAX_QUESTIONS } from "@/requests/gaps";
import { LAYER_LABELS, opText, stepText, TRIGGER_LABELS, typeLabel } from "@/requests/labels";
import { currentWorkspace, readRequest, RequestError, type RequestState } from "@/requests/store";
import {
  addNewNode,
  answerNew,
  answerPick,
  answerUnknown,
  chooseTrigger,
  removeChange,
  signOffRequest,
  tagNode,
  untagNode,
} from "../../actions";

export const dynamic = "force-dynamic";

const CARDS = [
  { id: "request", label: "The request" },
  { id: "trigger", label: "Trigger" },
  { id: "touches", label: "What it touches" },
  { id: "questions", label: "Questions" },
  { id: "changes", label: "Pending changes" },
  { id: "signoff", label: "Sign off" },
] as const;
type CardId = (typeof CARDS)[number]["id"];

function defaultCard(s: RequestState): CardId {
  if (s.request.status === "signed_off") return "signoff";
  if (!s.request.trigger) return "trigger";
  if (s.request.tagged.length === 0) return "touches";
  if (s.next) return "questions";
  return "changes";
}

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ card?: string; q?: string; error?: string }> };

export default async function RequestPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { card, q = "", error } = await searchParams;
  const db = await getDb();
  const actor = await currentWorkspace(db);
  if (!actor) redirect("/");
  let state: RequestState;
  try {
    state = await readRequest(db, actor, id);
  } catch (e) {
    if (e instanceof RequestError) notFound();
    throw e;
  }
  const active: CardId = CARDS.some((c) => c.id === card) ? (card as CardId) : defaultCard(state);
  const open = state.request.status === "open";
  const activeLabel = CARDS.find((c) => c.id === active)!.label;

  const summaries: Record<CardId, string> = {
    request: state.request.title,
    trigger: state.request.trigger ? TRIGGER_LABELS[state.request.trigger as keyof typeof TRIGGER_LABELS] : "Not chosen yet",
    touches: state.request.tagged.length
      ? `${state.request.tagged.length} tagged, ${state.affected.length - state.request.tagged.length} affected`
      : "Nothing tagged yet",
    questions: state.next
      ? `${state.answered.length} answered, more to ask`
      : `${state.answered.length} answered${open ? ", nothing more to ask" : ""}`,
    changes: `${state.ops.length} pending`,
    signoff: open ? "Not signed off" : `Signed off ${state.request.signedOffAt?.toLocaleDateString("en-CA") ?? ""}`,
  };

  const body: Record<CardId, React.ReactNode> = {
    request: <p className="request-text">{state.request.body}</p>,
    trigger: <TriggerCard state={state} />,
    touches: <TouchesCard state={state} q={q} />,
    questions: <QuestionsCard state={state} />,
    changes: <ChangesCard state={state} />,
    signoff: <SignOffCard state={state} />,
  };

  return (
    <main className="page">
      <nav className="crumbs" aria-label="Where you are">
        <Link href="/">Requests</Link> <span aria-hidden>›</span> <span>{state.request.title}</span> <span aria-hidden>›</span>{" "}
        <strong>{activeLabel}</strong>
      </nav>
      {error && <p className="error">{error}</p>}
      {CARDS.map((c, i) =>
        c.id === active ? (
          <section key={c.id} className="card active" aria-current="step">
            <h2>
              <span className="num">{i + 1}</span> {c.label}
            </h2>
            {body[c.id]}
          </section>
        ) : (
          <Link key={c.id} href={`?card=${c.id}`} className="card quiet">
            <span className="num">{i + 1}</span>
            <span className="quiet-label">{c.label}</span>
            <span className="quiet-summary">{summaries[c.id]}</span>
          </Link>
        ),
      )}
    </main>
  );
}

const Hidden = ({ state }: { state: RequestState }) => <input type="hidden" name="requestId" value={state.request.id} />;

function TriggerCard({ state }: { state: RequestState }) {
  if (state.request.status !== "open") return <p>{TRIGGER_LABELS[state.request.trigger as keyof typeof TRIGGER_LABELS] ?? "None"}</p>;
  return (
    <form action={chooseTrigger} className="stack">
      <p className="lead">What triggered this request?</p>
      <Hidden state={state} />
      <div className="choices">
        {TRIGGERS.map((t) => (
          <label key={t} className="choice">
            <input type="radio" name="trigger" value={t} defaultChecked={state.request.trigger === t} required />
            {TRIGGER_LABELS[t]}
          </label>
        ))}
      </div>
      <div>
        <button className="primary">Save</button>
      </div>
    </form>
  );
}

function TouchesCard({ state, q }: { state: RequestState; q: string }) {
  const { model, request } = state;
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const tagged = request.tagged.map((id) => byId.get(id)).filter((n) => n !== undefined);
  const results = q
    ? search({ nodes: model.nodes.map((n) => ({ ...n, source: "user_entered", confidence: null, verified: false })), edges: [] }, q)
        .filter((n) => !request.tagged.includes(n.id))
        .slice(0, 12)
    : [];
  const affected = state.affected.filter((a) => a.depth > 0);
  const byLayer = LAYERS.map((layer) => ({ layer, items: affected.filter((a) => byId.get(a.id)?.layer === layer) })).filter(
    (g) => g.items.length > 0,
  );
  const open = request.status === "open";

  return (
    <div className="stack">
      <div>
        <h3>Tagged</h3>
        {tagged.length === 0 && <p className="muted">Nothing yet. Find what this request touches and tag it.</p>}
        <ul className="items">
          {tagged.map((n) => (
            <li key={n.id}>
              <span>
                {n.name} <span className="muted">· {typeLabel(n.type)}</span>
                {n.pending && <span className="badge">new</span>}
              </span>
              {open && !n.pending && (
                <form action={untagNode}>
                  <Hidden state={state} />
                  <input type="hidden" name="nodeId" value={n.id} />
                  <button className="link">Remove</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div>
          <h3>Find and tag</h3>
          <form method="get" className="inline">
            <input type="hidden" name="card" value="touches" />
            <input name="q" defaultValue={q} placeholder="Search by name or type" aria-label="Search the model" />
            <button>Search</button>
          </form>
          {q && results.length === 0 && <p className="muted">Nothing found for “{q}”.</p>}
          <ul className="items">
            {results.map((n) => (
              <li key={n.id}>
                <span>
                  {n.name} <span className="muted">· {typeLabel(n.type)}</span>
                </span>
                <form action={tagNode}>
                  <Hidden state={state} />
                  <input type="hidden" name="nodeId" value={n.id} />
                  <button className="link">Tag</button>
                </form>
              </li>
            ))}
          </ul>
          <details className="add">
            <summary>Not in the model? Add it</summary>
            <form action={addNewNode} className="inline">
              <Hidden state={state} />
              <select name="nodeType" aria-label="Type" defaultValue="Obligation">
                {NODE_TYPE_NAMES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
              <input name="name" placeholder="Name" required aria-label="Name" />
              <button>Add and tag</button>
            </form>
          </details>
        </div>
      )}

      <div>
        <h3>Affected ({affected.length})</h3>
        {affected.length === 0 && <p className="muted">Tag something to see what else it affects.</p>}
        {byLayer.map(({ layer, items }) => (
          <div key={layer} className="layer-group">
            <h4>
              {LAYER_LABELS[layer as Layer]} <span className="muted">({items.length})</span>
            </h4>
            <ul className="items why">
              {items.map((a) => (
                <li key={a.id}>
                  <span>
                    {byId.get(a.id)!.name} <span className="muted">· {typeLabel(byId.get(a.id)!.type)}</span>
                  </span>
                  <span className="muted small">Why: {a.path.map((s) => stepText(model, s)).join(", then ")}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsCard({ state }: { state: RequestState }) {
  const { next, model } = state;
  const done = state.answered.length;
  if (!next) {
    return (
      <div className="stack">
        <p className="lead">
          {state.request.status === "open"
            ? done >= MAX_QUESTIONS
              ? `That is ${MAX_QUESTIONS} questions, the most for one request.`
              : state.request.tagged.length === 0
                ? "Tag what the request touches first. The questions come from what is missing there."
                : "Nothing is missing on what this request touches."
            : "This request is signed off."}
        </p>
        {done > 0 && <p className="muted">{done} answered. The changes they made are under Pending changes.</p>}
      </div>
    );
  }
  const node = model.nodes.find((n) => n.id === next.nodeId)!;
  const candidates = model.nodes
    .filter((n) => next.rule.answer.includes(n.type) && n.id !== node.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const keys = (
    <>
      <Hidden state={state} />
      <input type="hidden" name="ruleId" value={next.rule.id} />
      <input type="hidden" name="nodeId" value={next.nodeId} />
    </>
  );
  return (
    <div className="stack">
      <p className="muted small">
        Question {done + 1}, up to {MAX_QUESTIONS}. Asked because “{node.name}” has nothing linked for this yet.
      </p>
      <p className="question">{next.question}</p>

      {candidates.length > 0 && (
        <form action={answerPick} className="stack">
          {keys}
          <div className="choices">
            {candidates.map((c) => (
              <label key={c.id} className="choice">
                <input type="checkbox" name="pick" value={c.id} />
                {c.name} <span className="muted">· {typeLabel(c.type)}</span>
              </label>
            ))}
          </div>
          <div>
            <button className="primary">Save answer</button>
          </div>
        </form>
      )}

      <details className="add">
        <summary>It is something new</summary>
        <form action={answerNew} className="inline">
          {keys}
          {next.rule.answer.length > 1 ? (
            <select name="nodeType" aria-label="Type">
              {next.rule.answer.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="nodeType" value={next.rule.answer[0]} />
          )}
          <input name="name" placeholder="Name" required aria-label="Name" />
          <button>Add</button>
        </form>
      </details>

      <details className="add">
        <summary>Don&apos;t know yet</summary>
        <form action={answerUnknown} className="stack">
          {keys}
          <textarea name="note" rows={2} placeholder="Who could answer it, or what to check (optional)" aria-label="Note" />
          <div>
            <button>Record as an open question</button>
          </div>
        </form>
      </details>
    </div>
  );
}

function ChangesCard({ state }: { state: RequestState }) {
  const open = state.request.status === "open";
  const model = state.model;
  if (state.ops.length === 0) return <p className="muted">No changes yet. Tagging new things and answering questions adds them here.</p>;
  return (
    <div className="stack">
      <p className="lead">{open ? "This is what sign-off will write into the company model." : "Written into the company model at sign-off."}</p>
      <ul className="items">
        {state.ops.map((op) => (
          <li key={op.id}>
            <span>
              {opText(model, op)}
              {op.answerId && <span className="muted small"> · from a question</span>}
            </span>
            {open && (
              <form action={removeChange}>
                <Hidden state={state} />
                <input type="hidden" name="operationId" value={op.id} />
                <button className="link">Remove</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {open && (
        <div>
          <Link href="?card=signoff" className="button primary">
            Looks right
          </Link>
        </div>
      )}
    </div>
  );
}

function SignOffCard({ state }: { state: RequestState }) {
  if (state.request.status !== "open") {
    return (
      <div className="stack">
        <p className="lead">
          Signed off. {state.ops.length} {state.ops.length === 1 ? "change is" : "changes are"} now in the company model, and every new request
          starts from them.
        </p>
        <div>
          <Link href="/model" className="button">
            See the company model
          </Link>
        </div>
      </div>
    );
  }
  const n = state.ops.length;
  return (
    <form action={signOffRequest} className="stack">
      <Hidden state={state} />
      <p className="lead">
        {n === 0
          ? "There are no changes. Signing off closes the request without changing the model."
          : `Sign-off writes ${n} ${n === 1 ? "change" : "changes"} into the company model. It cannot be undone.`}
      </p>
      <div>
        <button className="primary">Sign off</button>
      </div>
    </form>
  );
}
