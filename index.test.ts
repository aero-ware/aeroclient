import ac from "./src";

const c = new ac({
    token: "ODA5NTQ4MzM1MzQ5NDk3ODY3.YCWsow.RkwLWQfOSXClBUwyC8MTVC21_r4",
    prefix: "!",
    useDefaults: true,
});

c.registerCommand({
    name: "test",
    serverCooldown: 10,
    async callback({ message }) {
        return message.channel.send(`this is a test command`);
    },
});
