import { config as dotenv } from "dotenv";
import AeroClient from "./src";

dotenv();

const client = new AeroClient({
    token: process.env.TOKEN,
    logging: true,
    useDefault: true,
    persistentCooldowns: true,
});

client.registerCommand({
    name: "die",
    cooldown: 15,
    callback({ message }) {
        message.reply("no u");
    },
});
