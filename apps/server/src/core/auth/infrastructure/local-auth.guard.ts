import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for the POST /auth/login endpoint.
 * Invokes LocalStrategy.validate(email, password) and sets req.user = Identity on success.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
