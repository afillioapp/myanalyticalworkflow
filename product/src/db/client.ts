import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type Executor = Db | Tx;

export interface Connection {
  db: Db;
  migrate(): Promise<void>;
  close(): Promise<void>;
}

const MIGRATIONS = "drizzle";

// DATABASE_URL set: real Postgres (Neon on Vercel). Otherwise PGlite, an embedded
// Postgres: a folder on disk for local work, or "memory://" for tests.
export async function connect(target = process.env.DATABASE_URL ?? "./.pglite"): Promise<Connection> {
  if (/^postgres(ql)?:\/\//.test(target)) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: target });
    const db = drizzle(pool, { schema });
    return {
      db: db as unknown as Db,
      migrate: () => migrate(db, { migrationsFolder: MIGRATIONS }),
      close: () => pool.end(),
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(target);
  const db = drizzle(client, { schema });
  return {
    db: db as unknown as Db,
    migrate: () => migrate(db, { migrationsFolder: MIGRATIONS }),
    close: () => client.close(),
  };
}

// Drop everything, including drizzle's migration journal, then rebuild from migrations.
export async function resetSchema(conn: Connection): Promise<void> {
  await conn.db.execute(sql`drop schema if exists drizzle cascade`);
  await conn.db.execute(sql`drop schema if exists public cascade`);
  await conn.db.execute(sql`create schema public`);
  await conn.migrate();
}
