#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, getInputCached } from "./common.ts";

// part 1

function parseInput(
    input: string,
): { ids: number[]; ranges: { start: number; end: number }[] } {
    const [rangesInput, idsInput] = input.trim().split("\n\n");

    const ranges = rangesInput.split("\n").map((range) =>
        range.split("-").map((v) => parseInt(v))
    ).map(([start, end]) => ({ start, end }));
    const ids = idsInput.split("\n").map((id) => parseInt(id));

    return { ids, ranges };
}

function isFresh(
    id: number,
    ranges: { start: number; end: number }[],
): boolean {
    return ranges.some((range) => id >= range.start && id <= range.end);
}

// part 1 example

const EXAMPLE_INPUT = `
3-5
10-14
16-20
12-18

1
5
8
11
17
32
`;

const { ranges: example_ranges, ids: example_ids } = parseInput(EXAMPLE_INPUT);

assertEq(false, isFresh(example_ids[0], example_ranges));
assertEq(true, isFresh(example_ids[1], example_ranges));
assertEq(false, isFresh(example_ids[2], example_ranges));
assertEq(true, isFresh(example_ids[3], example_ranges));
assertEq(true, isFresh(example_ids[4], example_ranges));
assertEq(false, isFresh(example_ids[5], example_ranges));

// part 1 actual

const input = await getInputCached("5");
const { ranges, ids } = parseInput(input);

const freshCount = ids
    .map((id) => isFresh(id, ranges) ? 1 : 0)
    .reduce((state: number, curr) => state + curr, 0);

console.log("the number of available ids (part 1) is", freshCount);

// part 2

function totalValidIds(ranges: { start: number; end: number }[]): number {
    // sorting lets us do the next phase in one pass
    const sortedRanges = ranges.toSorted((a, b) => a.start - b.start);

    const { idCount, range } = sortedRanges.reduce((state, nextRange) => {
        // if there is no overlap, this region is finalized
        if (state.range.end < nextRange.start) {
            return {
                idCount: state.idCount += state.range.end - state.range.start + 1,
                range: structuredClone(nextRange),
            };
        }

        // otherwise, there is some overlap.
        // either the range is a total subset, which we ignore,
        // or it expands the merged range
        if (nextRange.end > state.range.end) {
            state.range.end = nextRange.end;
        }

        return state;
    }, { idCount: 0, range: structuredClone(sortedRanges[0]) });

    // we have to remember to include the ids of the final range
    return idCount + range.end - range.start + 1;
}

// part 2 example

assertEq(14, totalValidIds(example_ranges));

// part 2 actual
console.log("total available ids (part 2) is", totalValidIds(ranges));
