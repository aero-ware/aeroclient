import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import axios from "axios";
import parse from "discord-parse-utils";
import {
    Channel,
    Client,
    ClientOptions,
    Collection,
    Message,
    MessageEmbed,
    TextChannel,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import Keyv from "keyv";
import ms from "ms";
import { join } from "path";
import { DiscordInteractions, Interaction } from "slash-commands";
import registerDefaults from "./client/defaults";
import devOptions from "./client/dev";
import Loader from "./client/Loader";
import Pipeline, { Middleware } from "./client/middleware";
import {
    AeroClientOptions,
    Command,
    Locales,
    MiddlewareContext,
    SlashCommand,
} from "./types";

/**
 * The AeroClient extends the discord.js Client class to offer more features.
 *
 * If you are using config files, please use `AeroClient.create` instead of the constructor.
 * @class
 */
export default class AeroClient extends Client {
    /**
     * The commands that have been registered by AeroClient.
     */
    public commands = new Collection<string, Command>();
    /**
     * The slash commands that have been registered by AeroClient.
     */
    public interactions = new Collection<string, SlashCommand>();
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
    public defaultPrefix = "!";
    /**
     * Utility regex.
     */
    public regex = {
        user: /<@!?(\d{18})>/g,
        role: /<@&(\d{18})>/g,
        channel: /<@#(\d{18})>/g,
        imageAttachment: /\.(png|jpg|jpeg|webp)$/gi,
        inviteLink: /discord\.gg\//gi,
        giftLink: /discord\.gift\//gi,
        emoji: /:(\w+):/g,
        httpOrHttps: /https?:\/\//gi,
        boldText: /\*\*(.*)\*\*/g,
        italicText: /(?:\*(.*)\*)|(?:_(.*)_)/g,
        underlinedText: /__(.*)__/g,
        strikethroughText: /~~(.*)~~/g,
        codeblock: /```(\w+)(.*)```/gs,
        quote: /> +/,
    };
    /**
     * Literally axios
     */
    public http = axios;
    /**
     * AeroClient global namespace.
     */
    public global: {
        [prop: string]: any;
    } = {};

    /**
     * @private
     */
    private cooldowns = new Collection<string, Collection<string, number>>();
    /**
     * @private
     */
    private serverCooldowns = new Collection<
        string,
        Collection<string, number>
    >();
    /**
     * @private
     */
    private cooldownStore?: Keyv<string>;
    /**
     * @private
     */
    private serverCooldownStore?: Keyv<string>;
    /**
     * @private
     */
    private loader = new Loader(this);
    /**
     * @private
     */
    private middlewares = Pipeline<MiddlewareContext>();
    /**
     * @private
     */
    private logChannel: Channel | undefined;

    private static configFiles = [
        "aeroclient.conf",
        "aeroclient.env",
        "aeroclient.json",
        "aeroclient.config.js",
        "aeroclient.config.ts",
    ];

    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    public constructor(
        options: AeroClientOptions,
        baseOptions?: ClientOptions
    ) {
        super(baseOptions);

        this.logger = new Logger(
            (options && options.loggerHeader) || "aeroclient",
            (options && options.loggerShowFlags) || false
        );

        this.clientOptions = options;

        this.init(options);

        this.prefixes = new Keyv<string>(options.connectionUri, {
            namespace: "prefixes",
        });

        if (options.persistentCooldowns) {
            this.cooldownStore = new Keyv<string>(options.connectionUri, {
                namespace: "cooldowns",
            });

            this.serverCooldownStore = new Keyv<string>(options.connectionUri, {
                namespace: "serverCooldowns",
            });
        }

        this.localeStore = new Keyv<string>(options.connectionUri, {
            namespace: "locales",
        });

        this.disabledCommands = new Keyv<string>(options.connectionUri, {
            namespace: "disabled-commands",
        });

        this.defaultPrefix = options.prefix || "!";

        if (options.useDefaults) registerDefaults(this);

        if (options.dev) devOptions(this);
    }

    /**
     * @private
     */
    private async init(options: AeroClientOptions) {
        if (options.commandsPath) await this.loadCommands(options.commandsPath);
        if (options.eventsPath) await this.loadEvents(options.eventsPath);
        if (options.messagesPath) await this.loadMessages(options.messagesPath);
        if (options.languagesPath)
            await this.loadLocales(options.languagesPath);

        this.once(
            "ready",
            options.readyCallback ||
                (async () => {
                    this.logger.success("AeroClient is ready!");

                    if (options.logChannel) {
                        try {
                            this.logChannel = await this.channels.fetch(
                                options.logChannel
                            );

                            if (
                                !["dm", "group", "text"].includes(
                                    this.logChannel.type
                                )
                            )
                                this.logger.error(
                                    "Channel type must be either 'dm', 'group', or 'text'."
                                );
                            else
                                process.on("unhandledRejection", (err) => {
                                    console.log(err);
                                    (this.logChannel as TextChannel).send(
                                        //@ts-ignore
                                        (err && (err.stack || err.message)) ||
                                            "ERROR",
                                        {
                                            code: true,
                                        }
                                    );
                                });
                        } catch {
                            this.logger.error("Log channel ID is invalid.");
                        }
                    }
                })
        );

        this.on(
            "message",
            this.clientOptions.customHandler ||
                (async (message) => {
                    if (message.author.bot) return;

                    const prefix = message.guild
                        ? (await this.prefixes.get(message.guild?.id)) ||
                          this.clientOptions.prefix ||
                          this.defaultPrefix
                        : this.clientOptions.prefix || this.defaultPrefix;

                    const args = message.content
                        .slice(prefix.length)
                        .split(/\s+/g);

                    const commandName = this.clientOptions.allowSpaces
                        ? args.shift() || args.shift()
                        : args.shift();

                    let command:
                        | Command
                        | undefined = message.content.startsWith(prefix)
                        ? this.commands.get(commandName || "") ||
                          this.commands.find(
                              (cmd) =>
                                  !!(
                                      cmd.aliases &&
                                      cmd.aliases.includes(commandName || "")
                                  )
                          )
                        : undefined;

                    const shouldStop = await this.middlewares.execute({
                        message,
                        args,
                        command,
                    });

                    if (shouldStop) return;

                    if (!message.content.startsWith(prefix)) return;

                    if (!command) return;

                    const guildDisabledCommands = (
                        (await this.disabledCommands.get(
                            message.guild?.id || ""
                        )) || ""
                    ).split(",");

                    if (command.guildOnly && !message.guild) {
                        if (this.clientOptions.responses?.guild)
                            message.channel.send(
                                this.clientOptions.responses?.guild.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
                        return;
                    }

                    if (command.dmOnly && message.guild) {
                        if (this.clientOptions.responses?.dm)
                            message.channel.send(
                                this.clientOptions.responses?.dm.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
                        return;
                    }

                    if (guildDisabledCommands.includes(command.name)) {
                        if (this.clientOptions.responses?.disabled)
                            message.channel.send(
                                this.clientOptions.responses?.disabled.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
                        return;
                    }

                    if (
                        command.testOnly &&
                        message.guild &&
                        !this.clientOptions.testServers?.includes(
                            message.guild.id
                        )
                    ) {
                        if (this.clientOptions.responses?.test)
                            message.channel.send(
                                this.clientOptions.responses.test.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
                        return;
                    }

                    //! doesnt work soooo
                    if (this.clientOptions.experimentalSubcommands)
                        while (command.hasSubcommands) {
                            const commandName = args.shift();

                            if (commandName) {
                                const subcommand =
                                    this.commands.get(commandName) ||
                                    this.commands.find(
                                        (cmd) =>
                                            !!(
                                                cmd.aliases &&
                                                cmd.aliases.includes(
                                                    commandName
                                                )
                                            )
                                    );

                                if (
                                    subcommand &&
                                    subcommand.parentCommand === command.name
                                ) {
                                    command = subcommand;
                                }
                            }
                        }

                    if (
                        command.staffOnly &&
                        this.clientOptions.staff &&
                        !this.clientOptions.staff.includes(message.author.id)
                    ) {
                        if (this.clientOptions.responses?.staff)
                            message.channel.send(
                                this.clientOptions.responses?.staff.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
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
                            )
                                .replace(
                                    /\$PERMS/g,
                                    `\`${command
                                        .permissions!.map((p) => parse.case(p))
                                        .join(", ")}\``
                                )
                                .replace(/\$COMMAND/g, command.name)
                        );

                    if (
                        command.nsfw &&
                        message.channel.type !== "dm" &&
                        !message.channel.nsfw
                    ) {
                        if (this.clientOptions.responses?.nsfw)
                            message.channel.send(
                                this.clientOptions.responses?.nsfw.replace(
                                    /\$COMMAND/g,
                                    command.name
                                )
                            );
                        return;
                    }

                    if (command.metasyntax) {
                        if (!(await command.metasyntax.test(message, args))) {
                            return message.channel.send(
                                this.clientOptions.responses?.usage
                                    ?.replace(/\$COMMAND/g, command.name)
                                    .replace(/\$PREFIX/g, prefix)
                                    .replace(
                                        /\$USAGE/g,
                                        command.metasyntax.source || ""
                                    ) ||
                                    `The usage of \`${
                                        command.name
                                    }\` is \`${prefix}${command.name}${
                                        command.metasyntax.source
                                            ? ` ${command.metasyntax.source}`
                                            : ""
                                    }\`.`
                            );
                        }
                    } else if (
                        (command.args && !args.length) ||
                        (command.minArgs && command.minArgs > args.length) ||
                        (command.maxArgs && command.maxArgs < args.length)
                    ) {
                        return message.channel.send(
                            this.clientOptions.responses?.usage
                                ?.replace(/\$COMMAND/g, command.name)
                                .replace(/\$PREFIX/g, prefix)
                                .replace(/\$USAGE/g, command.usage || "") ||
                                `The usage of \`${
                                    command.name
                                }\` is \`${prefix}${command.name}${
                                    command.usage ? ` ${command.usage}` : ""
                                }\`.`
                        );
                    }

                    if (!this.cooldowns.has(command.name)) {
                        this.cooldowns.set(command.name, new Collection());

                        if (this.cooldownStore) {
                            const cooldownObj = JSON.parse(
                                (await this.cooldownStore.get(command.name)) ||
                                    "{}"
                            );

                            cooldownObj[message.author.id] = 0;

                            await this.cooldownStore.set(
                                command.name,
                                JSON.stringify(cooldownObj)
                            );
                        }
                    }

                    if (!this.serverCooldowns.has(command.name)) {
                        this.serverCooldowns.set(
                            command.name,
                            new Collection()
                        );

                        if (this.serverCooldownStore && message.guild) {
                            const cooldownObj = JSON.parse(
                                (await this.serverCooldownStore.get(
                                    command.name
                                )) || "{}"
                            );

                            cooldownObj[message.guild.id] = 0;

                            await this.serverCooldownStore.set(
                                command.name,
                                JSON.stringify(cooldownObj)
                            );
                        }
                    }

                    const now = Date.now();

                    let timestamps = command.cooldown
                        ? this.cooldownStore
                            ? JSON.parse(
                                  (await this.cooldownStore.get(
                                      command.name
                                  )) || "{}"
                              )
                            : this.cooldowns.get(command.name)
                        : this.serverCooldownStore
                        ? JSON.parse(
                              (await this.serverCooldownStore.get(
                                  command.name
                              )) || "{}"
                          )
                        : this.serverCooldowns.get(command.name);

                    const cooldownAmount =
                        (command.serverCooldown || command.cooldown || 0) *
                        1000;

                    if (!(timestamps instanceof Collection)) {
                        const tCollection = new Collection<string, number>();
                        for (const k in timestamps)
                            tCollection.set(k, timestamps[k]);
                        timestamps = tCollection;
                    }

                    if (
                        (timestamps.has(message.author.id) ||
                            timestamps.has(
                                message.guild && message.guild.id
                            )) &&
                        !command.ratelimit
                    ) {
                        const expirationTime =
                            (timestamps!.get(message.author.id) ||
                                timestamps!.get(
                                    message.guild && message.guild.id
                                ))! + cooldownAmount;

                        if (now < expirationTime) {
                            const timeLeft = expirationTime - now;

                            const msTime = ms(Math.round(timeLeft), {
                                long: true,
                            });

                            const formattedTime = msTime.endsWith("ms")
                                ? `${(timeLeft / 1000).toFixed(1)} seconds`
                                : msTime;

                            if (
                                !(
                                    this.clientOptions.staff &&
                                    this.clientOptions.staff.includes(
                                        message.author.id
                                    ) &&
                                    this.clientOptions.disableStaffCooldowns
                                )
                            )
                                return message.channel.send(
                                    this.clientOptions.responses &&
                                        this.clientOptions.responses.cooldown
                                        ? this.clientOptions.responses.cooldown
                                              .replace(/\$TIME/g, formattedTime)
                                              .replace(
                                                  /\$COMMAND/g,
                                                  command.name
                                              )
                                        : `Please wait ${formattedTime} before reusing the \`${command.name}\` command.`
                                );
                        }
                    } else if (command.ratelimit) {
                        if (command.ratelimit.check(message.author.id)) {
                            return message.channel.send(
                                this.clientOptions.responses &&
                                    this.clientOptions.responses.ratelimit
                                    ? this.clientOptions.responses.ratelimit.replace(
                                          /\$COMMAND/g,
                                          command.name
                                      )
                                    : `You are being ratelimited.`
                            );
                        }
                    }

                    try {
                        if (
                            (await command.callback({
                                message,
                                args,
                                parsed:
                                    (command.metasyntax &&
                                        (await command.metasyntax.parse(
                                            message,
                                            args
                                        ))) ||
                                    [],
                                client: this,
                                text: message.content,
                                locale:
                                    (await this.localeStore.get(
                                        message.author.id
                                    )) || "en",
                            })) !== "invalid"
                        ) {
                            if (!command.ratelimit) {
                                timestamps!.set(
                                    command.serverCooldown && message.guild
                                        ? message.guild.id
                                        : message.author.id,
                                    now
                                );
                                if (this.cooldownStore) {
                                    const cooldownObj = JSON.parse(
                                        (await this.cooldownStore.get(
                                            command.name
                                        )) || "{}"
                                    );

                                    cooldownObj[message.author.id] = now;

                                    await this.cooldownStore.set(
                                        command.name,
                                        JSON.stringify(cooldownObj)
                                    );
                                }
                                if (this.serverCooldownStore) {
                                    const cooldownObj = JSON.parse(
                                        (await this.serverCooldownStore.get(
                                            command.name
                                        )) || "{}"
                                    );

                                    cooldownObj[message.author.id] = now;

                                    await this.serverCooldownStore.set(
                                        command.name,
                                        JSON.stringify(cooldownObj)
                                    );
                                }
                                setTimeout(
                                    () => timestamps.delete(message.author.id),
                                    cooldownAmount
                                );
                            } else {
                                command.ratelimit.add(message.author.id);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        if (
                            this.clientOptions.responses &&
                            this.clientOptions.responses.error
                        )
                            message.channel.send(
                                this.clientOptions.responses.error
                                    .replace(/\$COMMAND/g, command.name)
                                    .replace(/\$ERROR/g, err)
                            );
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
    public paginate(
        message: Message,
        pages: MessageEmbed[],
        options: Parameters<typeof utils.paginate>[2]
    ) {
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

    /**
     * Creates an interface to interact with your app.
     * @param key Client public key.
     */
    public createInteraction(key: string) {
        //@ts-ignore
        this.ws.on("INTERACTION_CREATE", (i: Interaction) =>
            this.emit("interaction", i)
        );

        return new DiscordInteractions({
            applicationId: this.user?.id!,
            authToken: this.clientOptions.token!,
            publicKey: key,
        });
    }

    /**
     * Takes options and constructs a new AeroClient.
     *
     * If you are using external config files, make sure you use this instead of the constructor.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    public static async create(
        clientOptions?: AeroClientOptions,
        baseOptions?: ClientOptions
    ) {
        let options = clientOptions;

        const logger = new Logger("config");

        if (!options) {
            await Promise.all(
                AeroClient.configFiles.map(async (fileName) => {
                    if (fs.existsSync(join(require.main?.path!, fileName))) {
                        try {
                            if (
                                /\.[tj]s$/.test(fileName) ||
                                fileName.endsWith("json")
                            )
                                options = (
                                    await import(
                                        join(require.main?.path!, fileName)
                                    )
                                ).default;
                            else
                                options = dotenv.parse(
                                    fs
                                        .readFileSync(
                                            join(require.main?.path!, fileName),
                                            "utf8"
                                        )
                                        .toString()
                                );

                            logger.success(`Loaded config from ${fileName}.`);
                        } catch {
                            logger.error(`Failed to load ${fileName}.`);
                        }
                    }
                })
            );

            if (!options)
                throw new Error(`No options or config files were found.`);
        }

        return new AeroClient(options, baseOptions);
    }
}
