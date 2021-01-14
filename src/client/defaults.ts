import { MessageEmbed } from "discord.js";
import ms from "ms";
import AeroClient from "../AeroClient";

/**
 * Registers the default commands to the provided AeroClient.
 * @param client the client to register commands to
 */
export default function registerDefaults(client: AeroClient) {
    client.registerCommand({
        name: "setprefix",
        args: true,
        usage: "<prefix>",
        category: "utility",
        cooldown: 1,
        guildOnly: true,
        description: "sets the prefix for this server.",
        permissions: ["ADMINISTRATOR"],
        guarded: true,
        async callback({ message, args, client }) {
            if (!message.guild) return;

            if (!message.member?.hasPermission("ADMINISTRATOR")) return message.channel.send("Sorry, you don't have permission.");

            client.prefixes.set(message.guild?.id, args[0]);

            return message.channel.send(`:white_check_mark: Set the prefix to \`${args[0]}\``);
        },
    });

    client.registerCommand({
        name: "setlocale",
        args: true,
        minArgs: 1,
        usage: "<ar|en|fr|zh|pt|ru|es>",
        category: "utility",
        description: "sets your locale for the bot's responses to you",
        details: "depending on your locale, the bot will respond to you in different languages.",
        guarded: true,
        async callback({ message, args }): Promise<any> {
            const locales: string[] = ["ar", "en", "fr", "zh", "de", "pt", "ru", "es"];

            if (!locales.includes(args[0].toLowerCase())) {
                return message.reply(`invalid locale. the valid locales are: \`${locales.join(", ")}\``);
            }
            await client.localeStore.set(message.author.id, args[0]);
            message.reply(`set your preferred locale to ${args[0]}`);
        },
    });

    client.registerCommand({
        name: "getlocale",
        category: "utility",
        cooldown: 5,
        guarded: true,
        async callback({ message }) {
            const userLocale = await client.localeStore.get(message.author.id);
            message.reply(
                userLocale
                    ? `your locale is set to: \`${await client.localeStore.get(message.author.id)}\`.`
                    : `you don't have a locale set. use \`${
                          (await client.prefixes.get(message.guild ? message.guild.id : "")) || "!"
                      }setlocale <locale>\` to set your locale.`
            );
        },
    });

    client.registerCommand({
        name: "disable",
        minArgs: 1,
        guildOnly: true,
        category: "utility",
        cooldown: 1,
        usage: "<command name>",
        guarded: true,
        permissions: ["ADMINISTRATOR"],
        async callback({ message, args }): Promise<any> {
            const guildDisabledCommands = ((await client.disabledCommands.get(message.guild!.id)) || "").split(",");
            let updated: boolean = false;
            client.commands.forEach(
                async (c): Promise<any> => {
                    if (c.name.toLowerCase() === args[0].toLocaleLowerCase()) {
                        if (!guildDisabledCommands.includes(c.name.toLowerCase())) {
                            if (c.guarded) {
                                return message.channel.send(
                                    client.clientOptions.responses?.guarded
                                        ? client.clientOptions.responses.guarded
                                        : "This command is guarded and cannot be disabled."
                                );
                            }
                            guildDisabledCommands.push(c.name.toLowerCase());
                            updated = true;
                            return await client.disabledCommands.set(message.guild!.id, guildDisabledCommands.join(","));
                        }
                    }
                }
            );
            if (updated) return message.reply(`disabled command ${args[0].toLowerCase()} for this server.`);
        },
    });

    client.registerCommand({
        name: "enable",
        minArgs: 1,
        guildOnly: true,
        category: "utility",
        cooldown: 1,
        usage: "<command name>",
        guarded: true,
        permissions: ["ADMINISTRATOR"],
        async callback({ message, args }): Promise<any> {
            let guildDisabledCommands = ((await client.disabledCommands.get(message.guild!.id)) || "").split(",");
            let updated: boolean = false;
            client.commands.forEach(
                async (c): Promise<any> => {
                    if (c.name.toLowerCase() === args[0].toLowerCase()) {
                        if (guildDisabledCommands.includes(c.name.toLowerCase())) {
                            guildDisabledCommands.splice(guildDisabledCommands.indexOf(c.name), 1);
                            updated = true;
                            return await client.disabledCommands.set(message.guild!.id, guildDisabledCommands.join(","));
                        }
                    }
                }
            );
            if (updated) return message.reply(`enabled command ${args[0].toLowerCase()} for this server.`);
        },
    });

    client.registerCommand({
        name: "help",
        aliases: ["commands"],
        usage: "[command]",
        category: "utility",
        cooldown: 1,
        guarded: true,
        async callback({ message, args, client }) {
            const { commands } = client;

            const categories = new Set<string>();

            commands.forEach((cmd) => (cmd.category ? categories.add(cmd.category) : null));

            const prefix = message.guild ? (await client.prefixes.get(message.guild?.id)) || client.defaultPrefix : client.defaultPrefix;

            const uncategorized = client.commands
                .filter((cmd) => typeof cmd.category === "undefined")
                .map((cmd) => `\`${cmd.name}\``)
                .join("\n");

            const fields = Array.from(categories).map((cat) => ({
                name: cat.toLowerCase(),
                value:
                    client.commands
                        .filter((cmd) => cmd.category === cat && !cmd.hidden)
                        .map((cmd) => `\`${cmd.name}\``)
                        .join("\n") || "None",
                inline: true,
            }));

            if (uncategorized)
                fields.push({
                    name: "uncategorized",
                    value: uncategorized,
                    inline: true,
                });

            if (!args.length) {
                return message.channel.send(
                    new MessageEmbed()
                        .setTitle("Help")
                        .setColor("RANDOM")
                        .setDescription(`Use \`${prefix}help <command>\` for info on a specific command!`)
                        .setTimestamp(message.createdAt)
                        .addFields(fields)
                );
            }

            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find((c) => !!(c.aliases && c.aliases.includes(name)));

            if (!command) {
                message.channel.send(`Couldn't find the command \`${name}\`!`);
                return "invalid";
            }

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(`Info for ${command.name}`)
                    .addField("Aliases", command.aliases ? command.aliases.map((a) => `\`${a}\``).join("\n") : "None")
                    .addField("Description", command.description || "None")
                    .addField("Details", command.details || "None")
                    .addField("Usage", `\`${prefix}${command.name}${command.usage ? " " + command.usage : ""}\``)
                    .addField("Category", command.category ? command.category.toLowerCase() : "None", true)
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
