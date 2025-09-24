import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { EnvironmentVariables, NodeEnv } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private _minify: boolean;

  constructor(
    @Inject(I_LOGGER) private readonly _logger: ILogger,
    @Inject(I_CONFIG_SERVICE)
    configService: IConfigService<EnvironmentVariables, true>,
  ) {
    this._minify = configService.get('NODE_ENV') === NodeEnv.Production;
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    const now = performance.now();

    this._logger.log(`Request ${req.method} ${req.baseUrl}`);

    try {
      if (req.body && Object.keys(req.body).length > 0) {
        this._logger.verbose(
          `Request body: ${(JSON.stringify(req.body), null, this._minify ? null : 2)}`,
        );
      }
    } catch (error) {
      this._logger.warn(`Failed to log request body: ${error.message}`);
    }

    try {
      if (req.query && Object.keys(req.query).length > 0) {
        this._logger.verbose(`Request query: ${JSON.stringify(req.query)}`);
      }
    } catch (error) {
      this._logger.warn(`Failed to log request query: ${error.message}`);
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
