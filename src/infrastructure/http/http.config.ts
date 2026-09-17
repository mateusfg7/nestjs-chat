import { registerAs } from "@nestjs/config";
import { z } from "zod";

const httpConfigSchema = z.object({
  port: z.coerce.number().min(1).max(65_535),
});

export const httpConfig = registerAs("http", () =>
  httpConfigSchema.parse({
    port: process.env.PORT,
  })
);
