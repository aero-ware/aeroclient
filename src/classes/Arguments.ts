import { Channel, GuildMember, Message, Role, User } from "discord.js";
import ms from "ms";
import AeroClient from "..";

type ArgumentType =
    | "member"
    | "user"
    | "role"
    | "channel"
    | "number"
    | "integer"
    | "string"
    | "boolean"
    | "duration"
    | "date"
    | string;

type Lex = {
    type: ArgumentType;
    optional: boolean;
    or: { type: ArgumentType; literal: boolean }[];
    literal: boolean;
};

const validArgTypes = ["member", "user", "role", "channel", "number", "integer", "string", "boolean", "duration", "date"];

/**
 * The Arguments class validates and parses arguments according to a constructed lexicon.
 *
 * To create an Arguments instance, either use
 * - Arguments.compile
 * - Arguments.from
 *
 * @class
 */
export default class Arguments {
    private static client: AeroClient | undefined;

    private readonly lexicon: Lex[];

    private readonly __source__: string;

    private constructor(lexicon: Lex[], source: string) {
        if (!Arguments.client) throw new Error("Cannot compile if an AeroClient is not supplied.");

        this.__source__ = source;

        this.lexicon = lexicon;
    }

    public get source() {
        return this.__source__;
    }

    public toString() {
        return this.__source__;
    }

    public valueOf() {
        return this.__source__;
    }

    /**
     * Tests a given message with the command arguments for matching the lexicon.
     *
     * @param message The message for context.
     *
     * @param args The command arguments.
     *
     * @returns If the arguments matched the lexicon.
     */
    public async test(message: Message, args: string[]) {
        if (this.requiredArgsLength > args.length) return false;

        async function check(arg: string, lex: Lex) {
            const notOr = !lex.or.some(
                async (t) =>
                    !(await check(arg, {
                        optional: lex.optional,
                        or: [],
                        type: t.type,
                        literal: lex.literal,
                    }))
            );

            if (lex.literal) {
                if (arg !== lex.type && notOr) return false;
            } else
                switch (lex.type) {
                    case "integer":
                        if (!parseInt(arg) && notOr) return false;
                        break;
                    case "number":
                        if (!parseFloat(arg) && notOr) return false;
                        break;
                    case "string":
                        break;
                    case "channel":
                        try {
                            if (!(await Arguments.client!.channels.fetch(arg.match(/(\d{18})/)?.[0] || "")) && notOr)
                                return false;
                        } catch {
                            return false;
                        }
                        break;
                    case "role":
                        if (!message.guild) return false;
                        try {
                            if (!(await message.guild.roles.fetch(arg.match(/(\d{18})/)?.[0] || "")) && notOr) return false;
                        } catch {
                            return false;
                        }
                        break;
                    case "member":
                        if (!message.guild) return false;
                        try {
                            if (!(await message.guild.members.fetch(arg.match(/(\d{18})/)?.[0] || "")) && notOr) return false;
                        } catch {
                            return false;
                        }
                        break;
                    case "user":
                        try {
                            if (!(await Arguments.client!.users.fetch(arg.match(/(\d{18})/)?.[0] || "")) && notOr) return false;
                        } catch {
                            return false;
                        }
                        break;
                    case "boolean":
                        if (!/((y(es)?)|(enabled?)|(on)|(true))|((no?)|(disabled?)|(off)|(false))/.test(arg) && notOr)
                            return false;
                        break;
                    case "duration":
                        if (!ms(arg) && notOr) return false;
                        break;
                    case "date":
                        if (
                            !/\d\d\/\d\d\/\d\d\d\d/.test(arg) &&
                            !/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/.test(
                                arg
                            ) &&
                            notOr
                        )
                            return false;
                        break;
                }

            return true;
        }

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const lex = this.lexicon[i];

            if (!(await check(arg, lex))) return false;
        }

