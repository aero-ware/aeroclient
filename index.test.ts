import { config as dotenv } from "dotenv";
import AeroClient from "./src";

dotenv();

const client = new AeroClient({
    token: process.env.TOKEN,
    logging: true,
    useDefault: true,
});

client.registerCommand({
    name: "die",
    callback({ message }) {
        message.reply("no u");
    },
});
