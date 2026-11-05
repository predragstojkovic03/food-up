import { EmployeeRole, IdentityType } from '@food-up/shared';
import { JwtService } from '@nestjs/jwt';

/**
 * Signs an access token exactly like AuthService does (same payload shape and secret),
 * so tests can act as any identity without going through the login flow each time.
 */
export function accessTokenFor(identity: {
  identityId: string;
  role?: EmployeeRole;
  type?: IdentityType;
}): string {
  return new JwtService({ secret: process.env.JWT_SECRET }).sign(
    {
      sub: identity.identityId,
      type: identity.type ?? IdentityType.Employee,
      ...(identity.role ? { role: identity.role } : {}),
    },
    { expiresIn: '5m' },
  );
}

export function bearer(identity: Parameters<typeof accessTokenFor>[0]): string {
  return `Bearer ${accessTokenFor(identity)}`;
}
