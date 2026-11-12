// One database connection for the running app. With DATABASE_URL it is Neon (production).
// Without it, a local PGlite folder, migrated on first use so `npm run dev` just works.

import { connect, type Connection, type Db } from "./client";

let connection: Promise<Connection> | undefined;

export async function getDb(): Promise<Db> {
  connection ??= (async () => {
    const conn = await connect(process.env.DATABASE_URL ?? "./.pglite");
    if (!process.env.DATABASE_URL) await conn.migrate();
    return conn;
  })();
  try {
    return (await connection).db;
  } catch (error) {
    connection = undefined;
    throw error;
  }
}
