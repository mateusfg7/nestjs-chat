import { registerAs } from "@nestjs/config";
import { z } from "zod";

const wsConfigSchema = z.object({
  port: z.coerce.number().min(1).max(65_535),
});

export const wsConfig = registerAs("ws", () =>
  wsConfigSchema.parse({
    port: process.env.WEBSOCKET_PORT,
  })
);
