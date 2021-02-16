import { EmbedFieldData, MessageEmbed, MessageEmbedOptions } from "discord.js";

export default class AeroEmbed extends MessageEmbed {
    constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.setColor("RANDOM");
    }

    /**
     * Adds a blank field to the embed.
     * @param inline Should the blank field be an inline field?
     */
    blank(inline?: boolean) {
        this.addField("\u200b", "\u200b", inline);

        return this;
    }

    /**
     * Adds a 2×2 grid layout.
     * @param data Field data for the layout.
     * @param spaceOut Should the fields be spaced out?
     */
    twoByTwo(
        data: [
            [
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                }
            ],
            [
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                }
            ]
        ],
        spaceOut?: boolean
    ) {
        let fir = false;
        for (const row of data) {
            let sec = false;
            for (const { name, value } of row) {
                this.addField(name, value, true);
                if (!sec && spaceOut) this.blank(true);
                sec = true;
            }
            if (!fir || !spaceOut) this.blank(!spaceOut);
            fir = true;
        }

        return this;
    }

    /**
     * Adds a 3×3 grid layout.
     * @param data Field data for the layout.
     */
    threeByThree(
        data: [
            [
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                }
            ],
            [
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                }
            ],
            [
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                },
                EmbedFieldData & {
                    inline?: undefined;
                }
            ]
        ]
    ) {
        for (const row of data) {
            for (const { name, value } of row) {
                this.addField(name, value, true);
            }
        }

        return this;
    }
}
