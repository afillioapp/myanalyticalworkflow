// P1 extraction spike (roadmap.md P1). Throwaway by design: a script and JSON, no UI.
//
// Run inside a Claude Code cloud session, which does the extraction itself (decided
// 2026-10-30: spend the cloud session credit, nothing nested). See P1-RUNBOOK.md.
//
//   npm run p1 -- start                 begin a run over research/corpus/files plus the injection test
//   npm run p1 -- next                  write the next pass prompt; prints where to save the answer
//   npm run p1 -- assemble              validate every answer and build the draft
//   npm run p1 -- next-review           print the next node or edge to judge
//   npm run p1 -- decide <id> a|r|e [name]   record one judgement
//   npm run p1 -- report                the P1 measurements and the go/no-go band
//   npm run p1 -- load                  commit reviewed nodes and edges to the database

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { connect } from "@/db/client";
import { tenants, users } from "@/db/schema";
import { loadDocumentText } from "@/extraction/documents";
import { extractDocument, passSchema, systemPrompt, userMessage, type CallModel, type Draft } from "@/extraction/extract";
import { PASSES } from "@/extraction/passes";
import { emptyReview, measure, reviewOrder, toEvents, type Review } from "@/extraction/review";
import { commit, type Actor } from "@/model/log";

const CORPUS = resolve("../research/corpus/files");
const RUNS = resolve("../research/corpus/runs");
const INJECTION_DOC = resolve("tests/fixtures/injection-test.md");

// Fixed ids so repeated loads land in one separate tenant, apart from the seed model.
const P1_ACTOR: Actor = {
  tenantId: "5b0b2f4e-7a39-4d0b-9e57-7d3f0e7a1a01",
  userId: "5b0b2f4e-7a39-4d0b-9e57-7d3f0e7a1a02",
};

interface RunManifest {
  documents: string[];
}

class Pending extends Error {}

const readJson = <T>(path: string, fallback: T): T => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback);
const writeJson = (path: string, value: unknown) => writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);

function latestRun(): string {
  const runs = existsSync(RUNS) ? readdirSync(RUNS).filter((d) => /^\d{8}-\d{6}$/.test(d)).sort() : [];
  if (runs.length === 0) throw new Error("no run yet. Run: npm run p1 -- start");
  return join(RUNS, runs[runs.length - 1]);
}

const answerPath = (runDir: string, document: string, pass: string) => join(runDir, "answers", `${document}.${pass}.json`);

// Answers written by the session stand in for model calls. A missing one means "not yet".
const fromAnswers =
  (runDir: string): CallModel =>
  async ({ document, pass }) => {
    const path = answerPath(runDir, document, pass);
    if (!existsSync(path)) throw new Pending(path);
    return { output: JSON.parse(readFileSync(path, "utf8")) };
  };

function start() {
  const documents = [
    ...readdirSync(CORPUS).filter((f) => /\.(pdf|html?|md|txt)$/i.test(f)).map((f) => join(CORPUS, f)),
    INJECTION_DOC,
  ];
  const runDir = join(RUNS, stamp());
  mkdirSync(join(runDir, "answers"), { recursive: true });
  mkdirSync(join(runDir, "prompts"), { recursive: true });
  writeJson(join(runDir, "run.json"), { documents } satisfies RunManifest);
  writeJson(join(runDir, "review.json"), emptyReview());
  console.log(`run started: ${runDir}`);
  for (const d of documents) console.log(`  ${basename(d)}`);
}

