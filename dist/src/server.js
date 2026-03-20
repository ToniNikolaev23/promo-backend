"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const config_js_1 = require("./config.js");
app_js_1.app.listen(config_js_1.config.port, () => {
    console.log(`Server running on http://localhost:${config_js_1.config.port}`);
});
