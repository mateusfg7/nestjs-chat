import { GetUserConversationListOptions } from "@modules/chat/application/ports/options/get-user-conversation-list.options";

export class GetUserConversationListQuery {
  public constructor(
    public readonly userId: string,
    public readonly options: GetUserConversationListOptions
  ) {}
}
