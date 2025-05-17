import { firefox } from "playwright";
import fs from "node:fs/promises";
import saveToFile from "./utils/saveToFile.js";
import getMP3FromVideoId from "./utils/getMP3FromVideoId.js";
import { tryCatch } from "./utils/tryCatch.js";

type ResultLog = { songURL: string; downloadURL: string; title: string };

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
const RESULT_LOG_URL = new URL("../result-log.txt", import.meta.url);
const HEADLESS = false;
/** For some reason, playwright initial `goto` method is stuck at waiting even when the DOM is loaded.
 *
 * This is necessary to avoid waiting for too long, will always result in timeout error,
 *
 * adjust depending on how fast browser loads the content, set headless to false to view.
 */
const TIMEOUT = 1500;
/*************************************************************************/
/*************************************************************************/

function sanitizeURL(url: string) {
  const baseURL = "https://www.premiumtuberapp.com/video/";
  const [videoID] = url.replace(baseURL, "").split("?");
  return videoID;
}

function notEmptyString(v: string) {
  return v.trim() !== "";
}

async function getSongURLList() {
  const songURLListURL = new URL("../8link.txt", import.meta.url);
  const buffer = await fs.readFile(songURLListURL);
  return buffer.toString().split("\n").filter(notEmptyString);
}

async function automate() {
  const browser = await tryCatch(
    firefox.launch({
      headless: HEADLESS,
    })
  );

  if (!browser.data || browser.error) {
    const error =
      browser.error instanceof Error
        ? browser.error.message
        : "Unknown error occured.";
    console.warn(`[BROWSER LAUNCH ERROR]: ${error.toUpperCase()}.`);
    return;
  }

  const songURLList = await tryCatch(getSongURLList());

  if (!songURLList.data || songURLList.error) {
    const error =
      songURLList.error instanceof Error
        ? songURLList.error.message
        : "Unknown error occured.";
    console.warn(`[READING SONG LIST ERROR]: ${error.toUpperCase()}.`);
    return;
  }

  /** Get the YouTube and Scraper URL, together with YouTube title using Playwright. */
  const resultLogList = new Promise<ResultLog[]>((resolve) => {
    const resultLogList: ResultLog[] = [];
    const titleHeading = "h1[class='style-scope ytd-watch-metadata']";
    browser.data.newPage().then(async (page) => {
      console.table(songURLList.data);
      let index = 0;

      for (const songURL of songURLList.data) {
        let downloadURL = "";
        await tryCatch(page.goto(songURL, { timeout: TIMEOUT }));

        if (!songURL.includes("youtu")) {
          const videoID = sanitizeURL(page.url());
          const { downloadURL: dURL, youTubeURL } = await getMP3FromVideoId(
            videoID,
            index
          );
          downloadURL = dURL;

          // if (videoID.includes("https")) {
          //   return console.warn(`[INVALID VIDEO ID]: ${videoID}.`);
          // }

          console.info(`[DOM CONTENT LOADED]: ${youTubeURL}`);
          await tryCatch(page.goto(youTubeURL));
        } else {
          const { downloadURL: dURL } = await getMP3FromVideoId(
            songURL.split("?v=")[1],
            index
          );
          downloadURL = dURL;
        }
        index += 1;

        await tryCatch(page.waitForSelector(titleHeading));

        const textContent = await tryCatch(
          page.locator(titleHeading).textContent()
        );

        if (textContent.data) {
          resultLogList.push({
            songURL,
            downloadURL,
            title: textContent.data,
          });
        }
      }
      // await youtubeURLPage.close();
      await page.close();
      await browser.data.close();
      resolve(resultLogList);
    });
  });

  const awaitedList = await resultLogList;
  /** Save the song from Scraper URL to buffer to file. */
  for (const { songURL, downloadURL, title } of awaitedList) {
    const result = await tryCatch(saveToFile(downloadURL, title));
    await fs.appendFile(
      RESULT_LOG_URL,
      `[${
        result.error ? "❌" : "✔"
      }]: FOR ${songURL} ${title} - ${downloadURL}\n`
    );
    console.info(`[ERROR FS]: ${result.error?.message}`);
  }

  console.table(awaitedList);
}

await automate();
