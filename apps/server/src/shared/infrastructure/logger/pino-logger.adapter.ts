import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ILogger } from 'src/shared/application/logger.interface';

@Injectable()
export class PinoLoggerAdapter implements ILogger {
  constructor(private readonly _pino: PinoLogger) {}

  log(message: string, context?: string): void {
    this._assign({ context });
    this._pino.info(message);
  }

  error(message: string, context?: string): void {
    this._assign({ context });
    this._pino.error(message);
  }

  warn(message: string, context?: string): void {
    this._assign({ context });
    this._pino.warn(message);
  }

  debug(message: string, context?: string): void {
    this._assign({ context });
    this._pino.debug(message);
  }

  verbose(message: string, context?: string): void {
    this._assign({ context });
    this._pino.trace(message);
  }

  private _assign(fields: Record<string, unknown>): void {
    try {
      this._pino.assign(fields);
    } catch {
      // PinoLogger.assign() throws outside of request scope (e.g. BullMQ workers)
    }
  }
}
