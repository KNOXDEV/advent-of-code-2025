#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, DisjointSets, getInputCached, int, pairs, product } from "./common.ts";

// part 1

type Point = {
    x: number,
    y: number,
    z: number
};

function pointDistance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

function parse(input: string): Point[] {
    return input
        .trim().split("\n")
        .map(line => line.split(",").map(int))
        .map(([x, y, z]) => ({ x, y, z }));
}

function getCircuits(points: Point[], n: number): Set<Point>[] {
    // first, compute all relative distances and sort in ascending order
    const pointPairs = points.ext(pairs).map(([a, b]) => ({ a, b, d: pointDistance(a, b) })).toArray().toSorted(({ d }, { d: d2 }) => d - d2);

    const disjointSets = new DisjointSets<Point>((p) => `${p.x},${p.y},${p.z}`);
    for (const point of points)
        disjointSets.makeSet(point);

    // only connect the top n closest pairs
    for (let i = 0; i < n; i++) {
        const { a, b } = pointPairs[i];
        disjointSets.union(a, b);
    }

    // at the end, get all finalized groups
    return disjointSets.getSets();
}

// part 1 example

const EXAMPLE_INPUT = `
162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689
`;
const examplePoints = parse(EXAMPLE_INPUT);
const exampleCircuits = getCircuits(examplePoints, 10);
// sort by circuit size, multiply top 3 sizes
const exampleCircuitCount = exampleCircuits.map(circuit => circuit.size).toSorted().slice(-3).ext(product);
assertEq(40, exampleCircuitCount)

// part 1 actual

const input = await getInputCached("8");
const points = parse(input);
const circuits = getCircuits(points, 1000);
const circuitCount = circuits.map(circuit => circuit.size).toSorted((a, b) => a - b).slice(-3).ext(product)
console.log("circuit count product (part 1) is", circuitCount)

// part 2

function joinUntilConnected(points: Point[]): Point[] {
    // first, compute all relative distances and sort in ascending order
    const pointPairs = points.ext(pairs).map(([a, b]) => ({ a, b, d: pointDistance(a, b) })).toArray().toSorted(({ d }, { d: d2 }) => d - d2);

    const disjointSets = new DisjointSets<Point>((p) => `${p.x},${p.y},${p.z}`);
    for (const point of points)
        disjointSets.makeSet(point);

    // join until completely connected
    for (const { a, b } of pointPairs) {
        disjointSets.union(a, b);

        // return the final pair
        if(disjointSets.getSets().length === 1)
            return [a, b];
    }

    return [];
}

const [a, b] = joinUntilConnected(points);
console.log("x coordinate product of final pair (part 2) is", a.x * b.x);