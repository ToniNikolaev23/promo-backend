import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { sql } from "../db.js";
import type { AuthTokenPayload } from "../types.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
    jti: string;
  };
};

const getBearerToken = (headerValue?: string): string | null => {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = getBearerToken(req.header("authorization"));

  if (!token) {
    res.status(401).json({ error: "Missing or invalid Authorization header." });
    return;
  }

  let payload: AuthTokenPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
  } catch {
    res.status(401).json({ error: "Invalid token." });
    return;
  }

  if (!payload.sub || !payload.email || !payload.jti) {
    res.status(401).json({ error: "Invalid token payload." });
    return;
  }

  const tokenRows = await sql`
    SELECT user_id
    FROM jwt_tokens
    WHERE jti = ${payload.jti}
      AND user_id = ${payload.sub}
      AND expires_at > NOW()
    LIMIT 1
  `;

  if (tokenRows.length === 0) {
    res.status(401).json({ error: "Token revoked or expired." });
    return;
  }

  req.auth = {
    userId: payload.sub,
    email: payload.email,
    jti: payload.jti
  };

  next();
};
