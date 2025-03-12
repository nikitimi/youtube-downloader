import fs from "node:fs/promises";

export default async function saveToFile(stringURL, title) {
  if (stringURL.trim() === "") {
    return console.log("String URL passed is not valid.");
  }
  const response = await fetch(stringURL, {
    method: "GET",
    headers: {
      host: "cdn73.savetube.su",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.5",
      "accept-encoding": "gzip, deflate, br, zstd",
      "alt-used": "cdn73.savetube.su",
      connection: "keep-alive",
      "upgrade-insecure-requests": 1,
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "cross-site",
      priority: "u=0, i",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
    },
  });

  if (!response.ok) return console.log("Error in fetching.");
  const buffer = await response.arrayBuffer();

  await fs.writeFile(
    new URL(`../raw/${title}.mp3`, import.meta.url),
    Buffer.from(buffer)
  );
  console.log(`Successfully written ${title}.`);
}
