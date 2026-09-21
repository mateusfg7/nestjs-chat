import {
  conversationMembers,
  conversationMembersRelations,
} from "./conversation-members";
import { conversations, conversationsRelations } from "./conversations";
import { conversationsTypeEnum } from "./conversations-type-enum-in-chat";
import { deletedMessages, deletedMessagesRelations } from "./deleted-messages";
import { messages, messagesRelations } from "./messages";
import { messagesTypeEnum } from "./messages-type-enum";

export const chatSchemas = {
  conversationMembers,
  conversationMembersRelations,
  conversations,
  conversationsRelations,
  conversationsTypeEnum,
  deletedMessages,
  deletedMessagesRelations,
  messages,
  messagesRelations,
  messagesTypeEnum,
};
