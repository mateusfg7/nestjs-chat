import { httpConfig } from "@infrastructure/http/http.config";
import { LoggerModule } from "@infrastructure/logger/logger.module";
import { RedisModule } from "@infrastructure/redis/redis.module";
import { wsConfig } from "@infrastructure/websocket/ws.config";
import { AuthModule } from "@modules/auth/auth.module";
import { ChatModule } from "@modules/chat/chat.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [appConfig, httpConfig, wsConfig],
      cache: true,
    }),

    LoggerModule.forRoot({ isGlobal: true }),
    RedisModule,
    UserModule,
    AuthModule,
    ChatModule,
  ],
})
export class AppModule {}
