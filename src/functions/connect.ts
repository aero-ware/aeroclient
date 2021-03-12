import Logger from "@aeroware/logger";
import mongoose from "mongoose";

export default async function connect(uri: string) {
    try {
        const logger = new Logger("mongo");

        mongoose.connect(
            uri,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                keepAlive: true,
            },
            (err) => {
                if (err) return logger.error(err.stack || err.message);
                logger.success("Connected to mongo");
            }
        );

        mongoose.connection.on("connect", () => {
            logger.success("Mongoose is connected");
        });

        mongoose.connection.on("error", (err) => {
            logger.error(err.stack || err.message);
        });

        mongoose.connection.on("disconnect", () => {
            logger.warn("Mongoose was disconnected");
        });

        mongoose.connection.on("reconnect", () => {
            logger.info("Mongoose has reconnected");
        });

        return mongoose.connection;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
