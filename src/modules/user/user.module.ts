import { DrizzleModule } from "@infrastructure/drizzle";
import { AuthModule } from "@modules/auth/auth.module";
import { AuthIntegrationPort } from "@modules/user/application/ports/auth-integration.port";
import { AuthIntegrationAdapter } from "@modules/user/infrastructure/adapters/auth-integration.adapter";
import { UserHttpGuard } from "@modules/user/presentation/http/guards/user-http.guard";
import { UserHttpController } from "@modules/user/presentation/http/user-http.controller";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CommandHandlers } from "./application/commands";
import { UserReadRepositoryPort } from "./application/ports/user-read-repository.port";
import { UserRepositoryPort } from "./application/ports/user-repository.port";
import { QueryHandlers } from "./application/queries";
import { UserPostgresRepository } from "./infrastructure/database/repositories/user-postgres.repository";
import { UserPostgresReadRepository } from "./infrastructure/database/repositories/user-postgres-read.repository";

@Module({
  imports: [DrizzleModule, AuthModule, CqrsModule],
  controllers: [UserHttpController],
  providers: [
    UserHttpGuard,
    { provide: AuthIntegrationPort, useClass: AuthIntegrationAdapter },
    { provide: UserRepositoryPort, useClass: UserPostgresRepository },
    { provide: UserReadRepositoryPort, useClass: UserPostgresReadRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class UserModule {}
