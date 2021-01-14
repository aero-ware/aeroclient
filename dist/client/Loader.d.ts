import AeroClient from "../AeroClient";
export default class Loader {
    private client;
    /**
     * Creates a Loder given a client.
     * @param client the client that called this loader
     */
    constructor(client: AeroClient);
    /**
     * Loads all commands in a folder, and subfolders.
     * @param path Directory to load.
     */
    loadCommands(path: string): Promise<void>;
    /**
     * Loads all events in a folder, and subfolders.
     * @param path Directory to load.
     */
    loadEvents(path: string): Promise<void>;
    /**
     * Loads responses from a JSON file.
     * @param path Path to load the JSON (file extension must be included)
     */
    loadMessages(path: string): Promise<void>;
    /**
     * Reads JSON files in the given directory to provide language support.
     * @param dir the directory to read the locale files from
     */
    loadLocales(dir: string): Promise<void>;
}
