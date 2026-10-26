// npm run db:migrate | db:reset | db:seed
// Uses DATABASE_URL when set, otherwise the local PGlite folder ./.pglite.
import { connect, resetSchema } from "@/db/client";
import { loadSeed } from "@/model/seed";

const command = process.argv[2];

// On Vercel before a database is attached there is nothing to migrate.
if (process.env.VERCEL && !process.env.DATABASE_URL) {
  console.log(`db ${command}: skipped, DATABASE_URL not set`);
  process.exit(0);
}

const conn = await connect();
try {
  if (command === "migrate") {
    await conn.migrate();
  } else if (command === "reset") {
    await resetSchema(conn);
  } else if (command === "seed") {
    await resetSchema(conn);
    await loadSeed(conn.db);
  } else {
    throw new Error(`unknown command: ${command}`);
  }
  console.log(`db ${command}: done`);
} finally {
  await conn.close();
}
