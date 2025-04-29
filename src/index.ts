// import { google } from "googleapis";
import dotenv from "dotenv";
import saveToFile from "./saveToFile.js";
import getMP3FromVideoId from "./utils/getMP3FromVideoId.js";
import fs from "node:fs/promises";
import rename from "./utils/puppeteer/rename.js";
import browser from "./utils/puppeteer/puppeteer.js";

dotenv.config();

/** Create a YouTube API helper. */
// const youtube = google.youtube({
//   version: "v3",
//   auth: process.env.YOUTUBE_API_KEY,
// });

/** ARGUMENT MUST BE VIDEO ID ARRAY. */
async function processTheSongByVideoId(arrayedList: string[]) {
  for (const videoId of arrayedList) {
    console.table({ videoId });
    const { downloadURL, youTubeURL } = await getMP3FromVideoId(videoId);
    const title = await rename(youTubeURL);
    await saveToFile(downloadURL, title);
  }
}

async function processSongList(array: string[] = []) {
  // If an array argument has been passed.
  if (array.length > 0) {
    await processTheSongByVideoId(array);
    return;
  }
  const rawSongList = new URL("../songlist.txt", import.meta.url);
  const buffer = await fs.readFile(rawSongList);
  const arrayedList = buffer.toString().split("\n");

  // If no array argument is passed.
  if (arrayedList.length > 0) {
    await processTheSongByVideoId(arrayedList);
    return;
  }
}

/** Returns 0 to many instance of videoId Array. */
async function process8LinkURLList() {
  const videoIdList = [];
  try {
    const rawSongList = new URL("../8link.txt", import.meta.url);
    const buffer = await fs.readFile(rawSongList);
    const arrayedList = buffer.toString().split("\n");

    if (arrayedList.length > 0) {
      const page = await browser.newPage();
      for (const rawURL of arrayedList) {
        await page.goto(rawURL);
        const [videoId] = page
          .url()
          .replace("https://www.premiumtuberapp.com/video/", "")
          .split("?");
        console.info(videoId);
        videoIdList.push(videoId);
      }
      return videoIdList;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn(err.message);
    }
    return videoIdList;
  }
}
const videoIdArray = await process8LinkURLList();
console.table(videoIdArray);
await processSongList(videoIdArray);
await browser.close();

/** WITH YOUTUBE SEARCH. */
// if (arrayedList.length > 0) {
//   // Search for Video in YouTube
//   for (const song of arrayedList) {
//     const result = youtube.search.list({
//       part: "snippet",
//       q: `${song} lyrics video`,
//     });

//     if (result instanceof Promise) {
//       const { data } = await result;
//       if (data.items instanceof Array && data.items.length > 0) {
//         const videoId = data.items[0].id.videoId;
//         console.table({ song, videoId });
//         // const stringURL = await getMP3FromVideoId(videoId);
//         // await saveToFile(stringURL, song);
//       }
//     }
//   }
// }

/** DIRECT VIDEO ID. */
// for (const { videoId, title } of list) {
//   const stringURL = await getMP3FromVideoId(videoId);
//   if (typeof stringURL !== "string" || stringURL.trim() === "") {
//     // TODO: Implement a downloader for the youtube video not found within scrapper API.
//     continue;
//   }
//   await saveToFile(stringURL, title);
// }
