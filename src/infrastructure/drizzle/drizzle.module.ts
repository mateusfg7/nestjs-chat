import { DrizzlePostgresModule } from "@knaadh/nestjs-drizzle-postgres";
import { Module } from "@nestjs/common";
import { DATABASE_TAG } from "./drizzle.constants";
import { schemas } from "./schemas";

@Module({
  imports: [
    DrizzlePostgresModule.registerAsync({
      tag: DATABASE_TAG,
      useFactory: () => ({
        postgres: {
          url: "postgres://postgres:postgres@localhost:5432/chatterbox",
        },
        config: {
          schema: schemas,
        },
      }),
    }),
  ],
  exports: [DrizzlePostgresModule],
})
export class DrizzleModule {}
