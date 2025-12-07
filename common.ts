export async function getInputCached(day: string) {
    const inputFilePath = `.inputs/day${day}`;

    return await Deno.readTextFile(inputFilePath).catch(() =>
        // if the file didn't exist, attempt to write it
        Deno.mkdir(".inputs", { recursive: true })
            .then(() => getInputStream(day))
            .then((stream) => Deno.writeFile(inputFilePath, stream))
            .then(() => Deno.readTextFile(inputFilePath))
    );
}

async function getInputStream(day: string) {
    const session = Deno.env.get("AOC_SESSION");
    const request = await fetch(
        `https://adventofcode.com/2025/day/${day}/input`,
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0",
                "Cookie": `session=${session}`,
            },
        },
    );

    if (!request.body) {
        throw Error("missing AOC request body");
    }
    return request.body;
}