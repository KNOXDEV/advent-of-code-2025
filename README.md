# advent of code 2025 (Deno Edition)

As is oft the tradition, I'll be using the Advent of Code to build fluency in some fringe yet vogue technology.
This year's reinvented wheel of choice is [Deno](https://deno.com/): a NodeJS Sequel.

I'm very well-versed in JavaScript / TypeScript already (as you must be for any web development),
but I don't think NodeJS itself is able to quite rise to the general utility of Python or Bash as a small-task scripting language.

Does Deno address these concerns? Under what circumstances is it a better general-purpose scripting language than Python?
Under what circumstances is it a better option for a Node project than Node itself?
Hopefully we will find out, as I've been trying to root out Python from my small-task workflows for quite some time.

## on the challenges themselves

As is also tradition, I am unlikely to do a substantial number of AoC challenges or do them in a timely manner.
Once my above goal has been met, I will move on to something else. 

### how to run challenges

I use Nix to manage the devShell, but it's not really necessary.
As long as you have Deno (v2.5.6 as of writing) installed, everything will work. 

Run each day's script directly:

```bash
./day01.ts
```

If you don't already have challenge inputs downloaded and cached, you'll need to set your AOC_SESSION cookie.

```bash
export AOC_SESSION=sessionCookieHere
```

Then, the `common.ts` chassis will download inputs for you. 