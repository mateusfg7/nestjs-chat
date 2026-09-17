import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Params } from 'nestjs-pino';

export interface LoggerModuleOptions {
  pinoHttp?: Params['pinoHttp'];
}

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<LoggerModuleOptions>()
    .setClassMethodName('forRoot')
    .setExtras({ isGlobal: false }, (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }))
    .build();
