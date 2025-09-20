import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as JwtPayload;
  },
);
