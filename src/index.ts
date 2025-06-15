import fs from "node:fs/promises";
import saveToFile from "./utils/saveToFile.js";
import { tryCatch } from "./utils/tryCatch.js";
import cdnInfo from "./utils/cdnInfo.js";
import decode from "./utils/decode.js";

type ResultLog = { songURL: string; downloadURL: string; title: string };

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
const RESULT_LOG_URL = new URL("../result-log.txt", import.meta.url);
// const HEADLESS = false;
/** For some reason, playwright initial `goto` method is stuck at waiting even when the DOM is loaded.
 *
 * This is necessary to avoid waiting for too long, will always result in timeout error,
 *
 * adjust depending on how fast browser loads the content, set headless to false to view.
 */
// const TIMEOUT = 1500;
/*************************************************************************/
/*************************************************************************/

function notEmptyString(v: string) {
  return v.trim() !== "";
}

async function getSongURLList() {
  const songURLListURL = new URL("../8link.txt", import.meta.url);
  const buffer = await fs.readFile(songURLListURL);
  return buffer.toString().split("\n").filter(notEmptyString);
}

async function automate() {
  const songURLList = await tryCatch(getSongURLList());

  if (!songURLList.data || songURLList.error) {
    const error =
      songURLList.error instanceof Error
        ? songURLList.error.message
        : "Unknown error occured.";
    console.warn(`[READING SONG LIST ERROR]: ${error.toUpperCase()}.`);
    return;
  }
  /** Save the song from Scraper URL to buffer to file. */
  for (const url of songURLList.data) {
    const info = await cdnInfo(url);
    if (!info) {
      console.warn(`No CDN Info for URL: ${url}`);
      continue;
    }
    const decoded = decode(info.data);
    const audioFormat = decoded.audio_formats.find((f) => f.quality === 128);
    if (!audioFormat) {
      console.warn(`No Audio format found for URL: ${url}`);
      continue;
    }
    const response = await fetch("https://cdn302.savetube.su/download", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        downloadType: "audio",
        quality: `${audioFormat.quality}`,
        key: decoded.key,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch audio for URL: ${url}`);
      continue;
    }
    const json = await response.json();

    const result = await tryCatch(
      saveToFile(json.data.downloadUrl, decoded.title)
    );
    await fs.appendFile(
      RESULT_LOG_URL,
      `[${result.error ? "❌" : "✔"}]: FOR ${url} ${decoded.title} - ${
        json.data.downloadUrl
      }\n`
    );
    if (result.error instanceof Error) {
      console.warn(`[ERROR FS]: ${result.error.message}`);
    }
  }
}

await automate();
