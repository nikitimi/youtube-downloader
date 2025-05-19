import { z } from "zod";

const resultHolderSchema = z
  .object({
    success: z.literal(true),
    buffer: z.instanceof(Buffer),
    youtubeURL: z.string(),
    title: z.string(),
  })
  .or(
    z.object({
      success: z.literal(false),
      buffer: z.null(),
      youtubeURL: z.string(),
      title: z.string(),
    })
  );

export default resultHolderSchema;
export type ResultHolder = z.infer<typeof resultHolderSchema>;
