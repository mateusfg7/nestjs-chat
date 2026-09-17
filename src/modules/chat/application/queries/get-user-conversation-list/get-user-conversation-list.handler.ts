import { PaginatedResult } from "@common/pagination/pagination.interface";
import { ConversationReadDto } from "@modules/chat/application/dtos/conversation-read.dto";
import { ConversationReadRepositoryPort } from "@modules/chat/application/ports/conversation-read-repository.port";
import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserConversationListQuery } from "./get-user-conversation-list.query";

@QueryHandler(GetUserConversationListQuery)
export class GetUserConversationListHandler
  implements
    IQueryHandler<
      GetUserConversationListQuery,
      PaginatedResult<ConversationReadDto>
    >
{
  private readonly logger = new Logger(GetUserConversationListHandler.name);

  constructor(private readonly queryRepo: ConversationReadRepositoryPort) {}

  async execute(
    query: GetUserConversationListQuery
  ): Promise<PaginatedResult<ConversationReadDto>> {
    const { userId, options } = query;

    this.logger.debug(`Fetching conversation list for user ${userId}`);

    const conversationList = await this.queryRepo.getUserConversationList(
      userId,
      options
    );

    return conversationList;
  }
}
