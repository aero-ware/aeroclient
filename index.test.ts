import { config as dotenv } from "dotenv";
import AeroClient, { AeroEmbed } from "./src";

dotenv();

const client = new AeroClient({
    prefix: ".",
    token: process.env.TOKEN,
    useDefaults: true,
    logChannel: "804819759706669137",
});

client.on("ready", async () => {
    (await client.guilds.fetch("804819758775533588")).me?.setNickname("BETA TESTING");
});

client.use(({ message }, next, stop) => {
    if (!["508442553754845184", "564930157371195437"].includes(message.author.id))
        return stop();

    return next();
});

client.registerCommand({
    name: "embed",
    async callback({ message, args }) {
        message.channel.send(
            new AeroEmbed().setTitle("Test").threeByThree([
                [
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                ],
                [
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                ],
                [
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                    {
                        name: "test",
                        value: "test",
                    },
                ],
            ])
        );
    },
});

client.registerCommand({
    name: "test",
    category: "test",
    async callback() {},
});
