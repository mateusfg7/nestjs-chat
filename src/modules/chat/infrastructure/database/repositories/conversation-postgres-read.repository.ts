import { PaginationHelper } from "@common/pagination/pagination.helper";
import {
  PaginatedResult,
  PaginationOptions,
} from "@common/pagination/pagination.interface";
import { DrizzleDb, InjectDb, schemas } from "@infrastructure/drizzle";
import { ConversationReadDto } from "@modules/chat/application/dtos/conversation-read.dto";
import { MessageReadDto } from "@modules/chat/application/dtos/message-read.dto";
import { ConversationReadRepositoryPort } from "@modules/chat/application/ports/conversation-read-repository.port";
import { GetUserConversationIdsOptions } from "@modules/chat/application/ports/options/get-user-conversation-ids.options";
import { GetUserConversationListOptions } from "@modules/chat/application/ports/options/get-user-conversation-list.options";
import { Injectable } from "@nestjs/common";
import { and, desc, eq, exists, inArray, not, SQL, sql } from "drizzle-orm";

type UserRow = typeof schemas.users.$inferSelect;
type ConversationRow = typeof schemas.conversations.$inferSelect;
type MemberRow = typeof schemas.conversationMembers.$inferSelect & {
  conversation?: ConversationRow;
  lastSeenMessage?: MessageRow;
  lastMessage?: MessageRow;
};
type MessageRow = typeof schemas.messages.$inferSelect & {
  sender?: MemberRow;
  conversation?: ConversationRow;
};

