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

With no `DATABASE_URL`, the db commands use PGlite (Postgres in-process) stored in `./.pglite`. With `DATABASE_URL` set they run against that database. Vercel runs migrations before every build (`vercel-build`).

## How the model works

- `src/model/taxonomy.ts` is the node and edge taxonomy from spec section 4. The database CHECK constraints come from it.
- Every change is an event. `commit()` in `src/model/log.ts` appends events and projects them in one transaction. The `events` table rejects UPDATE, DELETE and TRUNCATE.
- `nodes`, `edges`, `documents` and `document_blocks` are projections. `replay()` rebuilds them from the log.
- `src/model/apply.ts` is the only code that writes the projections, and it validates edge endpoints against the taxonomy.
- Documents are ordered blocks. A `node` block points at a node, such as a Requirement, and holds no text of its own.
