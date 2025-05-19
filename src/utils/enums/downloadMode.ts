import { z } from "zod";

const downloadModeEnum = z.enum(["mp3", "mp4"]);

export default downloadModeEnum;
export type DownloadMode = z.infer<typeof downloadModeEnum>;
