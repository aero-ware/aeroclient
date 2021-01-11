import Logger from "@aeroware/logger";
import { Client, ClientOptions, Collection, MessageEmbed } from "discord.js";
import { readdir, stat } from "fs/promises";
import Keyv from "keyv";
import ms from "ms";
import { join } from "path";
import { AeroClientOptions, Command, EventHandler } from "./types";

/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
export default class AeroClient extends Client {
    public commands = new Collection<string, Command>();
    private logger: Logger;
    private prefix: string;
    private logging: boolean;
    private prefixes: Keyv;
    private cooldowns = new Collection<string, Collection<string, number>>();
    private clientOptions: AeroClientOptions;

    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    constructor(options: AeroClientOptions, baseOptions?: ClientOptions) {
        super(baseOptions);

        this.prefix = options.prefix || "!";
        this.logging = options.logging || false;
        this.clientOptions = options;

        this.init(options);

        this.logger = new Logger(
            options.loggerHeader || "aeroclient",
            options.loggerShowFlags || false
        );

        this.prefixes = new Keyv(options.connectionUri);

        if (options.useDefault) {
            this.registerCommand({
                name: "setprefix",
                args: true,
                usage: "<prefix>",
                category: "utility",
                async callback({ message, args, client }) {
                    if (!message.guild) return;

                    client.prefixes.set(message.guild?.id, args[0]);

                    message.channel.send(
                        `:white_check_mark: Set the prefix to \`${args[0]}\``
                    );
                },
            });

            this.registerCommand({
                name: "help",
                aliases: ["commands"],
                usage: "[command]",
                category: "utility",
                async callback({ message, args, client }) {
                    const { commands } = client;

                    const categories = new Set<string>();

                    commands.forEach((cmd) =>
                        cmd.category ? categories.add(cmd.category) : null
                    );

                    const prefix = message.guild
                        ? (await client.prefixes.get(message.guild?.id)) ||
                          client.prefix
                        : client.prefix;

                    if (!args.length) {
                        return message.channel.send(
                            new MessageEmbed()
                                .setTitle("Help")
                                .setColor("RANDOM")
                                .setDescription(
                                    `Use \`${prefix}help <command>\` for info on a specific command!`
                                )
                                .setTimestamp(message.createdAt)
                                .addFields(
                                    Array.from(categories).map((cat) => ({
                                        name: cat.toLowerCase(),
                                        value: client.commands
                                            .filter(
                                                (cmd) => cmd.category === cat
                                            )
                                            .map((cmd) => `\`${cmd.name}\``)
                                            .join("\n"),
                                        inline: true,
                                    }))
                                )
                                .addField(
                                    "uncategorized commands",
                                    client.commands
                                        .filter(
                                            (cmd) =>
                                                typeof cmd.category ===
                                                "undefined"
                                        )
                                        .map((cmd) => `\`${cmd.name}\``)
                                        .join("\n")
                                )
                        );
                    }

                    const name = args[0].toLowerCase();
                    const command =
                        commands.get(name) ||
                        commands.find(
                            (c) => !!(c.aliases && c.aliases.includes(name))
                        );

                    if (!command) {
                        message.channel.send(
                            `Couldn't find the command \`${name}\`!`
                        );
                        return "invalid";
                    }

                    return message.channel.send(
                        new MessageEmbed()
                            .setTitle(`Info for ${command.name}`)
                            .addField(
                                "Aliases",
                                command.aliases
                                    ? command.aliases
                                          .map((a) => `\`${a}\``)
                                          .join("\n")
                                    : "None"
                            )
                            .addField(
                                "Description",
                                command.description || "None"
                            )
                            .addField(
                                "Usage",
                                `\`${prefix}${command.name} ${command.usage}\``
                            )
                            .addField(
                                "Category",
                                command.category
                                    ? command.category.toLowerCase()
                                    : "None",
                                true
                            )
                            .addField(
                                "Cooldown",
                                ms((command.cooldown || 0) * 1000, {
                                    long: true,
                                }),
                                true
                            )
                            .setColor("RANDOM")
                            .setFooter(client.user?.tag)
                            .setTimestamp(message.createdAt)
                    );
                },
            });
        }
    }

