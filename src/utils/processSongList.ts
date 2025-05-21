import fs from "node:fs/promises";
import { firefox } from "playwright";
import { tryCatch } from "./tryCatch.js";
import { songListURL } from "./urls.js";
import direct from "./direct.js";
import eightLinkCleaner from "./eightLinkCleaner.js";
import Timer from "./timer.js";
import { DownloadMode } from "./enums/downloadMode.js";

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
/** Whether to show the browser or not. */
const HEADLESS = true;
/** For some reason, playwright initial `goto` method is stuck at waiting even when the DOM is loaded.
 *
 * This is necessary to avoid waiting for too long, will always result in timeout error,
 *
 * adjust depending on how fast browser loads the content, set headless to false to view.
 */
const TIMEOUT = 6000;
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

export default async function processSongList(divider: string) {
  const timeStart = new Date();
  const youtubeURLList: { songURL: string; mode: DownloadMode }[] = [];
  const browser = await tryCatch(
    firefox.launch({
      headless: HEADLESS,
    })
  );

  if (browser.error) {
    const error =
      browser.error instanceof Error
        ? browser.error.message
        : "Unknown error occured.";
    console.warn(`[BROWSER LAUNCH ERROR]: ${error.toUpperCase()}.`);
    return false;
  }

  await eightLinkCleaner();
  const songURLList = await tryCatch(getSongURLList());

  if (songURLList.error) {
    const error =
      songURLList.error instanceof Error
        ? songURLList.error.message
        : "Unknown error occured.";
    console.warn(`[READING SONG LIST ERROR]: ${error.toUpperCase()}.`);
    return false;
  }

  const uniqueURLList = Array.from(new Set(songURLList.data)).map((v) => {
    const [songURL, mode] = v.split(divider);
    return { songURL, mode: mode as DownloadMode };
  });

  const page = await browser.data.newPage();
  const sortedSongs = uniqueURLList.sort((a, b) =>
    a.songURL < b.songURL ? -1 : 0
  );
  console.info("[SORTED UNIQUE LIST]");
  console.table(sortedSongs);

  /** This should resolve the coldstart that renders 8link.cc redirects YouTube title getter unsuccessful. */
  let timeoutPlaceholder = TIMEOUT;
  for (const props of sortedSongs) {
    await tryCatch(page.goto(props.songURL, { timeout: timeoutPlaceholder }));

    if (props.songURL.includes("youtu")) {
      youtubeURLList.push(props);
      continue;
    }
    const videoID = sanitizeURL(page.url());
    youtubeURLList.push({
      songURL: `https://www.youtube.com/watch?v=${videoID}`,
      mode: props.mode,
    });

    if (timeoutPlaceholder === TIMEOUT) {
      timeoutPlaceholder = 1500;
    }
  }
  // await youtubeURLPage.close();
  await tryCatch(page.close());
  await tryCatch(browser.data.close());

  console.info("[PROCESSED LIST]");
  console.table(youtubeURLList);

  await direct(youtubeURLList);
  const timeEnd = new Date();
  new Timer(timeStart, timeEnd).logElapsedTime();
  return true;
}
