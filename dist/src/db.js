"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
const serverless_1 = require("@neondatabase/serverless");
const config_js_1 = require("./config.js");
exports.sql = (0, serverless_1.neon)(config_js_1.config.databaseUrl);
