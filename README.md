# AeroClient

![AeroClient](aeroclient.png)
[![Discord](https://discordapp.com/api/guilds/778074336447168512/embed.png)](https://discord.gg/JdTQG3a9Ye)

## About

AeroClient is a [discord.js](https://github.com/discordjs/discord.js) framework that focuses on customization.
It is fully customizable due to the many options and flags you can set. AeroClient also features something new in discord.js frameworks: middleware.

## Features

-   Aliases
-   Logger
-   Persistable
    -   Prefixes
    -   Cooldowns
-   Command handling
    -   Many flags to choose and enable; some are listed below
        -   `args` if arguments are required
        -   `guildOnly` if the command can only be executed in a guild
        -   `dmOnly` if the command can only be executed in a direct message
    -   Automatic incorrect usage reply
-   Automatic loading
    -   Events
    -   Commands
    -   Custom responses; also listed below
        -   `error` when an error occurs
        -   `usage` when the usage is incorrect
        -   `cooldown` when the cooldown is not over
-   Cooldowns
-   Default commands and behaviour
    -   `setprefix` sets the prefix for the current guild
    -   `help` simple help command
-   Middleware
    -   Stop command execution if needed
    -   Customize AeroClient behaviour
