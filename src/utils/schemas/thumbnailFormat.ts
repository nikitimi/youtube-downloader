import { z } from "zod";

const thumbnailFormatSchema = z.object({
  label: z.string().default("Thumbnail"),
  quality: z.string().default("Thumbnail"),
  value: z.string().default("Thumbnail"),
  url: z.string(),
});

export type ThumbnailFormat = z.infer<typeof thumbnailFormatSchema>;
export default thumbnailFormatSchema;
