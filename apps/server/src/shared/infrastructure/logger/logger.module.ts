import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { I_LOGGER } from 'src/shared/application/logger.interface';
import { PinoLoggerAdapter } from './pino-logger.adapter';

@Global()
@Module({
  imports: [PinoLoggerModule],
  providers: [
    PinoLoggerAdapter,
    { provide: I_LOGGER, useExisting: PinoLoggerAdapter },
  ],
  exports: [I_LOGGER],
})
export class LoggerModule {}