    /**
     * Private async method to initiate the client and start it up.
     * @param options Options to customize the AeroClient.
     */
    private async init(options: AeroClientOptions) {
        if (options.commandsPath) await this.loadCommands(options.commandsPath);
        if (options.eventsPath) await this.loadCommands(options.eventsPath);

        this.once(
            "ready",
            options.readyCallback ||
                (() => this.logger.success("AeroClient is ready!"))
        );

        this.on("message", async (message) => {
            const prefix = message.guild
                ? (await this.prefixes.get(message.guild?.id)) || this.prefix
                : this.prefix;

            const args = message.content.slice(prefix.length).split(/\s+/g);
            const commandName = args.shift();

            if (!commandName) return;

            const command =
                this.commands.get(commandName) ||
                this.commands.find(
                    (cmd) =>
                        !!(cmd.aliases && cmd.aliases.includes(commandName))
                );

            if (!command) return;

            if (command.args && !args.length) {
                return message.channel.send(
                    `The usage of \`${command.name}\` is \`${prefix}${command.name} ${command.usage}\`.`
                );
            }

            if (!this.cooldowns.has(command.name)) {
                this.cooldowns.set(command.name, new Collection());
            }

            const now = Date.now();
            const timestamps = this.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || 0) * 1000;

            if (timestamps!.has(message.author.id)) {
                const expirationTime =
                    timestamps!.get(message.author.id)! + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = expirationTime - now;
                    const msTime = ms(Math.round(timeLeft), {
                        long: true,
                    });
                    const formattedTime = msTime.endsWith("ms")
                        ? `${(timeLeft / 1000).toFixed(1)} seconds`
                        : msTime;
                    return message.channel.send(
                        this.clientOptions.cooldownResponse
                            ? this.clientOptions.cooldownResponse.replace(
                                  "$TIME",
                                  formattedTime
                              )
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
                    })) !== "invalid"
                ) {
                    timestamps!.set(message.author.id, now);
                    setTimeout(
                        () => timestamps!.delete(message.author.id),
                        cooldownAmount
                    );
                }
            } catch (err) {
                console.error(err);
                if (this.clientOptions.errorResponse)
                    message.channel.send(this.clientOptions.errorResponse);
            }

            return;
        });

        await this.login(options.token);
    }

    /**
     * Loads all commands in a folder, and subfolders.
     * @param path Directory to load.
     */
    public async loadCommands(path: string) {
        const directory = require.main?.path
            ? `${require.main.path}/${path}`
            : path;

        const names = new Set<string>();

        const traverse = async (directory: string) => {
            const commands = await readdir(directory);

            for (const command of commands) {
                const filePath = join(directory, command);

                if ((await stat(filePath)).isDirectory()) {
                    await traverse(filePath);
                    continue;
                }

                const file = (await import(filePath)).default;

                if (!file.name) {
                    if (this.logging)
                        this.logger.warn(
                            `The command in the file '${command}' has no name`
                        );
                    continue;
                }

                if (!file.execute) {
                    if (this.logging)
                        this.logger.warn(
                            `The command in the file '${command}' has no callback`
                        );
                    continue;
                }

                if (names.has(file.name)) {
                    if (this.logging)
                        this.logger.warn(
                            `Found duplicate command '${file.name}'`
                        );
                    continue;
                }

                this.commands.set(file.name, file);

                if (this.logging)
                    this.logger.info(`Loaded the '${file.name}' command!`);
            }
        };

        await traverse(directory);
    }

    public async loadEvents(path: string) {
        const directory = require.main?.path
            ? `${require.main.path}/${path}`
            : path;

        const names = new Set<string>();

        const traverse = async (directory: string) => {
            const events = await readdir(directory);

            for (const event of events) {
                const filePath = join(directory, event);

                if ((await stat(filePath)).isDirectory()) {
                    await traverse(filePath);
                    continue;
                }

                const file: EventHandler = (await import(filePath)).default;

                if (names.has(file.name)) {
                    if (this.logging)
                        this.logger.warn(
                            `Found a duplicate event '${file.name}'`
                        );
                    continue;
                }

                names.add(file.name);

                this[file.once ? "once" : "on"](
                    file.name,
                    file.callback.bind(this)
                );

                if (this.logging)
                    this.logger.info(`Loaded the '${file.name}' event!`);
            }
        };

        await traverse(directory);
    }

    public registerCommand(command: Command) {
        this.commands.set(command.name, command);
    }
}
