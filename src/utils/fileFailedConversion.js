import fs from "node:fs/promises";

const csvFileURL = new URL("../../failedConversionList.csv", import.meta.url);

export default async function fileFailedConversion({ videoId, title }) {
  try {
    await fs.appendFile(csvFileURL, `${JSON.stringify({ videoId, title })}\n`);
    console.log("Successfully written the failed conversion to file.");
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    await fs.writeFile(csvFileURL, "");
    fileFailedConversion();
  }
}
