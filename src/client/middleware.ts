/*
 * TypeScript implementation of middleware.
 *
 * Author:
 * https://medium.com/@MunifTanjim
 *
 * Source:
 * https://medium.com/javascript-in-plain-english/basic-middleware-pattern-in-javascript-ef8756a75cb1
 */

export type Next = (stop?: boolean) => Promise<void> | void;

export type Middleware<T> = (context: T, next: Next) => Promise<unknown> | unknown;

export type Pipeline<T> = {
    use: (...middlewares: Middleware<T>[]) => void;
    execute: (context: T) => Promise<boolean>;
};

export default function Pipeline<T>(...middlewares: Middleware<T>[]): Pipeline<T> {
    const stack: Middleware<T>[] = middlewares;

    const use: Pipeline<T>["use"] = (...middlewares) => {
        stack.push(...middlewares);
    };

    const execute: Pipeline<T>["execute"] = async (context) => {
        let prevIndex = -1;

        let stop = false;

        const runner = async (index: number): Promise<void> => {
            if (index === prevIndex) {
                throw new Error("next() called multiple times");
            }

            prevIndex = index;

            const middleware = stack[index];

            if (middleware) {
                await middleware(context, (stopExec) => {
                    if (stopExec) {
                        stop = true;
                        return;
                    }
                    return runner(index + 1);
                });
            }
        };

        await runner(0);

        return stop;
    };

    return { use, execute };
}
