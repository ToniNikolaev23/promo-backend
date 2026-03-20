"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const db_js_1 = require("../db.js");
const schema_js_1 = require("../schema.js");
const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "password";
const run = async () => {
    const existing = await db_js_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_js_1.users.email, TEST_EMAIL)
    });
    if (existing) {
        console.log("Test user already exists.");
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(TEST_PASSWORD, 10);
    await db_js_1.db.insert(schema_js_1.users).values({
        email: TEST_EMAIL,
        passwordHash
    });
    console.log("Test user created: test@test.com / password");
};
run()
    .catch((error) => {
    console.error("Failed to seed test user:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_js_1.client.end();
});
