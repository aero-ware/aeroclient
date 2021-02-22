import { Channel, GuildMember, Message, Role, User } from "discord.js";
import AeroClient from "..";

/**
 * Valid argument types.
 */
type ArgumentType =
    | "member"
    | "user"
    | "role"
    | "channel"
    | "number"
    | "integer"
    | "string"
    | "boolean";

type Lex = {
    type: ArgumentType;
    optional: boolean;
};

const validArgTypes = [
    "member",
    "user",
    "role",
    "channel",
    "number",
    "integer",
    "string",
    "boolean",
];

/**
 * Handles parsing argument types in a command.
 */
export default class Arguments {
    /**
     * The client.
     */
    private static client: AeroClient | undefined;

    /**
     * The syntax of the command given as an array of Lex.
     */
    private lexicon: Lex[];

    /**
     * Creates an instance customized for the command.
     * @param lexicon the arguments of the command
     */
    private constructor(lexicon: Lex[]) {
        if (!Arguments.client)
            throw new Error("Cannot compile if an AeroClient is not supplied.");

        this.lexicon = lexicon;
    }

    /**
     * Tests a given message with args for matching the given lexicon.
     * @param message the message to test content of
     * @param args the args taken from the message
     * @returns resolves to the result of the test
     */
    public async test(message: Message, args: string[]) {
        if (this.requiredArgsLength > args.length) return false;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const lex = this.lexicon[i];

            switch (lex.type) {
                case "integer":
                    if (!parseInt(arg)) return false;
                    break;
                case "number":
                    if (!parseFloat(arg)) return false;
                    break;
                case "string":
                    break;
                case "channel":
                    try {
                        if (
                            !(await Arguments.client!.channels.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            ))
                        )
                            return false;
                    } catch {
                        return false;
                    }
                    break;
                case "role":
                    if (!message.guild) return false;
                    try {
                        if (
                            !(await message.guild.roles.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            ))
                        )
                            return false;
                    } catch {
                        return false;
                    }
                    break;
                case "member":
                    if (!message.guild) return false;
                    try {
                        if (
                            !(await message.guild.members.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            ))
                        )
                            return false;
                    } catch {
                        return false;
                    }
                    break;
                case "user":
                    try {
                        if (
                            !(await Arguments.client!.users.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            ))
                        )
                            return false;
                    } catch {
                        return false;
                    }
                    break;
                case "boolean":
                    return /((y(es)?)|(enabled?)|(on)|(true))|((no?)|(disabled?)|(off)|(false))/.test(
                        arg
                    );
            }
        }

        return true;
    }

    /**
     * Parses the arguments and returns an array with the parsed values.
     * @param message the message to parse arguments of
     * @param args arguments parsed from the message
     * @returns the parsed values, or an empty array if the arguments did not match the lexicon
     */
    public async parse(message: Message, args: string[]) {
        if (!(await this.test(message, args))) return [];

        const objects: (
            | number
            | string
            | Role
            | Channel
            | GuildMember
            | User
            | boolean
            | undefined
        )[] = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const lex = this.lexicon[i];

            switch (lex.type) {
                case "integer":
                    objects.push(parseInt(arg));
                    break;
                case "number":
                    objects.push(parseFloat(arg));
                    break;
                case "string":
                    objects.push(arg);
                    break;
                case "channel":
                    try {
                        objects.push(
                            (await Arguments.client!.channels.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            )) || undefined
                        );
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "role":
                    if (!message.guild) {
                        objects.push(undefined);
                        break;
                    }
                    try {
                        objects.push(
                            (await message.guild.roles.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            )) || undefined
                        );
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "member":
                    if (!message.guild) {
                        objects.push(undefined);
                        break;
                    }
                    try {
                        objects.push(
                            (await message.guild.members.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            )) || undefined
                        );
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "user":
                    try {
                        objects.push(
                            (await Arguments.client!.users.fetch(
                                arg.match(/(\d{18})/)?.[0] || ""
                            )) || undefined
                        );
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "boolean":
                    if (/(y(es)?)|(enabled?)|(on)|(true)/.test(arg))
                        objects.push(true);
                    else if (/(no?)|(disabled?)|(off)|(false)/.test(arg))
                        objects.push(false);
                    else objects.push(undefined);
                    break;
            }
        }

        return objects;
    }

    /**
     * Returns the number of required arguments in the lexicon.
     */
    private get requiredArgsLength() {
        return this.lexicon.filter((l) => !l.optional).length;
    }

    /**
     * Returns the number of optional arguments in the lexicon.
     */
    private get optionalArgsLength() {
        return this.lexicon.filter((l) => l.optional).length;
    }

    /**
     * Turns a usage string with given type into an Arguments instance matching the type.
     *
     * Wrap an argument in carets `<>` for a required argument.
     * Wrap an argument in brackets `[]` for an optional argument.
     * @param string the usage string in the specified format
     * @param legend an object with each key matching an argument with its typw
     */
    public static compile(
        string: string,
        legend?: { [key: string]: ArgumentType }
    ) {
        const args = string.split(/\s+/);

        const lexicon: Lex[] = args.map((a) => {
            const type = a.slice(1, a.length - 1);
            const legendType = legend && legend[type];

            if (legendType && !validArgTypes.includes(legendType))
                throw new Error(`Invalid argument type: '${legendType}'.`);

            if (
                !(a.startsWith("<") && a.endsWith(">")) &&
                !(a.startsWith("[") && a.endsWith("]"))
            )
                throw new Error("Invalid argument syntax.");

            if (!validArgTypes.includes(type) && !legendType)
                throw new Error(`Invalid argument type: '${type}'.`);

            if (a.startsWith("<") && a.endsWith(">"))
                return {
                    type: (legendType || type) as ArgumentType,
                    optional: false,
                };
            if (a.startsWith("[") && a.endsWith("]"))
                return {
                    type: (legendType || type) as ArgumentType,
                    optional: true,
                };

            throw new Error("Invalid argument syntax.");
        });

        return new Arguments(
            lexicon.sort((a, b) =>
                a.optional === b.optional
                    ? 0
                    : a.optional && !b.optional
                    ? 1
                    : -1
            )
        );
    }

    /**
     * sets the private static client field of the class.
     * @param client the client
     * @returns this instance
     */
    public static setClient(client: AeroClient) {
        Arguments.client = client;

        return this;
    }
}
