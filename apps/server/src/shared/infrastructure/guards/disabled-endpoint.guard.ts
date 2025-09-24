import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_DISABLED_KEY } from '../decorators/disabled.decorator';

@Injectable()
export class DisabledEndpointGuard {
  constructor(private readonly _reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isDisabled = this._reflector.getAllAndOverride<boolean>(
      IS_DISABLED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isDisabled) {
      throw new NotFoundException();
    }

    return true;
  }
}
