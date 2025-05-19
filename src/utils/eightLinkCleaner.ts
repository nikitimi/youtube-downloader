import { rootURL, songListURL } from "./urls.js";
import fs from "node:fs/promises";

const regExp = /(https:\/\/8link.cc\/)+([A-Za-z0-9]{6})+([\r\n]?)/g;

/** Extract 8links to songListURL. */
export default async function eightLinkCleaner() {
  const eightLinkCleaningTextURL = new URL("8link-cleaning.txt", rootURL);
  const buffer = await fs.readFile(eightLinkCleaningTextURL);
  const results = buffer.toString().matchAll(regExp);
  if (results) {
    for (const [, base, id] of results) {
      const link = `${base}${id}`;
      await fs.appendFile(songListURL, `${link}\n`);
    }
  }
  await fs.writeFile(eightLinkCleaningTextURL, "");
}
