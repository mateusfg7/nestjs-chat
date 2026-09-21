import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  foreignKey,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { messages } from "./messages";

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    lastSeenMessageId: uuid("last_seen_message_id").references(
      (): AnyPgColumn => messages.id,
      { onDelete: "cascade", onUpdate: "cascade" }
    ),
    lastMessageId: uuid("last_message_id").references(
      (): AnyPgColumn => messages.id,
      { onDelete: "cascade", onUpdate: "cascade" }
    ),
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
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    unique().on(table.lastSeenMessageId),
    unique().on(table.lastMessageId),
  ]
);

export const conversationMembersRelations = relations(
  conversationMembers,
  ({ one, many }) => ({
    messages: many(messages),
    conversations: one(conversations, {
      fields: [conversationMembers.conversationId],
      references: [conversations.id],
    }),
    lastSeenMessage: one(messages, {
      fields: [conversationMembers.lastSeenMessageId],
      references: [messages.id],
    }),
    lastMessage: one(messages, {
      fields: [conversationMembers.lastMessageId],
      references: [messages.id],
    }),
  })
);
