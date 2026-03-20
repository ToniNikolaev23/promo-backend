"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const config_js_1 = require("./config.js");
const db_js_1 = require("./db.js");
const auth_js_1 = require("./middleware/auth.js");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
exports.app.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid payload." });
        return;
    }
    const { email, password } = parsed.data;
    const userRows = (await (0, db_js_1.sql) `
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `);
    if (userRows.length === 0) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
    }
    const user = userRows[0];
    const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
    }
    const jti = node_crypto_1.default.randomUUID();
    const token = jsonwebtoken_1.default.sign({
        sub: user.id,
        email: user.email,
        jti
    }, config_js_1.config.jwtSecret, { expiresIn: config_js_1.config.jwtExpiresIn });
    await (0, db_js_1.sql) `
    INSERT INTO jwt_tokens (user_id, jti, expires_at)
    VALUES (
      ${user.id},
      ${jti},
      NOW() + (${config_js_1.config.jwtExpiresIn}::text)::interval
    )
  `;
    res.json({
        token,
        user: {
            email: user.email
        }
    });
});
exports.app.post("/logout", auth_js_1.requireAuth, async (req, res) => {
    await (0, db_js_1.sql) `
    DELETE FROM jwt_tokens
    WHERE jti = ${req.auth?.jti}
      AND user_id = ${req.auth?.userId}
  `;
    res.json({ success: true });
});
exports.app.get("/me", auth_js_1.requireAuth, (req, res) => {
    res.json({
        user: {
            id: req.auth?.userId,
            email: req.auth?.email
        }
    });
});
