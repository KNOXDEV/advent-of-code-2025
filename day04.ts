#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, getInputCached } from "./common.ts";

// provided example
const EXAMPLE_GRID = `
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.
`;

assertEq(13, getAccessible(toGrid(EXAMPLE_GRID)).length, "failed example");

function toGrid(input: string): string[][] {
    return input.trim().split("\n").map((line) => line.split(""));
}

function getAccessible(grid: string[][]): { i: number; j: number }[] {
    const check = (i: number, j: number) =>
        (i >= 0 && j >= 0 && i < grid.length && j < grid[i].length &&
                grid[i][j] === "@")
            ? 1
            : 0;

    const accessibleRolls = [];
    for (let i = 0; i < grid.length; i++) {
        const line = grid[i];
        for (let j = 0; j < line.length; j++) {
            const entry = grid[i][j];
            if (entry !== "@") {
                continue;
            }
            // check all eight cardinal directions for less than four rolls
            const adjacentRollsCount = check(i - 1, j - 1) + check(i - 1, j) +
                check(i - 1, j + 1) + check(i, j - 1) + check(i, j + 1) +
                check(i + 1, j - 1) + check(i + 1, j) + check(i + 1, j + 1);

            if (adjacentRollsCount < 4) {
                accessibleRolls.push({ i, j });
            }
        }
    }

    return accessibleRolls;
}

const input = await getInputCached("4");
const grid = toGrid(input);
const count = getAccessible(grid).length;
console.log("accessible rolls (part 1) is", count);

// part 2

// example
assertEq(43, removeAllPossibleRolls(toGrid(EXAMPLE_GRID)), "failed example");

function removeAllPossibleRolls(grid: string[][]): number {
    let accessibleRolls = getAccessible(grid);
    let totalRolls = 0;

    while (accessibleRolls.length > 0) {
        // remove the rolls
        for (const { i, j } of accessibleRolls) {
            grid[i][j] = ".";
        }

        totalRolls += accessibleRolls.length;
        accessibleRolls = getAccessible(grid);
    }

    return totalRolls;
}

const totalRolls = removeAllPossibleRolls(grid);
console.log("total accessible rolls (part 2) is", totalRolls);
