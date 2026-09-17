import { registerAs } from "@nestjs/config";
import { z } from "zod";

const redisConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().min(1).max(65_535),
  username: z.string(),
  password: z.string(),
});

export const redisConfig = registerAs("redis", () =>
  redisConfigSchema.parse({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME || "",
    password: process.env.REDIS_PASSWORD || "",
  })
);
