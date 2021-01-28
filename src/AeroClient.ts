import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import parse from "discord-parse-utils";
import { Client, ClientOptions, Collection, Message, MessageEmbed } from "discord.js";
import Keyv from "keyv";
import ms from "ms";
import registerDefaults from "./client/defaults";
import Loader from "./client/Loader";
import Pipeline, { Middleware } from "./client/middleware";
import { AeroClientOptions, Command, Locales, MiddlewareContext } from "./types";

/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
export default class AeroClient extends Client {
    /**
     * The commands that have been registered by AeroClient.
     */
    public commands = new Collection<string, Command>();
    /**
     * The logger used to log events.
     * @see https://npmjs.com/package/@aeroware/logger.
     */
    public logger: Logger;
    /**
     * The collection of guild prefixes saved by guild ID.
     */
    public prefixes: Keyv<string>;
    /**
     * The options that were passed to the client via the constructor.
     */
    public clientOptions: AeroClientOptions;
    /**
     * The keyv collection that matches user IDs to their preferred language.
     */
    public localeStore: Keyv<string>;
    /**
     * Object that stores locale-specific messages.
     */
    public locales: {
        [locale in Locales]?: {
            [key: string]: string;
        };
    } = {};
    /**
     * The keyv collection that stores what commands are disabled in a guild.
     */
    public disabledCommands: Keyv<string>;
    /**
     * The default prefix for the bot. Used in DMs and in guilds where a custom prefix is not set.
     */
    public readonly defaultPrefix = "!";
    private cooldowns = new Collection<string, Collection<string, number>>();
    private cooldownStore?: Keyv<string>;
    private loader = new Loader(this);
    private middlewares = Pipeline<MiddlewareContext>();

    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    public constructor(options: AeroClientOptions, baseOptions?: ClientOptions) {
        super(baseOptions);

        this.clientOptions = options;

        this.init(options);

        this.logger = new Logger(options.loggerHeader || "aeroclient", options.loggerShowFlags || false);

        this.prefixes = new Keyv<string>(options.connectionUri, {
            namespace: "prefixes",
        });

        if (options.persistentCooldowns)
            this.cooldownStore = new Keyv<string>(options.connectionUri, {
                namespace: "cooldowns",
            });

        this.localeStore = new Keyv<string>(options.connectionUri, { namespace: "locales" });

        this.disabledCommands = new Keyv<string>(options.connectionUri, { namespace: "disabled-commands" });

        if (options.useDefaults) registerDefaults(this);
    }

