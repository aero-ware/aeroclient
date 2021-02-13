"use strict";
/*
 * TypeScript implementation of middleware.
 *
 * Author:
 * https://medium.com/@MunifTanjim
 *
 * Source:
 * https://medium.com/javascript-in-plain-english/basic-middleware-pattern-in-javascript-ef8756a75cb1
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function Pipeline(...middlewares) {
    const stack = middlewares;
    const use = (...middlewares) => {
        stack.push(...middlewares);
    };
    const execute = (context) => __awaiter(this, void 0, void 0, function* () {
        let prevIndex = -1;
        let stop = false;
        const runner = (index) => __awaiter(this, void 0, void 0, function* () {
            if (index === prevIndex) {
                throw new Error("next() called multiple times");
            }
            prevIndex = index;
            const middleware = stack[index];
            if (middleware) {
                yield middleware(context, () => {
                    return runner(index + 1);
                }, () => {
                    stop = true;
                });
            }
        });
        yield runner(0);
        return stop;
    });
    return { use, execute };
}
exports.default = Pipeline;
