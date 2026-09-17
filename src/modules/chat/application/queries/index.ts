import { GetUserConversationHandler } from "./get-user-conversation/get-user-conversation.handler";
import { GetUserConversationIdsHandler } from "./get-user-conversation-ids/get-user-conversation-ids.handler";
import { GetUserConversationListHandler } from "./get-user-conversation-list/get-user-conversation-list.handler";
import { GetUserConversationMessageListHandler } from "./get-user-conversation-message-list/get-user-conversation-message-list.handler";

export const QueryHandlers = [
  GetUserConversationListHandler,
  GetUserConversationIdsHandler,
  GetUserConversationHandler,
  GetUserConversationMessageListHandler,
];
