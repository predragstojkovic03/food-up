import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EnvironmentVariables, NodeEnv } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from '../application/config-service.interface';
import { I_LOGGER, ILogger } from '../application/logger.interface';
import { AuthenticationException } from '../domain/exceptions/authentication.exception';
import { DomainException } from '../domain/exceptions/domain.exception';
import { EntityInstanceAlreadyExistsException } from '../domain/exceptions/entity-instance-already-exists.exception';
import { EntityInstanceNotFoundException } from '../domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from '../domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from '../domain/exceptions/invalid-operation.exception';
import { UnauthorizedException } from '../domain/exceptions/unauthorized.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private _environment: NodeEnv;

  constructor(
    @Inject(I_CONFIG_SERVICE)
    private configService: IConfigService<EnvironmentVariables, true>,
    @Inject(I_LOGGER)
    private logger: ILogger,
  ) {
    this._environment = this.configService.get('NODE_ENV');
  }

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.getStatus(exception);

    this.logger.error(JSON.stringify(exception));

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      path: ctx.getRequest<Request>().path,
      stack:
        this._environment === NodeEnv.Development ? exception.stack : undefined,
    });
  }

  private getStatus(exception: DomainException): number {
    switch (exception.constructor) {
      case UnauthorizedException:
        return HttpStatus.UNAUTHORIZED;
      case AuthenticationException:
        return HttpStatus.FORBIDDEN;
      case InvalidInputDataException:
      case InvalidOperationException:
        return HttpStatus.BAD_REQUEST;
      case EntityInstanceNotFoundException:
        return HttpStatus.NOT_FOUND;
      case EntityInstanceAlreadyExistsException:
        return HttpStatus.CONFLICT;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
