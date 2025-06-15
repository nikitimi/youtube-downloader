import fs from "node:fs/promises";

export default async function saveToFile(stringURL: string, title: string) {
  if (!stringURL) return console.log("String URL is undefined.");
  if (stringURL.trim() === "") {
    return console.log("String URL passed is not valid.");
  }
  const response = await fetch(stringURL, {
    method: "GET",
    headers: {
      Host: "cdn302.savetube.su",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Sec-GPC": "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      Priority: "u=0, i",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) return console.log("Error in fetching.");
  const buffer = await response.arrayBuffer();
  /** Removes non-numerical and alphabet characters. */
  const cleanerRegExp = /([#%&{}\\\/><*\?$":@+`\|=]*)/g;
  const sanitizedTitle = title.replace(cleanerRegExp, "").trim();

  await fs.writeFile(
    new URL(`../../raw/${sanitizedTitle}.mp3`, import.meta.url),
    Buffer.from(buffer)
  );
  console.log(`Successfully written ${sanitizedTitle}.`);
}
