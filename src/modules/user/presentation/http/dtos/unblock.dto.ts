import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class UnblockRequestParams {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  targetUserId: string;
}

export class UnblockResponse {}
