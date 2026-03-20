import { Global, Module } from '@nestjs/common';
import { I_LOGGER } from 'src/shared/application/logger.interface';
import { PinoLoggerAdapter } from './pino-logger.adapter';

@Global()
@Module({
  providers: [
    PinoLoggerAdapter,
    { provide: I_LOGGER, useExisting: PinoLoggerAdapter },
  ],
  exports: [I_LOGGER],
})
export class LoggerModule {}