        return true;
    }

    /**
     * Parses the arguments and returns an array with the parsed values.
     * @param message The message for context.
     * @param args The command arguments.
     * @returns The parsed values, or an empty array if the arguments did not match the lexicon.
     */
    public async parse(message: Message, args: string[]) {
        if (!(await this.test(message, args))) return [];

        const objects: (number | string | Role | Channel | GuildMember | User | Date | boolean | undefined)[] = [];

        async function parseArg(
            arg: string,
            lex: Lex
        ): Promise<number | string | Role | Channel | GuildMember | User | Date | boolean | undefined> {
            const or = await lex.or.reduce<
                Promise<number | string | Role | Channel | GuildMember | User | Date | boolean | undefined> | undefined
            >(
                async (_, t) =>
                    await parseArg(arg, {
                        optional: lex.optional,
                        or: [],
                        type: t.type,
                        literal: lex.literal,
                    }),
                undefined
            );

            switch (lex.type) {
                case "integer":
                    return parseInt(arg) || or;
                case "number":
                    return parseFloat(arg) || or;
                case "string":
                    return arg || or;
                case "channel":
                    try {
                        return (await Arguments.client!.channels.fetch(arg.match(/(\d{18})/)?.[0] || "")) || or;
                    } catch {
                        return or;
                    }
                case "role":
                    if (!message.guild) {
                        return or;
                    }
                    try {
                        return (await message.guild.roles.fetch(arg.match(/(\d{18})/)?.[0] || "")) || or;
                    } catch {
                        return or;
                    }
                case "member":
                    if (!message.guild) {
                        return or;
                    }
                    try {
                        return (await message.guild.members.fetch(arg.match(/(\d{18})/)?.[0] || "")) || or;
                    } catch {
                        return or;
                    }
                case "user":
                    try {
                        return (await Arguments.client!.users.fetch(arg.match(/(\d{18})/)?.[0] || "")) || or;
                    } catch {
                        return or;
                    }
                case "boolean":
                    if (/(^y(es)?$)|(^enabled?$)|(^on$)|(^true$)/.test(arg)) return true;
                    else if (/(^no?$)|(^disabled?$)|(^off$)|(^false$)/.test(arg)) return false;
                    return or;
                case "duration":
                    return ms(arg) || or;
                case "date":
                    return new Date(arg).getTime() ? new Date(arg) : or;
                default:
                    return arg || or;
            }
        }

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const lex = this.lexicon[i];

            objects.push(await parseArg(arg, lex));
        }

        return objects;
    }

    /**
     * @private
     */
    private get requiredArgsLength() {
        return this.lexicon.filter((l) => !l.optional).length;
    }

    /**
     * @private
     */
    private get optionalArgsLength() {
        return this.lexicon.filter((l) => l.optional).length;
    }

    /**
     * Compiles a string in argument syntax into an Arguments instance with the matching lexicon.
     *
     * - Wrap an argument in angle brackets `<>` for a required argument.
     *
     * - Wrap an argument in brackets `[]` for an optional argument.
     *
     * - Place `|` between types to accept either type.
     *
     * | Type        | Value       |
     * | ----------- | ----------- |
     * | "member"    | GuildMember |
     * | "user"      | User        |
     * | "role"      | Role        |
     * | "channel"   | Channel     |
     * | "number"    | Number      |
     * | "integer"   | Number      |
     * | "string"    | String      |
     * | "boolean"   | Boolean     |
     * | "duration"  | Number      |
     * | "date"      | Date        |
     * | "'literal'" | String      |
     *
     * @param string The argument syntax string.
     *
     * @param legend An object to use for pure type aliases.
     *
     * @example
     *
     * ```js
     * const argumentRegex = Arguments.compile(`<person>`, {
     *     person: "user",
     * });
     * ```
     */
    public static compile(string: string, legend?: { [key: string]: ArgumentType }) {
        const args = string.split(/\s+/);

        const lexicon: Lex[] = args.map((a) => {
            const or = a.slice(1, a.length - 1).split("|") as ArgumentType[];
            const literals: boolean[] = new Array(or.length).fill(false);
            let type = or.shift();
            let literal = false;

            if (!type) throw new Error(`Argument type is missing.`);

            const legendType = legend && legend[type];

            if (legendType && !validArgTypes.includes(legendType)) throw new Error(`Invalid argument type: '${legendType}'.`);

            if (!(a.startsWith("<") && a.endsWith(">")) && !(a.startsWith("[") && a.endsWith("]")))
                throw new Error("Invalid argument syntax.");

            if ((type.startsWith("'") && type.endsWith("'")) || (type.startsWith('"') && type.endsWith('"'))) {
                literal = true;
                type = type.slice(1, type.length - 1);
            }

            if (!validArgTypes.includes(type) && !legendType && !literal) throw new Error(`Invalid argument type: '${type}'.`);

            or.forEach((type, i) => {
                if (!type) throw new Error(`Argument type is missing.`);

                const legendType = legend && legend[type];

                if (legendType && !validArgTypes.includes(legendType))
                    throw new Error(`Invalid argument type: '${legendType}'.`);

                if (!(a.startsWith("<") && a.endsWith(">")) && !(a.startsWith("[") && a.endsWith("]")))
                    throw new Error("Invalid argument syntax.");

                if ((type.startsWith("'") && type.endsWith("'")) || (type.startsWith('"') && type.endsWith('"'))) {
                    literals[i] = true;
                    type = type.slice(1, type.length - 1);
                }

                if (type.split(/\s+/).length > 1) throw new Error(`Literals can't include whitespace.`);

                if (!validArgTypes.includes(type) && !legendType && !literals[i])
                    throw new Error(`Invalid argument type: '${type}'.`);
            });

            if (a.startsWith("<") && a.endsWith(">"))
                return {
                    type: (legendType || type) as ArgumentType,
                    optional: false,
                    or: or.map((o, i) => ({
                        type: o,
                        literal: literals[i],
                    })),
                    literal,
                };
            if (a.startsWith("[") && a.endsWith("]"))
                return {
                    type: (legendType || type) as ArgumentType,
                    optional: true,
                    or: or.map((o, i) => ({
                        type: o,
                        literal: literals[i],
                    })),
                    literal,
                };

            throw new Error("Invalid argument syntax.");
        });

        return new Arguments(
            lexicon.sort((a, b) => (a.optional === b.optional ? 0 : a.optional && !b.optional ? 1 : -1)),
            string
        );
    }

    /**
     * Creates an instance from a given lexicon.
     *
     * @param lexicon Lexicon to use.
     */
    public static from(lexicon: Lex[]) {
        return new Arguments(lexicon, "");
    }

    /**
     * Uses the provided client for interacting with the Discord API.
     *
     * @param client The client to use.
     * @returns Arguments
     */
    public static use(client: AeroClient) {
        Arguments.client = client;

        return Arguments;
    }
}
