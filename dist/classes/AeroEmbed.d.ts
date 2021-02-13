import { EmbedFieldData, MessageEmbed, MessageEmbedOptions } from "discord.js";
export default class AeroEmbed extends MessageEmbed {
    constructor(data?: MessageEmbed | MessageEmbedOptions);
    /**
     * Adds a blank field to the embed.
     * @param inline Should the blank field be an inline field?
     */
    blank(inline?: boolean): this;
    /**
     * Adds a 2×2 grid layout.
     * @param data Field data for the layout.
     * @param spaceOut Should the fields be spaced out?
     */
    twoByTwo(data: [
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
    ], spaceOut?: boolean): this;
    /**
     * Adds a 3×3 grid layout.
     * @param data Field data for the layout.
     */
    threeByThree(data: [
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
    ]): this;
}
