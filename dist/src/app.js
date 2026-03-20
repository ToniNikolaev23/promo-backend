"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const config_js_1 = require("./config.js");
const db_js_1 = require("./db.js");
const auth_js_1 = require("./middleware/auth.js");
const schema_js_1 = require("./schema.js");
const tokenExpiry_js_1 = require("./utils/tokenExpiry.js");
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
    const user = await db_js_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_js_1.users.email, email)
    });
    if (!user) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
    }
    const validPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
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
    // Keep only one active token per user by replacing previous ones.
    await db_js_1.db.delete(schema_js_1.jwtTokens).where((0, drizzle_orm_1.eq)(schema_js_1.jwtTokens.userId, user.id));
    await db_js_1.db.insert(schema_js_1.jwtTokens).values({
        userId: user.id,
        jti,
        expiresAt: (0, tokenExpiry_js_1.computeExpiresAt)(config_js_1.config.jwtExpiresIn)
    });
    res.json({
        token,
        user: {
            email: user.email
        }
    });
});
exports.app.post("/logout", auth_js_1.requireAuth, async (req, res) => {
    const auth = req.auth;
    if (!auth) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }
    await db_js_1.db.delete(schema_js_1.jwtTokens).where((0, drizzle_orm_1.eq)(schema_js_1.jwtTokens.userId, auth.userId));
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
