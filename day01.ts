#!/usr/bin/env -S deno run --allow-read=./.inputs/
import { getInputCached } from "./common.ts";
const input = await getInputCached("1");

// parse input to numbers
const rotations = input.trim().split("\n").map((rotation) =>
    parseInt(rotation.slice(1)) * (rotation.charAt(0) == "L" ? 1 : -1)
);

const results = rotations.reduce((state, curr) => {
    state.rotation += curr;

    // required for true modulo
    state.rotation = ((state.rotation % 100) + 100) % 100;

    if (state.rotation == 0) {
        state.count += 1;
    }
    return state;
}, { count: 0, rotation: 50 });

console.log("the (part 1) password is", results.count);

// part 2
const results2 = rotations.reduce((state, curr) => {

    // the case where you started at zero and went backwards
    if (state.rotation == 0 && curr < 0) {
        state.count -= 1;
    }

    state.rotation += curr;
    state.count += Math.floor(Math.abs(state.rotation) / 100);

    // the negative case
    if (state.rotation <= 0) {
        state.count += 1;
    }

    // required for true modulo
    state.rotation = ((state.rotation % 100) + 100) % 100;
    return state;
}, { count: 0, rotation: 50 });

console.log("the (part 2) password is", results2.count);
