import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { EMPLOYEE_ROLE_KEY } from './employee-role.decorator';

@Injectable()
export class EmployeeRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<EmployeeRole[]>(
      EMPLOYEE_ROLE_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.role) {
      throw new ForbiddenException('No employee role found in JWT payload');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('Access denied for employee role');
    }

    return true;
  }
}
