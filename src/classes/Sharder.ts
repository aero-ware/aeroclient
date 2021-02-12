import { ShardingManager, ShardingManagerMode } from "discord.js";

/**
 * WORK IN PROGRESS
 */

export default class Sharder extends ShardingManager {
    constructor(
        filePath: string,
        options?: {
            totalShards?: number | "auto";
            shardList?: number[] | "auto";
            mode?: ShardingManagerMode;
            respawn?: boolean;
            shardArgs?: string[];
            token?: string;
            execArgv?: string[];
        }
    ) {
        const path = `${require.main?.path}/${filePath}`;

        super(path, options);
    }
}
