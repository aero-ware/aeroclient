import { Client, ClientOptions, Collection } from "discord.js";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { AeroClientOptions, Command, EventHandler } from "./types";

/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
export default class AeroClient extends Client {
    public commands = new Collection<string, Command>();
    private prefix: string;
    private logging: boolean;

    constructor(options: AeroClientOptions, baseOptions?: ClientOptions) {
        super(baseOptions);
        this.prefix = options.prefix || "!";
        this.logging = options.logging || false;
        this.init(options);
    }

    private async init(options: AeroClientOptions) {
        if (options.commandsPath) await this.loadCommands(options.commandsPath);
        if (options.eventsPath) await this.loadCommands(options.eventsPath);
        this.once(
            "ready",
            options.readyCallback || (() => console.log("Ready!"))
        );
        await this.login(options.token);
    }

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
                        console.warn(
                            `The command in the file '${command}' has no name`
                        );
                    continue;
                }

                if (!file.execute) {
                    if (this.logging)
                        console.warn(
                            `The command in the file '${command}' has no callback`
                        );
                    continue;
                }

                if (names.has(file.name)) {
                    if (this.logging)
                        console.warn(`Found duplicate command '${file.name}'`);
                    continue;
                }

                this.commands.set(file.name, file);

                if (this.logging)
                    console.log(`Loaded the '${file.name}' command!`);
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
                        console.warn(`Found a duplicate event '${file.name}'`);
                    continue;
                }

                names.add(file.name);

                this[file.once ? "once" : "on"](
                    file.name,
                    file.callback.bind(this)
                );

                if (this.logging)
                    console.log(`Loaded the '${file.name}' event!`);
            }
        };

        await traverse(directory);
    }

    public registerCommand(command: Command) {
        this.commands.set(command.name, command);
    }
}
