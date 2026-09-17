import { AppDataSource } from "@infrastructure/database/postgres/config/data-source";
import { DataSource } from "typeorm";

export const ChatDataSource = new DataSource({
  ...AppDataSource.options,
  entities: ["dist/modules/chat/**/*.entity{.ts,.js}"],
  migrations: ["dist/modules/chat/infrastructure/database/migrations/**/*.js"],
});
