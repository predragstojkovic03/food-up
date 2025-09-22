import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IDENTITY_TYPE_KEY } from './identity-type.decorator';

@Injectable()
export class IdentityTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.get<string[]>(
      IDENTITY_TYPE_KEY,
      context.getHandler(),
    );
    if (!requiredTypes) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard

    if (!user || !user.identityType) {
      throw new ForbiddenException('No identity type found in JWT payload');
    }

    if (!requiredTypes.includes(user.identityType)) {
      throw new ForbiddenException('Access denied for identity type');
    }

    return true;
  }
}
