import hljs from "highlight.js";
import React, { useEffect } from "react";
import "./App.css";
import "./docs.css";
import Header from "./header/Header";
import "./hl.css";
import "./sidebar.css";

function App() {
    useEffect(() => {
        hljs.configure({
            languages: ["typescript"],
        });

        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightBlock(block as HTMLElement);
        });

        const hash = window.location.hash.slice(1);

        const element = document.getElementById(hash);

        if (element)
            setImmediate(() =>
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            );
    }, []);

    return (
        <div className="App">
            <Header />
            <aside className="sidebar">
                <div className="viewport">
                    <main className="sidebar-links">
                        <a href="#welcome">Welcome</a>
                        <br />
                        <a href="#documentation">Documentation</a>
                        <br />
                        <div className="t">
                            <a href="#aeroclient">AeroClient</a>
                            <br />
                            <div className="t">
                                <a href="#options">Options</a>
                                <br />
                                <a href="#properties">Properties</a>
                                <br />
                                <a href="#methods">Methods</a>
                                <br />
                                <a href="#middleware">Middleware</a>
                                <br />
                            </div>
                            <a href="#command">Command</a>
                            <br />
                            <a href="#usage">Usage</a>
                            <div className="t">
                                <a href="#commands">Commands</a>
                                <br />
                                <a href="#events">Events</a>
                                <br />
                                <a href="#messages">Messages</a>
                                <br />
                                <a href="#locales">Locales</a>
                            </div>
                            <a href="#logger">Logger</a>
                            <br />
                            <div className="t">
                                <a href="#logger-methods">Methods</a>
                                <br />
                            </div>
                            <a href="#utils">utils</a>
                            <br />
                            <div className="t">
                                <a href="#input">Input</a>
                                <br />
                                <a href="#parsing">Parsing</a>
                                <br />
                                <a href="#timing">Timing</a>
                                <br />
                                <div className="t">
                                    <a href="#stopwatch">Stopwatch</a>
                                    <div className="t">
                                        <a href="#stopwatch-properties">Properties</a>
                                        <br />
                                        <a href="#stopwatch-methods">Methods</a>
                                    </div>
                                </div>
                                <a href="#pagination">Pagination</a>
                                <br />
                                <div className="t">
                                    <a href="#pagination-options">Options</a>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </aside>
            <article className="docs">
                <div className="viewport">
                    <div>
                        <div className="welcome">
                            <h2>
                                <a id="welcome" href="#welcome">
                                    #
                                </a>{" "}
                                Welcome!
                            </h2>
                            <p>
                                Welcome to the AeroClient v1 documentation.
                                <br />
                                <a href="#documentation" className="red">
                                    Click here skip the welcome section.
                                </a>
                            </p>
                            <h3>About</h3>
                            <p>
                                AeroClient is a discord.js framework that focuses on customization.
                                <br />
                                It is fully customizable due to the many options and flags you can set.
                                <br />
                                AeroClient also features something new in discord.js frameworks: middleware.
                            </p>
                            <p>In short, AeroClient is</p>
                            <ul>
                                <li>modular;</li>
                                <li>performant;</li>
                                <li>flexible;</li>
                                <li>and easy to use.</li>
                            </ul>
                            <p>Also, since AeroClient is written in TypeScript, it provides it's own typings.</p>
                            <h3>Example (using ES6 import/export)</h3>
                            <pre>
                                <code>
                                    {`\
import AeroClient from "@aeroware/aeroclient";

// create a client with default settings and commands
const client = new AeroClient({
    token: "token",
    prefix: "prefix",
    useDefaults: true,
    logging: true,
});`}
                                </code>
                            </pre>
                            <h3>Included Packages</h3>
                            <p>
                                <a href="http://npmjs.com/package/@aeroware/logger" target="_blank" rel="noreferrer" className="red">
                                    @aeroware/logger
                                </a>
                                <br />
                                AeroWare's own extremely minimal logging utility.
                            </p>
                            <p>
                                <a href="http://npmjs.com/package/@aeroware/discord-utils" target="_blank" rel="noreferrer" className="red">
                                    @aeroware/discord-utils
                                </a>
                                <br />
                                AeroWare's small package that contains many utilities for discord.js
                            </p>
                            <p>
                                <a href="http://npmjs.com/package/date-fns" target="_blank" rel="noreferrer" className="red">
                                    date-fns
                                </a>
                                <br />A formatting utility for dates and time.
                            </p>
                            <p>
                                <a href="http://npmjs.com/package/ms" target="_blank" rel="noreferrer" className="red">
                                    ms
                                </a>
                                <br />A small utility to convert strings to milliseconds and back.
                            </p>
                            <p>
                                <a href="http://npmjs.com/package/keyv" target="_blank" rel="noreferrer" className="red">
                                    keyv
                                </a>
                                <br />A key-value based in-memory storage that can be persistent.
                            </p>
                        </div>
                        <div className="documentation">
                            <h2>
                                <a id="documentation" href="#documentation" className="red">
                                    #
                                </a>{" "}
                                Documentation
                            </h2>
                            <h3>
                                <a id="aeroclient" href="#aeroclient" className="red">
                                    #
                                </a>{" "}
                                AeroClient
                            </h3>
                            <h4>Constructor</h4>
                            <p>
                                The constructor takes two arguments: AeroClient options, and{" "}
                                <a href="https://discord.js.org/#/docs/main/stable/class/Client">Client</a> options.
                                <br />
                                It's less confusing and easy to manage.
                            </p>
                            <pre>
                                <code>
                                    {`\
new AeroClient(clientOptions, options);
`}
                                </code>
                            </pre>
                            <span className="red">@param</span> <code>clientOptions</code> – AeroClient options
                            <br />
                            <span className="red">@param</span> <code>options</code> –{" "}
                            <a href="https://discord.js.org/#/docs/main/stable/class/Client">Client</a> options
                            <h4 id="options">AeroClientOptions</h4>
                            <p>
                                Keep in mind that all of these are <em>optional</em>, but some of them are recommended.
                            </p>
                            <ul>
                                <li>
                                    <code>token</code> – The client's token
                                </li>
                                <li>
                                    <code>prefix</code> – The client's prefix
                                </li>
                                <li>
                                    <code>logging</code> – Flag to enable logging
                                </li>
                                <li>
                                    <code>loggerHeader</code> – The client's logger's header
                                </li>
                                <li>
                                    <code>loggerShowFlags</code> – Recommended if your terminal doesn't have colors
                                </li>
                                <li>
                                    <code>commandsPath</code> – Path where all your command files are found
                                </li>
                                <li>
                                    <code>eventsPath</code> – Path where all your event files are found
                                </li>
                                <li>
                                    <code>messagesPath</code> – Path where your predefined custom response messages are
                                </li>
                                <li>
                                    <code>languagesPath</code> – Path where your predefined translated messages are
                                </li>
                                <li>
                                    <code>connectionUri</code> – A uri to connect to your database so AeroClient can store data
                                </li>
                                <li>
                                    <code>useDefaults</code> – Flag to enable default commands and settings
                                </li>
                                <li>
                                    <code>persistentCooldowns</code> – Flag to enable persistent cooldowns
                                </li>
                                <li>
                                    <code>responses</code> – Response info
                                </li>
                                <ul>
                                    <li>
                                        <code>cooldown</code> – Reponse to send when the command is on cooldown
                                    </li>
                                    <li>
                                        <code>error</code> – Response to send when an error occurs
                                    </li>
                                    <li>
                                        <code>usage</code> – Response to send when the usage is incorrect
                                    </li>
                                    <li>
                                        <code>nsfw</code> – Response to send when an NSFW command is used in a SFW channel
                                    </li>
                                    <li>
                                        <code>guild</code> – Response to send when a guild only command is used in a direct message
                                    </li>
                                    <li>
                                        <code>dm</code> – Response to send when a direct message only command is used in a guild
                                    </li>
                                    <li>
                                        <code>staff</code> – Response to send when a non-staff user attempts to use a staff only command
                                    </li>
                                </ul>
                                <li>
                                    <code>staff</code> – Array of strings of staff ids
                                </li>
                                <li>
                                    <code>customHandler</code> – A callback to use instead of our command handler
                                </li>
                                <li>
                                    <code>readyCallback</code> – A callback to use instead of our ready event callback
                                </li>
                            </ul>
                            <h4>ClientOptions</h4>
                            <p>
                                View the discord.js docs <a href="https://discord.js.org/#/docs/main/stable/typedef/ClientOptions">here</a>.
                            </p>
                            <h4 id="properties">Properties</h4>
                            <ul>
                                <li>
                                    <code>commands</code> – Collection of all stored commands
                                </li>
                                <li>
                                    <code>logger</code> – Logger used to log events
                                </li>
                                <li>
                                    <code>prefixes</code> – Keyv that stores prefixes for each guild
                                </li>
                                <li>
                                    <code>clientOptions</code> – The client options that were passed into the constructor
                                </li>
                                <li>
                                    <code>localeStore</code> – Stored locales for each user
                                </li>
                                <li>
                                    <code>locales</code> – Stored translated resopnses
                                </li>
                            </ul>
                            <h4 id="methods">Methods</h4>
                            <pre>
                                <code>{`\
registerCommand(command)
`}</code>
                            </pre>
                            <p>
                                Registers a command object into the client's <code>commands</code> property.
                            </p>
                            <span className="red">@param</span> <code>command</code> – Command object to register
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
loadCommands(directory)
`}</code>
                            </pre>
                            <p>Registers all commands in a directory.</p>
                            <span className="red">@param</span> <code>directory</code> – Directory to load
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
loadEvents(directory)
`}</code>
                            </pre>
                            <p>Registers all events in a directory.</p>
                            <span className="red">@param</span> <code>directory</code> – Directory to load
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
loadMessages(directory)
`}</code>
                            </pre>
                            <p>Loads a JSON file with the custom messages.</p>
                            <span className="red">@param</span> <code>path</code> – Path to the JSON file
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
loadLocales(directory)
`}</code>
                            </pre>
                            <p>Registers all locales in a directory.</p>
                            <span className="red">@param</span> <code>directory</code> – Directory to load
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
paginate(message, pages, options)
`}</code>
                            </pre>
                            <p>
                                The docs for this method are <a href="#pagination">here</a>.
                            </p>
                            <h4 id="middleware">Middleware</h4>
                            <p>
                                AeroClient introduces something new in discord.js frameworks.
                                <br />
                                This something new is called middleware. If you have used express you may know what it is,
                                <br />
                                but if you don't, we will explain.
                                <br />
                                Middleware in our framework refers to a function that runs right before command execution.
                                <br />
                                They are also is executed in the order you used them, and they change AeroClient's behaviour.
                            </p>
                            <p>First, let's see the method to use middleware.</p>
                            <pre>
                                <code>{`\
