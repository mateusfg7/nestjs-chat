import { pgEnum } from "drizzle-orm/pg-core";

export const conversationsTypeEnum = pgEnum("conversations_type_enum", [
  "DIRECT",
]);
