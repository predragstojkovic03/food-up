import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
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
    const user: JwtPayload = request.user as JwtPayload; // Populated by JwtAuthGuard

    if (!user || !user.type) {
      throw new ForbiddenException('No identity type found in JWT payload');
    }

    if (!requiredTypes.includes(user.type)) {
      throw new UnauthorizedException('Access denied for identity type');
    }

    return true;
  }
}
