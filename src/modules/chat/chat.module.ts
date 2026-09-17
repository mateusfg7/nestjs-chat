import { AuthModule } from "@modules/auth/auth.module";
import { AuthIntegrationPort } from "@modules/chat/application/ports/auth-integration.port";
import { UserIntegrationPort } from "@modules/chat/application/ports/user-integration.port";
import { AuthIntegrationAdapter } from "@modules/chat/infrastructure/adapters/auth-integration.adapter";
import { UserIntegrationAdapter } from "@modules/chat/infrastructure/adapters/user-integration.adapter";
import { ChatDatabaseModule } from "@modules/chat/infrastructure/database/chat-database.module";
import { ChatWsGateway } from "@modules/chat/presentation/ws/chat-ws.gateway";
import { ChatWsGuard } from "@modules/chat/presentation/ws/guards/chat-ws.guard";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { CommandHandlers } from "./application/commands";
import { QueryHandlers } from "./application/queries";
import { EventHandlers } from "./presentation/ws/events/handlers";

@Module({
  imports: [CqrsModule, ChatDatabaseModule, UserModule, AuthModule],
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
  ],
  exports: [],
})
export class ChatModule {}