    /**
     * Private async method to initiate the client and start it up.
     * @param options Options to customize the AeroClient.
     */
    private async init(options: AeroClientOptions) {
        if (options.commandsPath) await this.loadCommands(options.commandsPath);
        if (options.eventsPath) await this.loadEvents(options.eventsPath);
        if (options.messagesPath) await this.loadMessages(options.messagesPath);
        if (options.languagesPath) await this.loadLocales(options.languagesPath);

        this.once("ready", options.readyCallback || (() => this.logger.success("AeroClient is ready!")));

        this.on(
            "message",
            this.clientOptions.customHandler ||
                (async (message) => {
                    if (message.author.bot) return;

                    const prefix = message.guild
                        ? (await this.prefixes.get(message.guild?.id)) || this.clientOptions.prefix || this.defaultPrefix
                        : this.clientOptions.prefix || this.defaultPrefix;

                    const args = message.content.slice(prefix.length).split(/\s+/g);

                    const commandName = args.shift();

                    const command = message.content.startsWith(prefix)
                        ? this.commands.get(commandName || "") || this.commands.find((cmd) => !!(cmd.aliases && cmd.aliases.includes(commandName || "")))
                        : undefined;

                    const shouldStop = await this.middlewares.execute({
                        message,
                        args,
                        command,
                    });

                    if (shouldStop) return;

                    if (!message.content.startsWith(prefix)) return;

                    if (!command) return;

                    const guildDisabledCommands = ((await this.disabledCommands.get(message.guild?.id || "")) || "").split(",");

                    if (command.guildOnly && !message.guild) {
                        if (this.clientOptions.responses?.guild) message.channel.send(this.clientOptions.responses?.guild);
                        return;
                    }

                    if (command.dmOnly && message.guild) {
                        if (this.clientOptions.responses?.dm) message.channel.send(this.clientOptions.responses?.dm);
                        return;
                    }

                    if (guildDisabledCommands.includes(command.name)) {
                        if (this.clientOptions.responses?.disabled) message.channel.send(this.clientOptions.responses?.disabled);
                        return;
                    }

                    if (command.staffOnly && this.clientOptions.staff && !this.clientOptions.staff.includes(message.author.id)) {
                        if (this.clientOptions.responses?.staff) message.channel.send(this.clientOptions.responses?.staff);
                        return;
                    }

                    let hasPermission = true;

                    if (message.guild && command.permissions)
                        for (const perm of command.permissions)
                            if (!message.member!.hasPermission(perm)) {
                                hasPermission = false;
                                break;
                            }

                    if (!hasPermission)
                        return message.channel.send(
                            (this.clientOptions.responses?.perms
                                ? this.clientOptions.responses.perms
                                : `You need to have \`$PERMS\` to run this command.`
                            ).replace(/\$PERMS/g, `\`${command.permissions!.map((p) => parse.case(p)).join(", ")}\``)
                        );

                    if (command.nsfw && message.channel.type !== "dm" && !message.channel.nsfw) {
                        if (this.clientOptions.responses?.nsfw) message.channel.send(this.clientOptions.responses?.nsfw);
                        return;
                    }

                    if (
                        (command.args && !args.length) ||
                        (command.minArgs && command.minArgs > args.length) ||
                        (command.maxArgs && command.maxArgs < args.length)
                    ) {
                        return message.channel.send(
                            this.clientOptions.responses?.usage
                                ?.replace(/\$COMMAND/g, command.name)
                                .replace(/\$PREFIX/g, prefix)
                                .replace(/\$USAGE/g, command.usage || "") ||
                                `The usage of \`${command.name}\` is \`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ""}\`.`
                        );
                    }

                    if (!this.cooldowns.has(command.name)) {
                        this.cooldowns.set(command.name, new Collection());

                        if (this.cooldownStore) {
                            const cooldownObj = JSON.parse((await this.cooldownStore.get(command.name)) || "{}");

                            cooldownObj[message.author.id] = 0;

                            await this.cooldownStore.set(command.name, JSON.stringify(cooldownObj));
                        }
                    }

                    const now = Date.now();

                    let timestamps = this.cooldownStore ? JSON.parse((await this.cooldownStore.get(command.name)) || "{}") : this.cooldowns.get(command.name);

                    const cooldownAmount = (command.cooldown || 0) * 1000;

                    if (!(timestamps instanceof Collection)) {
                        const tCollection = new Collection<string, number>();
                        for (const k in timestamps) tCollection.set(k, timestamps[k]);
                        timestamps = tCollection;
                    }

                    if (timestamps.has(message.author.id)) {
                        const expirationTime = timestamps!.get(message.author.id)! + cooldownAmount;

                        if (now < expirationTime) {
                            const timeLeft = expirationTime - now;

                            const msTime = ms(Math.round(timeLeft), {
                                long: true,
                            });

                            const formattedTime = msTime.endsWith("ms") ? `${(timeLeft / 1000).toFixed(1)} seconds` : msTime;

                            return message.channel.send(
                                this.clientOptions.responses && this.clientOptions.responses.cooldown
                                    ? this.clientOptions.responses.cooldown.replace(/\$TIME/g, formattedTime).replace(/\$COMMAND/g, command.name)
                                    : `Please wait ${formattedTime} before reusing the \`${command.name}\` command.`
                            );
                        }
                    }

                    try {
                        if (
                            (await command.callback({
                                message,
                                args,
                                client: this,
                                text: message.content,
                                locale: (await this.localeStore.get(message.author.id)) || "en",
                            })) !== "invalid"
                        ) {
                            timestamps!.set(message.author.id, now);
                            if (this.cooldownStore) {
                                const cooldownObj = JSON.parse((await this.cooldownStore.get(command.name)) || "{}");

                                cooldownObj[message.author.id] = now;

                                await this.cooldownStore.set(command.name, JSON.stringify(cooldownObj));
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        if (this.clientOptions.responses && this.clientOptions.responses.error) message.channel.send(this.clientOptions.responses.error);
                    }

                    return;
                })
        );

        await this.login(options.token);
    }

    /**
     * Adds a middleware into the client's middleware stack.
     * @param middleware the middleware function to execute
     */
    public use(middleware: Middleware<MiddlewareContext>) {
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
    public paginate(message: Message, pages: MessageEmbed[], options: Parameters<typeof utils.paginate>[2]) {
        utils.paginate(message, pages, options);
        return this;
    }

    /**
     * Loads commands from the specified directory.
     * Note: To register an indiviudal command, use `registerCommand(command: Command)`
     * @param directory the directory to load commands from
     */
    public async loadCommands(directory: string) {
        await this.loader.loadCommands(directory);
        this.emit("commandsLoaded");
        return this;
    }

    /**
     * Loads events from the specified directory.
     * @param directory the directory to load events from
     */
    public async loadEvents(directory: string) {
        await this.loader.loadEvents(directory);
        this.emit("eventsLoaded");
        return this;
    }

    /**
     * Loads messages from the specified directory.
     * @param directory the directory to load messages from
     */
    public async loadMessages(directory: string) {
        await this.loader.loadMessages(directory);
        this.emit("messagesLoaded");
        return this;
    }

    /**
     * Loads language JSONs from the specified directory.
     * @param dir the directory to load languages from
     */
    public async loadLocales(dir: string) {
        await this.loader.loadLocales(dir);
        this.emit("localesLoaded");
        return this;
    }

    /**
     * Registers a command.
     * Note; To register a folder of commands, use `loadCommands(directory: string)`
     * @param command the command to register
     */
    public registerCommand(command: Command) {
        this.commands.set(command.name, command);
        return this;
    }
}