use(middleware)
`}</code>
                            </pre>
                            <p>Applies middleware to the client.</p>
                            <span className="red">@param</span> <code>middleware</code> – The middleware function
                            <br />
                            <p>
                                The middleware function will get two parameters.
                                <br />
                                The first is the context object and the second is a function.
                            </p>
                            <pre>
                                <code>{`\
client.use(({ message }, next) => {
    if (message.content.includes("some bad word")) {
        message.reply("no u");
        next(true);
    }
});
`}</code>
                            </pre>
                            <p>The context object has three properties. The message, the arguments for the command, and the command object itself.</p>
                            <p>
                                Calling the next function without any parameters will allow other middleware to execute, like express.
                                <br />
                                However, if you pass in <code>true</code>, the middleware stops command execution as well.
                            </p>
                            <p>
                                In the above example, if a message contains <code>some bad word</code>, the client will reply <code>no u</code> and stop command
                                execution.
                                <br />
                                This means that even if the user used <code>!help some bad word</code>, the client will not execute the help command.
                            </p>
                            <h3 id="command">The Command type</h3>
                            <h4>Properties</h4>
                            <ul>
                                <li>
                                    <code>name</code> – Name of the command
                                </li>
                                <li>
                                    <code>aliases</code> – Aliases of the command
                                </li>
                                <li>
                                    <code>category</code> – The command's category
                                </li>
                                <li>
                                    <code>args</code> – If arguments are required
                                </li>
                                <li>
                                    <code>minArgs</code> – Minimum amount of arguments required
                                </li>
                                <li>
                                    <code>maxArgs</code> – Maximum amount of arguments required
                                </li>
                                <li>
                                    <code>usage</code> – The command's usage
                                </li>
                                <li>
                                    <code>cooldown</code> – Cooldown in seconds
                                </li>
                                <li>
                                    <code>description</code> – Short description of the command
                                </li>
                                <li>
                                    <code>details</code> – Long description of the command
                                </li>
                                <li>
                                    <code>guildOnly</code> – If the command can only be executed in a guild
                                </li>
                                <li>
                                    <code>staffOnly</code> – If the command can only be executed by staff
                                </li>
                                <li>
                                    <code>dmOnly</code> – If the command can only be executed in a direct message
                                </li>
                                <li>
                                    <code>nsfw</code> – If the command can only be executed in an NSFW channel
                                </li>
                                <li>
                                    <code>hidden</code> – If the command should be hidden from the default help command
                                </li>
                            </ul>
                            <h4>Methods</h4>
                            <pre>
                                <code>{`\
