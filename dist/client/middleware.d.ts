export declare type Next = () => Promise<void> | void;
export declare type Stop = () => Promise<void> | void;
export declare type Middleware<T> = (context: T, next: Next, stop: Stop) => Promise<unknown> | unknown;
export declare type Pipeline<T> = {
    use: (...middlewares: Middleware<T>[]) => void;
    execute: (context: T) => Promise<boolean>;
};
export default function Pipeline<T>(...middlewares: Middleware<T>[]): Pipeline<T>;
