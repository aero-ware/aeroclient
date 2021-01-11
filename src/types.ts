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
 * Represents a command callback for execution of the command.
 */
export type CommandCallback = (
    message: Message,
    args: string[],
    client: AeroClient
) => unknown;

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
     * The callback to execute.
     */
    callback: CommandCallback;
}

/**
 * Options for the client.
 */
export interface AeroClientOptions {
    token?: string;
    prefix?: string;
    readyCallback?: () => void;
    logging?: boolean;
    commandsPath?: string;
    eventsPath?: string;
}
