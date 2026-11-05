import { IdentityType, MealType } from '@food-up/shared';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MealsService } from './meals.service';

describe('MealsService — supplier access', () => {
  let service: MealsService;
  let repository: any;
  let suppliersService: any;

  const identityId = 'identity-manager-a';
  const meal = {
    id: 'meal-1',
    supplierId: 'sup-managed-b',
    name: 'Sarma',
    type: MealType.Lunch,
  };

  beforeEach(() => {
    repository = {
      findOneByCriteria: jest.fn().mockResolvedValue(meal),
      findOneByCriteriaOrThrow: jest.fn().mockResolvedValue(meal),
      findByCriteria: jest.fn().mockResolvedValue([]),
      insert: jest.fn((m: unknown) => Promise.resolve(m)),
      update: jest.fn().mockResolvedValue(meal),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    suppliersService = {
      assertCanManage: jest
        .fn()
        .mockRejectedValue(new EntityInstanceNotFoundException()),
      assertCanView: jest
        .fn()
        .mockRejectedValue(new EntityInstanceNotFoundException()),
    };
    service = new MealsService(
      repository,
      {
        findById: jest.fn().mockResolvedValue({ type: IdentityType.Employee }),
      } as any,
      suppliersService,
      { log: jest.fn() } as any,
    );
  });

  it("rejects creating a meal for a supplier the caller can't manage", async () => {
    await expect(
      service.create(identityId, {
        name: 'X',
        type: MealType.Lunch,
        supplierId: 'sup-managed-b',
      } as any),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it("rejects updating or deleting a meal of a supplier the caller can't manage", async () => {
    await expect(
      service.update('meal-1', { price: 1 }, identityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    await expect(service.delete('meal-1', identityId)).rejects.toBeInstanceOf(
      EntityInstanceNotFoundException,
    );
    expect(suppliersService.assertCanManage).toHaveBeenCalledWith(
      'sup-managed-b',
      identityId,
    );
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("rejects listing meals of a supplier the caller can't view", async () => {
    await expect(
      service.findBySupplier('sup-managed-b', identityId),
    ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    expect(repository.findByCriteria).not.toHaveBeenCalled();
  });

  it('updates and deletes meals of a supplier the caller manages', async () => {
    suppliersService.assertCanManage.mockResolvedValue({ id: 'sup-managed-b' });
    await service.update('meal-1', { price: 1 }, identityId);
    await service.delete('meal-1', identityId);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledWith('meal-1');
  });
});
