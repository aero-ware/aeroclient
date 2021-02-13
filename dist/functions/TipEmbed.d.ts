import { MessageEmbed, MessageEmbedOptions } from "discord.js";
export default function TipEmbed(tips: string[], options?: {
    color?: string;
    timestamps?: boolean;
    easterEggs?: {
        eggs: string[];
        chance: number;
    };
}): {
    new (data?: MessageEmbed | MessageEmbedOptions | undefined): {
        author: import("discord.js").MessageEmbedAuthor | null;
        color: number | null;
        readonly createdAt: Date | null;
        description: string | null;
        fields: import("discord.js").EmbedField[];
        files: (string | import("discord.js").MessageAttachment | import("discord.js").FileOptions)[];
        footer: import("discord.js").MessageEmbedFooter | null;
        readonly hexColor: string | null;
        image: import("discord.js").MessageEmbedImage | null;
        readonly length: number;
        provider: import("discord.js").MessageEmbedProvider | null;
        thumbnail: import("discord.js").MessageEmbedThumbnail | null;
        timestamp: number | null;
        title: string | null;
        type: string;
        url: string | null;
        readonly video: import("discord.js").MessageEmbedVideo | null;
        addField(name: any, value: any, inline?: boolean | undefined): any;
        addFields(...fields: import("discord.js").EmbedFieldData[] | import("discord.js").EmbedFieldData[][]): any;
        attachFiles(file: (string | import("discord.js").MessageAttachment | import("discord.js").FileOptions)[]): any;
        setAuthor(name: any, iconURL?: string | undefined, url?: string | undefined): any;
        setColor(color: import("discord.js").ColorResolvable): any;
        setDescription(description: any): any;
        setFooter(text: any, iconURL?: string | undefined): any;
        setImage(url: string): any;
        setThumbnail(url: string): any;
        setTimestamp(timestamp?: number | Date | undefined): any;
        setTitle(title: any): any;
        setURL(url: string): any;
        spliceFields(index: number, deleteCount: number, ...fields: import("discord.js").EmbedFieldData[] | import("discord.js").EmbedFieldData[][]): any;
        toJSON(): object;
    };
    footers: string[];
    easterEggs: string[] | undefined;
    eggChance: number | undefined;
    normalizeField(name: any, value: any, inline?: boolean | undefined): Required<import("discord.js").EmbedFieldData>;
    normalizeFields(...fields: import("discord.js").EmbedFieldData[] | import("discord.js").EmbedFieldData[][]): Required<import("discord.js").EmbedFieldData>[];
};
