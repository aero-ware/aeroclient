import hljs from "highlight.js";
import React from "react";
import "./App.css";
import "./docs.css";
import Header from "./header/Header";
import "./sidebar.css";

function App() {
    document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block as HTMLElement);
    });

    return (
        <div className="App">
            <Header />
            <aside className="sidebar">
                <div className="viewport">
                    <main className="nav">
                        <a href="#welcome">Welcome</a>
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
                            <p>Welcome to the AeroClient v1 documentation.</p>
                            <h3>About</h3>
                            <p>
                                AeroClient is a discord.js framework that focuses on customization.
                                It is fully customizable due to the many options and flags you can
                                set. AeroClient also features something new in discord.js
                                frameworks: middleware.
                            </p>
                            <p>In short, AeroClient is</p>
                            <ul>
                                <li>modular;</li>
                                <li>performant;</li>
                                <li>flexible;</li>
                                <li>and easy to use.</li>
                            </ul>
                            <h3>Included Packages</h3>
                            <p>
                                <a
                                    href="http://npmjs.com/package/@aeroware/logger"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="red"
                                >
                                    @aeroware/logger
                                </a>
                                <br />
                                AeroWare's own extremely minimal logging utility.
                            </p>
                            <p>
                                <a
                                    href="http://npmjs.com/package/@aeroware/discord-utils"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="red"
                                >
                                    @aeroware/discord-utils
                                </a>
                                <br />
                                AeroWare's small package that contains many utilities for discord.js
                            </p>
                            <p>
                                <a
                                    href="http://npmjs.com/package/date-fns"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="red"
                                >
                                    date-fns
                                </a>
                                <br />A formatting utility for dates and time.
                            </p>
                            <p>
                                <a
                                    href="http://npmjs.com/package/ms"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="red"
                                >
                                    ms
                                </a>
                                <br />A small utility to convert strings to milliseconds and back.
                            </p>
                            <p>
                                <a
                                    href="http://npmjs.com/package/keyv"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="red"
                                >
                                    keyv
                                </a>
                                <br />A key-value based in-memory storage that can be persistent.
                            </p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default App;