@Injectable()
export class ConversationPostgresReadRepository
  implements ConversationReadRepositoryPort
{
  public constructor(@InjectDb() private readonly db: DrizzleDb) {}

  public async conversationExists(
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    const [row] = await this.db
      .select({ id: schemas.conversations.id })
      .from(schemas.conversations)
      .innerJoin(
        schemas.conversationMembers,
        and(
          eq(
            schemas.conversationMembers.conversationId,
            schemas.conversations.id
          ),
          eq(schemas.conversationMembers.userId, userId)
        )
      )
      .where(
        and(
          eq(schemas.conversations.type, "DIRECT"),
          exists(
            this.db
              .select()
              .from(schemas.conversationMembers)
              .where(
                and(
                  eq(
                    schemas.conversationMembers.conversationId,
                    schemas.conversations.id
                  ),
                  eq(schemas.conversationMembers.userId, targetUserId)
                )
              )
          )
        )
      )
      .limit(1);

    return !!row;
  }

  public async getUserConversationList(
    userId: string,
    options: GetUserConversationListOptions
  ): Promise<PaginatedResult<ConversationReadDto>> {
    // Shared WHERE conditions (type filter + filterUserIds exists-subquery)
    const whereConditions: SQL[] = [];

    if (options.filterUserIds && options.filterUserIds.length > 0) {
      whereConditions.push(
        exists(
          this.db
            .select({ one: sql`1` })
            .from(schemas.conversationMembers)
            .where(
              and(
                inArray(
                  schemas.conversationMembers.userId,
                  options.filterUserIds
                ),
                eq(
                  schemas.conversationMembers.conversationId,
                  schemas.conversations.id
                )
              )
            )
        )
      );
    }

    if (options.type !== null) {
      whereConditions.push(
        eq(
          schemas.conversations.type,
          options.type as unknown as (typeof schemas.conversationsTypeEnum.enumValues)[number]
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const joinCondition = and(
      eq(schemas.conversationMembers.conversationId, schemas.conversations.id),
      eq(schemas.conversationMembers.userId, userId)
    );

    let rows: {
      conversation: ConversationRow;
      member: MemberRow;
      lastMessage?: MessageRow | null;
      lastMessageSender?: UserRow | null;
    }[];

    if (options.withLastMessage) {
      let q = this.db
        .select({
          conversation: schemas.conversations,
          member: schemas.conversationMembers,
          lastMessage: schemas.messages,
          lastMessageSender: schemas.users,
        })
        .from(schemas.conversations)
        .innerJoin(schemas.conversationMembers, joinCondition)
        .leftJoin(
          schemas.messages,
          eq(schemas.messages.id, schemas.conversationMembers.lastMessageId)
        )
        .leftJoin(
          schemas.users,
          eq(schemas.users.id, schemas.messages.senderId)
        )
        .orderBy(desc(schemas.messages.createdAt))
        .$dynamic();

      if (whereClause) {
        q = q.where(whereClause);
      }
      if (options.pagination) {
        q = q.limit(options.pagination.limit).offset(options.pagination.offset);
      }

      rows = await q;
    } else {
      let q = this.db
        .select({
          conversation: schemas.conversations,
          member: schemas.conversationMembers,
        })
        .from(schemas.conversations)
        .innerJoin(schemas.conversationMembers, joinCondition)
        .orderBy(desc(schemas.conversations.createdAt))
        .$dynamic();

      if (whereClause) {
        q = q.where(whereClause);
      }
      if (options.pagination) {
        q = q.limit(options.pagination.limit).offset(options.pagination.offset);
      }

      rows = await q;
    }

    // Drizzle has no getManyAndCount() — run the count separately with the same filters
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(schemas.conversations)
      .innerJoin(schemas.conversationMembers, joinCondition)
      .where(whereClause);

    if (rows.length === 0) {
      return PaginationHelper.createResult([], count, options.pagination);
    }

    const conversationIds = rows.map((r) => r.conversation.id);

    // Not-seen counts: correlated subquery per (conversation, user), same math as the
    // COUNT(m.id) - COUNT(dm.message_id) trick from the TypeORM version
    const notSeenCountsQuery = await this.db
      .select({
        conversationId: schemas.conversationMembers.conversationId,
        notSeenCount: sql<number>`(
        SELECT COUNT(m.id) - COUNT(dm.message_id)
        FROM ${schemas.messages} m
        LEFT JOIN ${schemas.deletedMessages} dm
          ON m.id = dm.message_id AND dm.user_id = ${userId}
        WHERE m.conversation_id = ${schemas.conversationMembers.conversationId}
          AND m.id > ${schemas.conversationMembers.lastSeenMessageId}
      )`.mapWith(Number),
      })
      .from(schemas.conversationMembers)
      .where(
        and(
          eq(schemas.conversationMembers.userId, userId),
          inArray(schemas.conversationMembers.conversationId, conversationIds)
        )
      );

    const notSeenCountsMap = new Map<string, number>();
    for (const row of notSeenCountsQuery) {
      notSeenCountsMap.set(row.conversationId, row.notSeenCount || 0);
    }

    // Map to DTOs
    const dtos: ConversationReadDto[] = rows.map((row) => {
      const { conversation, member } = row;
      const lastMessage = "lastMessage" in row ? row.lastMessage : null;
      const lastMessageSender =
        "lastMessageSender" in row ? row.lastMessageSender : null;

      return {
        id: conversation.id,
        type: conversation.type,
        identifier: conversation.identifier,
        title: conversation.title,
        picture: conversation.picture,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        notSeenCount: notSeenCountsMap.get(conversation.id) || 0,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              text: lastMessage.text,
              type: lastMessage.type,
              senderId: lastMessageSender
                ? lastMessageSender.id
                : lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        members: [
          {
            id: member.id,
            userId: member.userId,
            lastSeenMessageId: member.lastSeenMessageId,
            lastMessageId: member.lastMessageId,
          },
        ],
      };
    });

    // Populate other members for direct conversations manually
    const allMembers = await this.db
      .select()
      .from(schemas.conversationMembers)
      .where(
        inArray(schemas.conversationMembers.conversationId, conversationIds)
      );

    const dtoMap = new Map(dtos.map((dto) => [dto.id, dto]));

    for (const member of allMembers) {
      if (member.userId !== userId) {
        const dto = dtoMap.get(member.conversationId);
        if (dto) {
          dto.members.push({
            id: member.id,
            userId: member.userId,
            lastSeenMessageId: member.lastSeenMessageId,
            lastMessageId: member.lastMessageId,
          });
        }
      }
    }

    return PaginationHelper.createResult(dtos, count, options.pagination);
  }

  public async getUserConversationIds(
    userId: string,
    options: GetUserConversationIdsOptions
  ): Promise<string[]> {
    const query = this.db
      .select()
      .from(schemas.conversations)
      .innerJoin(
        schemas.conversationMembers,
        eq(schemas.conversationMembers.userId, userId)
      );

    const result =
      options.type === null
        ? await query
        : await query.where(
            eq(
              schemas.conversations.type,
              options.type as ConversationRow["type"]
            )
          );

    const conversationsIds = result.map((row) => row.conversations.id);

    return conversationsIds;
  }

  public async getUserConversationById(
    conversationId: string,
    userId: string
  ): Promise<ConversationReadDto | null> {
    const rows = await this.db
      .select({
        conversation: schemas.conversations,
        member: schemas.conversationMembers,
      })
      .from(schemas.conversations)
      .innerJoin(
        schemas.conversationMembers,
        eq(schemas.conversationMembers.conversationId, schemas.conversations.id)
      )
      .where(
        and(
          eq(schemas.conversations.id, conversationId),
          exists(
            this.db
              .select({ one: sql`1` })
              .from(schemas.conversationMembers)
              .where(
                and(
                  eq(schemas.conversationMembers.userId, userId),
                  eq(
                    schemas.conversationMembers.conversationId,
                    schemas.conversations.id
                  )
                )
              )
          )
        )
      );

    if (rows.length === 0) {
      return null;
    }

    const { conversation } = rows[0];

    const dto: ConversationReadDto = {
      id: conversation.id,
      type: conversation.type,
      identifier: conversation.identifier,
      title: conversation.title,
      picture: conversation.picture,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      notSeenCount: 0,
      lastMessage: null,
      members: rows.map((row) => ({
        id: row.member.id,
        userId: row.member.userId,
        lastSeenMessageId: row.member.lastSeenMessageId,
        lastMessageId: row.member.lastMessageId,
      })),
    };

    return dto;
  }

  public async getUserConversationMessageList(
    conversationId: string,
    userId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<MessageReadDto>> {
    const notDeletedCondition = and(
      eq(schemas.messages.conversationId, conversationId),
      not(
        exists(
          this.db
            .select({ one: sql`1` })
            .from(schemas.deletedMessages)
            .where(
              and(
                eq(schemas.deletedMessages.userId, userId),
                eq(schemas.deletedMessages.messageId, schemas.messages.id)
              )
            )
        )
      )
    );

    const { messages, count } = await this.db.transaction(async (tx) => {
      const rows = await tx
        .select({
          message: schemas.messages,
          sender: schemas.users,
        })
        .from(schemas.messages)
        .innerJoin(
          schemas.users,
          eq(schemas.users.id, schemas.messages.senderId)
        )
        .where(notDeletedCondition)
        .orderBy(desc(schemas.messages.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit);

      const [{ count: total }] = await tx
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(schemas.messages)
        .innerJoin(
          schemas.users,
          eq(schemas.users.id, schemas.messages.senderId)
        )
        .where(notDeletedCondition);

      return { messages: rows, count: total };
    });

    const dtos: MessageReadDto[] = messages.map(({ message, sender }) => ({
      id: message.id,
      text: message.text,
      type: message.type,
      senderId: sender ? sender.id : message.senderId,
      createdAt: message.createdAt,
    }));

    return PaginationHelper.createResult(dtos, count, pagination);
  }
}
