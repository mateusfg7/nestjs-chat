import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { conversationMembers } from "./conversation-members";
import { conversationsTypeEnum } from "./conversations-type-enum-in-chat";
import { messages } from "./messages";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid().primaryKey().notNull(),
    title: varchar(),
    picture: varchar(),
    identifier: varchar(),
    type: conversationsTypeEnum().default("DIRECT").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    uniqueIndex("conversations_identifier_uniq").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messagesInChats: many(messages),
  conversationMembersInChats: many(conversationMembers),
}));
