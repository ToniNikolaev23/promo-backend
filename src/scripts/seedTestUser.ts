import bcrypt from "bcryptjs";
import { sql } from "../db.js";

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "password";

const run = async (): Promise<void> => {
  const existing = await sql`
    SELECT id FROM users WHERE email = ${TEST_EMAIL} LIMIT 1
  `;

  if (existing.length > 0) {
    console.log("Test user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${TEST_EMAIL}, ${passwordHash})
  `;

  console.log("Test user created: test@test.com / password");
};

run().catch((error: unknown) => {
  console.error("Failed to seed test user:", error);
  process.exit(1);
});
