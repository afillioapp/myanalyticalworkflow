import { count } from "drizzle-orm";
import { connect, type Connection } from "@/db/client";
import { events } from "@/db/schema";

export const dynamic = "force-dynamic";

let connection: Promise<Connection> | undefined;

// Proves the deploy can reach the database and the migrations ran.
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: true, database: "not configured" });
  }
  try {
    connection ??= connect(process.env.DATABASE_URL);
    const { db } = await connection;
    const [row] = await db.select({ events: count() }).from(events);
    return Response.json({ ok: true, database: "connected", events: row.events });
  } catch (error) {
    connection = undefined;
    return Response.json({ ok: false, database: "error", message: (error as Error).message }, { status: 503 });
  }
}
