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

// reverse columns and rows
export function transpose<T>(arr: T[][]): T[][] {
    return arr[0].map((_, col) => arr.map((row) => row[col]));
}

// iterate over a sliding window view of the provided array
export function* slidingWindow<T>(arr: T[], windowSize: number) {
    for (let i = 0; i + windowSize <= arr.length; i++) {
        yield arr.slice(i, i + windowSize);
    }
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
