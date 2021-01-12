import { config as dotenv } from "dotenv";
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
