import repl from "repl";
import AeroClient from "..";

export default function devOptions(client: AeroClient) {
    const options = client.clientOptions.dev!;

    if (options.eval) {
        if (options.eval.command) {
            client.registerCommand({
                name: "eval",
                aliases: ["exec"],
                args: true,
                usage: "<code>",
                category: "development",
                staffOnly: true,
                testOnly: true,
                hidden: true,
                async callback({ message, args }) {
                    try {
                        const code = args.join(" ");

                        return message.channel.send(
                            await new Promise((resolve, reject) => {
                                resolve(eval(`(async function () {${code}})()`));
                            })
                        );
                    } catch (e) {
                        return message.channel.send(e, { code: true });
                    }
                },
            });
        }
        if (options.eval.console) {
            repl.start().context.client = client;
        }
    }
    if (options.events) {
        if (options.events.debug) {
            client.on("debug", client.logger.info.bind(client));
        }
        if (options.events.error) {
            client.on("error", console.log.bind(console));
        }
    }

    return client;
}
