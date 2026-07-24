import { AuthController } from './auth.controller';

// @Throttle({ default: { ttl, limit } }) sets metadata via individual keys per throttler name.
// Keys are: THROTTLER_TTL + name and THROTTLER_LIMIT + name (from @nestjs/throttler constants).
const THROTTLER_TTL = 'THROTTLER:TTL';
const THROTTLER_LIMIT = 'THROTTLER:LIMIT';

describe('AuthController throttle metadata', () => {
  it('login is limited to 5 requests per minute', () => {
    const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', AuthController.prototype.login);
    const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', AuthController.prototype.login);
    expect(ttl).toBe(60_000);
    expect(limit).toBe(5);
  });

  it('refresh is limited to 20 requests per minute', () => {
    const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', AuthController.prototype.refresh);
    const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', AuthController.prototype.refresh);
    expect(ttl).toBe(60_000);
    expect(limit).toBe(20);
  });

  it('changePassword is limited to 5 requests per minute', () => {
    const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', AuthController.prototype.changePassword);
    const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', AuthController.prototype.changePassword);
    expect(ttl).toBe(60_000);
    expect(limit).toBe(5);
  });

  it('getMe has no throttle override (uses global 120/min)', () => {
    const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', AuthController.prototype.getMe);
    const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', AuthController.prototype.getMe);
    expect(ttl).toBeUndefined();
    expect(limit).toBeUndefined();
  });

  it('logout has no throttle override (uses global 120/min)', () => {
    const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', AuthController.prototype.logout);
    const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', AuthController.prototype.logout);
    expect(ttl).toBeUndefined();
    expect(limit).toBeUndefined();
  });
});
