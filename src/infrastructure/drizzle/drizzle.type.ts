import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schemas } from "./schemas";

export type DrizzleDb = PostgresJsDatabase<typeof schemas>;
