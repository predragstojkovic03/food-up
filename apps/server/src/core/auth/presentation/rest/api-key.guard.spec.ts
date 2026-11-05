import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyProtected } from 'src/core/auth/presentation/rest/api-key-protected.decorator';
import { ApiKeyGuard } from 'src/core/auth/presentation/rest/api-key.guard';
import { IS_PUBLIC_KEY } from 'src/core/auth/presentation/rest/public.decorator';

class TestController {
  @ApiKeyProtected()
  protectedRoute() {}

  openRoute() {}
}

function contextFor(
  handler: keyof TestController,
  headers: Record<string, string> = {},
): ExecutionContext {
  return {
    getHandler: () => TestController.prototype[handler],
    getClass: () => TestController,
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;
}

function guardWithKey(key: string | undefined): ApiKeyGuard {
  return new ApiKeyGuard(new Reflector(), {
    get: jest.fn().mockReturnValue(key),
  } as any);
}

describe('ApiKeyGuard', () => {
  it('lets requests through to routes without @ApiKeyProtected', () => {
    expect(guardWithKey('secret').canActivate(contextFor('openRoute'))).toBe(
      true,
    );
  });

  it('accepts the configured key', () => {
    expect(
      guardWithKey('secret').canActivate(
        contextFor('protectedRoute', { 'x-api-key': 'secret' }),
      ),
    ).toBe(true);
  });

  it.each([
    ['missing', {}],
    ['wrong', { 'x-api-key': 'not-the-secret' }],
    ['empty', { 'x-api-key': '' }],
  ])('rejects a %s key with 401', (_, headers) => {
    expect(() =>
      guardWithKey('secret').canActivate(contextFor('protectedRoute', headers)),
    ).toThrow(UnauthorizedException);
  });

  it('disables protected routes (404) when no key is configured', () => {
    expect(() =>
      guardWithKey(undefined).canActivate(
        contextFor('protectedRoute', { 'x-api-key': '' }),
      ),
    ).toThrow(NotFoundException);
  });

  it('marks protected routes public so the JWT guard skips them', () => {
    expect(
      new Reflector().get(
        IS_PUBLIC_KEY,
        TestController.prototype.protectedRoute,
      ),
    ).toBe(true);
  });
});
