import { firefox } from "playwright";
import fs from "node:fs/promises";
import saveToFile from "./saveToFile.js";
import getMP3FromVideoId from "./utils/getMP3FromVideoId.js";
import { tryCatch } from "./utils/tryCatch.js";

function notEmptyString(v: string) {
  return v.trim() !== "";
}

async function getSongURLList() {
  const songURLListURL = new URL("../8link.txt", import.meta.url);
  const buffer = await fs.readFile(songURLListURL);
  return buffer.toString().split("\r\n").filter(notEmptyString);
}

async function automate() {
  const browser = await tryCatch(
    firefox.launch({
      headless: false,
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

  const page = await browser.data.newPage();
  const resultLogList: Record<"downloadURL" | "title", string>[] = [];
  const titleHeading = "h1[class='style-scope ytd-watch-metadata']";

  function sanitizeURL(url: string) {
    const baseURL = "https://www.premiumtuberapp.com/video/";
    const [videoID] = url.replace(baseURL, "").split("?");
    return videoID;
  }

  page.on("domcontentloaded", async (p) => {
    const youtubeURLPage = await browser.data.newPage();
    const videoID = sanitizeURL(p.url());
    if (videoID.includes("https"))
      return console.warn(`[INVALID VIDEO ID]: ${videoID}.`);
    const { downloadURL, youTubeURL } = await getMP3FromVideoId(videoID);
    await tryCatch(youtubeURLPage.goto(youTubeURL));
    await tryCatch(youtubeURLPage.waitForSelector(titleHeading));

    youtubeURLPage.on("domcontentloaded", async (pp) => {
      const textContent = await tryCatch(
        pp.locator(titleHeading).textContent()
      );
      if (!textContent.data) {
        console.warn("[CANNOT LOCATE TITLE IN YOUTUBE].");
        return;
      }
      resultLogList.push({ downloadURL, title: textContent.data });
    });

    await youtubeURLPage.close();
  });

  //   for (const songURL of songURLList.data) {
  //     const response = await tryCatch(page.goto(songURL, { timeout: 60000 }));
  //     if (!response.data || response.error) {
  //       const error =
  //         response.error instanceof Error
  //           ? response.error.message
  //           : "Unknown error occured.";
  //       console.warn(`[GOTO URL]: ${error.toUpperCase()}.`);
  //       continue;
  //     }
  //   }
  const promiseList = songURLList.data.map((songURL) =>
    tryCatch(page.goto(songURL, { timeout: 60000 })).then((response) => {
      if (!response.data || response.error) {
        const error =
          response.error instanceof Error
            ? response.error.message
            : "Unknown error occured.";
        console.warn(`[GOTO URL]: ${error.toUpperCase()}.`);
      }
    })
  );

  const results = await Promise.allSettled(promiseList);

  for (const result of results) {
    console.table(result);
  }
  for (const { downloadURL, title } of resultLogList) {
    const result = await tryCatch(saveToFile(downloadURL, title));
    const isUnsuccessful = result.data === null || result.error;
    console.info(`[${isUnsuccessful ? "❌" : "✔"}]: FOR ${downloadURL}.`);
  }
  //   await page.waitForSelector(selector);
  //   const title = await page.locator(selector).textContent();
  console.table(resultLogList);
  await page.close();
  await browser.data.close();
}

await automate();