callback(context)
`}</code>
                            </pre>
                            <p>The callback takes one parameter, the context object. Its properties are listed below.</p>
                            <ul>
                                <li>
                                    <code>message</code> – The message obejct from the message event
                                </li>
                                <li>
                                    <code>args</code> – The arguments for the command
                                </li>
                                <li>
                                    <code>client</code> – The AeroClient instance
                                </li>
                                <li>
                                    <code>text</code> – Full message content. Same as <code>message.content</code>.
                                </li>
                            </ul>
                            <span className="red">@param</span> <code>context</code> – The context object
                            <br />
                            <h3 id="usage">Usage</h3>
                            <h4 id="commands">Commands</h4>
                            <p>
                                AeroClient supports two ways for declaring commands.
                                <br />
                                The first way we shall look at is <code>client.registerCommand</code>
                            </p>
                            <pre>
                                <code>{`\
client.registerCommand({
    name: "hello",
    callback({ message }) {
        message.reply("hi!");
    }
})
`}</code>
                            </pre>
                            <p>You can also wrap it in a function and export it from another file.</p>
                            <pre>
                                <code>{`\
module.exports = (client) => {
    client.registerCommand({
        name: "hello",
        callback({ message }) {
            message.reply("hi!");
        }
    })
}
`}</code>
                            </pre>
                            <p>Or export the command object itself.</p>
                            <pre>
                                <code>{`\
