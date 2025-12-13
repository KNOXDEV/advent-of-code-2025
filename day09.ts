#!/usr/bin/env -S deno run --allow-read=./.inputs/
import {
    assertEq,
    getInputCached,
    int,
    max,
    pairs,
    slidingWindow,
    sort,
} from "./common.ts";

type Point = { x: number; y: number };

// part 1

function parseInput(input: string): Point[] {
    return input.trim().split("\n")
        .map((line) => line.split(",").map(int))
        .map(([x, y]) => ({ x, y }));
}

function findLargestArea(points: Point[]): number {
    return pairs(points).map(([a, b]) =>
        (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1)
    ).ext(max)!;
}

// part 1 example
const EXAMPLE_INPUT = `
7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3
`;
const examplePoints = parseInput(EXAMPLE_INPUT);
const exampleLargestArea = findLargestArea(examplePoints);
assertEq(50, exampleLargestArea);

// part 1 actual
const input = await getInputCached("9");
const points = parseInput(input);
const largestArea = findLargestArea(points);
console.log(
    "the area of the largest possible rectangle (part 1) is",
    largestArea,
);

// part 2

// we will try a hacky and not generally correct solution where
// we simply do AABB collision checks to eliminate considered rectangles and hope it works.

// AABBs operate under the convention that x0 <= x1, y0 <= y1.
// Also, they are not aligned to the "center" of each tile,
// but the top left corner of each tile.
type AABB = { x0: number; y0: number; x1: number; y1: number };

function pointsToAABB(p0: Point, p1: Point): AABB {
    const [x0, x1] = [p0.x, p1.x].ext(sort);
    const [y0, y1] = [p0.y, p1.y].ext(sort);
    // AABBs are considered to be aligned to the top left corner of each tile,
    // which means we need to expand the bottom right corner
    return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

// In this check, edges *are* allowed to overlap but not cross.
// This also allows edges of a rectangle to not collide with the rectangle itself.
function collide(a: AABB, b: AABB): boolean {
    return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

function findLargestAreaConvex(points: Point[]): number {
    // Create an array of colliders (consecutive points that we treat as thin rectangles).
    // Note we need to *wrap* the sliding window to include the edge lastPoint->firstPoint.
    const colliders = slidingWindow(points, 2, { wrap: true })
        .map(([a, b]) => pointsToAABB(a, b))
        .toArray();

    return pairs(points)
        .map(([a, b]) => pointsToAABB(a, b))
        // remove rectangles that collide with an existing collider
        .filter((box) =>
            !colliders.some((line) =>
                collide(line, {
                    // we shrink the rect during collision because edges can overlap
                    x0: box.x0 + 1,
                    y0: box.y0 + 1,
                    x1: box.x1 - 1,
                    y1: box.y1 - 1,
                })
            )
        )
        .map((box) => (box.x1 - box.x0) * (box.y1 - box.y0))
        .ext(max)!;
}

// part 2 example
const exampleLargestAreaConvex = findLargestAreaConvex(examplePoints);
assertEq(24, exampleLargestAreaConvex);

// part 2 actual
const largestAreaConvex = findLargestAreaConvex(points);
console.log("largest convex area (part 2) is", largestAreaConvex);
