"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function TipEmbed(tips, options) {
    var _a;
    return _a = class TipEmbed extends discord_js_1.MessageEmbed {
            constructor(data) {
                super(data);
                this.setColor((options && options.color) || "RANDOM");
                if (options && options.timestamps)
                    this.setTimestamp();
                if (TipEmbed.easterEggs && Math.random() < (TipEmbed.eggChance || 0))
                    this.setFooter(TipEmbed.easterEggs[Math.floor(Math.random() * TipEmbed.easterEggs.length)]);
                else
                    this.setFooter(TipEmbed.footers[Math.floor(Math.random() * TipEmbed.footers.length)]);
            }
        },
        _a.footers = tips,
        _a.easterEggs = options && options.easterEggs && options.easterEggs.eggs,
        _a.eggChance = options && options.easterEggs && options.easterEggs.chance,
        _a;
}
exports.default = TipEmbed;
