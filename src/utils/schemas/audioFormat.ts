import { z } from "zod";

const audioFormatSchema = z.object({
  quality: z.number().default(128),
  url: z.string().nullable(),
  label: z.string(),
});

export type AudioFormat = z.infer<typeof audioFormatSchema>;
export default audioFormatSchema;
