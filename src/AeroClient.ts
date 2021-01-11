import { Client, ClientOptions } from "discord.js";

export default class AeroClient extends Client {
    constructor(options: ClientOptions) {
        super(options);
    }
}