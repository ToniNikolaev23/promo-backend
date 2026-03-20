import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import express from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { config } from "./config.js";
import { db } from "./db.js";
import { requireAuth, type AuthenticatedRequest } from "./middleware/auth.js";
import { jwtTokens, users } from "./schema.js";
import { computeExpiresAt } from "./utils/tokenExpiry.js";

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
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!user) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

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

  // Keep only one active token per user by replacing previous ones.
  await db.delete(jwtTokens).where(eq(jwtTokens.userId, user.id));

  await db.insert(jwtTokens).values({
    userId: user.id,
    jti,
    expiresAt: computeExpiresAt(config.jwtExpiresIn)
  });

  res.json({
    token,
    user: {
      email: user.email
    }
  });
});

app.post("/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
  const auth = req.auth;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  await db.delete(jwtTokens).where(eq(jwtTokens.userId, auth.userId));

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
