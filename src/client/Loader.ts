import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import AeroClient from "../AeroClient";
import { EventHandler } from "../types";

export default class Loader {
    private client: AeroClient;

    /**
     * Creates a Loder given a client.
     * @param client the client that called this loader
     */
    constructor(client: AeroClient) {
        this.client = client;
    }

    /**
     * Loads all commands in a folder, and subfolders.
     * @param path Directory to load.
     */
    public async loadCommands(path: string) {
        const directory = require.main?.path ? `${require.main.path}/${path}` : path;

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
                    if (this.client.clientOptions.logging)
                        this.client.logger.warn(`The command in the file '${command}' has no name`);
                    continue;
                }

                if (!file.execute) {
                    if (this.client.clientOptions.logging)
                        this.client.logger.warn(
                            `The command in the file '${command}' has no callback`
                        );
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
        };

        await traverse(directory);
    }

    /**
     * Loads all events in a folder, and subfolders.
     * @param path Directory to load.
     */
    public async loadEvents(path: string) {
        const directory = require.main?.path ? `${require.main.path}/${path}` : path;

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
                    if (this.client.clientOptions.logging)
                        this.client.logger.warn(`Found a duplicate event '${file.name}'`);
                    continue;
                }

                names.add(file.name);

                this.client[file.once ? "once" : "on"](file.name, file.callback.bind(this));

                if (this.client.clientOptions.logging)
                    this.client.logger.info(`Loaded the '${file.name}' event!`);
            }
        };

        await traverse(directory);
    }

    /**
     * Loads responses from a JSON file.
     * @param path Path to load the JSON (file extension must be included)
     */
    public async loadMessages(path: string) {
        const file = require.main?.path ? `${require.main.path}/${path}` : path;

        const json = JSON.parse(
            await readFile(file, {
                encoding: "utf-8",
            })
        );

        ["cooldown", "error", "usage", "nsfw", "guild", "guarded", "dm", "staff"].forEach(
            (flag) => {
                const key = `${flag.toUpperCase()}_RESPONSE`;
                if (json[key])
                    this.client.clientOptions.responses = {
                        ...this.client.clientOptions.responses,
                        [flag]: json[key],
                    };
            }
        );
    }
}
