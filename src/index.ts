import fs from "node:fs/promises";
import { tryCatch } from "./utils/tryCatch.js";
import {
  renamedResultLogURL,
  renamedSongListURL,
  resultLogURL,
  songListURL,
} from "./utils/urls.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import processSongList from "./utils/processSongList.js";
import { type Browser, firefox } from "playwright";

/*************************************************************************/
/** CONFIG */
/*************************************************************************/
/** DIVIDER for [`songURL`, `mode`]. */
const DIVIDER = "__DIVIDER__";
/*************************************************************************/
/*************************************************************************/

let browser: Browser | null = null;
dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 3000;
const origins = process.env.ALLOWED_ORIGINS;
const corsMiddleware = cors({
  origin: origins ? origins.split(" ") : undefined,
});
const bodyParserMiddleware = bodyParser.json();

app.post(
  "/api/v1/downloadSongs/",
  corsMiddleware,
  bodyParserMiddleware,
  async (req, res) => {
    console.dir(req.body);
    for (const { links, mode } of req.body) {
      for (const link of links) {
        await tryCatch(
          fs.appendFile(songListURL, `${link}${DIVIDER}${mode}\n`)
        );
      }
    }
    const success = await processSongList(DIVIDER);
    await tryCatch(fs.rename(songListURL, renamedSongListURL()));
    await tryCatch(fs.rename(resultLogURL, renamedResultLogURL()));

    await tryCatch(fs.writeFile(songListURL, ""));
    return void res.json({ success });
  }
);

app.post(
  "/api/v1/fetchVideoID/",
  corsMiddleware,
  bodyParserMiddleware,
  async (req, res) => {
    const youtubeURLs: string[] = [];
    if (!(req.body.urls instanceof Array)) {
      console.warn(
        "[POST FETCH VIDEO ID]: Request URLs are not a valid array."
      );
      return void res.status(400).json({ success: false, youtubeURLs });
    }

    if (!browser) {
      console.warn("[POST FETCH VIDEO ID]: Browser not assigned.");
      return void res.status(400).json({ success: false, youtubeURLs });
    }

    const page = await tryCatch(browser.newPage());
    if (page.error) {
      console.warn(`[POST FETCH VIDEO ID]: Page ${page.error.message}.`);
      return void res.status(400).json({ success: false, youtubeURLs });
    }

    for (const url of req.body.urls) {
      await tryCatch(page.data.goto(url, { timeout: 1000 }));
      const premiumTuberURL = page.data.url();
      const dividerIndex = premiumTuberURL.lastIndexOf("/");
      const [videoID] = premiumTuberURL
        .substring(dividerIndex + 1, premiumTuberURL.length)
        .split("?");
      const youtubeURL = `https://www.youtube.com/watch?v=${videoID}`;
      youtubeURLs.push(youtubeURL);
    }

    await page.data.close();
    res.json({
      success: true,
      youtubeURLs,
    });
  }
);

app.options("/api/v1/postSong/", corsMiddleware, (req, __, next) => next(req));
app.options("/api/v1/fetchVideoID/", corsMiddleware, (req, __, next) =>
  next(req)
);

app.listen(PORT, async () => {
  console.log(`Listening to PORT: ${PORT}`);
  const firefoxBrowser = await tryCatch(
    firefox.launch({
      headless: true,
    })
  );
  if (firefoxBrowser.error) {
    console.warn(`[EXPRESS LISTEN]: Browser ${firefoxBrowser.error.message}.`);
    return;
  }
  browser = firefoxBrowser.data;
});
