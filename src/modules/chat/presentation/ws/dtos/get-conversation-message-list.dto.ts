import { IsInt, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetConversationMessageListRequest {
  @IsNotEmpty({ message: 'ConversationId should not be empty' })
  @IsNumberString()
  conversationId: string;

  @IsInt()
  page: number;

  @IsInt()
  pageSize: number;
}
