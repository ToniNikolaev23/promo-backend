import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import express from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { config } from "./config.js";
import { sql } from "./db.js";
import { requireAuth, type AuthenticatedRequest } from "./middleware/auth.js";
import type { UserRow } from "./types.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload." });
    return;
  }

  const { email, password } = parsed.data;
  const userRows = (await sql`
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `) as UserRow[];

  if (userRows.length === 0) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const user = userRows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      jti
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] }
  );

  await sql`
    INSERT INTO jwt_tokens (user_id, jti, expires_at)
    VALUES (
      ${user.id},
      ${jti},
      NOW() + (${config.jwtExpiresIn}::text)::interval
    )
  `;

  res.json({
    token,
    user: {
      email: user.email
    }
  });
});

app.post("/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
  await sql`
    DELETE FROM jwt_tokens
    WHERE jti = ${req.auth?.jti}
      AND user_id = ${req.auth?.userId}
  `;

  res.json({ success: true });
});

app.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: {
      id: req.auth?.userId,
      email: req.auth?.email
    }
  });
});
