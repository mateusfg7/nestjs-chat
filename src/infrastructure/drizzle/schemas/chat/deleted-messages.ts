import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { messages } from "./messages";

export const deletedMessages = pgTable(
  "deleted_messages",
  {
    userId: uuid("user_id").notNull(),
    messageId: uuid("message_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [messages.id],
      name: "FK_af4864dee9672d02ce3d5ecdfa6",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.messageId],
      name: "PK_291432ce5670ad7a99d1ec20818",
    }),
  ]
);

export const deletedMessagesRelations = relations(
  deletedMessages,
  ({ one }) => ({
    messagesInChat: one(messages, {
      fields: [deletedMessages.messageId],
      references: [messages.id],
    }),
  })
);
