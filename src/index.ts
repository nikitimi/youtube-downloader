import { firefox } from "playwright";
import fs from "node:fs/promises";
import { tryCatch } from "./utils/tryCatch.js";
import { songListURL } from "./utils/urls.js";
import direct from "./utils/direct.js";
import eightLinkCleaner from "./utils/eightLinkCleaner.js";
import Timer from "./utils/timer.js";
import { argv } from "node:process";
import downloadModeEnum from "./utils/enums/downloadMode.js";

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
const HEADLESS = true;
/** For some reason, playwright initial `goto` method is stuck at waiting even when the DOM is loaded.
 *
 * This is necessary to avoid waiting for too long, will always result in timeout error,
 *
 * adjust depending on how fast browser loads the content, set headless to false to view.
 */
const TIMEOUT = 1500;
/*************************************************************************/
/*************************************************************************/

/** Returns the YouTube `videoID` from premiumtuberapp.com. */
function sanitizeURL(url: string) {
  const baseURL = "https://www.premiumtuberapp.com/video/";
  const [videoID] = url.replace(baseURL, "").split("?");
  return videoID;
}

/** Filter. */
function notEmptyString(v: string) {
  return v.trim() !== "";
}

async function getSongURLList() {
  const buffer = await fs.readFile(songListURL);
  return buffer.toString().split("\n").filter(notEmptyString);
}

async function automate() {
  const { success, ...rest } = downloadModeEnum.safeParse(argv[2]);
  const timeStart = new Date();
  const youtubeURLList: string[] = [];
  const browser = await tryCatch(
    firefox.launch({
      headless: HEADLESS,
    })
  );

  if (!success) {
    console.warn(`[ZOD PARSER]:`);
    console.table(JSON.parse(rest.error!.message));
    return;
  }

  if (browser.error) {
    const error =
      browser.error instanceof Error
        ? browser.error.message
        : "Unknown error occured.";
    console.warn(`[BROWSER LAUNCH ERROR]: ${error.toUpperCase()}.`);
    return;
  }

  await eightLinkCleaner();
  const songURLList = await tryCatch(getSongURLList());

  if (songURLList.error) {
    const error =
      songURLList.error instanceof Error
        ? songURLList.error.message
        : "Unknown error occured.";
    console.warn(`[READING SONG LIST ERROR]: ${error.toUpperCase()}.`);
    return;
  }

  const uniqueURLList = Array.from(new Set(songURLList.data));

  const page = await browser.data.newPage();
  const sortedSongs = uniqueURLList.sort();
  console.info("[SORTED UNIQUE LIST]");
  console.table(sortedSongs);

  for (const songURL of sortedSongs) {
    await tryCatch(page.goto(songURL, { timeout: TIMEOUT }));

    if (songURL.includes("youtu")) {
      youtubeURLList.push(songURL);
      continue;
    }
    const videoID = sanitizeURL(page.url());
    youtubeURLList.push(`https://www.youtube.com/watch?v=${videoID}`);
  }
  // await youtubeURLPage.close();
  await page.close();
  await browser.data.close();

  console.info("[PROCESSED LIST]");
  console.table(youtubeURLList);

  await direct(youtubeURLList, rest.data!);
  const timeEnd = new Date();
  new Timer(timeStart, timeEnd).logElapsedTime();
}

await automate();
