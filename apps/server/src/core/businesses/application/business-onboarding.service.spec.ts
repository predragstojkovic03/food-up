import { EntityInstanceAlreadyExistsException } from 'src/shared/domain/exceptions/entity-instance-already-exists.exception';
import { BusinessOnboardingService } from './business-onboarding.service';
import { BusinessesService } from './businesses.service';

describe('BusinessOnboardingService', () => {
  const dto = {
    name: 'Acme',
    contactEmail: 'office@acme.com',
    manager: { name: 'Jane', email: 'jane@acme.com', password: 'secret123' },
  };

  let businessesService: any;
  let employeesService: any;
  let transactionRunner: any;
  let service: BusinessOnboardingService;

  beforeEach(() => {
    businessesService = { create: jest.fn().mockResolvedValue({ id: 'biz-1', name: 'Acme' }) };
    employeesService = { createManager: jest.fn().mockResolvedValue({ id: 'emp-1', name: 'Jane' }) };
    transactionRunner = { run: jest.fn((work: () => Promise<unknown>) => work()) };
    service = new BusinessOnboardingService(
      businessesService,
      employeesService,
      transactionRunner,
      { log: jest.fn() } as any,
    );
  });

  it('creates the business and its manager inside one transaction', async () => {
    const result = await service.onboard(dto);

    expect(transactionRunner.run).toHaveBeenCalledTimes(1);
    expect(businessesService.create).toHaveBeenCalledWith({
      name: 'Acme',
      contactEmail: 'office@acme.com',
      contactPhone: undefined,
    });
    expect(employeesService.createManager).toHaveBeenCalledWith({ ...dto.manager, businessId: 'biz-1' });
    expect(result).toEqual({ business: { id: 'biz-1', name: 'Acme' }, manager: { id: 'emp-1', name: 'Jane' } });
  });

  it('propagates a manager failure so the transaction rolls back', async () => {
    employeesService.createManager.mockRejectedValue(new EntityInstanceAlreadyExistsException());
    await expect(service.onboard(dto)).rejects.toBeInstanceOf(EntityInstanceAlreadyExistsException);
  });
});

describe('BusinessesService.create — uniqueness', () => {
  function serviceWith(existing: { name?: string; contactEmail?: string }) {
    const repository = {
      findOneByCriteria: jest.fn((criteria: { name?: string; contactEmail?: string }) =>
        Promise.resolve(
          (criteria.name && criteria.name === existing.name) ||
            (criteria.contactEmail && criteria.contactEmail === existing.contactEmail)
            ? { id: 'existing' }
            : null,
        ),
      ),
      insert: jest.fn((b: unknown) => Promise.resolve(b)),
    };
    return { repository, service: new BusinessesService(repository as any, { log: jest.fn() } as any) };
  }

  it.each([
    ['name', { name: 'Acme' }],
    ['contact email', { contactEmail: 'office@acme.com' }],
  ])('rejects a taken %s with 409', async (_, existing) => {
    const { repository, service } = serviceWith(existing);
    await expect(service.create({ name: 'Acme', contactEmail: 'office@acme.com' })).rejects.toBeInstanceOf(
      EntityInstanceAlreadyExistsException,
    );
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('creates the business when name and contact email are free', async () => {
    const { repository, service } = serviceWith({});
    await service.create({ name: 'Acme', contactEmail: 'office@acme.com' });
    expect(repository.insert).toHaveBeenCalledTimes(1);
  });
});
