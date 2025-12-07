#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { getInputCached } from "./common.ts";
const input = await getInputCached("2");

const ranges = input.trim().split(",");
let sum = 0;

for (const range of ranges) {
    const [start, end] = range.split("-");
    const startInt = parseInt(start);
    const endInt = parseInt(end);

    for (let id = startInt; id <= endInt; id++) {
        const idString = id.toString();

        // if there is an odd number of digits, skip
        if (idString.length % 2 != 0) {
            continue;
        }

        const middleIndex = idString.length / 2;

        // if repeated sequence, increment sum
        if (idString.slice(0, middleIndex) == idString.slice(middleIndex)) {
            sum += id;
        }
    }
}

console.log("the sum of fake IDs (part 1) is", sum);

// part 2

sum = 0;

for (const range of ranges) {
    const [start, end] = range.split("-");
    const startInt = parseInt(start);
    const endInt = parseInt(end);

    for (let id = startInt; id <= endInt; id++) {
        const idString = id.toString();

        // we'll iterate over each possible substring length 
        for (let substringLength = 1; substringLength <= idString.length / 2; substringLength++) {
            const substring = idString.substring(0, substringLength);

            // if this doesn't divide the string evenly, skip
            if (idString.length % substring.length != 0) {
                continue;
            }

            const repeatedSubstring = substring.repeat(idString.length / substring.length);
            if (repeatedSubstring == idString) {
                sum += id;
                // breaking here is important to avoid double counting numbers like 777777
                break;
            }
        }
    }
}

console.log("the sum of fake IDs (part 2) is", sum);