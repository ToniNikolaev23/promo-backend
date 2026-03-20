import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import * as schema from "./schema.js";

const isLocal =
  config.databaseUrl.includes("@localhost:") ||
  config.databaseUrl.includes("@127.0.0.1:");

export const client = postgres(config.databaseUrl, {
  ssl: isLocal ? false : "require"
});

export const db = drizzle(client, { schema });