module.exports = {
    name: "hello",
    callback({ message }) {
        message.reply("hi!");
    }
}
`}</code>
                            </pre>
                            <p>Generally the second method is preferred since it is more concise.</p>
                            <h4 id="events">Events</h4>
                            <p>AeroClient also supports individual event files.</p>
                            <p>In each file, there should be one export. An example is show below.</p>
                            <pre>
                                <code>{`\
module.exports = {
    name: "guildMemberAdd",
    once: false,
    callback(member) {
        member.user.send("hello");
    }
}
`}</code>
                            </pre>
                            <p>There are three properties. The name, whether if should execute once, and finally, the callback to execute.</p>
                            <h4 id="messages">Messages</h4>
                            <p>AeroClient allows you to configure response messages with a JSON file.</p>
                            <p>
                                Simple add the path to the JSON file in as the <code>messagesPath</code> option.
                            </p>
                            <h4 id="locales">Locales and translated responses</h4>
                            <p>
                                AeroClient supports a number of locales.
                                <br />
                                Your translated messages should be contained in a JSON file with the locale as the name.
                                <br />
                                For example, a JSON file with French translations would be named <code>fr.json</code>.
                                <br />
                                AeroClient will automatically load all support locales if you add the <code>languagesPath</code> option.
                            </p>
                            <h3 id="logger">Logger</h3>
                            <p>
                                The Logger class is a simple logger that can be configured easily.
                                <br />
                                Logger instances only have methods and do not have properties.
                            </p>
                            <h4>Constructor</h4>
                            <pre>
                                <code>{`\
new Logger(header, showFlags)
`}</code>
                                <span className="red">@param</span> <code>header</code> – Custom header for the logger. Defaults to <code>logger</code>.
                                <span className="red">@param</span> <code>showFlags</code> – Flag to show flags or not.
                            </pre>
                            <h4 id="logger-methods">Methods</h4>
                            <pre>
                                <code>{`\
success(message)
`}</code>
                            </pre>
                            <p>Logs a message in green.</p>
                            <span className="red">@param</span> <code>message</code> – Message to log
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
info(message)
`}</code>
                            </pre>
                            <p>Logs a message in blue.</p>
                            <span className="red">@param</span> <code>message</code> – Message to log
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
warn(message)
`}</code>
                            </pre>
                            <p>Logs a message in yellow.</p>
                            <span className="red">@param</span> <code>message</code> – Message to log
                            <br />
                            <br />
                            <br />
                            <pre>
                                <code>{`\
error(message)
`}</code>
                            </pre>
                            <p>Logs a message in red.</p>
                            <span className="red">@param</span> <code>message</code> – Message to log
                            <br />
                            <h3 id="utils">utils – Coming soon!</h3>
                            <h4 id="input">Input</h4>
                            <h4 id="parsing">Parsing</h4>
                            <h4 id="timing">Timing</h4>
                            <h4 id="pagination">Pagination</h4>
                        </div>
                        <div
                            className="footer"
                            id="footer"
                            style={{
                                opacity: 0.5,
                                fontSize: "1rem",
                                paddingTop: "2rem",
                            }}
                        >
                            Copyright 2021 &copy; AeroWare
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default App;
