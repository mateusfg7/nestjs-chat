import { pgEnum } from "drizzle-orm/pg-core";

export const messagesTypeEnum = pgEnum("messages_type_enum", ["TEXT"]);
