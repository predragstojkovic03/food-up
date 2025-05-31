import { Global, Module } from '@nestjs/common';
import { I_LOGGER } from 'src/shared/domain/logger.interface';
import { CustomLogger } from './custom-logger';

@Global()
@Module({
  providers: [
    {
      provide: I_LOGGER,
      useClass: CustomLogger,
    },
  ],
  exports: [I_LOGGER],
})
export class LoggerModule {}
