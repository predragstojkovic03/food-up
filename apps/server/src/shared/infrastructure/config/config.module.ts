import { Global, Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { validate } from 'src/env.validation';
import { I_CONFIG_SERVICE } from 'src/shared/application/config-service.interface';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
  providers: [
    {
      provide: I_CONFIG_SERVICE,
      useClass: ConfigService,
    },
  ],
})
export class ConfigModule {}
