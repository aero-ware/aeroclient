"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
class Loader {
    /**
     * Creates a Loder given a client.
     * @param client the client that called this loader
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Loads all commands in a folder, and subfolders.
     * @param path Directory to load.
     */
    loadCommands(path) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const directory = ((_a = require.main) === null || _a === void 0 ? void 0 : _a.path) ? `${require.main.path}/${path}` : path;
            const names = new Set();
            const traverse = (directory) => __awaiter(this, void 0, void 0, function* () {
                const commands = yield promises_1.readdir(directory);
                for (const command of commands) {
                    const filePath = path_1.join(directory, command);
                    if ((yield promises_1.stat(filePath)).isDirectory()) {
                        yield traverse(filePath);
                        continue;
                    }
                    const file = (yield Promise.resolve().then(() => __importStar(require(filePath)))).default;
                    if (typeof file === "function") {
                        file(this.client);
                        continue;
                    }
                    if (!file.name) {
                        if (this.client.clientOptions.logging)
                            this.client.logger.warn(`The command in the file '${command}' has no name`);
                        continue;
                    }
                    if (!file.callback) {
                        if (this.client.clientOptions.logging)
                            this.client.logger.warn(`The command in the file '${command}' has no callback`);
                        continue;
                    }
                    if (names.has(file.name)) {
                        if (this.client.clientOptions.logging)
                            this.client.logger.warn(`Found duplicate command '${file.name}'`);
                        continue;
                    }
                    this.client.commands.set(file.name, file);
                    if (this.client.clientOptions.logging)
                        this.client.logger.info(`Loaded the '${file.name}' command!`);
                }
            });
            yield traverse(directory);
        });
    }
    /**
     * Loads all events in a folder, and subfolders.
     * @param path Directory to load.
     */
    loadEvents(path) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const directory = ((_a = require.main) === null || _a === void 0 ? void 0 : _a.path) ? `${require.main.path}/${path}` : path;
            const names = new Set();
            const traverse = (directory) => __awaiter(this, void 0, void 0, function* () {
                const events = yield promises_1.readdir(directory);
                for (const event of events) {
                    const filePath = path_1.join(directory, event);
                    if ((yield promises_1.stat(filePath)).isDirectory()) {
                        yield traverse(filePath);
                        continue;
                    }
                    const file = (yield Promise.resolve().then(() => __importStar(require(filePath)))).default;
                    if (names.has(file.name)) {
                        if (this.client.clientOptions.logging)
                            this.client.logger.warn(`Found a duplicate event '${file.name}'`);
                        continue;
                    }
                    names.add(file.name);
                    this.client[file.once ? "once" : "on"](file.name, file.callback.bind(this));
                    if (this.client.clientOptions.logging)
                        this.client.logger.info(`Loaded the '${file.name}' event!`);
                }
            });
            yield traverse(directory);
        });
    }
    /**
     * Loads responses from a JSON file.
     * @param path Path to load the JSON (file extension must be included)
     */
    loadMessages(path) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const file = ((_a = require.main) === null || _a === void 0 ? void 0 : _a.path) ? `${require.main.path}/${path}` : path;
            const json = JSON.parse(yield promises_1.readFile(file, {
                encoding: "utf-8",
            }));
            ["cooldown", "error", "usage", "nsfw", "guild", "guarded", "dm", "staff"].forEach((flag) => {
                const key = `${flag.toUpperCase()}_RESPONSE`;
                if (json[key])
                    this.client.clientOptions.responses = Object.assign(Object.assign({}, this.client.clientOptions.responses), { [flag]: json[key] });
            });
        });
    }
    /**
     * Reads JSON files in the given directory to provide language support.
     * @param dir the directory to read the locale files from
     */
    loadLocales(dir) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${(_a = require.main) === null || _a === void 0 ? void 0 : _a.path}/${dir}`;
            const files = yield promises_1.readdir(path, {
                withFileTypes: true,
            });
            const locales = ["ar", "en", "fr", "zh", "de", "pt", "ru", "es"];
            files.forEach((f) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (f.isFile() && f.name.endsWith("json")) {
                        const name = f.name.slice(0, f.name.length - 5);
                        if (locales.includes(name))
                            this.client.locales[name] = JSON.parse(yield promises_1.readFile(`${path}/${f.name}`, {
                                encoding: "utf-8",
                            }));
                    }
                }
                catch (e) {
                    this.client.logger.error(`Could not load ${f}`);
                }
            }));
        });
    }
}
exports.default = Loader;
