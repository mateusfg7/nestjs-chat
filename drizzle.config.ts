import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const dbUrl = `postgres://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;

export default defineConfig({
  out: "./src/infrastructure/drizzle/migrations",
  dialect: "postgresql",
  schema: "./src/infrastructure/drizzle/schemas/**",
  dbCredentials: {
    url: dbUrl,
  },
});
