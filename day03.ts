#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { getInputCached } from "./common.ts";
const input = await getInputCached("3");

const banks = input.trim().split("\n");

function findLargestDigit(
    digits: string[],
): { largestDigit: string; digitIndex: number } {
    return digits
        .entries()
        .reduce((state, [idx, digit]) => {
            // we want the first largest digit,
            // because it gives us the largest search space for the second digit
            if (digit > state.largestDigit) {
                state.largestDigit = digit;
                state.digitIndex = idx;
            }

            return state;
        }, { largestDigit: digits[0], digitIndex: 0 });
}

let sum = 0;

for (const bank of banks) {
    const digits = bank.split("");

    // we don't want to consider the last digit, because we can't pick a second digit
    const { largestDigit, digitIndex } = findLargestDigit(digits.slice(0, -1));

    // next, find the largest remaining digit
    const { largestDigit: secondDigit, digitIndex: _ } = findLargestDigit(
        digits.slice(digitIndex + 1),
    );

    const joltage = parseInt(largestDigit + secondDigit);
    sum += joltage;
}

console.log("maximum joltage (part 1) is", sum);

sum = 0;

for (const bank of banks) {
    const digits = bank.split("");

    let startingIndex = 0;
    let joltageDigits = "";

    for (let i = 0; i < 12; i++) {
        // we don't want to consider the last ~i digits, because we can't pick enough following digits
        const { largestDigit, digitIndex } = findLargestDigit(
            digits.slice(startingIndex, digits.length - 11 + i),
        );

        startingIndex += digitIndex + 1;
        joltageDigits += largestDigit;
    }

    const joltage = parseInt(joltageDigits);
    sum += joltage;
}

console.log("maximum joltage (part 2) is", sum);
