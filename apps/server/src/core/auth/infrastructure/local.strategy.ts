import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { AuthService } from '../application/auth.service';

/**
 * Passport local strategy — validates email/password from the request body.
 *
 * WHY this exists as a separate strategy: Passport abstracts credential validation
 * behind pluggable strategies. This one handles email/password. When Google OAuth
 * or an internal SSO is added, a new strategy (GoogleStrategy, SamlStrategy) will
 * handle their respective flows. The controller stays the same — it just guards with
 * a different AuthGuard and calls authService.issueSessionForIdentity(req.user.id).
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<Identity> {
    const identity = await this._authService.validateLocalCredentials(email, password);
    if (!identity) throw new UnauthorizedException('Invalid credentials');
    return identity;
  }
}
