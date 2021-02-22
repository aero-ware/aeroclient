import { Channel, GuildMember, Message, Role, User } from "discord.js";
import AeroClient from "..";

type ArgumentType = "member" | "user" | "role" | "channel" | "number" | "integer" | "string";

type Lex = {
    type: ArgumentType;
    optional: boolean;
};

const validArgTypes = ["member", "user", "role", "channel", "number", "integer", "string"];

export default class Arguments {
    private static client: AeroClient | undefined;

    private lexicon: Lex[];

    private constructor(lexicon: Lex[]) {
        if (!Arguments.client) throw new Error("Cannot compile if an AeroClient is not supplied.");

        this.lexicon = lexicon;
    }

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
                        if (!(await Arguments.client!.channels.fetch(arg.match(/(\d{18})/)?.[0] || ""))) return false;
                    } catch {
                        return false;
                    }
                    break;
                case "role":
                    if (!message.guild) return false;
                    try {
                        if (!(await message.guild.roles.fetch(arg.match(/(\d{18})/)?.[0] || ""))) return false;
                    } catch {
                        return false;
                    }
                    break;
                case "member":
                    if (!message.guild) return false;
                    try {
                        if (!(await message.guild.members.fetch(arg.match(/(\d{18})/)?.[0] || ""))) return false;
                    } catch {
                        return false;
                    }
                    break;
                case "user":
                    try {
                        if (!(await Arguments.client!.users.fetch(arg.match(/(\d{18})/)?.[0] || ""))) return false;
                    } catch {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    public async parse(message: Message, args: string[]) {
        if (!(await this.test(message, args))) return [];

        const objects: (number | string | Role | Channel | GuildMember | User | undefined)[] = [];

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
                        objects.push((await Arguments.client!.channels.fetch(arg.match(/(\d{18})/)?.[0] || "")) || undefined);
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "role":
                    if (!message.guild) return objects.push(undefined);
                    try {
                        objects.push((await message.guild.roles.fetch(arg.match(/(\d{18})/)?.[0] || "")) || undefined);
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "member":
                    if (!message.guild) return objects.push(undefined);
                    try {
                        objects.push((await message.guild.members.fetch(arg.match(/(\d{18})/)?.[0] || "")) || undefined);
                    } catch {
                        objects.push(undefined);
                    }
                    break;
                case "user":
                    try {
                        objects.push((await Arguments.client!.users.fetch(arg.match(/(\d{18})/)?.[0] || "")) || undefined);
                    } catch {
                        objects.push(undefined);
                    }
                    break;
            }
        }

        return objects;
    }

    private get requiredArgsLength() {
        return this.lexicon.filter((l) => !l.optional).length;
    }

    private get optionalArgsLength() {
        return this.lexicon.filter((l) => l.optional).length;
    }

    public static compile(string: string, legend?: { [key: string]: ArgumentType }) {
        const args = string.split(/\s+/);

        const lexicon: Lex[] = args.map((a) => {
            const type = a.slice(1, a.length - 1);
            const legendType = legend && legend[type];

            if (legendType && !validArgTypes.includes(legendType)) throw new Error(`Invalid argument type: '${legendType}'.`);

            if (!(a.startsWith("<") && a.endsWith(">")) && !(a.startsWith("[") && a.endsWith("]")))
                throw new Error("Invalid argument syntax.");

            if (!validArgTypes.includes(type) && !legendType) throw new Error(`Invalid argument type: '${type}'.`);

            if (a.startsWith("<") && a.endsWith(">")) return { type: (legendType || type) as ArgumentType, optional: false };
            if (a.startsWith("[") && a.endsWith("]")) return { type: (legendType || type) as ArgumentType, optional: true };

            throw new Error("Invalid argument syntax.");
        });

        return new Arguments(lexicon.sort((a, b) => (a.optional === b.optional ? 0 : a.optional && !b.optional ? 1 : -1)));
    }

    public static setClient(client: AeroClient) {
        Arguments.client = client;

        return this;
    }
}
