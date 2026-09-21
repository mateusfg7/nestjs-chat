import {
  conflictUpdateAllExcept,
  DrizzleDb,
  InjectDb,
  schemas,
} from "@infrastructure/drizzle";
import { ConversationRepositoryPort } from "@modules/chat/application/ports/conversation-repository.port";
import { MessageType } from "@modules/chat/domain/enums/chat-type.enum";
import { ConversationType } from "@modules/chat/domain/enums/conversation-type.enum";
import { ConversationEntity } from "@modules/chat/domain/models/conversation.model";
import { ConversationMemberEntity } from "@modules/chat/domain/models/conversation-member.model";
import { MessageEntity } from "@modules/chat/domain/models/message.entity";
import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

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
export class ConversationPostgresRepository
  implements ConversationRepositoryPort
{
  public constructor(@InjectDb() private readonly db: DrizzleDb) {}

  #toMessageEntity(messageRow: MessageRow): MessageEntity {
    const entity = MessageEntity.reconstruct(
      messageRow.id,
      messageRow.text,
      MessageType[messageRow.type],
      messageRow.senderId,
      messageRow.conversationId,
      [], // deletedForUserIds must be populated separately by the repo
      new Date(messageRow.createdAt),
      new Date(messageRow.updatedAt),
      messageRow.deletedAt ? new Date(messageRow.deletedAt) : undefined
    );

    if (messageRow.sender) {
      entity.loadSender(this.#toMemberEntity(messageRow.sender));
    }

    if (messageRow.conversation) {
      entity.loadConversation(
        this.#toConversationEntity(messageRow.conversation, [], [])
      );
    }

    return entity;
  }

  #toMemberEntity(memberRow: MemberRow): ConversationMemberEntity {
    const entity = ConversationMemberEntity.reconstruct(
      memberRow.id,
      memberRow.userId,
      memberRow.conversationId,
      memberRow.lastSeenMessageId ?? undefined,
      memberRow.lastMessageId ?? undefined,
      new Date(memberRow.createdAt),
      new Date(memberRow.updatedAt),
      memberRow.deletedAt ? new Date(memberRow.deletedAt) : undefined
    );

    if (memberRow.conversation) {
      entity.loadConversation(
        this.#toConversationEntity(memberRow.conversation, [], [])
      );
    }

    if (memberRow.lastSeenMessage) {
      entity.loadLastSeenMessage(
        this.#toMessageEntity(memberRow.lastSeenMessage)
      );
    }
    if (memberRow.lastMessage) {
      entity.loadLastMessage(this.#toMessageEntity(memberRow.lastMessage));
    }

    return entity;
  }

  #toConversationEntity(
    conversationRow: ConversationRow,
    messageRows: MessageRow[],
    memberRows: MemberRow[]
  ): ConversationEntity {
    const entity = ConversationEntity.reconstruct(
      conversationRow.id,
      ConversationType[conversationRow.type],
      conversationRow.title,
      conversationRow.picture,
      conversationRow.identifier,
      new Date(conversationRow.createdAt),
      new Date(conversationRow.updatedAt),
      conversationRow.deletedAt
        ? new Date(conversationRow.deletedAt)
        : undefined
    );

    entity.loadMessages(
      messageRows.map((message) => {
        const messageEntity = MessageEntity.reconstruct(
          message.id,
          message.text,
          MessageType[message.type],
          message.senderId,
          message.conversationId,
          [], // deletedForUserIds must be populated separately by the repo
          new Date(message.createdAt),
          new Date(message.updatedAt),
          message.deletedAt ? new Date(message.deletedAt) : undefined
        );

        if (message.sender) {
          messageEntity.loadSender(this.#toMemberEntity(message.sender));
        }

        if (message.conversation) {
          messageEntity.loadConversation(
            this.#toConversationEntity(message.conversation, [], [])
          );
        }

        return messageEntity;
      })
    );

    entity.loadMembers(memberRows.map((cm) => this.#toMemberEntity(cm)));

    return entity;
  }

  public async getConversationById(
    id: string
  ): Promise<ConversationEntity | null> {
    const [conversationRow] = await this.db
      .select()
      .from(schemas.conversations)
      .where(eq(schemas.conversations.id, id));

    if (!conversationRow) {
      return null;
    }

    const messageRows = await this.db
      .select()
      .from(schemas.messages)
      .where(eq(schemas.messages.conversationId, conversationRow.id));

    const memberRows = await this.db
      .select()
      .from(schemas.conversationMembers)
      .where(
        eq(schemas.conversationMembers.conversationId, conversationRow.id)
      );

    return this.#toConversationEntity(conversationRow, messageRows, memberRows);
  }

  public async saveConversation(
    conversationEntity: ConversationEntity
  ): Promise<ConversationEntity> {
    return await this.db.transaction(async (tx) => {
      const [conversationRow] = await tx
        .insert(schemas.conversations)
        .values({
          id: conversationEntity.id,
          createdAt: conversationEntity.createdAt.toISOString(),
          deletedAt: conversationEntity.deletedAt?.toISOString(),
          identifier: conversationEntity.identifier,
          picture: conversationEntity.picture,
          title: conversationEntity.title,
          type: conversationEntity.type,
          updatedAt: conversationEntity.updatedAt.toISOString(),
        })
        .onConflictDoUpdate({
          target: schemas.conversations.id,
          set: conflictUpdateAllExcept(schemas.conversations, ["id"]),
        })
        .returning();

      let memberRows: MemberRow[] = [];
      if (conversationEntity.members.length > 0) {
        memberRows = await tx
          .insert(schemas.conversationMembers)
          .values(
            conversationEntity.members.map((member) => ({
              id: member.id,
              conversationId: member.conversationId,
              userId: member.userId,
              createdAt: member.createdAt.toISOString(),
              deletedAt: member.deletedAt?.toISOString(),
              lastMessageId: member.lastMessageId,
              lastSeenMessageId: member.lastSeenMessageId,
              updatedAt: member.updatedAt.toISOString(),
            }))
          )
          .onConflictDoUpdate({
            target: schemas.conversationMembers.id,
            set: conflictUpdateAllExcept(schemas.conversationMembers, ["id"]),
          })
          .returning();
      }

      const messageRows = await this.db
        .select()
        .from(schemas.messages)
        .where(eq(schemas.messages.conversationId, conversationRow.id));

      return this.#toConversationEntity(
        conversationRow,
        messageRows,
        memberRows
      );
    });
  }

  public async saveMessage(
    messageEntity: MessageEntity
  ): Promise<MessageEntity> {
    return await this.db.transaction(async (tx) => {
      const [messageRow] = await tx
        .insert(schemas.messages)
        .values({
          id: messageEntity.id,
          conversationId: messageEntity.conversationId,
          senderId: messageEntity.senderId,
          text: messageEntity.text,
          type: messageEntity.type,
          createdAt: messageEntity.createdAt.toISOString(),
          deletedAt: messageEntity.deletedAt?.toISOString(),
          updatedAt: messageEntity.updatedAt.toISOString(),
        })
        .returning();

      if (messageEntity.deletedForUserIds?.length) {
        await tx.insert(schemas.deletedMessages).values(
          messageEntity.deletedForUserIds.map((userId) => ({
            userId,
            messageId: messageRow.id,
          }))
        );
      }

      const conversationMembersToUpdate = await tx
        .select()
        .from(schemas.conversationMembers)
        .where(eq(schemas.conversationMembers.id, messageRow.conversationId));

      await tx
        .insert(schemas.conversationMembers)
        .values(
          conversationMembersToUpdate.map((member) => ({
            ...member,

            // If the user is the sender, also update their last_seen_message
            lastSeenMessageId:
              member.id === messageEntity.senderId
                ? messageRow.id
                : member.lastSeenMessageId,

            // If the user hasn't deleted the message, update their last message
            lastMessageId: messageEntity.deletedForUserIds.includes(
              member.userId
            )
              ? member.lastMessageId
              : messageRow.id,
          }))
        )
        .onConflictDoUpdate({
          target: schemas.conversationMembers.id,
          set: conflictUpdateAllExcept(schemas.conversationMembers, ["id"]),
        });

      const entity = this.#toMessageEntity(messageRow);

      // Restore the deletedForUserIds to the returned entity since we don't map it back natively in #toMessageEntity
      for (const id of messageEntity.deletedForUserIds) {
        entity.deleteForUser(id);
      }

      return entity;
    });
  }

  public async deleteConversation(id: string): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const [, deletedConversationResult] = await Promise.all([
        tx
          .update(schemas.conversationMembers)
          .set({ deletedAt: new Date().toISOString() })
          .where(eq(schemas.conversationMembers.conversationId, id)),
        tx
          .update(schemas.conversations)
          .set({ deletedAt: new Date().toISOString() })
          .where(eq(schemas.conversations.id, id)),
      ]);

      return deletedConversationResult.count === 1;
    });
  }
}
