import { RatelimitOptions } from "../types";

type Time = "second" | "minute" | "hour" | "day";

const timeToMs: Record<Time, number> = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
};

/**
 * Ratelimit class represents a ratelimit.
 *
 * Use Ratelimit.create to create a Ratelimit instance.
 * @class
 */
export default class Ratelimit {
    private options: RatelimitOptions;
    private users = new Map<
        string,
        {
            calls: number;
            recharge: number;
        }
    >();

    private constructor(options: RatelimitOptions) {
        this.options = options;

        options.clear
            ? setInterval(() => {
                  this.users.clear();
              }, timeToMs[options.per])
            : setInterval(() => {
                  this.users.forEach((_, id) => {
                      this.users.set(id, {
                          calls: this.users.get(id)!.calls,
                          recharge: this.users.get(id)!.recharge,
                      });
                  });
              }, timeToMs[options.per] / options.calls);
    }

    /**
     * Adds an ID to the Ratelimit's map.
     * @param id ID to add (assumed to be a user id).
     */
    public add(id: string) {
        let user = this.users.get(id);

        if (this.users.has(id) && user!.calls < this.options.calls && user!.recharge <= 0)
            this.users.set(id, { calls: user!.calls + 1, recharge: 0 });
        else if (!user)
            this.users.set(id, {
                calls: 1,
                recharge: 0,
            });

        user = this.users.get(id);

        const isRatelimited = this.users.has(id) && user!.calls < this.options.calls;

        if (isRatelimited && this.options.recharge && user!.recharge <= 0) {
            this.users.set(id, {
                calls: user!.calls,
                recharge: this.options.recharge,
            });

            setTimeout(() => {
                this.users.set(id, {
                    calls: user!.calls,
                    recharge: 0,
                });
            }, this.options.recharge);
        }

        return this.check(id);
    }

    /**
     * Removes an ID from the Ratelimit's map.
     * @param id ID to remove (assumed to be a user id).
     */
    public remove(id: string) {
        const user = this.users.get(id);

        if (user && user!.recharge <= 0) {
            if (this.users.has(id) && user!.calls > 0) this.users.set(id, { calls: user!.calls - 1, recharge: 0 });
        }

        return this.check(id);
    }

    /**
     * Returns a boolean indicating whether or not the ID is being ratelimited.
     * @param id ID to check.
     */
    public check(id: string) {
        return this.users.has(id) && this.users.get(id)!.calls > this.options.calls;
    }

    /**
     * Creates a new ratelimit from a set of options.
     * @param options Options for the Ratelimit instance.
     */
    public static create(options: RatelimitOptions) {
        return new Ratelimit(options);
    }
}
