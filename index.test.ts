import { config as dotenv } from "dotenv";
import { createJSDocCallbackTag } from "typescript";
import AeroClient from "./src";

dotenv();

const client = new AeroClient({
    token: process.env.TOKEN,
    logging: true,
    useDefaults: true,
    persistentCooldowns: true,
});

client.use(({ args, message, command }, next) => {
    if (message.content.includes("fuck")) {
        message.reply("since ur rude, im not executing that command");
        next(true);
    }
});

client.registerCommand({
    name: "die",
    cooldown: 15,
    args: true,
    minArgs: 2,
    maxArgs: 3,
    callback({ message }) {
        message.reply("no u");
    },
});

client.registerCommand({
    name: "setlocale",
    args: true,
    minArgs: 1,
    async callback({ message, args }): Promise<any | void> {
        const locales: string[] = [
            "ar",
            "en",
            "fr",
            "zh",
            "de",
            "pt",
            "ru",
            "es",
        ];

        if (!locales.includes(args[0].toLowerCase())) {
            return message.reply(`invalid locale. the valid locales are: \`${locales.join(', ')}\``);
        }
        await client.localeDB.set(message.author.id, args[0]);
        message.reply(`set your preferred locale to ${args[0]}`);
    }
})

client.registerCommand({
    name: "getlocale",
    async callback({ message }) {
        const userLocale = await client.localeDB.get(message.author.id);
        message.reply(
            userLocale ?
            `your locale is set to: \`${await client.localeDB.get(message.author.id)}\`.`
            : `you don't have a locale set. use \`${await client.prefixes.get(message.guild ? message.guild.id : '') || '!'}setlocale <locale>\` to set your locale.`
        );
    }
})