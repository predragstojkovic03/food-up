import { BadRequestException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityType } from '@food-up/shared';

const mockRepository = { insert: jest.fn() };
const mockIdentityService = { createWithGoogle: jest.fn() };
const mockBusinessInvitesService = { validate: jest.fn(), consume: jest.fn() };
const mockTransactionRunner = { run: jest.fn().mockImplementation(async (cb: () => Promise<unknown>) => cb()) };
const mockLogger = { log: jest.fn(), warn: jest.fn(), debug: jest.fn() };

function makeService(): EmployeesService {
  return new EmployeesService(
    mockRepository as any,
    mockIdentityService as any,
    mockBusinessInvitesService as any,
    mockTransactionRunner as any,
    mockLogger as any,
  );
}

describe('EmployeesService.registerWithGoogle', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws BadRequestException when invite token is invalid or expired', async () => {
    mockBusinessInvitesService.validate.mockResolvedValue(null);

    await expect(
      makeService().registerWithGoogle('gid', 'emp@example.com', 'Jane', null, 'bad-token'),
    ).rejects.toThrow(BadRequestException);

    expect(mockBusinessInvitesService.consume).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when Google email does not match invite email', async () => {
    mockBusinessInvitesService.validate.mockResolvedValue('invited@company.com');

    await expect(
      makeService().registerWithGoogle('gid', 'different@gmail.com', 'Jane', null, 'token'),
    ).rejects.toThrow(BadRequestException);

    expect(mockBusinessInvitesService.consume).not.toHaveBeenCalled();
  });

  it('throws BadRequestException with GOOGLE_EMAIL_MISMATCH code for email mismatch', async () => {
    mockBusinessInvitesService.validate.mockResolvedValue('invited@company.com');

    try {
      await makeService().registerWithGoogle('gid', 'different@gmail.com', 'Jane', null, 'token');
      fail('should have thrown');
    } catch (err) {
      expect((err as Error).message).toBe('GOOGLE_EMAIL_MISMATCH');
    }
  });

  it('creates identity with Google and inserts employee on success', async () => {
    const inviteEmail = 'emp@company.com';
    const googleId = 'google-123';
    const pictureUrl = 'https://pic.example.com/photo.jpg';

    mockBusinessInvitesService.validate.mockResolvedValue(inviteEmail);
    mockBusinessInvitesService.consume.mockResolvedValue({ businessId: 'biz-1', email: inviteEmail });

    const fakeIdentity = Identity.createWithGoogle(inviteEmail, googleId, IdentityType.Employee);
    mockIdentityService.createWithGoogle.mockResolvedValue(fakeIdentity);

    const fakeEmployee = { id: 'emp-1', identityId: fakeIdentity.id };
    mockRepository.insert.mockResolvedValue(fakeEmployee);

    const result = await makeService().registerWithGoogle(googleId, inviteEmail, 'Jane Doe', pictureUrl, 'valid-token');

    expect(mockBusinessInvitesService.validate).toHaveBeenCalledWith('valid-token');
    expect(mockBusinessInvitesService.consume).toHaveBeenCalledWith('valid-token');
    expect(mockIdentityService.createWithGoogle).toHaveBeenCalledWith({
      email: inviteEmail,
      googleId,
      pictureUrl,
      type: IdentityType.Employee,
    });
    expect(mockRepository.insert).toHaveBeenCalled();
    expect(result).toBe(fakeEmployee);
  });

  it('email comparison is case-insensitive', async () => {
    mockBusinessInvitesService.validate.mockResolvedValue('Emp@Company.com');
    mockBusinessInvitesService.consume.mockResolvedValue({ businessId: 'biz-1', email: 'emp@company.com' });

    const fakeIdentity = Identity.createWithGoogle('emp@company.com', 'gid', IdentityType.Employee);
    mockIdentityService.createWithGoogle.mockResolvedValue(fakeIdentity);
    mockRepository.insert.mockResolvedValue({ id: 'emp-1', identityId: fakeIdentity.id });

    await expect(
      makeService().registerWithGoogle('gid', 'emp@company.com', 'Jane', null, 'token'),
    ).resolves.toBeDefined();
  });
});
