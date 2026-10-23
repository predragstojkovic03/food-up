import { Language } from '@food-up/shared';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { BusinessInvitesService } from 'src/core/business-invites/application/business-invites.service';
import { BusinessesController } from './businesses.controller';

describe('BusinessesController — invites are scoped to the manager business', () => {
  let controller: BusinessesController;
  let invitesService: any;

  const manager = { sub: 'identity-manager-a' } as any;
  const invite = {
    id: 'invite-a',
    businessId: 'biz-a',
    token: 'secret-token',
    email: 'new@example.com',
    expiresAt: new Date(),
    mailSent: true,
  };

  beforeEach(() => {
    invitesService = {
      findActiveByBusiness: jest.fn().mockResolvedValue([invite]),
      create: jest.fn().mockResolvedValue(invite),
      resend: jest.fn().mockResolvedValue(invite),
    };
    controller = new BusinessesController(
      { findOne: jest.fn().mockResolvedValue({ id: 'biz-a', language: Language.Sr }) } as any,
      invitesService,
      { findByIdentity: jest.fn().mockResolvedValue({ id: 'emp-manager-a', businessId: 'biz-a' }) } as any,
    );
  });

  it("lists, creates and resends invites for the manager's own business", async () => {
    await expect(controller.listInvites('biz-a', manager)).resolves.toHaveLength(1);
    await controller.createInvite('biz-a', { email: 'new@example.com' } as any, manager);
    await controller.resendInvite('biz-a', 'invite-a', manager);

    expect(invitesService.findActiveByBusiness).toHaveBeenCalledWith('biz-a');
    expect(invitesService.create).toHaveBeenCalledWith('biz-a', 'new@example.com', Language.Sr);
    expect(invitesService.resend).toHaveBeenCalledWith('invite-a', 'biz-a', Language.Sr);
  });

  it.each([
    ['listInvites', (c: BusinessesController) => c.listInvites('biz-b', manager)],
    ['createInvite', (c: BusinessesController) => c.createInvite('biz-b', { email: 'x@example.com' } as any, manager)],
    ['resendInvite', (c: BusinessesController) => c.resendInvite('biz-b', 'invite-b', manager)],
  ])('%s rejects another business as not found', async (_, call) => {
    await expect(call(controller)).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(invitesService.findActiveByBusiness).not.toHaveBeenCalled();
    expect(invitesService.create).not.toHaveBeenCalled();
    expect(invitesService.resend).not.toHaveBeenCalled();
  });
});

describe('BusinessInvitesService.resend', () => {
  it('rejects an invite that belongs to a different business than the one in the path', async () => {
    const mailService = { send: jest.fn() };
    const service = new BusinessInvitesService(
      {
        findOneByCriteriaOrThrow: jest.fn().mockResolvedValue({ id: 'invite-b', businessId: 'biz-b', isActive: true }),
      } as any,
      { log: jest.fn(), warn: jest.fn() } as any,
      mailService as any,
      { get: jest.fn() } as any,
    );

    await expect(service.resend('invite-b', 'biz-a', Language.En)).rejects.toBeInstanceOf(
      EntityInstanceNotFoundException,
    );
    expect(mailService.send).not.toHaveBeenCalled();
  });
});
