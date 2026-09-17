import { BaseWsAuthGuard } from "@common/websocket/guards/base-ws-auth.guard";
import { VerifyAccessTokenQuery } from "@modules/auth/application/queries/verify-access-token/verify-access-token.query";
import { Injectable, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";

@Injectable()
export class AuthWsGuard extends BaseWsAuthGuard {
  protected readonly logger = new Logger(AuthWsGuard.name);

  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  protected verifyToken(token: string) {
    return this.queryBus.execute(new VerifyAccessTokenQuery(token));
  }
}
