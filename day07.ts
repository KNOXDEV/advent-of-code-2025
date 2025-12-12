#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, DiGraph, getInputCached, slidingWindow, sum, transpose } from "./common.ts";

// part 1

type Manifold = string[][];

function parseInput(input: string): Manifold {
    const lines = input.trim().split("\n");
    return lines.map(line => line.split(""));
}

function simulateManifold(manifold: Manifold): Manifold {
    // over each pair of rows
    for (const [prevRow, currRow] of slidingWindow(manifold, 2)) {
        for (const [i, prevTile] of prevRow.entries()) {
            if (prevTile === '.' || prevTile === '^')
                continue;

            // split the beam
            if (currRow[i] === '^') {
                currRow[i - 1] = '|';
                currRow[i + 1] = '|';
                continue;
            }

            // otherwise, propagate
            currRow[i] = '|';
        }
    }
    return manifold;
}

function countSplits(manifold: Manifold): number {
    // count beams entering splitters
    return manifold.ext(transpose).map((row) => row.join("").matchAll(/\|\^/g).toArray().length).ext(sum);
}

// part 1 example

const EXAMPLE_INPUT = `
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............
`;

let exampleManifold = parseInput(EXAMPLE_INPUT);
exampleManifold = simulateManifold(exampleManifold);
const exampleSplitCount = countSplits(exampleManifold);
assertEq(21, exampleSplitCount);

// part 1 actual

const input = await getInputCached("7");
const manifold = parseInput(input);
const simulated = simulateManifold(manifold);
const splitCount = countSplits(simulated);

console.log("number of splits (part 1) is", splitCount);

// part 2
// this is the part where it became obvious to me that this is better treated as a graph problem.
// we are going to reparse as such

// manifold must already be simulated to parse
function parseGraph(simulatedManifold: Manifold): DiGraph<[number, number]> {
    const graph = new DiGraph<[number, number]>(([i, j]) => `${i},${j}`);

    const firstRow = simulatedManifold[0];
    const rootIndex = firstRow.findIndex((tile) => tile === "S");
    graph.upsertNode([rootIndex, 0]);

    for (let j = 1; j < simulatedManifold.length; j++) {
        const aboveRow = simulatedManifold[j - 1];
        const row = simulatedManifold[j];
        for (let i = 0; i < row.length; i++) {
            // only beams matter
            if (row[i] !== '|')
                continue;

            // this beam is a node 
            graph.upsertNode([i, j]);

            // if this is a beam, we MIGHT be connected to the node above us
            if (aboveRow[i] === '|' || aboveRow[i] === 'S')
                graph.upsertNode([i, j - 1], [i, j]);

            // we split from the node to the left of us
            if (row[i - 1] === '^' && aboveRow[i - 1] === "|")
                graph.upsertNode([i - 1, j - 1], [i, j]);

            // we split from the node to the right of us
            if (row[i + 1] === '^' && aboveRow[i + 1] === "|")
                graph.upsertNode([i + 1, j - 1], [i, j]);
        }
    }
    return graph;
}

// part 2 example
const exampleGraph = parseGraph(exampleManifold);
const exampleTimelineCount = exampleGraph.countDistinctPaths();
assertEq(40, exampleTimelineCount);

// part 2 actual
const graph = parseGraph(simulated);
const timelineCount = graph.countDistinctPaths();
console.log("number of timelines (part 2) is", timelineCount);