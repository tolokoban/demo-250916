export function isObject(data: unknown): data is { [key: string]: unknown } {
    if (Array.isArray(data)) return false
    return typeof data === "object"
}

export function assertObject(
    data: unknown,
    name = "data"
): asserts data is { [key: string]: unknown } {
    if (!isObject(data))
        throw Error(
            `${name} was expected to be an object but we got ${typeof data}!`
        )
}

export function isString(data: unknown): data is string {
    return typeof data === "string"
}

export function assertString(
    data: unknown,
    name = "data"
): asserts data is string {
    if (!isString(data)) {
        throw Error(
            `${name} was expected to be a string but we got ${typeof data}!`
        )
    }
}

export function assertImage(    data: unknown,
    name = "data"
): asserts data is HTMLImageElement {
    if (!(data instanceof HTMLImageElement)) {
        throw Error(
            `${name} was expected to be an Image but we got ${typeof data}!`
        )
    }
}

