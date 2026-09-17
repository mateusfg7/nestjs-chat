import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class BlockRequestBody {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  targetUserId: string;
}

export class BlockResponse {}
