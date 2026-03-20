"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtTokens = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull()
});
exports.jwtTokens = (0, pg_core_1.pgTable)("jwt_tokens", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    jti: (0, pg_core_1.text)("jti").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
    (0, pg_core_1.uniqueIndex)("jwt_tokens_jti_unique").on(table.jti),
    (0, pg_core_1.index)("idx_jwt_tokens_user_id").on(table.userId),
    (0, pg_core_1.index)("idx_jwt_tokens_expires_at").on(table.expiresAt)
]);
