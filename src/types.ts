import { ClientEvents, Message } from "discord.js";
import AeroClient from ".";

/**
 * An event handler that the client will load.
 */
export interface EventHandler {
    /**
     * Name of event
     */
    name: keyof ClientEvents;
    /**
     * Run once
     */
    once: boolean;
    /**
     * Event callback
     * @this {this} `this` in the callback refers to the client.
     */
    callback: <K extends keyof ClientEvents>(...args: ClientEvents[K]) => any;
}

/**
 * A middleware callback.
 */
export type MiddlewareContext = {
    message: Message;
    args: string[];
};

/**
 * Represents a command callback for execution of the command.
 */
export type CommandCallback = (context: {
    message: Message;
    args: string[];
    client: AeroClient;
    text: string;
}) => unknown;

/**
 * A command that the client will load.
 */
export interface Command {
    /**
     * Name of the command.
     */
    name: string;
    /**
     * Aliases of the command.
     */
    aliases?: string[];
    /**
     * The command's category.
     */
    category?: string;
    /**
     * Are arguments required to execute the command.
     */
    args?: boolean;
    /**
     * The command's usage.
     */
    usage?: string;
    /**
     * The command's cooldown in seconds.
     */
    cooldown?: number;
    /**
     * Description of the command.
     */
    description?: string;
    /**
     * The callback to execute.
     */
    callback: CommandCallback;
}

/**
 * Options for the client.
 */
export interface AeroClientOptions {
    /**
     * The client's token.
     */
    token?: string;
    /**
     * The client's prefix.
     */
    prefix?: string;
    /**
     * Debugging option.
     */
    logging?: boolean;
    /**
     * Custom log header.
     */
    loggerHeader?: string;
    /**
     * Logger flags option.
     */
    loggerShowFlags?: boolean;
    /**
     * Directory to load command files.
     */
    commandsPath?: string;
    /**
     * Directory to load event files.
     */
    eventsPath?: string;
    /**
     * Connection string for Keyv.
     */
    connectionUri?: string;
    /**
     * Reponse when an error occurs.
     */
    errorResponse?: string;
    /**
     * Response when cooldown is not over.
     */
    cooldownResponse?: string;
    /**
     * Use default commands.
     */
    useDefault?: boolean;
    /**
     * Custom handler instead of default one.
     */
    customHandler?: (message: Message) => unknown;
    /**
     * Custom callback when client is ready.
     */
    readyCallback?: () => void;
}
