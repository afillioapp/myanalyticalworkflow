// One request, one page (design/visual-identity.md, plans/P3.md section 5, plans/P4.md
// section 1). Cards in the order of the loop. One card is active and takes input; the
// others show one line and open on click.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db/server";
import { REQUEST_MODES, TRIGGERS } from "@/db/schema";
import { search } from "@/graph/view";
import { LAYERS, NODE_TYPE_NAMES, type Layer } from "@/model/taxonomy";
import { MAX_QUESTIONS } from "@/requests/gaps";
import { mandateRegulation, obligationsOf, type IntakeStep } from "@/requests/intake";
import { COVERAGE_LABELS, LAYER_LABELS, MODE_LABELS, opText, stepText, TRIGGER_LABELS, typeLabel } from "@/requests/labels";
import { currentWorkspace, readRequest, RequestError, type RequestState } from "@/requests/store";
import {
  addNewNode,
  answerNew,
  answerPick,
  answerText,
  answerUnknown,
  askMoreQuestions,
  chooseMode,
  chooseRegulation,
  chooseSponsor,
  chooseTrigger,
  coverageUndo,
  coverageVerdict,
  intakeSkip,
  intakeText,
  newObligation,
  newRegulation,
  removeChange,
  signOffRequest,
  tagNode,
  untagNode,
} from "../../actions";

export const dynamic = "force-dynamic";

const CARDS = [
  { id: "request", label: "The request" },
  { id: "trigger", label: "Trigger" },
  { id: "mode", label: "Mode" },
  { id: "intake", label: "Intake" },
  { id: "prior", label: "Prior work" },
  { id: "touches", label: "What it touches" },
  { id: "questions", label: "Questions" },
  { id: "coverage", label: "Coverage" },
  { id: "changes", label: "Pending changes" },
  { id: "signoff", label: "Quality gate and sign off" },
] as const;
type CardId = (typeof CARDS)[number]["id"];

