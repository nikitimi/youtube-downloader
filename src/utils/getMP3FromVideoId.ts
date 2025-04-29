import { ytmp3 } from "@vreden/youtube_scraper";

export default async function getMP3FromVideoId(videoId: string) {
  const youTubeURL = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`Initializing download for ${youTubeURL}`);

  try {
    const res = await ytmp3(youTubeURL, 128);
    if (!res.status) throw new Error("Status is not ok.");
    return { downloadURL: res.download.url, youTubeURL };
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return { downloadURL: "", youTubeURL: "" };
  }
}
