import { z } from "zod";

// creating a schema for strings
export const extensionMessage = z.object({
  t: z.literal("xt"),
  b: z.object({
    r: z.number(),
    o: z.any(),
  })
});
