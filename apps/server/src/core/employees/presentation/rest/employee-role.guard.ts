import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { EmployeeRole } from '@food-up/shared';
import { EMPLOYEE_ROLE_KEY } from './employee-role.decorator';

@Injectable()
export class EmployeeRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Method-level metadata overrides class-level metadata
    const requiredRoles = this.reflector.getAllAndOverride<EmployeeRole[]>(EMPLOYEE_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.role) {
      throw new ForbiddenException('No employee role found in JWT payload');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied for employee role');
    }

    return true;
  }
}
