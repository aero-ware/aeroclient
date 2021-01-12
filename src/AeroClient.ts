import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import { Client, ClientOptions, Collection, Message, MessageEmbed } from "discord.js";
import Keyv from "keyv";
import ms from "ms";
import registerDefaults from "./client/defaults";
import Loader from "./client/Loader";
import Pipeline, { Middleware } from "./client/middleware";
import { AeroClientOptions, Command, MiddlewareContext } from "./types";

/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
export default class AeroClient extends Client {
    public commands = new Collection<string, Command>();
    public logger: Logger;
    public prefixes: Keyv<string>;
    public clientOptions: AeroClientOptions;
    private cooldowns = new Collection<string, Collection<string, number>>();
    private cooldownDB?: Keyv<string>;
    private loader = new Loader(this);
    private middlewares = Pipeline<MiddlewareContext>();
    private defaultPrefix = "!";

    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    constructor(options: AeroClientOptions, baseOptions?: ClientOptions) {
        super(baseOptions);

        this.clientOptions = options;

        this.init(options);

        this.logger = new Logger(
            options.loggerHeader || "aeroclient",
            options.loggerShowFlags || false
        );

        this.prefixes = new Keyv<string>(options.connectionUri, {
            namespace: "prefixes",
        });

        if (options.persistentCooldowns)
            this.cooldownDB = new Keyv<string>(options.connectionUri, {
                namespace: "cooldowns",
            });

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

        this.once(
            "ready",
            options.readyCallback || (() => this.logger.success("AeroClient is ready!"))
        );

        this.on(
            "message",
            this.clientOptions.customHandler ||
                (async (message) => {
                    const prefix = message.guild
                        ? (await this.prefixes.get(message.guild?.id)) ||
                          this.clientOptions.prefix ||
                          this.defaultPrefix
                        : this.clientOptions.prefix || this.defaultPrefix;

                    const args = message.content.slice(prefix.length).split(/\s+/g);

                    const commandName = args.shift();

                    if (!commandName) return;

                    const command =
                        this.commands.get(commandName) ||
                        this.commands.find(
                            (cmd) => !!(cmd.aliases && cmd.aliases.includes(commandName))
                        );

                    if (!command) return;

                    const shouldStop = await this.middlewares.execute({
                        message,
                        args,
                        command,
                    });

                    if (shouldStop) return;

                    if (command.guildOnly && !message.guild) {
                        if (this.clientOptions.responses?.guild)
                            message.channel.send(this.clientOptions.responses?.guild);
                        return;
                    }

                    if (command.dmOnly && message.guild) {
                        if (this.clientOptions.responses?.dm)
                            message.channel.send(this.clientOptions.responses?.dm);
                        return;
                    }

                    if (
                        command.staffOnly &&
                        this.clientOptions.staff &&
                        this.clientOptions.staff.includes(message.author.id)
                    ) {
                        if (this.clientOptions.responses?.staff)
                            message.channel.send(this.clientOptions.responses?.staff);
                        return;
                    }

                    if (command.nsfw && message.channel.type !== "dm" && !message.channel.nsfw) {
                        if (this.clientOptions.responses?.nsfw)
                            message.channel.send(this.clientOptions.responses?.nsfw);
                        return;
                    }
                    this.logger.info(`minArgs: ${command.minArgs}, maxArgs: ${command.maxArgs}, found: ${args.length}`);
                    if ((command.args && !args.length) || (command.minArgs && command.minArgs > args.length) || (command.maxArgs && command.maxArgs < args.length)) {
                        this.logger.warn("argument mismatch")
                        return message.channel.send(
                            this.clientOptions.responses?.usage
                                ?.replace("$COMMAND", command.name)
                                .replace("$PREFIX", prefix)
                                .replace("$USAGE", command.usage || "") ||
                                `The usage of \`${command.name}\` is \`${prefix}${command.name} ${command.usage}\`.`
                        );
                    }
                    this.logger.error("continuing");

                    if (!this.cooldowns.has(command.name)) {
                        this.cooldowns.set(command.name, new Collection());

                        if (this.cooldownDB) {
                            const cooldownObj = JSON.parse(
                                (await this.cooldownDB.get(command.name)) || "{}"
                            );

                            cooldownObj[message.author.id] = 0;

                            await this.cooldownDB.set(command.name, JSON.stringify(cooldownObj));
                        }
                    }

                    const now = Date.now();

                    let timestamps = this.cooldownDB
                        ? JSON.parse((await this.cooldownDB.get(command.name)) || "{}")
                        : this.cooldowns.get(command.name);

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

                            const formattedTime = msTime.endsWith("ms")
                                ? `${(timeLeft / 1000).toFixed(1)} seconds`
                                : msTime;

                            return message.channel.send(
                                this.clientOptions.responses &&
                                    this.clientOptions.responses.cooldown
                                    ? this.clientOptions.responses.cooldown
                                          .replace("$TIME", formattedTime)
                                          .replace("$COMMAND", command.name)
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
                            })) !== "invalid"
                        ) {
                            timestamps!.set(message.author.id, now);
                            if (this.cooldownDB) {
                                const cooldownObj = JSON.parse(
                                    (await this.cooldownDB.get(command.name)) || "{}"
                                );

                                cooldownObj[message.author.id] = now;

                                await this.cooldownDB.set(
                                    command.name,
                                    JSON.stringify(cooldownObj)
                                );
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        if (this.clientOptions.responses && this.clientOptions.responses.error)
                            message.channel.send(this.clientOptions.responses.error);
                    }

                    return;
                })
        );

        await this.login(options.token);
    }

    public use(middleware: Middleware<MiddlewareContext>) {
        this.middlewares.use(middleware);
    }

    public paginate(
        message: Message,
        pages: MessageEmbed[],
        options: Parameters<typeof utils.paginate>[2]
    ) {
        utils.paginate(message, pages, options);
    }

    public async loadCommands(directory: string) {
        await this.loader.loadCommands(directory);
    }

    public async loadEvents(directory: string) {
        await this.loader.loadEvents(directory);
    }

    public async loadMessages(directory: string) {
        await this.loader.loadMessages(directory);
    }

    public registerCommand(command: Command) {
        this.commands.set(command.name, command);
    }
}
