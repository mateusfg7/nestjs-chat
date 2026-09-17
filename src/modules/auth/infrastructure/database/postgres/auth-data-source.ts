import { AppDataSource } from "@infrastructure/database/postgres/config/data-source";
import { DataSource } from "typeorm";

export const AuthDataSource = new DataSource({
  ...AppDataSource.options,
  entities: ["dist/modules/auth/**/*.entity{.ts,.js}"],
  migrations: ["dist/modules/auth/infrastructure/database/migrations/**/*.js"],
});
