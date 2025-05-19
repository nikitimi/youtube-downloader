import type { ResultHolder } from "./schemas/resultHolder.js";

import { firefox } from "playwright";
import fs from "node:fs/promises";
import { tryCatch } from "./tryCatch.js";
import logging from "./logging.js";
import { rawDirectoryURL } from "./urls.js";
import sanitizeTitle from "./sanitizeTitle.js";
import { DownloadMode } from "./enums/downloadMode.js";

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
const HEADLESS = true;
const TIMEOUT = 60000;
/*************************************************************************/

/** Directly get download link without using third-party node package. */
export default async function direct(
  youtubeURLList: string[],
  downloadMode: DownloadMode
) {
  const resultHolder: ResultHolder[] = [];
  const browser = await tryCatch(
    firefox.launch({
      headless: HEADLESS,
    })
  );

  function selectedOption(fallback?: string) {
    if (fallback === "fallback") {
      switch (downloadMode) {
        case "mp4":
          return "360";
        default:
          break;
      }
    }
    switch (downloadMode) {
      case "mp3":
        return "128";
      case "mp4":
        return "1080";
      default:
        return "360";
    }
  }

  if (browser.error) {
    console.log(`BROWSER: ${browser.error.message}`);
    return null;
  }

  const page = await tryCatch(browser.data.newPage());

  if (page.error) {
    console.log(`PAGE: ${page.error.message}`);
    return null;
  }

  for (const youtubeURL of youtubeURLList) {
    await page.data.goto("https://yt.savetube.me/");

    const searchInputLocator = page.data.locator(
      'input[placeholder="Paste your Youtube link here"]'
    );
    const searchButtonLocator = page.data.locator('button[type="submit"]');
    const groupButton = 'div[class="btn-group flex"]';
    const anchorDownload = "a[download]";

    await searchInputLocator.fill(youtubeURL);
    await searchButtonLocator.click();

    // Loading...
    const groupButtonResult = await tryCatch(
      page.data.waitForSelector(groupButton, { timeout: 6000 })
    );
    if (groupButtonResult.error) {
      // This usually means that the YouTube URL is invalid.
      console.warn(`[CDN FAILED]`);
      resultHolder.push({
        buffer: null,
        success: false,
        youtubeURL,
        title: "untitled",
      });
      continue;
    }
    // console.info("Group Button found.");
    const baseGroup = page.data.locator(groupButton);

    const selectOption = await tryCatch(
      baseGroup.locator("select").selectOption(selectedOption(), {
        timeout: TIMEOUT,
      })
    );
    if (selectOption.error) {
      console.warn(`[FALLBACK]: ${selectOption.error.message}`);
      baseGroup.locator("select").selectOption(selectedOption("fallback"), {
        timeout: TIMEOUT,
      });
    }
    await baseGroup.locator("button").click({ timeout: TIMEOUT });
    const titleLocator = page.data.locator("h3[class]");
    const title = await titleLocator.first().textContent();

    // Loading...
    await page.data.waitForSelector(anchorDownload);
    const href = await page.data
      .locator(anchorDownload)
      .getAttribute("href", { timeout: TIMEOUT });
    if (!href) {
      console.warn("No valid href found.");
      resultHolder.push({
        buffer: null,
        success: false,
        youtubeURL,
        title: `${title ? title : "untitled"}`,
      });
      continue;
    }

    const response = await tryCatch(
      fetch(href, {
        method: "GET",
      })
    );

    if (response.error) {
      console.warn(`RESPONSE: ${response.error.message}`);
      resultHolder.push({
        buffer: null,
        success: false,
        youtubeURL,
        title: `${title ? title : "untitled"}`,
      });
      continue;
    }

    const arrayBuffer = await response.data.arrayBuffer();
    console.info(`[PROCESSING]: ${title}.`);
    resultHolder.push({
      buffer: Buffer.from(arrayBuffer),
      success: true,
      youtubeURL,
      title: `${title ? title : "untitled"}`,
    });
  }

  await browser.data.close();

  console.info("Downloading songs...");
  for (const { success, buffer, title, youtubeURL } of resultHolder) {
    await logging({ success, title, youtubeURL });
    if (!success) continue;

    await fs.writeFile(
      new URL(
        `${sanitizeTitle(title).split(".")[0]}${
          downloadMode ? `.${downloadMode}` : ""
        }`,
        rawDirectoryURL
      ),
      buffer
    );
  }
}
