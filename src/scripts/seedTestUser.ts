import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { client, db } from "../db.js";
import { users } from "../schema.js";

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "password";

const run = async (): Promise<void> => {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, TEST_EMAIL)
  });

  if (existing) {
    console.log("Test user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  await db.insert(users).values({
    email: TEST_EMAIL,
    passwordHash
  });

  console.log("Test user created: test@test.com / password");
};

run()
  .catch((error: unknown) => {
    console.error("Failed to seed test user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
