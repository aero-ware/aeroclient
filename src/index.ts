import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import AeroClient from "./AeroClient";
import AeroEmbed from "./classes/AeroEmbed";
import Arguments from "./classes/Arguments";
import TipEmbed from "./functions/TipEmbed";

export { utils, Logger, TipEmbed, AeroEmbed, Arguments };
export default AeroClient;

module.exports.utils = utils;
module.exports.Logger = Logger;
module.exports.TipEmbed = TipEmbed;
module.exports.AeroEmbed = AeroEmbed;
module.exports.Arguments = Arguments;
module.exports = AeroClient;
