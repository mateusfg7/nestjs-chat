import { CurrentUserId } from "@common/decorators/current-user-id.decorator";
import { BlockUserCommand } from "@modules/user/application/commands/block-user/block-user.command";
import { UnblockUserCommand } from "@modules/user/application/commands/unblock-user/unblock-user.command";
import {
  BlockRequestBody,
  BlockResponse,
} from "@modules/user/presentation/http/dtos/block.dto";
import {
  UnblockRequestParams,
  UnblockResponse,
} from "@modules/user/presentation/http/dtos/unblock.dto";
import { UserHttpGuard } from "@modules/user/presentation/http/guards/user-http.guard";
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@Controller("user")
@ApiTags("User")
export class UserHttpController {
  public constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: "Block",
    description: "Block a user",
  })
  @ApiOkResponse({
    type: BlockResponse,
    description: "Successfully blocked the user",
  })
  @ApiConflictResponse({
    type: null,
    description: "User is already blocked",
  })
  @Post("block")
  @UseGuards(UserHttpGuard)
  public async block(
    @Body() body: BlockRequestBody,
    @CurrentUserId() authUserId: string
  ): Promise<BlockResponse> {
    const success = await this.commandBus.execute(
      new BlockUserCommand(authUserId, body.targetUserId)
    );

    if (success === false) {
      throw new ConflictException("User is already blocked");
    }

    return {};
  }

  @ApiOperation({
    summary: "Unblock",
    description: "Unblock a blocked user",
  })
  @ApiOkResponse({
    type: UnblockResponse,
    description: "Successfully blocked the user",
  })
  @ApiNoContentResponse({ type: null, description: "User was not blocked" })
  @Delete("block/:targetUserId")
  @UseGuards(UserHttpGuard)
  public async unblock(
    @Param() params: UnblockRequestParams,
    @CurrentUserId() authUserId: string
  ): Promise<UnblockResponse> {
    await this.commandBus.execute(
      new UnblockUserCommand(authUserId, params.targetUserId)
    );

    return {};
  }
}
