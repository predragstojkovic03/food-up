import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityType, EmployeeRole } from '@food-up/shared';

const mockIdentityService = {
  findByGoogleId: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  linkGoogle: jest.fn(),
};
const mockEmployeesService = { findByIdentity: jest.fn() };
const mockRtRepo = { findById: jest.fn(), create: jest.fn(), markUsed: jest.fn(), revoke: jest.fn(), revokeFamily: jest.fn() };
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

describe('AuthService.findOrLinkGoogleIdentity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns existing identity when googleId already linked', async () => {
    const existing = Identity.createWithGoogle('a@b.com', 'gid', IdentityType.Employee);
    mockIdentityService.findByGoogleId.mockResolvedValue(existing);
    const result = await makeService().findOrLinkGoogleIdentity('gid', 'a@b.com');
    expect(result).toBe(existing);
    expect(mockIdentityService.findByEmail).not.toHaveBeenCalled();
  });

  it('links Google and clears password for a regular employee', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    const employee = Identity.createWithPassword('emp@b.com', 'hash', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(employee);
    mockEmployeesService.findByIdentity.mockResolvedValue({ role: EmployeeRole.Basic });
    mockIdentityService.linkGoogle.mockResolvedValue(undefined);
    mockIdentityService.findById.mockResolvedValue(employee);

    await makeService().findOrLinkGoogleIdentity('gid', 'emp@b.com');

    expect(mockIdentityService.linkGoogle).toHaveBeenCalledWith(
      employee.id,
      'gid',
      true, // clearPassword=true for non-manager employee
    );
  });

  it('links Google and keeps password for a manager employee', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    const manager = Identity.createWithPassword('mgr@b.com', 'hash', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(manager);
    mockEmployeesService.findByIdentity.mockResolvedValue({ role: EmployeeRole.Manager });
    mockIdentityService.linkGoogle.mockResolvedValue(undefined);
    mockIdentityService.findById.mockResolvedValue(manager);

    await makeService().findOrLinkGoogleIdentity('gid', 'mgr@b.com');

    expect(mockIdentityService.linkGoogle).toHaveBeenCalledWith(
      manager.id,
      'gid',
      false, // clearPassword=false for manager
    );
  });

  it('throws UnauthorizedException when email has no account', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    mockIdentityService.findByEmail.mockResolvedValue(null);
    await expect(makeService().findOrLinkGoogleIdentity('gid', 'unknown@b.com'))
      .rejects.toThrow(UnauthorizedException);
  });
});