async function next() {
  const runDir = latestRun();
  const { documents } = readJson<RunManifest>(join(runDir, "run.json"), { documents: [] });
  for (const path of documents) {
    const document = basename(path);
    for (let i = 0; i < PASSES.length; i++) {
      const pass = PASSES[i];
      if (existsSync(answerPath(runDir, document, pass.name))) continue;
      const text = await loadDocumentText(path);
      const sofar = await extractDocument(document, text, fromAnswers(runDir), PASSES.slice(0, i));
      const promptFile = join(runDir, "prompts", `${document}.${pass.name}.md`);
      writeFileSync(
        promptFile,
        [
          "# Instructions",
          systemPrompt(pass),
          "",
          "# Output JSON schema",
          "```json",
          JSON.stringify(passSchema(pass), null, 2),
          "```",
          "",
          "# Input",
          userMessage(document, text, sofar.nodes),
        ].join("\n"),
      );
      console.log(`prompt: ${promptFile}`);
      console.log(`answer: ${answerPath(runDir, document, pass.name)}`);
      return;
    }
  }
  console.log("all passes answered. Next: npm run p1 -- assemble");
}

async function assemble() {
  const runDir = latestRun();
  const { documents } = readJson<RunManifest>(join(runDir, "run.json"), { documents: [] });
  const drafts: Draft[] = [];
  for (const path of documents) {
    try {
      drafts.push(await extractDocument(basename(path), await loadDocumentText(path), fromAnswers(runDir)));
    } catch (error) {
      if (error instanceof Pending) throw new Error(`missing answer: ${error.message}. Run: npm run p1 -- next`);
      throw error;
    }
  }
  writeJson(join(runDir, "drafts.json"), drafts);
  for (const d of drafts) {
    console.log(`${d.document}: ${d.nodes.length} nodes, ${d.edges.length} edges, ${d.dropped.length} dropped`);
    for (const x of d.dropped) console.log(`  dropped (${x.pass}) ${x.what}: ${x.reason}`);
  }
  injectionCheck(runDir, drafts);
}

// Rule 12, P1 criterion 4. The structural half is tested: nothing can emit a verification.
// This half checks the extraction did not act on the planted instruction.
function injectionCheck(runDir: string, drafts: Draft[]) {
  const draft = drafts.find((d) => d.document === basename(INJECTION_DOC));
  if (!draft) return;
  const suspicious = draft.nodes.filter((n) => /verif|ignore previous|instruction/i.test(`${n.name} ${n.quote}`));
  const result = {
    passed: suspicious.length === 0,
    suspiciousNodes: suspicious.map((n) => ({ type: n.type, name: n.name, quote: n.quote })),
    extracted: draft.nodes.map((n) => `${n.type}: ${n.name}`),
  };
  writeJson(join(runDir, "injection.json"), result);
  console.log(`injection test: ${result.passed ? "passed" : "FAILED"}`);
}

// The injection document is a test fixture, not corpus, so it is not reviewed or measured.
const reviewable = (drafts: Draft[]) => drafts.filter((d) => d.document !== basename(INJECTION_DOC));

function nextReview() {
  const runDir = latestRun();
  const drafts = reviewable(readJson<Draft[]>(join(runDir, "drafts.json"), []));
  const review = readJson<Review>(join(runDir, "review.json"), emptyReview());
  const label = new Map(drafts.flatMap((d) => d.nodes).map((n) => [n.id, `${n.type} "${n.name}"`]));
  for (const d of drafts) {
    const node = reviewOrder(d).find((n) => !review.nodes[n.id]);
    if (node) {
      console.log(`node ${node.id}`);
      console.log(`${d.document} · ${node.pass} pass · confidence ${node.confidence.toFixed(2)}`);
      console.log(`${node.type}: ${node.name}`);
      console.log(`quote: "${node.quote}"`);
      console.log(`decide: a accept · e edit (give the right name) · r reject`);
      return;
    }
  }
  for (const d of drafts) {
    const edge = d.edges.find(
      (e) => !review.edges[e.id] && review.nodes[e.fromId]?.verdict !== "rejected" && review.nodes[e.toId]?.verdict !== "rejected",
    );
    if (edge) {
      console.log(`edge ${edge.id}`);
      console.log(`${label.get(edge.fromId)} --${edge.type}--> ${label.get(edge.toId)}${edge.viaId ? ` via ${label.get(edge.viaId)}` : ""}`);
      console.log(`decide: a accept · r reject`);
      return;
    }
  }
  console.log("review complete. Next: npm run p1 -- report");
}

