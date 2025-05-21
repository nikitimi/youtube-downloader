import type { ResultHolder } from "./schemas/resultHolder.js";

import fs from "node:fs/promises";
import { resultLogURL } from "./urls.js";

export default async function (result: Omit<ResultHolder, "buffer" | "mode">) {
  const { success, title, youtubeURL } = result;
  const log = `[${success ? "✔" : "❌"}] ${title} \` ${youtubeURL}\n`;
  await fs.appendFile(resultLogURL, log);
}
