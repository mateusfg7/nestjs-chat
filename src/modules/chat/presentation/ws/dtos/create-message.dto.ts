import { IsNotEmpty, IsNumberString, MinLength } from 'class-validator';

export class CreateMessageRequest {
  @IsNotEmpty()
  @IsNumberString()
  conversationId: string;

  @IsNotEmpty()
  @MinLength(1)
  text: string;
}