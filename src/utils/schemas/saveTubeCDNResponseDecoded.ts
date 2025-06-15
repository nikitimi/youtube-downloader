import { z } from "zod";
import audioFormatSchema from "../schemas/audioFormat.js";
import thumbnailFormatSchema from "../schemas/thumbnailFormat.js";
import videoFormatShema from "../schemas/videoFormat.js";

const saveTubeCDNResponseDecodedSchema = z.object({
  id: z.string().length(11),
  key: z.string().default("ab630bd9ce1238ece7bed8e4583643a28e4ed767"),
  url: z.string(),
  title: z.string(),
  titleSlug: z.string(),
  thumbnail: z.string(),
  duration: z.number(),
  durationLabel: z.string(),
  audio_formats: z.array(audioFormatSchema),
  video_formats: z.array(videoFormatShema),
  thumbnail_formats: z.array(thumbnailFormatSchema),
  default_selected: z.number().default(360),
  fromCache: z.boolean(),
});

export type SaveTubeCDNResponseDecoded = z.infer<
  typeof saveTubeCDNResponseDecodedSchema
>;
export default saveTubeCDNResponseDecodedSchema;
