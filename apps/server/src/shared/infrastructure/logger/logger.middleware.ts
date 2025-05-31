import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { I_LOGGER, ILogger } from 'src/shared/domain/logger.interface';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(@Inject(I_LOGGER) private readonly _logger: ILogger) {}

  use(req: Request, res: Response, next: (error?: any) => void) {
    const now = performance.now();

    this._logger.log(`Request ${req.method} ${req.url}`);

    if (req.body && Object.keys(req.body).length > 0) {
      this._logger.verbose(`Request body: ${JSON.stringify(req.body)}`);
    }

    if (req.query && Object.keys(req.query).length > 0) {
      this._logger.verbose(`Request query: ${JSON.stringify(req.query)}`);
    }

    res.on('finish', () => {
      const elapsed = performance.now() - now;
      const roundedElapsed = Math.round(elapsed * 100) / 100;

      this._logger.log(
        `Response ${req.method} ${res.statusCode} | ${roundedElapsed} [ms]`,
      );
    });

    next();
  }
}
