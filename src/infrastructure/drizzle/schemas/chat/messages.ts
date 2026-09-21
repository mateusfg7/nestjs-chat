import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { conversationMembers } from "./conversation-members";
import { conversations } from "./conversations";
import { deletedMessages } from "./deleted-messages";
import { messagesTypeEnum } from "./messages-type-enum";

export const messages = pgTable(
  "messages",
  {
    id: uuid().primaryKey().notNull(),
    text: text().notNull(),
    type: messagesTypeEnum().default("TEXT").notNull(),
    senderId: uuid("sender_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    index("messages_sender_id_idx").using(
      "btree",
      table.senderId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "FK_e5663ce0c730b2de83445e2fd19",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [conversationMembers.id],
      name: "messages_sender_id_fk",
    }).onUpdate("cascade"),
  ]
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversationsInChat: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  conversationMembersInChat: one(conversationMembers, {
    fields: [messages.senderId],
    references: [conversationMembers.id],
    relationName: "messagesInChat_senderId_conversationMembersInChat_id",
  }),
  conversationMembersInChats_lastSeenMessageId: many(conversationMembers, {
    relationName:
      "conversationMembersInChat_lastSeenMessageId_messagesInChat_id",
  }),
  conversationMembersInChats_lastMessage: many(conversationMembers, {
    relationName: "conversationMembersInChat_lastMessage_messagesInChat_id",
  }),
  deletedMessagesInChats: many(deletedMessages),
}));
