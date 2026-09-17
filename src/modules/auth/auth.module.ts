import { UserIntegrationPort } from "@modules/auth/application/ports/user-integration.port";
import { TokenService } from "@modules/auth/application/services/token.service";
import { UserIntegrationAdapter } from "@modules/auth/infrastructure/adapters/user-integration.adapter";
import { authConfig } from "@modules/auth/infrastructure/config/auth.config";
import { AuthDatabaseModule } from "@modules/auth/infrastructure/database/auth-database.module";
import { AuthHttpGuard } from "@modules/auth/presentation/guards/auth-http.guard";
import { AuthWsGuard } from "@modules/auth/presentation/guards/auth-ws.guard";
import { AuthHttpController } from "@modules/auth/presentation/http/auth-http.controller";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { CommandHandlers } from "./application/commands";
import { QueryHandlers } from "./application/queries";
import { AuthSaga } from "./application/sagas/auth.saga";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forFeature(authConfig),
    AuthDatabaseModule,
    JwtModule.register({
      signOptions: {
        algorithm: "RS256",
        issuer: "nestjs-chat",
        audience: "nestjs-chat-client",
      },
      verifyOptions: {
        algorithms: ["RS256"],
        issuer: "nestjs-chat",
        audience: "nestjs-chat-client",
        clockTolerance: 15,
      },
    }),
  ],
  controllers: [AuthHttpController],
  providers: [
    TokenService,
    ...CommandHandlers,
    ...QueryHandlers,
    AuthSaga,
    AuthHttpGuard,
    AuthWsGuard,
    { provide: UserIntegrationPort, useClass: UserIntegrationAdapter },
  ],
  exports: [AuthHttpGuard, AuthWsGuard],
})
export class AuthModule {}
