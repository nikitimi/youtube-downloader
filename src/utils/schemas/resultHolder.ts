import { z } from "zod";
import downloadModeEnum from "../enums/downloadMode.js";

const baseSchema = z.object({
  mode: downloadModeEnum,
  youtubeURL: z.string(),
  title: z.string(),
});

const resultHolderSchema = z
  .object({
    success: z.literal(true),
    buffer: z.instanceof(Buffer),
  })
  .merge(baseSchema)
  .or(
    z
      .object({
        success: z.literal(false),
        buffer: z.null(),
      })
      .merge(baseSchema)
  );

export default resultHolderSchema;
export type ResultHolder = z.infer<typeof resultHolderSchema>;
