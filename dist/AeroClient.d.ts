import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import { Client, ClientOptions, Collection, Message, MessageEmbed } from "discord.js";
import Keyv from "keyv";
import { Middleware } from "./client/middleware";
import { AeroClientOptions, Command, Locales, MiddlewareContext } from "./types";
/**
 * The AeroClient extends the discord.js Client class to offer more features.
 */
export default class AeroClient extends Client {
    /**
     * The commands that have been registered by AeroClient.
     */
    commands: Collection<string, Command>;
    /**
     * The logger used to log events.
     * @see https://npmjs.com/package/@aeroware/logger.
     */
    logger: Logger;
    /**
     * The collection of guild prefixes saved by guild ID.
     */
    prefixes: Keyv<string>;
    /**
     * The options that were passed to the client via the constructor.
     */
    clientOptions: AeroClientOptions;
    /**
     * The keyv collection that matches user IDs to their preferred language.
     */
    localeStore: Keyv<string>;
    /**
     * Object that stores locale-specific messages.
     */
    locales: {
        [locale in Locales]?: {
            [key: string]: string;
        };
    };
    /**
     * The keyv collection that stores what commands are disabled in a guild.
     */
    disabledCommands: Keyv<string>;
    /**
     * The default prefix for the bot. Used in DMs and in guilds where a custom prefix is not set.
     */
    defaultPrefix: string;
    private cooldowns;
    private cooldownStore?;
    private loader;
    private middlewares;
    private logChannel;
    /**
     * Takes options and constructs a new AeroClient.
     * @param options Options to customize the AeroClient.
     * @param baseOptions Options for the regular trash client.
     */
    constructor(options: AeroClientOptions, baseOptions?: ClientOptions);
    /**
     * Private async method to initiate the client and start it up.
     * @param options Options to customize the AeroClient.
     */
    private init;
    /**
     * Adds a middleware into the client's middleware stack.
     * @param middleware the middleware function to execute
     */
    use(middleware: Middleware<MiddlewareContext>): this;
    /**
     * Creates a pagination with embeds and controlled by reactions.
     * @param message the message that requested this pagination
     * @param pages an array of embeds that will be shown to the user as a pagination
     * @param options options for the pagination.
     * @see https://npmjs.com/package/@aeroware/discord-utils
     */
    paginate(message: Message, pages: MessageEmbed[], options: Parameters<typeof utils.paginate>[2]): this;
    /**
     * Loads commands from the specified directory.
     * Note: To register an indiviudal command, use `registerCommand(command: Command)`
     * @param directory the directory to load commands from
     */
    loadCommands(directory: string): Promise<this>;
    /**
     * Loads events from the specified directory.
     * @param directory the directory to load events from
     */
    loadEvents(directory: string): Promise<this>;
    /**
     * Loads messages from the specified directory.
     * @param directory the directory to load messages from
     */
    loadMessages(directory: string): Promise<this>;
    /**
     * Loads language JSONs from the specified directory.
     * @param dir the directory to load languages from
     */
    loadLocales(dir: string): Promise<this>;
    /**
     * Registers a command.
     * Note; To register a folder of commands, use `loadCommands(directory: string)`
     * @param command the command to register
     */
    registerCommand(command: Command): this;
}
