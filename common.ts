export async function getInputCached(day: string) {
    const inputFilePath = `.inputs/day${day}`;

    return await Deno.readTextFile(inputFilePath).catch(() =>
        // if the file didn't exist, attempt to write it
        Deno.mkdir(".inputs", { recursive: true })
            .then(() => getInputStream(day))
            .then((stream) => Deno.writeFile(inputFilePath, stream))
            .then(() => Deno.readTextFile(inputFilePath))
    );
}

async function getInputStream(day: string) {
    const session = Deno.env.get("AOC_SESSION");
    const request = await fetch(
        `https://adventofcode.com/2025/day/${day}/input`,
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0",
                "Cookie": `session=${session}`,
            },
        },
    );

    if (!request.body) {
        throw Error("missing AOC request body");
    }
    return request.body;
}

// very lightweight assert for testing examples
export function assertEq<T>(expected: T, actual: T, failure_message?: string) {
    if (!isFlexibleEqual(expected, actual)) {
        throw Error(`'${expected}' != '${actual}'; ${failure_message}`);
    }
}

function isFlexibleEqual<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;

    // array case
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((ae, i) => isFlexibleEqual(ae, b[i]));
    }

    return false;
}

/// collections stuff

// reverse columns and rows
export function transpose<T>(arr: T[][]): T[][] {
    return arr[0].map((_, col) => arr.map((row) => row[col]));
}

export function sum<T>(iter: Iterable<T>, by: (item: T, idx: number) => number = (item) => Number(item), init: number = 0): number {
    return Iterator.from(iter).reduce((accum, item, idx) => accum + by(item, idx), init);
}

export function product<T>(iter: Iterable<T>, by: (item: T, idx: number) => number = (item) => Number(item), init: number = 1): number {
    return Iterator.from(iter).reduce((accum, item, idx) => accum * by(item, idx), init);
}

export function unique<T>(iter: Iterable<T>): Set<T> {
    return new Set(iter);
}

export function identity<T>(x: T): T {
    return x;
}

export function int(x: string): number {
    return parseInt(x);
}

export function truthy<T>(iter: Iterable<T>): IteratorObject<T> {
    return Iterator.from(iter).filter(identity);
}

// iterate over a sliding window view of the provided array
export function* slidingWindow<T>(arr: T[], windowSize: number) {
    for (let i = 0; i + windowSize <= arr.length; i++) {
        yield arr.slice(i, i + windowSize);
    }
}

export function* pairs<T>(arr: T[]): Generator<[T, T]> {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            yield [arr[i], arr[j]]
        }
    }
}

export function groupBy<T>(iter: Iterable<T>, fn: (item: T, idx: number) => string): Map<string, Array<T>> {
    return Iterator.from(iter).reduce((groups, item, idx) => {
        const key = fn(item, idx);
        const group = groups.get(key) || [];
        group.push(item);
        groups.set(key, group);
        return groups;
    }, new Map<string, Array<T>>());
}

export class DisjointSets<T> implements Iterable<Set<T>> {

    mapping: Map<string, { element: T; sentinalKey: string; }>;
    setCount: number;
    keyFunc: (element: T) => string;

    constructor(keyFunc: (element: T) => string) {
        this.mapping = new Map<string, { element: T, sentinalKey: string }>();
        this.keyFunc = keyFunc;
        this.setCount = 0;
    }

    // iterate over each distinct set
    [Symbol.iterator](): Iterator<Set<T>> {
        return groupBy(this.mapping.values(), ((value) => this.find(this.keyFunc(value.element)).sentinalKey)).values().map(list => new Set(list.map(val => val.element)));
    }

    getSets(): Array<Set<T>> {
        return Iterator.from(this).toArray();
    }

    makeSet(...elements: T[]) {
        const sentinalKey = this.keyFunc(elements[0]);
        for (const element of elements)
            this.mapping.set(this.keyFunc(element), { element, sentinalKey });
        this.setCount++;
    }

    private find(key: string): { element: T, sentinalKey: string } {
        const value = this.mapping.get(key)!;
        if (value.sentinalKey !== key) {
            // path compression
            const { sentinalKey } = this.find(value.sentinalKey);
            value.sentinalKey = sentinalKey;
            this.mapping.set(key, value);
        }
        return value;
    }

    // returns true if two sets were joined, false if they were already joined
    union(a: T, b: T): boolean {
        const resultA = this.find(this.keyFunc(a));
        const resultB = this.find(this.keyFunc(b));

        // if they are already in the same set, do nothing
        if (resultA.sentinalKey === resultB.sentinalKey)
            return false;

        // otherwise, join them (not the most efficient but whatever)
        const sentinalElement = this.mapping.get(resultA.sentinalKey)!;
        this.mapping.set(resultA.sentinalKey, { ...sentinalElement, sentinalKey: resultB.sentinalKey });
        this.setCount--;
        return true;
    }
}

/// these I'm not too sure about tbh

// return an array of indices where the predicate is true
export function findIndices<T>(
    arr: T[],
    predicate: (item: T, index: number) => unknown,
): number[] {
    return arr
        .entries()
        .filter(([idx, item]) => predicate(item, idx))
        .map(([idx, _]) => idx)
        .toArray();
}

// similar to the split function on strings, but for arrays
export function* splitArrayAtIndices<T>(
    arr: T[],
    indices: number[],
    options: { includeSeparator?: boolean } = {},
) {
    const { includeSeparator = false } = options;

    if (indices.length == 0) {
        yield arr;
        return;
    }

    // yield the range from the start to the first index
    yield arr.slice(0, indices[0]);

    yield* slidingWindow(indices, 2).map(
        ([start, end]) => arr.slice(start + (includeSeparator ? 0 : 1), end),
    );

    // yield the range from the last index to the end of the array
    yield arr.slice(
        indices[indices.length - 1] + (includeSeparator ? 0 : 1),
        arr.length,
    );
}

/// fun little hack that provides a lazy way to call utility functions directly on array objects
/// this is a code smell but for advent of code I don't care

declare global {
    interface Array<T> {
        /**
         * Apply any function that operates on arrays inline. Basically an escape hatch to make the utility functions
         * in this file readily accessible.
         */
        ext<ReturnType, ArgsType extends unknown[]>(fn: (arr: Array<T>, ...args: ArgsType) => ReturnType, ...args: ArgsType): ReturnType;
    }
}

if (!Array.prototype.ext) {
    Array.prototype.ext = function <T, ReturnType, ArgsType extends unknown[]>(this: Array<T>, fn: (arr: Array<T>, ...args: ArgsType) => ReturnType, ...args: ArgsType): ReturnType {
        return fn(this, ...args);
    }
}