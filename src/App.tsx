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

        document.querySelectorAll("a").forEach((a) => {
            if (a instanceof HTMLAnchorElement)
                a.addEventListener("click", (e) => {
                    e.preventDefault();
                    const element = document.getElementById(
                        a.href.split("/").pop()?.slice(1) || "welcome"
                    );
                    if (!element) return;
                    window.location.hash = `#${element.id}`;
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                    });
                });
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
                        <a href="#welcome">Welcome</a><br/>
                        <a href="#documentation">Documentation</a><br/>
                        <div className="t">
                            <a href="#aeroclient">AeroClient</a><br/>
                            <div className="t">
                                <a href="#options">Options</a><br/> 
                                <a href="#properties">Properties</a><br/> 
                                <a href="#methods">Methods</a><br/>
                                <a href="#middleware">Middleware</a><br/>
                            </div>
                            <a href="#logger">Logger</a><br/>
                            <div className="t">
                                <a href="#logger-methods">Methods</a><br/>
                            </div>
                            <a href="#utils">utils</a><br/>
                            <div className="t">
                                <a href="#input">Input</a><br/>
                                <a href="#parsing">Parsing</a><br/>
                                <a href="#timing">Timing</a><br/>
                                <div className="t">
                                    <a href="#stopwatch">Stopwatch</a>
                                    <div className="t">
                                        <a href="#stopwatch-properties">Properties</a><br/>
                                        <a href="#stopwatch-methods">Methods</a>
                                    </div>
                                </div>
                                <a href="#pagination">Pagination</a><br/>
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
                        </div>
                        <div
                            className="footer"
                            id="footer"
                            style={{
                                opacity: 0.5,
                                fontSize: "1rem",
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
