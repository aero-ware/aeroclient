import React, { useEffect, useState } from "react";
import "./header.css";

function Header() {
    const [logoText, setLogoText] = useState(window.innerWidth < 800 ? "A" : "AeroClient");

    useEffect(() => {
        window.addEventListener("resize", function () {
            setLogoText(window.innerWidth < 800 ? "A" : "AeroClient");
        });
    }, []);

    return (
        <header className="header">
            <div className="logo-container">
                <h1 className="logo">
                    <span className="red">{logoText.slice(0, 4)}</span>
                    {logoText.slice(4)}
                </h1>
            </div>
            <nav className="nav">
                <a
                    href="https://github.com/aero-ware/aeroclient"
                    target="_blank"
                    rel="noreferrer"
                    className="red"
                >
                    <i className="fab fa-github"></i>
                </a>
                <a
                    href="https://www.npmjs.com/org/aeroware"
                    target="_blank"
                    rel="noreferrer"
                    className="red"
                >
                    <i className="fab fa-npm fa-1x"></i>
                </a>
                <a
                    href="https://discord.gg/JdTQG3a9Ye"
                    target="_blank"
                    rel="noreferrer"
                    className="red"
                >
                    <i className="fab fa-discord"></i>
                </a>
            </nav>
        </header>
    );
}

export default Header;
