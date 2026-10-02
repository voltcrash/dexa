import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { DATABASE_URL } from "$app/env/private";
import * as schema from "./schema.js";

export type Database = ReturnType<typeof createDb>;

function createDb(connectionString: string) {
  // The WebSocket pool (unlike neon-http) supports the transactions Better Auth relies on.
  return drizzle({ client: new Pool({ connectionString }), schema });
}

let db: Database | undefined;

export function isDatabaseConfigured(): boolean {
  return Boolean(DATABASE_URL);
}

export function getDb(): Database {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.",
    );
  }
  db ??= createDb(DATABASE_URL);
  return db;
}