function defaultCard(s: RequestState): CardId {
  if (s.request.status === "signed_off") return "signoff";
  if (!s.request.trigger) return "trigger";
  if (!s.request.mode) return "mode";
  if (s.intakeStep) return "intake";
  if (s.request.tagged.length === 0) return "touches";
  if (s.next) return "questions";
  if (s.nextCoverage) return "coverage";
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
  const visible = CARDS.filter((c) => c.id !== "intake" || state.request.mode !== null);
  const active: CardId = visible.some((c) => c.id === card) ? (card as CardId) : defaultCard(state);
  const open = state.request.status === "open";
  const activeLabel = CARDS.find((c) => c.id === active)!.label;
  const nameOf = (nodeId: string | null) => state.model.nodes.find((n) => n.id === nodeId)?.name ?? "";
  const leftToCover = state.coverage.filter((i) => i.state === null).length;
  const failing = state.gate.filter((c) => !c.pass).length;

  const summaries: Record<CardId, string> = {
    request: state.request.title,
    trigger: state.request.trigger ? TRIGGER_LABELS[state.request.trigger as keyof typeof TRIGGER_LABELS] : "Not chosen yet",
    mode: state.request.mode ? MODE_LABELS[state.request.mode as keyof typeof MODE_LABELS] : "Not chosen yet",
    intake: state.intakeStep ? "Not finished" : `Done${state.request.sponsorId ? ` · sponsor: ${nameOf(state.request.sponsorId)}` : ""}`,
    prior: state.priorRequests.length || state.priorNodes.length
      ? `${state.priorRequests.length} earlier ${state.priorRequests.length === 1 ? "request" : "requests"}, ${state.priorNodes.length} linked records`
      : "Nothing earlier found",
    touches: state.request.tagged.length
      ? `${state.request.tagged.length} tagged, ${state.affected.length - state.request.tagged.length} affected`
      : "Nothing tagged yet",
    questions: state.next
      ? `${state.answered.length} answered, more to ask`
      : state.moreQuestions
        ? `${state.answered.length} answered, more available`
        : `${state.answered.length} answered${open ? ", nothing more to ask" : ""}`,
    coverage: state.coverage.length ? `${leftToCover} of ${state.coverage.length} left` : "Nothing to cover yet",
    changes: `${state.ops.length} pending`,
    signoff: open
      ? failing
        ? `${failing} ${failing === 1 ? "check" : "checks"} to pass`
        : "Ready to sign off"
      : `Signed off ${state.request.signedOffAt?.toLocaleDateString("en-CA") ?? ""}`,
  };

  const body: Record<CardId, React.ReactNode> = {
    request: <p className="request-text">{state.request.body}</p>,
    trigger: <TriggerCard state={state} />,
    mode: <ModeCard state={state} />,
    intake: <IntakeCard state={state} />,
    prior: <PriorCard state={state} />,
    touches: <TouchesCard state={state} q={q} />,
    questions: <QuestionsCard state={state} />,
    coverage: <CoverageCard state={state} />,
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
      {visible.map((c, i) =>
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
const isOpen = (state: RequestState) => state.request.status === "open";

function TriggerCard({ state }: { state: RequestState }) {
  if (!isOpen(state)) return <p>{TRIGGER_LABELS[state.request.trigger as keyof typeof TRIGGER_LABELS] ?? "None"}</p>;
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

function ModeCard({ state }: { state: RequestState }) {
  if (!isOpen(state)) return <p>{MODE_LABELS[state.request.mode as keyof typeof MODE_LABELS] ?? "None"}</p>;
  // Pre-selected from the trigger, but changeable (plans/P4.md decision 6).
  const suggested = state.request.mode ?? (state.request.trigger === "regulatory_change" ? "mandate" : "request");
  return (
    <form action={chooseMode} className="stack">
      <p className="lead">Did someone ask for this, or is it imposed from outside?</p>
      <Hidden state={state} />
      <div className="choices">
        {REQUEST_MODES.map((m) => (
          <label key={m} className="choice">
            <input type="radio" name="mode" value={m} defaultChecked={suggested === m} required />
            <span>
              {MODE_LABELS[m]}{" "}
              <span className="muted small">
                {m === "request" ? "· a stakeholder wants something" : "· a regulation or legal document, with duties to meet"}
              </span>
            </span>
          </label>
        ))}
      </div>
      <div>
        <button className="primary">Save</button>
      </div>
    </form>
  );
}

const STEP_QUESTIONS: Partial<Record<IntakeStep, { question: string; hint: string }>> = {
  symptom: { question: "What is being observed?", hint: "The symptom: what people see happening, not why." },
  cause: { question: "Why might it be happening?", hint: "A hypothesis. It stays one until evidence supports it." },
  evidence: { question: "What supports that?", hint: "Data, a sample, a report. Optional for now." },
  solution: { question: "What solution was asked for?", hint: "Recorded as asked. It is not assumed to be right." },
  measure: { question: "How will success be measured?", hint: "A measure, and today's value if anyone knows it. Optional." },
};

function IntakeCard({ state }: { state: RequestState }) {
  const step = state.intakeStep;
  const { model } = state;
  const regulation = mandateRegulation({ tagged: state.request.tagged, model });
  if (!step) {
    const recorded = state.ops.filter(
      (o) => o.kind === "add_node" && ["Symptom", "CauseHypothesis", "Evidence", "ProposedSolution", "SuccessMeasure", "Obligation"].includes(o.payload.nodeType),
    );
    return (
      <div className="stack">
        <p className="lead">Intake is done.</p>
        <ul className="items">
          {state.request.sponsorId && <li>Sponsor: {model.nodes.find((n) => n.id === state.request.sponsorId)?.name}</li>}
          {regulation && <li>Regulation: {model.nodes.find((n) => n.id === regulation)?.name}</li>}
          {recorded.map((o) => (
            <li key={o.id}>{opText(model, o).replace(/^Add /, "")}</li>
          ))}
        </ul>
      </div>
    );
  }
  const keys = (
    <>
      <Hidden state={state} />
      <input type="hidden" name="step" value={step} />
    </>
  );

  if (step === "regulation") {
    const regulations = model.nodes.filter((n) => n.type === "Regulation").sort((a, b) => a.name.localeCompare(b.name));
    return (
      <div className="stack">
        <p className="question">Which regulation is this about?</p>
        <ul className="items">
          {regulations.map((r) => (
            <li key={r.id}>
              <span>{r.name}</span>
              <form action={chooseRegulation}>
                <Hidden state={state} />
                <input type="hidden" name="nodeId" value={r.id} />
                <button className="link">Choose</button>
              </form>
            </li>
          ))}
        </ul>
        <details className="add">
          <summary>It is not in the model</summary>
          <form action={newRegulation} className="inline">
            <Hidden state={state} />
            <input name="name" placeholder="Name of the regulation" required aria-label="Name" />
            <button>Add</button>
          </form>
        </details>
      </div>
    );
  }

  if (step === "obligations") {
    const duties = regulation ? obligationsOf(model, regulation) : [];
    return (
      <div className="stack">
        <p className="question">What duties does it impose?</p>
        <p className="muted small">One at a time, in plain words. Each becomes an obligation the request has to meet.</p>
        {duties.length > 0 && (
          <ul className="items">
            {duties.map((d) => (
              <li key={d}>
                <span>
                  {model.nodes.find((n) => n.id === d)?.name}
                  {model.nodes.find((n) => n.id === d)?.pending && <span className="badge">new</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form action={newObligation} className="inline">
          <Hidden state={state} />
          <input name="name" placeholder="A duty, e.g. Offer income replacement as optional" required aria-label="Duty" />
          <button>Add</button>
        </form>
        {duties.length > 0 && (
          <form action={intakeSkip}>
            {keys}
            <button className="primary">That is all of them</button>
          </form>
        )}
      </div>
    );
  }

  if (step === "sponsor") {
    const roles = model.nodes.filter((n) => n.type === "Role").sort((a, b) => a.name.localeCompare(b.name));
    return (
      <form action={chooseSponsor} className="stack">
        <p className="question">Who is the sponsor?</p>
        <p className="muted small">The person who owns the outcome and decides when it is good enough.</p>
        <Hidden state={state} />
        <div className="choices">
          {roles.map((r) => (
            <label key={r.id} className="choice">
              <input type="radio" name="sponsorId" value={r.id} required />
              {r.name}
            </label>
          ))}
        </div>
        <div>
          <button className="primary">Save</button>
        </div>
      </form>
    );
  }

  const q = STEP_QUESTIONS[step]!;
  const optional = step === "evidence" || step === "measure";
  return (
    <div className="stack">
      <p className="question">{q.question}</p>
      <p className="muted small">{q.hint}</p>
      <form action={intakeText} className="stack">
        {keys}
        <textarea name="text" rows={2} required aria-label={q.question} />
        {step === "measure" && <input name="baseline" placeholder="Today's value, if known" aria-label="Baseline" />}
        <div>
          <button className="primary">Save</button>
        </div>
      </form>
      {optional && (
        <form action={intakeSkip}>
          {keys}
          <button className="link">Skip for now</button>
        </form>
      )}
    </div>
  );
}

function PriorCard({ state }: { state: RequestState }) {
  const { model } = state;
  if (state.request.tagged.length === 0) return <p className="muted">Tag what the request touches first. Prior work is found from there.</p>;
  if (state.priorRequests.length === 0 && state.priorNodes.length === 0) {
    return <p className="lead">Nothing earlier touches what this request affects.</p>;
  }
  return (
    <div className="stack">
      {state.priorRequests.length > 0 && (
        <div>
          <h3>Earlier requests</h3>
          <ul className="items why">
            {state.priorRequests.map((r) => (
              <li key={r.id}>
                <Link href={`/requests/${r.id}`}>{r.title}</Link>
                <span className="muted small">
                  {r.status === "signed_off" ? "Signed off" : "Open"} · also touched {r.shared.map((id) => model.nodes.find((n) => n.id === id)?.name).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state.priorNodes.length > 0 && (
        <div>
          <h3>Already in the model</h3>
          <ul className="items">
            {state.priorNodes.map((id) => {
              const n = model.nodes.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <span>
                    {n.name} <span className="muted">· {typeLabel(n.type)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
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
  const affected = state.affected.filter((a) => !request.tagged.includes(a.id));
  const byLayer = LAYERS.map((layer) => ({ layer, items: affected.filter((a) => byId.get(a.id)?.layer === layer) })).filter(
    (g) => g.items.length > 0,
  );
  const open = isOpen(state);

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
          {!isOpen(state)
            ? "This request is signed off."
            : state.moreQuestions
              ? `That is ${state.questionLimit} questions. There are more to ask.`
              : state.request.tagged.length === 0
                ? "Tag what the request touches first. The questions come from what is missing there."
                : "Nothing is missing on what this request touches."}
        </p>
        {state.moreQuestions && (
          <form action={askMoreQuestions}>
            <Hidden state={state} />
            <button className="primary">Ask {MAX_QUESTIONS} more</button>
          </form>
        )}
        {done > 0 && <p className="muted">{done} answered. The changes they made are under Pending changes.</p>}
      </div>
    );
  }
  const node = model.nodes.find((n) => n.id === next.nodeId)!;
  const keys = (
    <>
      <Hidden state={state} />
      <input type="hidden" name="ruleId" value={next.rule.id} />
      <input type="hidden" name="nodeId" value={next.nodeId} />
    </>
  );
  const unknown = (
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
  );
  const header = (
    <>
      <p className="muted small">
        Question {done + 1}, up to {state.questionLimit} in this round. Asked because “{node.name}” has nothing recorded for this yet.
      </p>
      <p className="question">{next.question}</p>
    </>
  );

  if (next.rule.kind === "attribute") {
    return (
      <div className="stack">
        {header}
        <form action={answerText} className="stack">
          {keys}
          <textarea name="value" rows={2} required aria-label={next.question} />
          <div>
            <button className="primary">Save answer</button>
          </div>
        </form>
        {unknown}
      </div>
    );
  }

  const rule = next.rule;
  const candidates = model.nodes.filter((n) => rule.answer.includes(n.type) && n.id !== node.id).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="stack">
      {header}
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
          {rule.answer.length > 1 ? (
            <select name="nodeType" aria-label="Type">
              {rule.answer.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="nodeType" value={rule.answer[0]} />
          )}
          <input name="name" placeholder="Name" required aria-label="Name" />
          <button>Add</button>
        </form>
      </details>
      {unknown}
    </div>
  );
}

function CoverageCard({ state }: { state: RequestState }) {
  const { model } = state;
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const pathOf = new Map(state.affected.map((a) => [a.id, a.path]));
  const total = state.coverage.length;
  if (total === 0) return <p className="muted">Tag what the request touches first. Coverage counts what it affects.</p>;
  const left = state.coverage.filter((i) => i.state === null).length;
  const next = state.nextCoverage;
  const decided = state.coverage.filter((i) => i.state !== null);
  return (
    <div className="stack">
      <p className="muted small">
        {left} of {total} left. Processes, systems, data, forms, products and rules are counted. Anything a pending change touches is already addressed.
      </p>
      {next && isOpen(state) && (
        <div className="stack">
          <p className="question">
            {byId.get(next.nodeId)!.name} <span className="muted small">· {typeLabel(byId.get(next.nodeId)!.type)}</span>
          </p>
          <p className="muted small">Why it is affected: {(pathOf.get(next.nodeId) ?? []).map((s) => stepText(model, s)).join(", then ") || "tagged"}</p>
          <form action={coverageVerdict} className="inline">
            <Hidden state={state} />
            <input type="hidden" name="nodeId" value={next.nodeId} />
            <input type="hidden" name="state" value="addressed" />
            <button className="primary">Addressed</button>
          </form>
          <details className="add">
            <summary>Not applicable</summary>
            <form action={coverageVerdict} className="inline">
              <Hidden state={state} />
              <input type="hidden" name="nodeId" value={next.nodeId} />
              <input type="hidden" name="state" value="not_applicable" />
              <input name="reason" placeholder="Why it does not apply" required aria-label="Reason" />
              <button>Save</button>
            </form>
          </details>
          <details className="add">
            <summary>Blocked</summary>
            <form action={coverageVerdict} className="inline">
              <Hidden state={state} />
              <input type="hidden" name="nodeId" value={next.nodeId} />
              <input type="hidden" name="state" value="blocked" />
              <input name="reason" placeholder="What it is waiting on" required aria-label="Waiting on" />
              <button>Save</button>
            </form>
          </details>
        </div>
      )}
      {!next && <p className="lead">Every counted item has a verdict.</p>}
      {decided.length > 0 && (
        <details className="add" open={!next}>
          <summary>Verdicts so far ({decided.length})</summary>
          <ul className="items">
            {decided.map((i) => (
              <li key={i.nodeId}>
                <span>
                  {byId.get(i.nodeId)?.name}{" "}
                  <span className="muted small">
                    · {i.state === "changed" ? "Changed by this request" : COVERAGE_LABELS[i.state as keyof typeof COVERAGE_LABELS]}
                    {i.reason && `: ${i.reason}`}
                  </span>
                </span>
                {isOpen(state) && i.state !== "changed" && (
                  <form action={coverageUndo}>
                    <Hidden state={state} />
                    <input type="hidden" name="nodeId" value={i.nodeId} />
                    <button className="link">Undo</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ChangesCard({ state }: { state: RequestState }) {
  const open = isOpen(state);
  if (state.ops.length === 0) return <p className="muted">No changes yet. Intake, new things and answers add them here.</p>;
  return (
    <div className="stack">
      <p className="lead">{open ? "This is what sign-off will write into the company model." : "Written into the company model at sign-off."}</p>
      <ul className="items">
        {state.ops.map((op) => (
          <li key={op.id}>
            <span>
              {opText(state.model, op)}
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
  if (!isOpen(state)) {
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
  const failing = state.gate.filter((c) => !c.pass);
  const n = state.ops.length;
  return (
    <div className="stack">
      <ul className="items gate">
        {state.gate.map((c) => (
          <li key={c.id} className={c.pass ? "pass" : "fail"}>
            <span>
              <span aria-hidden>{c.pass ? "✓" : "✗"}</span> {c.label}
            </span>
            {!c.pass && (
              <Link href={`?card=${c.card}`} className="small">
                Fix
              </Link>
            )}
          </li>
        ))}
      </ul>
      {failing.length > 0 ? (
        <p className="muted">Sign off unlocks when every check passes.</p>
      ) : (
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
      )}
    </div>
  );
}
