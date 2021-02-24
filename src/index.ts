import utils from "@aeroware/discord-utils";
import Logger from "@aeroware/logger";
import AeroClient from "./AeroClient";
import AeroEmbed from "./classes/AeroEmbed";
import Arguments from "./classes/Arguments";
import TipEmbed from "./functions/TipEmbed";

/* Cool ES6 exports. */

export { utils, Logger, TipEmbed, AeroEmbed, Arguments };
export default AeroClient;

/* Require and AMD chad compatibility shit */

module.exports.utils = utils;
module.exports.Logger = Logger;
module.exports.TipEmbed = TipEmbed;
module.exports.AeroEmbed = AeroEmbed;
module.exports.Arguments = Arguments;
module.exports = AeroClient;

exports.utils = utils;
exports.Logger = Logger;
exports.TipEmbed = TipEmbed;
exports.AeroEmbed = AeroEmbed;
exports.Arguments = Arguments;
exports = AeroClient;
