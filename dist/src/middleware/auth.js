"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const db_js_1 = require("../db.js");
const getBearerToken = (headerValue) => {
    if (!headerValue) {
        return null;
    }
    const [scheme, token] = headerValue.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }
    return token;
};
const requireAuth = async (req, res, next) => {
    const token = getBearerToken(req.header("authorization"));
    if (!token) {
        res.status(401).json({ error: "Missing or invalid Authorization header." });
        return;
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, config_js_1.config.jwtSecret);
    }
    catch {
        res.status(401).json({ error: "Invalid token." });
        return;
    }
    if (!payload.sub || !payload.email || !payload.jti) {
        res.status(401).json({ error: "Invalid token payload." });
        return;
    }
    const tokenRows = await (0, db_js_1.sql) `
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
exports.requireAuth = requireAuth;
