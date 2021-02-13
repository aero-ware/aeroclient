"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * WORK IN PROGRESS
 */
class Sharder extends discord_js_1.ShardingManager {
    constructor(filePath, options) {
        var _a;
        const path = `${(_a = require.main) === null || _a === void 0 ? void 0 : _a.path}/${filePath}`;
        super(path, options);
    }
}
exports.default = Sharder;
