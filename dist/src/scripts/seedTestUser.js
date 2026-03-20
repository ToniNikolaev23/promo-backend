"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_js_1 = require("../db.js");
const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "password";
const run = async () => {
    const existing = await (0, db_js_1.sql) `
    SELECT id FROM users WHERE email = ${TEST_EMAIL} LIMIT 1
  `;
    if (existing.length > 0) {
        console.log("Test user already exists.");
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(TEST_PASSWORD, 10);
    await (0, db_js_1.sql) `
    INSERT INTO users (email, password_hash)
    VALUES (${TEST_EMAIL}, ${passwordHash})
  `;
    console.log("Test user created: test@test.com / password");
};
run().catch((error) => {
    console.error("Failed to seed test user:", error);
    process.exit(1);
});
