import { config as dotenv } from "dotenv";
import AeroClient from "./src";

dotenv();

const client = new AeroClient();

client.on("ready", () => console.log("Ready!"));

client.login(process.env.TOKEN);
