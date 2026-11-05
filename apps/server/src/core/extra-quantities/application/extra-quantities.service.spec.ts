import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ExtraQuantity } from '../domain/extra-quantity.entity';
import { ExtraQuantitiesService } from './extra-quantities.service';

describe('ExtraQuantitiesService — manager business scope', () => {
  const managerIdentityId = 'identity-manager-a';

  let repository: any;
  let service: ExtraQuantitiesService;

  beforeEach(() => {
    const rows: Record<string, ExtraQuantity> = {
      'eq-own': ExtraQuantity.reconstitute(
        'eq-own',
        'win-own',
        'mi-own',
        1,
        'Guest',
      ),
      'eq-foreign': ExtraQuantity.reconstitute(
        'eq-foreign',
        'win-foreign',
        'mi-foreign',
        1,
        null,
      ),
    };
    repository = {
      insert: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn((id: string) => Promise.resolve(rows[id] ?? null)),
      findByWindow: jest.fn().mockResolvedValue([]),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    service = new ExtraQuantitiesService(
      repository,
      {
        findOneInMyBusiness: jest.fn((windowId: string) =>
          windowId === 'win-own'
            ? Promise.resolve({ id: windowId, menuPeriodIds: ['period-own'] })
            : Promise.reject(new EntityInstanceNotFoundException()),
        ),
      } as any,
      {
        findOne: jest.fn((id: string) =>
          Promise.resolve({
            id,
            menuPeriodId: id === 'mi-own' ? 'period-own' : 'period-other',
          }),
        ),
      } as any,
    );
  });

  it("adds an extra quantity for a menu item of the manager's own window", async () => {
    await service.add('win-own', 'mi-own', 2, 'Guest', managerIdentityId);
    expect(repository.insert).toHaveBeenCalledTimes(1);
  });

  it("rejects adding to another business's window", async () => {
    await expect(
      service.add('win-foreign', 'mi-own', 2, null, managerIdentityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('rejects a menu item that is not part of the window', async () => {
    await expect(
      service.add('win-own', 'mi-other', 2, null, managerIdentityId),
    ).rejects.toBeInstanceOf(InvalidInputDataException);
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it("lists only the manager's own window", async () => {
    await expect(
      service.findByWindow('win-own', managerIdentityId),
    ).resolves.toEqual([]);
    await expect(
      service.findByWindow('win-foreign', managerIdentityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(repository.findByWindow).toHaveBeenCalledTimes(1);
  });

  it("removes rows of the manager's own window only", async () => {
    await service.remove('eq-own', managerIdentityId);
    expect(repository.remove).toHaveBeenCalledWith('eq-own');

    await expect(
      service.remove('eq-foreign', managerIdentityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    await expect(
      service.remove('eq-missing', managerIdentityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(repository.remove).toHaveBeenCalledTimes(1);
  });
});
