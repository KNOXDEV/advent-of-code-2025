#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { assertEq, findIndices, getInputCached, identity, int, product, splitArrayAtIndices, sum, transpose } from "./common.ts";

// part 1

type Problems = { numbers: number[]; op: string }[];

function parseInput(input: string): Problems {
    const vals = input.trim().split("\n").map((line) =>
        line.trim().split(" ").filter(identity)
    );

    return vals.ext(transpose).map((problem) => ({
        op: problem.pop()!,
        numbers: problem.map(int),
    }));
}

function computeAnswers(problems: Problems): number[] {
    return problems.map((problem) =>
        problem.op == "*"
            ? problem.numbers.ext(product)
            : problem.numbers.ext(sum)
    );
}

// part 1 example

const EXAMPLE_INPUT = `
123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   + 
`;

const exampleProblems = parseInput(EXAMPLE_INPUT);
const exampleAnswers = computeAnswers(exampleProblems);
assertEq([33210, 490, 4243455, 401], exampleAnswers);
assertEq(4277556, exampleAnswers.ext(sum));

// part 1 actual

const input = await getInputCached("6");
const problems = parseInput(input);
const answers = computeAnswers(problems);

console.log(
    "the total answer (part 1) is",
    answers.ext(sum),
);

// part 2

function parseInput2(input: string): Problems {
    const lines = input.trim().split("\n");
    const ops = lines.pop()!.split(" ").filter(identity);

    const digits = lines.map((line) => line.split(""));

    // transpose and parse digits
    // this will produce NaN between columns which is actually convenient
    const numbers = digits.ext(transpose).map(digits => digits.join("").trim()).map(int);

    // compute the indices where NaN is found
    // and split the array at those indicies
    const indices = findIndices(numbers, isNaN);
    const numChunks = splitArrayAtIndices(numbers, indices).toArray();

    return numChunks.map((nums, index) => ({ numbers: nums, op: ops[index] })).reverse();
}

// part 2 example

const example_problems2 = parseInput2(EXAMPLE_INPUT);
const example_answers2 = computeAnswers(example_problems2);
assertEq([1058, 3253600, 625, 8544], example_answers2);
assertEq(3263827, example_answers2.ext(sum));

// part 2 actual

const problems2 = parseInput2(input);
const answers2 = computeAnswers(problems2);

console.log(
    "the total answer (part 2) is",
    answers2.ext(sum),
);