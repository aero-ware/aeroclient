import { Channel, ClientEvents, ClientOptions, GuildMember, Message, PermissionString, Role, User } from "discord.js";
import AeroClient from ".";
import Arguments from "./classes/Arguments";
import Ratelimit from "./classes/Ratelimit";

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
 * A middleware callback's context.
 */
export type MiddlewareContext = {
    message: Message;
    args: string[];
    command?: Command;
};

/**
 * Represents a command callback for execution of the command.
 */
export type CommandCallback = (
    this: Command,
    context: {
        message: Message;
        args: string[];
        parsed: (number | string | Role | Channel | GuildMember | User | Date | boolean | undefined)[];
        client: AeroClient;
        text: string;
        locale: string;
    }
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
     * The command's category.
     */
    category?: string;
    /**
     * Are arguments required to execute the command?
     */
    args?: boolean;
    /**
     * The minimum number of arguments required to run the command.
     */
    minArgs?: number;
    /**
     * The maximum number of arguments allowed for command execution.
     */
    maxArgs?: number;
    /**
     * The command's usage.
     */
    usage?: string;
    /**
     * Employs an Arguments instance for validation and parsing.
     */
    metasyntax?: Arguments;
    /**
     * Employs  Ratelimit instance for ratelimiting users.
     */
    ratelimit?: Ratelimit;
    /**
     * The command's cooldown in seconds.
     */
    cooldown?: number;
    /**
     * The command's server cooldown in seconds.
     */
    serverCooldown?: number;
    /**
     * Description of the command.
     */
    description?: string;
    /**
     * A more thorough and longer description.
     */
    details?: string;
    /**
     * Can this command only be executed in a guild?
     */
    guildOnly?: boolean;
    /**
     * Can this command only be executed by bot staff?
     */
    staffOnly?: boolean;
    /**
     * Can this command only be executed in a test server?
     */
    testOnly?: boolean;
    /**
     * Can this command only be executed in a direct message?
     */
    dmOnly?: boolean;
    /**
     * Should this command be protected from disabling?
     */
    guarded?: boolean;
    /**
     * Permissions that GuildMembers must have to run this command. **DOES NOT APPLY IN DMs**
     */
    permissions?: PermissionString[];
    /**
     * Can this command only be executed in NSFW channels?
     */
    nsfw?: boolean;
    /**
     * Should this be hidden from the default help command?
     */
    hidden?: boolean;
    /**
     * Does this command have subcommands?
     */
    hasSubcommands?: boolean;
    /**
     * Parent command name. Only works with subcommands.
     */
    parentCommand?: string;
    /**
     * The callback to execute.
     */
    callback: CommandCallback;
}

/**
 * Stored responses for the bot for use in standard situations like an error or cooldown.
 */
export type ResponseInfo = {
    /**
     * Response to send when the command is in cooldown.
     */
    cooldown?: string;
    /**
     * Response to send when an error occurs.
     */
    error?: string;
    /**
     * Response to send when the usage is incorrect.
     */
    usage?: string;
    /**
     * Reponse to send when an NSFW command is used in a SFW channel.
     */
    nsfw?: string;
    /**
     * Response to send when a guild only command is used in a direct message.
     */
    guild?: string;
    /**
     * Response to send when a test server only command is used elsewhere.
     */
    test?: string;
    /**
     * Response to send when an attempt to disable a guarded command fails.
     */
    guarded?: string;
    /**
     * Response to send when a direct message only command is used in a guild.
     */
    dm?: string;
    /**
     * Response to send when a non-staff user attempts to use a staff only command.
     */
    staff?: string;
    /**
     * Response to send when someone tries to run a disabled command.
     */
    disabled?: string;
    /**
     * Response to send when someone has insufficient perms to run a command.
     */
    perms?: string;
    /**
     * Response to send when a user is being ratelimited.
     */
    ratelimit?: string;
};

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
     * Logger flags option (if your console doesn't support colors).
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
     * Path to load the JSON with messages.
     */
    messagesPath?: string;
    /**
     * Directory to load JSON files from that correspond to languages.
     */
    languagesPath?: string;
    /**
     * Connection string for Keyv.
     */
    connectionUri?: string;
    /**
     * Use default commands.
     */
    useDefaults?: boolean;
    /**
     * Store cooldowns in database to be persistent.
     */
    persistentCooldowns?: boolean;
    /**
     * Responses for the bot to use in standard situations.
     */
    responses?: ResponseInfo;
    /**
     * Array of ids of staff users.
     */
    staff?: string[];
    /**
     * Array of IDs of test servers.
     */
    testServers?: string[];
    /**
     * ID of the error log channel.
     */
    logChannel?: string;
    /**
     * Allow spaces to be between the prefix and command?
     */
    allowSpaces?: boolean;
    /**
     * Should staff be able to skip cooldowns?
     */
    disableStaffCooldowns?: boolean;
    /**
     * Enable experimental subcommands? [BROKEN]
     */
    experimentalSubcommands?: boolean;
    /**
     * Options for development.
     */
    dev?: {
        /**
         * Do not load these things into the client.
         */
        dontLoad?: {
            categories?: string[];
            commands?: string[];
            events?: string[];
            folders?: string[];
        };
        /**
         * Include eval commands?
         */
        eval?: {
            console?: boolean;
            command?: boolean;
        };
        /**
         * Include info events?
         */
        events?: {
            debug?: boolean;
            error?: boolean;
        };
    };
    /**
     * Regular discord.js client options.
     */
    clientOptions?: ClientOptions;
    /**
     * Custom handler instead of default one.
     */
    customHandler?: (message: Message) => unknown;
    /**
     * Custom callback when client is ready.
     */
    readyCallback?: () => void;
}

/**
 * All supported locales.
 */
export type Locales = "ar" | "en" | "fr" | "zh" | "de" | "pt" | "ru" | "es";

/**
 * Options support by the Ratelimit class.
 */
export interface RatelimitOptions {
    calls: number;
    per: "second" | "minute" | "hour" | "day";
    clear?: boolean;
    recharge?: number;
}
