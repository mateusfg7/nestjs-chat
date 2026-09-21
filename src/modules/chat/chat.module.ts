import { DrizzleModule } from "@infrastructure/drizzle";
import { AuthModule } from "@modules/auth/auth.module";
import { AuthIntegrationPort } from "@modules/chat/application/ports/auth-integration.port";
import { UserIntegrationPort } from "@modules/chat/application/ports/user-integration.port";
import { AuthIntegrationAdapter } from "@modules/chat/infrastructure/adapters/auth-integration.adapter";
import { UserIntegrationAdapter } from "@modules/chat/infrastructure/adapters/user-integration.adapter";
import { ChatWsGateway } from "@modules/chat/presentation/ws/chat-ws.gateway";
import { ChatWsGuard } from "@modules/chat/presentation/ws/guards/chat-ws.guard";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CommandHandlers } from "./application/commands";
import { ConversationReadRepositoryPort } from "./application/ports/conversation-read-repository.port";
import { ConversationRepositoryPort } from "./application/ports/conversation-repository.port";
import { QueryHandlers } from "./application/queries";
import { ConversationPostgresRepository } from "./infrastructure/database/repositories/conversation-postgres.repository";
import { ConversationPostgresReadRepository } from "./infrastructure/database/repositories/conversation-postgres-read.repository";
import { EventHandlers } from "./presentation/ws/events/handlers";

@Module({
  imports: [CqrsModule, UserModule, AuthModule, DrizzleModule],
  providers: [
    ChatWsGateway,
    ChatWsGuard,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    { provide: AuthIntegrationPort, useClass: AuthIntegrationAdapter },
    {
      provide: UserIntegrationPort,
      useClass: UserIntegrationAdapter,
    },
    {
      provide: ConversationRepositoryPort,
      useClass: ConversationPostgresRepository,
    },
    {
      provide: ConversationReadRepositoryPort,
      useClass: ConversationPostgresReadRepository,
    },
  ],
  exports: [],
})
export class ChatModule {}
