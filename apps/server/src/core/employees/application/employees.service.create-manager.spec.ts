import { EntityInstanceAlreadyExistsException } from 'src/shared/domain/exceptions/entity-instance-already-exists.exception';
import { EmployeesService } from './employees.service';

describe('EmployeesService.createManager', () => {
  let repository: any;
  let identityService: any;
  let service: EmployeesService;

  const dto = {
    name: 'Jane',
    email: 'jane@acme.com',
    password: 'secret123',
    businessId: 'biz-1',
  };

  beforeEach(() => {
    repository = { insert: jest.fn((e: unknown) => Promise.resolve(e)) };
    identityService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'identity-1' }),
    };
    service = new EmployeesService(
      repository,
      identityService,
      {} as any,
      { run: jest.fn((fn: () => unknown) => fn()) } as any,
      { log: jest.fn() } as any,
    );
  });

  it('creates the identity and the manager', async () => {
    await service.createManager(dto);
    expect(identityService.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jane@acme.com' }),
    );
    expect(repository.insert).toHaveBeenCalledTimes(1);
  });

  it('rejects an email that already has an account with 409', async () => {
    identityService.findByEmail.mockResolvedValue({ id: 'existing' });
    await expect(service.createManager(dto)).rejects.toBeInstanceOf(
      EntityInstanceAlreadyExistsException,
    );
    expect(identityService.create).not.toHaveBeenCalled();
    expect(repository.insert).not.toHaveBeenCalled();
  });
});
