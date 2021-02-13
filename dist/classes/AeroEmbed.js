"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class AeroEmbed extends discord_js_1.MessageEmbed {
    constructor(data) {
        super(data);
    }
    /**
     * Adds a blank field to the embed.
     * @param inline Should the blank field be an inline field?
     */
    blank(inline) {
        this.addField("\u200b", "\u200b", inline);
        return this;
    }
    /**
     * Adds a 2×2 grid layout.
     * @param data Field data for the layout.
     * @param spaceOut Should the fields be spaced out?
     */
    twoByTwo(data, spaceOut) {
        let fir = false;
        for (const row of data) {
            let sec = false;
            for (const { name, value } of row) {
                this.addField(name, value, true);
                if (!sec && spaceOut)
                    this.blank(true);
                sec = true;
            }
            if (!fir || !spaceOut)
                this.blank(!spaceOut);
            fir = true;
        }
        return this;
    }
    /**
     * Adds a 3×3 grid layout.
     * @param data Field data for the layout.
     */
    threeByThree(data) {
        for (const row of data) {
            for (const { name, value } of row) {
                this.addField(name, value, true);
            }
        }
        return this;
    }
}
exports.default = AeroEmbed;
