import ac, { Arguments } from "./src";

const c = new ac({
    token: "ODA5NTQ4MzM1MzQ5NDk3ODY3.YCWsow.PZq9iiTj2nQaPBQmdVieMz5TlOg",
    prefix: "!",
});

Arguments.use(c);

c.registerCommand({
    name: "test",
    metasyntax: Arguments.compile(`<user> [lol]`, {
        lol: "duration",
    }),
    async callback({ message, args, parsed }) {
        await message.channel.send("Arguments: " + args.join(" "));
        await message.channel.send("Parsed Arguments:" + parsed!.join(" ") || "_ _");
    },
});
