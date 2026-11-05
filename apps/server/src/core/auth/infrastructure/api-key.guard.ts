import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'node:crypto';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { API_KEY_HEADER, API_KEY_PROTECTED_KEY } from './api-key-protected.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    @Inject(I_CONFIG_SERVICE)
    private readonly _configService: IConfigService<EnvironmentVariables, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isProtected = this._reflector.getAllAndOverride<boolean>(API_KEY_PROTECTED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isProtected) return true;

    const expectedKey = this._configService.get('ADMIN_API_KEY');
    if (!expectedKey) {
      // Operator endpoints are off unless a key is configured
      throw new NotFoundException();
    }

    const providedKey = context.switchToHttp().getRequest().headers[API_KEY_HEADER];
    if (typeof providedKey !== 'string' || !this._matches(providedKey, expectedKey)) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }

  /** Constant-time comparison; hashing first makes both buffers the same length. */
  private _matches(provided: string, expected: string): boolean {
    const digest = (value: string) => createHash('sha256').update(value).digest();
    return timingSafeEqual(digest(provided), digest(expected));
  }
}
