import AeroClient, { Arguments } from "./src";

const client = new AeroClient({
    token: "ODA5NTQ4MzM1MzQ5NDk3ODY3.YCWsow.OZE0kAIBzoas75m_IbwiDtbiRFY",
    prefix: "!",
});

Arguments.setClient(client);

const regex = Arguments.compile(`<user> [reason]`, {
    reason: "string",
});

client.registerCommand({
    name: "test",
    async callback({ message, args }) {
        if (!(await regex.test(message, args))) return message.channel.send(`u fucked up the arguments dumbass`);

        const o = await regex.parse(message, args);

        console.log(o);

        return message.channel.send(`congrats u passed in the right args`);
    },
});
