import { ytmp3 } from "@vreden/youtube_scraper";
// import { google } from "googleapis";
import dotenv from "dotenv";
import saveToFile from "./saveToFile.js";
import fileFailedConversion from "./utils/fileFailedConversion.js";
import list from "../list.json" with { type: "json" };

dotenv.config();

async function getMP3FromVideoId(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`Initializing download for ${url}`);

  try {
    const res = await ytmp3(url, 128);
    if (!res.status) return console.log(res.message);
    return res.download.url;
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return "";
  }
}

// const youtube = google.youtube({
//   version: "v3",
//   auth: process.env.YOUTUBE_API_KEY,
// });
// Search for Video in YouTube
// for (const song of list) {
//   const result = youtube.search.list({
//     part: "snippet",
//     q: `${song} lyrics video`,
//   });

//   if (result instanceof Promise) {
//     const { data } = await result;
//     if (data.items instanceof Array && data.items.length > 0) {
//       const videoId = data.items[0].id.videoId;
//       console.log(videoId);
//       const stringURL = await getMP3FromVideoId(videoId);
//       await saveToFile(stringURL, song);
//     }
//   }
// }

// Direct `videoId`.
for (const { videoId, title } of list) {
  const stringURL = await getMP3FromVideoId(videoId);
  if (typeof stringURL !== "string" || stringURL.trim() === "") {
    // TODO: Implement a downloader for the youtube video not found within scrapper API.
    await fileFailedConversion({ videoId, title });
    continue;
  }
  await saveToFile(stringURL, title);
}
