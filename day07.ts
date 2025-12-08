#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, getInputCached, slidingWindow, transpose } from "./common.ts";

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
                currRow[i-1] = '|';
                currRow[i+1] = '|';
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
    return transpose(manifold).reduce((accum, row) => accum + row.join("").matchAll(/\|\^/g).toArray().length, 0);
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

type NodeLabel = string;
interface Graph { [label: NodeLabel]: NodeLabel[] };

// manifold must already be simulated to parse
function parseGraph(simulatedManifold: Manifold): { graph: Graph, rootNodeLabel: NodeLabel } {
    const graph: Graph = {};

    const firstRow = simulatedManifold[0];
    const rootIndex = firstRow.findIndex((tile) => tile === "S");
    const rootNodeLabel = `${rootIndex},${0}`;
    graph[rootNodeLabel] = [];

    for(let j = 1; j < simulatedManifold.length; j++) {
        const aboveRow = simulatedManifold[j-1];
        const row = simulatedManifold[j];
        for(let i = 0; i < row.length; i++) {
            // only beams matter
            if (row[i] !== '|')
                continue;

            // this beam is a node 
            const nodeLabel = `${i},${j}`;
            graph[nodeLabel] = [];

            // if this is a beam, we MIGHT be connected to the node above us
            if (aboveRow[i] === '|' || aboveRow[i] === 'S')
                graph[`${i},${j-1}`].push(nodeLabel);

            // we split from the node to the left of us
            if (row[i-1] === '^' && aboveRow[i-1] === "|")
                graph[`${i-1},${j-1}`].push(nodeLabel);

            // we split from the node to the right of us
            if (row[i+1] === '^' && aboveRow[i+1] === "|")
                graph[`${i+1},${j-1}`].push(nodeLabel);
        }
    }
    return { graph, rootNodeLabel };
}

function invertDiGraph(graph: Graph, rootNodeLabel: NodeLabel): { invertedGraph: Graph, rootNodes: NodeLabel[] } {
    const invertedGraph: Graph = { [rootNodeLabel]: [] };
    const rootNodes: Set<string> = new Set();

    bfs(graph, (node, edges) => {
        for (const edge of edges) {
            if (!(edge in invertedGraph))
                invertedGraph[edge] = [];
            if (!invertedGraph[edge].includes(node))
                invertedGraph[edge].push(node);
        }
        if(edges.length === 0)
            rootNodes.add(node);
    }, rootNodeLabel);

    return { invertedGraph, rootNodes: Array.from(rootNodes) };
}

function bfs(graph: Graph, vistor: (node: NodeLabel, edges: NodeLabel[]) => void, ...sourceNodeLabels: NodeLabel[]) {
    const nodesToVisit: NodeLabel[] = [...sourceNodeLabels];
    const visited = new Set(sourceNodeLabels);
    while (nodesToVisit.length > 0) {
        const node = nodesToVisit.shift()!;
        vistor(node, graph[node]);
        for (const edge of graph[node]) {
            if (visited.has(edge))
                continue;
            visited.add(edge);
            nodesToVisit.push(edge);
        }
    }
}

function countTimelines(manifoldGraph: Graph, rootNodeLabel: string): number {
    // theoretically speaking, we have a DAG that needs to be traversed in reverse topological order
    // to sum up the number of distinct paths to the target. 

    const { invertedGraph, rootNodes } = invertDiGraph(manifoldGraph, rootNodeLabel);
    const counts: {[key: string]: number} = {};

    // bfs the inverted graph 
    bfs(invertedGraph, (node, edges) => {
        // root nodes start at 1
        if(!(node in counts))
            counts[node] = 1;

        for (const edge of edges) {
            // edges start at zero
            if (!(edge in counts))
                counts[edge] = 0;
            // finally, add the count of each node to each parent node
            counts[edge] += counts[node];
            // console.log(node, edge, edges, counts[node], counts[edge]);
        }
    }, ...rootNodes)

    // at the end, the original rootNode will contain the final number of distinct paths
    return counts[rootNodeLabel];
}

// part 2 example
const {graph: exampleManifoldGraph, rootNodeLabel: exampleRootNodeLabel } = parseGraph(exampleManifold);
const exampleTimelineCount = countTimelines(exampleManifoldGraph, exampleRootNodeLabel);
assertEq(40, exampleTimelineCount);

// part 2 actual 

const { graph, rootNodeLabel } = parseGraph(simulated);
const timelineCount = countTimelines(graph, rootNodeLabel);
console.log("number of timelines (part 2) is", timelineCount);