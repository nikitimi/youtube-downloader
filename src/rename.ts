import fs from "node:fs/promises";

const rootURL = new URL("../", import.meta.url);
const contents = await fs.readdir(rootURL);

const mp3s = contents.filter((k) => k.includes(".mp3"));

for (const mp3 of mp3s) {
  await fs.rename(
    new URL(mp3, rootURL),
    new URL(mp3.replace(" [ ezmp3.cc ]", ""), rootURL)
  );
}
