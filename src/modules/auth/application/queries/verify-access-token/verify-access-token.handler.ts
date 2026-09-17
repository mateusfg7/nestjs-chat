import { TokenService } from "@modules/auth/application/services/token.service";
import { AccessTokenPayload } from "@modules/auth/domain/types/access-token-payload.type";
import { UnauthorizedException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VerifyAccessTokenQuery } from "./verify-access-token.query";

@QueryHandler(VerifyAccessTokenQuery)
export class VerifyAccessTokenHandler
  implements IQueryHandler<VerifyAccessTokenQuery, AccessTokenPayload>
{
  constructor(private readonly tokenService: TokenService) {}

  async execute(query: VerifyAccessTokenQuery): Promise<AccessTokenPayload> {
    try {
      const payload =
        await this.tokenService.verifyAccessToken<AccessTokenPayload>(
          query.accessToken
        );
      return payload;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
