import { VerifyAccessTokenQuery } from "@modules/auth/application/queries/verify-access-token/verify-access-token.query";
import { AccessTokenPayload } from "@modules/auth/domain/types/access-token-payload.type";
import {
  AuthIntegrationPort,
  ValidatedTokenPayload,
} from "@modules/chat/application/ports/auth-integration.port";
import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";

@Injectable()
export class AuthIntegrationAdapter implements AuthIntegrationPort {
  constructor(private readonly queryBus: QueryBus) {}

  async verifyToken(token: string): Promise<ValidatedTokenPayload> {
    const res = await this.queryBus.execute<
      VerifyAccessTokenQuery,
      AccessTokenPayload
    >(new VerifyAccessTokenQuery(token));
    return {
      sub: res.sub,
      role: res.role,
      exp: res.exp,
    };
  }
}
