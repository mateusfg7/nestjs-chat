import { pgEnum } from "drizzle-orm/pg-core";

export const usersRoleEnum = pgEnum("users_role_enum", ["USER"]);
