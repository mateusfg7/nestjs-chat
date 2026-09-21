import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const userBlocks = pgTable(
  "user_blocks",
  {
    blockerId: uuid("blocker_id").notNull(),
    blockedId: uuid("blocked_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.blockerId],
      foreignColumns: [users.id],
      name: "FK_dfcd8a81016d1de587fbd2d70bf",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.blockedId],
      foreignColumns: [users.id],
      name: "FK_7a0806a54f0ad9ced3e247cacd1",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.blockerId, table.blockedId],
      name: "PK_48667515438e7d0f0fed998b193",
    }),
  ]
);

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  usersInUser_blockerId: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
    relationName: "userBlocksInUser_blockerId_usersInUser_id",
  }),
  usersInUser_blockedId: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
    relationName: "userBlocksInUser_blockedId_usersInUser_id",
  }),
}));
