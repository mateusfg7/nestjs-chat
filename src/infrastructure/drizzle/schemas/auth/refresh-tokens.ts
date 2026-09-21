import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    token: text().notNull(),
    identifier: varchar().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    uniqueIndex("refresh_tokens_identifier_uniq").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops")
    ),
    index("refresh_tokens_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
  ]
);
