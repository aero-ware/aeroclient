import { MessageEmbed } from "discord.js";
import ms from "ms";
import AeroClient from "../AeroClient";

export default function registerDefaults(client: AeroClient) {
    client.registerCommand({
        name: "setprefix",
        args: true,
        usage: "<prefix>",
        category: "utility",
        cooldown: 1,
        guildOnly: true,
        async callback({ message, args, client }) {
            if (!message.guild) return;

            if (!message.member?.hasPermission("ADMINISTRATOR"))
                return message.channel.send("Sorry, you don't have permission.");

            client.prefixes.set(message.guild?.id, args[0]);

            return message.channel.send(`:white_check_mark: Set the prefix to \`${args[0]}\``);
        },
    });

    client.registerCommand({
        name: "help",
        aliases: ["commands"],
        usage: "[command]",
        category: "utility",
        cooldown: 1,
        async callback({ message, args, client }) {
            const { commands } = client;

            const categories = new Set<string>();

            commands.forEach((cmd) => (cmd.category ? categories.add(cmd.category) : null));

            const prefix = message.guild
                ? (await client.prefixes.get(message.guild?.id)) || client.clientOptions.prefix
                : client.clientOptions.prefix;

            if (!args.length) {
                return message.channel.send(
                    new MessageEmbed()
                        .setTitle("Help")
                        .setColor("RANDOM")
                        .setDescription(
                            `Use \`${prefix}help <command>\` for info on a specific command!`
                        )
                        .setTimestamp(message.createdAt)
                        .addFields(
                            Array.from(categories).map((cat) => ({
                                name: cat.toLowerCase(),
                                value: client.commands
                                    .filter((cmd) => cmd.category === cat && !cmd.hidden)
                                    .map((cmd) => `\`${cmd.name}\``)
                                    .join("\n"),
                                inline: true,
                            }))
                        )
                        .addField(
                            "uncategorized commands",
                            client.commands
                                .filter((cmd) => typeof cmd.category === "undefined")
                                .map((cmd) => `\`${cmd.name}\``)
                                .join("\n")
                        )
                );
            }

            const name = args[0].toLowerCase();
            const command =
                commands.get(name) ||
                commands.find((c) => !!(c.aliases && c.aliases.includes(name)));

            if (!command) {
                message.channel.send(`Couldn't find the command \`${name}\`!`);
                return "invalid";
            }

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(`Info for ${command.name}`)
                    .addField(
                        "Aliases",
                        command.aliases ? command.aliases.map((a) => `\`${a}\``).join("\n") : "None"
                    )
                    .addField("Description", command.description || "None")
                    .addField("Details", command.details || "None")
                    .addField("Usage", `\`${prefix}${command.name} ${command.usage}\``)
                    .addField(
                        "Category",
                        command.category ? command.category.toLowerCase() : "None",
                        true
                    )
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
