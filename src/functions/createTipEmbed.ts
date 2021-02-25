import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default function createTipEmbed(
    tips: string[],
    options?: {
        color?: string;
        timestamps?: boolean;
        easterEggs?: {
            eggs: string[];
            chance: number;
        };
    }
): typeof MessageEmbed {
    return class TipEmbed extends MessageEmbed {
        static footers = tips;
        static easterEggs = options && options.easterEggs && options.easterEggs.eggs;
        static eggChance = options && options.easterEggs && options.easterEggs.chance;

        constructor(data?: MessageEmbed | MessageEmbedOptions) {
            super(data);

            this.setColor((options && options.color) || "RANDOM");
            if (options && options.timestamps) this.setTimestamp();

            if (TipEmbed.easterEggs && Math.random() < (TipEmbed.eggChance || 0))
                this.setFooter(TipEmbed.easterEggs[Math.floor(Math.random() * TipEmbed.easterEggs.length)]);
            else this.setFooter(TipEmbed.footers[Math.floor(Math.random() * TipEmbed.footers.length)]);
        }
    };
}
