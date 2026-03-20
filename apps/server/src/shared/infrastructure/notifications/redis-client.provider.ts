import { Redis } from 'ioredis';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const RedisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: IConfigService<EnvironmentVariables, true>): Redis => {
    return new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    });
  },
  inject: [I_CONFIG_SERVICE],
};
