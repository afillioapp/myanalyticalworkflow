# BSA Tool: product

The app. Planning lives one level up: `../roadmap.md`, `../bsa-tool-design-spec.md`, `../rules/rules.md`.

## Commands

| Command | Does |
|---|---|
| `npm test` | P0 acceptance tests, on an in-memory Postgres |
| `npm run db:reset` | Drop the whole schema and rebuild it from migrations |
| `npm run db:seed` | Reset, then load `seed/company-model.ts` |
| `npm run db:generate` | Write a migration after changing `src/db/schema.ts` or `src/model/taxonomy.ts` |
| `npm run dev` | Local app on http://localhost:3000 |
| `npm run p1 -- <step>` | P1 extraction spike: start, next, assemble, next-review, decide, report, load. See `P1-RUNBOOK.md`. Built and tested, not yet run (2026-11-11) |

With no `DATABASE_URL`, the db commands use PGlite (Postgres in-process) stored in `./.pglite`. With `DATABASE_URL` set they run against that database. Vercel runs migrations before every build (`vercel-build`).

## The graph view (P2)

`/` draws the model read-only: one lane per department, flow left to right, same picture every time. Click a node to dim everything not connected to it. Double-click a lane or a process to open it. Search finds any node and opens what it is inside. `/?open=all` opens everything.

- `src/graph/lanes.ts`: which lane each node sits in, derived from edges. No owner means the Unassigned lane.
- `src/graph/view.ts`: what is visible for a set of toggles, folding, handoff edges, select-and-dim.
- `src/graph/layout.ts`: ELK decides left-to-right position, lanes decide the vertical band.
- `src/components/GraphView.tsx`: the React Flow page.

With `DATABASE_URL` set it reads the seed tenant from the database. If that is empty, or there is no database, it draws `seed/company-model.ts` and labels the page "Sample model".

## How the model works

- `src/model/taxonomy.ts` is the node and edge taxonomy from spec section 4. The database CHECK constraints come from it.
- Every change is an event. `commit()` in `src/model/log.ts` appends events and projects them in one transaction. The `events` table rejects UPDATE, DELETE and TRUNCATE.
- `nodes`, `edges`, `documents` and `document_blocks` are projections. `replay()` rebuilds them from the log.
- `src/model/apply.ts` is the only code that writes the projections, and it validates edge endpoints against the taxonomy.
- Documents are ordered blocks. A `node` block points at a node, such as a Requirement, and holds no text of its own.
