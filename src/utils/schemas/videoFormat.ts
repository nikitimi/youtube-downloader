import { z } from "zod";

const videoFormatShema = z.object({
  height: z.number().default(360),
  width: z.number().default(640),
  url: z.string(),
  quality: z.number().default(360),
  label: z.string(),
  default_selected: z.number(),
});

export type VideoFormat = z.infer<typeof videoFormatShema>;
export default videoFormatShema;
