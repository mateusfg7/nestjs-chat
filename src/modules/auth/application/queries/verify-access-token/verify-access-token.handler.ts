import { TokenService } from "@modules/auth/application/services/token.service";
import { AccessTokenPayload } from "@modules/auth/domain/types/access-token-payload.type";
import { UnauthorizedException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VerifyAccessTokenQuery } from "./verify-access-token.query";

@QueryHandler(VerifyAccessTokenQuery)
export class VerifyAccessTokenHandler
  implements IQueryHandler<VerifyAccessTokenQuery, AccessTokenPayload>
{
  public constructor(private readonly tokenService: TokenService) {}

  public async execute(
    query: VerifyAccessTokenQuery
  ): Promise<AccessTokenPayload> {
    try {
      const payload =
        await this.tokenService.verifyAccessToken<AccessTokenPayload>(
          query.accessToken
        );
      return payload;
    } catch {
      // biome-ignore lint/style/useErrorCause: Intentionally thrown custom error
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
