#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { getInputCached } from "./common.ts";
const input = await getInputCached("1");

// parse input to numbers
const rotations = input.trim().split("\n").map((rotation) =>
    parseInt(rotation.slice(1)) * (rotation.charAt(0) == "L" ? 1 : -1)
);

const results = rotations.reduce((state, curr) => {
    state.rotation += curr;
    state.rotation %= 100;
    if (state.rotation == 0) {
        state.count += 1;
    }
    return state;
}, { count: 0, rotation: 50 });

console.log("the password is", results.count);
