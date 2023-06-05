export function assert(expression: any, message: string): asserts expression {
    if (!Boolean(expression)) {
        throw new Error(message);
    }
}