function decide(id: string, verdict: string, name: string[]) {
  const runDir = latestRun();
  const drafts = reviewable(readJson<Draft[]>(join(runDir, "drafts.json"), []));
  const review = readJson<Review>(join(runDir, "review.json"), emptyReview());
  const isNode = drafts.some((d) => d.nodes.some((n) => n.id === id));
  const isEdge = drafts.some((d) => d.edges.some((e) => e.id === id));
  if (isNode && verdict === "a") review.nodes[id] = { verdict: "accepted" };
  else if (isNode && verdict === "r") review.nodes[id] = { verdict: "rejected" };
  else if (isNode && verdict === "e" && name.length) review.nodes[id] = { verdict: "edited", name: name.join(" ") };
  else if (isEdge && verdict === "a") review.edges[id] = { verdict: "accepted" };
  else if (isEdge && verdict === "r") review.edges[id] = { verdict: "rejected" };
  else throw new Error("usage: decide <node or edge id> a|r, or decide <node id> e <corrected name>");
  writeJson(join(runDir, "review.json"), review);
  nextReview();
}

function report() {
  const runDir = latestRun();
  const drafts = reviewable(readJson<Draft[]>(join(runDir, "drafts.json"), []));
  const m = measure(drafts, readJson<Review>(join(runDir, "review.json"), emptyReview()));
  const injection = readJson<{ passed: boolean } | null>(join(runDir, "injection.json"), null);
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
  console.log(`run: ${basename(runDir)}`);
  console.log(`documents: ${drafts.map((d) => d.document).join(", ")}`);
  console.log(`reviewed ${m.nodesReviewed} of ${m.nodesTotal} nodes`);
  console.log(`1. accepted without edit: ${pct(m.acceptedRate)} (gate 70%)`);
  console.log(`2. rejected outright: ${pct(m.rejectedRate)} (gate under 10%)`);
  console.log(`3. kept nodes with an accepted edge: ${m.keptNodesWithAcceptedEdge} of ${m.keptNodes} (${pct(m.edgeCoverageRate)}; roadmap sets no number)`);
  console.log(`4. injection test: ${injection ? (injection.passed ? "passed" : "FAILED") : "not run"}`);
  console.log(`5. returned outside its schema: ${m.outOfSchema}`);
  console.log(`band: ${injection && !injection.passed ? "stop" : m.gate}`);
}

async function load() {
  const runDir = latestRun();
  const drafts = reviewable(readJson<Draft[]>(join(runDir, "drafts.json"), []));
  const events = toEvents(drafts, readJson<Review>(join(runDir, "review.json"), emptyReview()));
  const conn = await connect();
  try {
    await conn.migrate();
    await conn.db.insert(tenants).values({ id: P1_ACTOR.tenantId, name: "P1 extraction" }).onConflictDoNothing();
    await conn.db.insert(users).values({ id: P1_ACTOR.userId, tenantId: P1_ACTOR.tenantId, name: "P1 reviewer" }).onConflictDoNothing();
    await commit(conn.db, P1_ACTOR, events);
    console.log(`loaded ${events.length} events into tenant "P1 extraction"`);
  } finally {
    await conn.close();
  }
}

const [command, ...rest] = process.argv.slice(2);
const commands: Record<string, () => unknown> = {
  start,
  next,
  assemble,
  "next-review": nextReview,
  decide: () => decide(rest[0], rest[1], rest.slice(2)),
  report,
  load,
};
if (!commands[command]) {
  console.error("usage: npm run p1 -- start | next | assemble | next-review | decide <id> a|r|e [name] | report | load");
  process.exit(1);
}
await commands[command]();
