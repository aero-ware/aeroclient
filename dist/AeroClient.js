"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_utils_1 = __importDefault(require("@aeroware/discord-utils"));
const logger_1 = __importDefault(require("@aeroware/logger"));
const discord_parse_utils_1 = __importDefault(require("discord-parse-utils"));
const discord_js_1 = require("discord.js");
const keyv_1 = __importDefault(require("keyv"));
const ms_1 = __importDefault(require("ms"));
const defaults_1 = __importDefault(require("./client/defaults"));
const Loader_1 = __importDefault(require("./client/Loader"));
const middleware_1 = __importDefault(require("./client/middleware"));
/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
class AeroClient extends discord_js_1.Client {
    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    constructor(options, baseOptions) {
        super(baseOptions);
        /**
         * The commands that have been registered by AeroClient.
         */
        this.commands = new discord_js_1.Collection();
        /**
         * Object that stores locale-specific messages.
         */
        this.locales = {};
        /**
         * The default prefix for the bot. Used in DMs and in guilds where a custom prefix is not set.
         */
        this.defaultPrefix = "!";
        this.cooldowns = new discord_js_1.Collection();
        this.loader = new Loader_1.default(this);
        this.middlewares = middleware_1.default();
        this.clientOptions = options;
        this.init(options);
        this.logger = new logger_1.default(options.loggerHeader || "aeroclient", options.loggerShowFlags || false);
        this.prefixes = new keyv_1.default(options.connectionUri, {
            namespace: "prefixes",
        });
        if (options.persistentCooldowns)
            this.cooldownStore = new keyv_1.default(options.connectionUri, {
                namespace: "cooldowns",
            });
        this.localeStore = new keyv_1.default(options.connectionUri, { namespace: "locales" });
        this.disabledCommands = new keyv_1.default(options.connectionUri, { namespace: "disabled-commands" });
        if (options.useDefaults)
            defaults_1.default(this);
    }
    /**
     * Private async method to initiate the client and start it up.
     * @param options Options to customize the AeroClient.
     */
    init(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.commandsPath)
                yield this.loadCommands(options.commandsPath);
            if (options.eventsPath)
                yield this.loadEvents(options.eventsPath);
            if (options.messagesPath)
                yield this.loadMessages(options.messagesPath);
            if (options.languagesPath)
                yield this.loadLocales(options.languagesPath);
            this.once("ready", options.readyCallback || (() => this.logger.success("AeroClient is ready!")));
            this.on("message", this.clientOptions.customHandler ||
                ((message) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                    if (message.author.bot)
                        return;
                    const prefix = message.guild
                        ? (yield this.prefixes.get((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id)) || this.clientOptions.prefix || this.defaultPrefix
                        : this.clientOptions.prefix || this.defaultPrefix;
                    const args = message.content.slice(prefix.length).split(/\s+/g);
                    const commandName = args.shift();
                    const command = this.commands.get(commandName || "") || this.commands.find((cmd) => !!(cmd.aliases && cmd.aliases.includes(commandName || "")));
                    const shouldStop = yield this.middlewares.execute({
                        message,
                        args,
                        command,
                    });
                    if (shouldStop)
                        return;
                    if (!message.content.startsWith(prefix))
                        return;
                    if (!command)
                        return;
                    const guildDisabledCommands = ((yield this.disabledCommands.get(((_b = message.guild) === null || _b === void 0 ? void 0 : _b.id) || "")) || "").split(",");
                    if (command.guildOnly && !message.guild) {
                        if ((_c = this.clientOptions.responses) === null || _c === void 0 ? void 0 : _c.guild)
                            message.channel.send((_d = this.clientOptions.responses) === null || _d === void 0 ? void 0 : _d.guild);
                        return;
                    }
                    if (command.dmOnly && message.guild) {
                        if ((_e = this.clientOptions.responses) === null || _e === void 0 ? void 0 : _e.dm)
                            message.channel.send((_f = this.clientOptions.responses) === null || _f === void 0 ? void 0 : _f.dm);
                        return;
                    }
                    if (guildDisabledCommands.includes(command.name)) {
                        if ((_g = this.clientOptions.responses) === null || _g === void 0 ? void 0 : _g.disabled)
                            message.channel.send((_h = this.clientOptions.responses) === null || _h === void 0 ? void 0 : _h.disabled);
                        return;
                    }
                    if (command.staffOnly && this.clientOptions.staff && this.clientOptions.staff.includes(message.author.id)) {
                        if ((_j = this.clientOptions.responses) === null || _j === void 0 ? void 0 : _j.staff)
                            message.channel.send((_k = this.clientOptions.responses) === null || _k === void 0 ? void 0 : _k.staff);
                        return;
                    }
                    let hasPermission = true;
                    if (message.guild && command.permissions)
                        for (const perm of command.permissions)
                            if (!message.member.hasPermission(perm)) {
                                hasPermission = false;
                                break;
                            }
                    if (!hasPermission)
                        return message.channel.send((((_l = this.clientOptions.responses) === null || _l === void 0 ? void 0 : _l.perms) ? this.clientOptions.responses.perms
                            : `You need to have \`$PERMS\` to run this command.`).replace("$PERMS", `\`${command.permissions.map((p) => discord_parse_utils_1.default.case(p)).join(", ")}\``));
                    if (command.nsfw && message.channel.type !== "dm" && !message.channel.nsfw) {
                        if ((_m = this.clientOptions.responses) === null || _m === void 0 ? void 0 : _m.nsfw)
                            message.channel.send((_o = this.clientOptions.responses) === null || _o === void 0 ? void 0 : _o.nsfw);
                        return;
                    }
                    if ((command.args && !args.length) ||
                        (command.minArgs && command.minArgs > args.length) ||
                        (command.maxArgs && command.maxArgs < args.length)) {
                        return message.channel.send(((_q = (_p = this.clientOptions.responses) === null || _p === void 0 ? void 0 : _p.usage) === null || _q === void 0 ? void 0 : _q.replace("$COMMAND", command.name).replace("$PREFIX", prefix).replace("$USAGE", command.usage || "")) ||
                            `The usage of \`${command.name}\` is \`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ""}\`.`);
                    }
                    if (!this.cooldowns.has(command.name)) {
                        this.cooldowns.set(command.name, new discord_js_1.Collection());
                        if (this.cooldownStore) {
                            const cooldownObj = JSON.parse((yield this.cooldownStore.get(command.name)) || "{}");
                            cooldownObj[message.author.id] = 0;
                            yield this.cooldownStore.set(command.name, JSON.stringify(cooldownObj));
                        }
                    }
                    const now = Date.now();
                    let timestamps = this.cooldownStore ? JSON.parse((yield this.cooldownStore.get(command.name)) || "{}") : this.cooldowns.get(command.name);
                    const cooldownAmount = (command.cooldown || 0) * 1000;
                    if (!(timestamps instanceof discord_js_1.Collection)) {
                        const tCollection = new discord_js_1.Collection();
                        for (const k in timestamps)
                            tCollection.set(k, timestamps[k]);
                        timestamps = tCollection;
                    }
                    if (timestamps.has(message.author.id)) {
                        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                        if (now < expirationTime) {
                            const timeLeft = expirationTime - now;
                            const msTime = ms_1.default(Math.round(timeLeft), {
                                long: true,
                            });
                            const formattedTime = msTime.endsWith("ms") ? `${(timeLeft / 1000).toFixed(1)} seconds` : msTime;
                            return message.channel.send(this.clientOptions.responses && this.clientOptions.responses.cooldown
                                ? this.clientOptions.responses.cooldown.replace("$TIME", formattedTime).replace("$COMMAND", command.name)
                                : `Please wait ${formattedTime} before reusing the \`${command.name}\` command.`);
                        }
                    }
                    try {
                        if ((yield command.callback({
                            message,
                            args,
                            client: this,
                            text: message.content,
                            locale: (yield this.localeStore.get(message.author.id)) || "en",
                        })) !== "invalid") {
                            timestamps.set(message.author.id, now);
                            if (this.cooldownStore) {
                                const cooldownObj = JSON.parse((yield this.cooldownStore.get(command.name)) || "{}");
                                cooldownObj[message.author.id] = now;
                                yield this.cooldownStore.set(command.name, JSON.stringify(cooldownObj));
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                        if (this.clientOptions.responses && this.clientOptions.responses.error)
                            message.channel.send(this.clientOptions.responses.error);
                    }
                    return;
                })));
            yield this.login(options.token);
        });
    }
    /**
     * Adds a middleware into the client's middleware stack.
     * @param middleware the middleware function to execute
     */
    use(middleware) {
        this.middlewares.use(middleware);
        this.emit("middlewareAdd");
        return this;
    }
    /**
     * Creates a pagination with embeds and controlled by reactions.
     * @param message the message that requested this pagination
     * @param pages an array of embeds that will be shown to the user as a pagination
     * @param options options for the pagination.
     * @see https://npmjs.com/package/@aeroware/discord-utils
     */
    paginate(message, pages, options) {
        discord_utils_1.default.paginate(message, pages, options);
        return this;
    }
    /**
     * Loads commands from the specified directory.
     * Note: To register an indiviudal command, use `registerCommand(command: Command)`
     * @param directory the directory to load commands from
     */
    loadCommands(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.loadCommands(directory);
            this.emit("commandsLoaded");
            return this;
        });
    }
    /**
     * Loads events from the specified directory.
     * @param directory the directory to load events from
     */
    loadEvents(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.loadEvents(directory);
            this.emit("eventsLoaded");
            return this;
        });
    }
    /**
     * Loads messages from the specified directory.
     * @param directory the directory to load messages from
     */
    loadMessages(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.loadMessages(directory);
            this.emit("messagesLoaded");
            return this;
        });
    }
    /**
     * Loads language JSONs from the specified directory.
     * @param dir the directory to load languages from
     */
    loadLocales(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.loadLocales(dir);
            this.emit("localesLoaded");
            return this;
        });
    }
    /**
     * Registers a command.
     * Note; To register a folder of commands, use `loadCommands(directory: string)`
     * @param command the command to register
     */
    registerCommand(command) {
        this.commands.set(command.name, command);
        return this;
    }
}
exports.default = AeroClient;
