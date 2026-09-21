import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userBlocks } from "./users-block";
import { usersRoleEnum } from "./users-role-enum";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 150 }).notNull(),
    username: varchar({ length: 40 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    role: usersRoleEnum().default("USER").notNull(),
    avatar: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    uniqueIndex("users_email_uniq").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("users_username_uniq").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  userBlocksInUsers_blockerId: many(userBlocks, {
    relationName: "userBlocksInUser_blockerId_usersInUser_id",
  }),
  userBlocksInUsers_blockedId: many(userBlocks, {
    relationName: "userBlocksInUser_blockedId_usersInUser_id",
  }),
}));
