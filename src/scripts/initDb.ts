import { sql } from "drizzle-orm";
import { client, db } from "../db.js";

const run = async (): Promise<void> => {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS jwt_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      jti TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_jwt_tokens_user_id ON jwt_tokens(user_id);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_jwt_tokens_expires_at ON jwt_tokens(expires_at);
  `);

  console.log("Database initialized successfully.");
};

run()
  .catch((error: unknown) => {
    console.error("Failed to initialize database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
