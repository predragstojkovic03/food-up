import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityType } from '@food-up/shared';

const mockIdentityService = {
  findByEmail: jest.fn(),
  validateCredentials: jest.fn(),
  findByGoogleId: jest.fn(),
};

const mockRtRepo = { findById: jest.fn(), create: jest.fn(), markUsed: jest.fn(), revoke: jest.fn(), revokeFamily: jest.fn() };
const mockEmployeesService = { findByIdentity: jest.fn() };
const mockJwtService = { signAsync: jest.fn() };
const mockConfig = { get: jest.fn() };

function makeService(): AuthService {
  return new AuthService(
    mockRtRepo as any,
    mockIdentityService as any,
    mockEmployeesService as any,
    mockJwtService as any,
    mockConfig as any,
  );
}

describe('AuthService.validateLocalCredentials', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when no identity found for email', async () => {
    mockIdentityService.findByEmail.mockResolvedValue(null);
    const result = await makeService().validateLocalCredentials('x@y.com', 'pass');
    expect(result).toBeNull();
  });

  it('throws UnauthorizedException for Google-only account (passwordHash null)', async () => {
    const googleOnly = Identity.createWithGoogle('x@y.com', 'gid', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(googleOnly);
    await expect(makeService().validateLocalCredentials('x@y.com', 'pass'))
      .rejects.toThrow(new UnauthorizedException('This account uses Google login'));
  });

  it('returns null when password is wrong', async () => {
    mockIdentityService.findByEmail.mockResolvedValue(
      Identity.createWithPassword('x@y.com', 'hash', IdentityType.Employee)
    );
    mockIdentityService.validateCredentials.mockRejectedValue(new Error('Invalid credentials'));
    const result = await makeService().validateLocalCredentials('x@y.com', 'wrongpass');
    expect(result).toBeNull();
  });
});
