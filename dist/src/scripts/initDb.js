"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const db_js_1 = require("../db.js");
const run = async () => {
    await db_js_1.db.execute((0, drizzle_orm_1.sql) `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);
    await db_js_1.db.execute((0, drizzle_orm_1.sql) `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    await db_js_1.db.execute((0, drizzle_orm_1.sql) `
    CREATE TABLE IF NOT EXISTS jwt_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      jti TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    await db_js_1.db.execute((0, drizzle_orm_1.sql) `
    CREATE INDEX IF NOT EXISTS idx_jwt_tokens_user_id ON jwt_tokens(user_id);
  `);
    await db_js_1.db.execute((0, drizzle_orm_1.sql) `
    CREATE INDEX IF NOT EXISTS idx_jwt_tokens_expires_at ON jwt_tokens(expires_at);
  `);
    console.log("Database initialized successfully.");
};
run()
    .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_js_1.client.end();
});
