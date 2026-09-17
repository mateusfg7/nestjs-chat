import { MessageReadDto } from "@modules/chat/application/dtos/message-read.dto";

export interface ConversationMemberReadDto {
  id: string;
  lastMessageId: string | null;
  lastSeenMessageId: string | null;
  userId: string;
}

export interface ConversationReadDto {
  createdAt: string;
  id: string;
  identifier: string | null;
  lastMessage: MessageReadDto | null;
  members: ConversationMemberReadDto[];
  notSeenCount: number;
  picture: string | null;
  title: string | null;
  type: string;
  updatedAt: string;
}
