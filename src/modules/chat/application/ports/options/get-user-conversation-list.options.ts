import { PaginationOptions } from "@common/pagination/pagination.interface";
import { ConversationType } from "@modules/chat/domain/enums/conversation-type.enum";

export class GetUserConversationListOptions {
  type?: ConversationType;
  filterUserIds?: string[];
  withLastMessage?: boolean;
  pagination: PaginationOptions;
}
