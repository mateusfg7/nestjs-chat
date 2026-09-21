import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SigninRequestBody {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public identifier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;
}

export class SigninUserItem {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;

  @ApiProperty()
  public createdAt: string;
}

export class SigninTokenItem {
  @ApiProperty()
  public accessToken: string;

  @ApiProperty()
  public refreshToken: string;
}

export class SigninResponse {
  @ApiProperty()
  public user: SigninUserItem;

  @ApiProperty()
  public tokens: SigninTokenItem;
}
