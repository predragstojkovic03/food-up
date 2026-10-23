import { MealType } from '@food-up/shared';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ChangeRequestsService } from './change-requests.service';

describe('ChangeRequestsService.create() — swap', () => {
  let service: ChangeRequestsService;
  let mockRepository: any;

  const employeeId = 'emp-1';
  const windowId = 'win-1';
  const date = '2025-06-03';

  const menuItems: Record<string, { id: string; mealId: string; day: string; menuPeriodId: string }> = {
    'mi-chicken': { id: 'mi-chicken', mealId: 'meal-chicken', day: date, menuPeriodId: 'period-1' },
    'mi-fish': { id: 'mi-fish', mealId: 'meal-fish', day: date, menuPeriodId: 'period-1' },
    'mi-fish-next-day': { id: 'mi-fish-next-day', mealId: 'meal-fish', day: '2025-06-04', menuPeriodId: 'period-1' },
    'mi-salad': { id: 'mi-salad', mealId: 'meal-salad', day: date, menuPeriodId: 'period-1' },
  };
  const meals: Record<string, { id: string; type: MealType }> = {
    'meal-chicken': { id: 'meal-chicken', type: MealType.Lunch },
    'meal-fish': { id: 'meal-fish', type: MealType.Lunch },
    'meal-salad': { id: 'meal-salad', type: MealType.Salad },
  };

  beforeEach(() => {
    mockRepository = { insert: jest.fn().mockResolvedValue(undefined) };

    service = new ChangeRequestsService(
      mockRepository,
      {
        findOne: jest.fn().mockResolvedValue({
          id: 'ms-1',
          employeeId,
          mealSelectionWindowId: windowId,
          menuItemId: 'mi-chicken',
          quantity: 1,
          date,
        }),
      } as any,
      { findOne: jest.fn((id: string) => Promise.resolve(menuItems[id])) } as any,
      { findOne: jest.fn((id: string) => Promise.resolve(meals[id])) } as any,
      { findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }) } as any,
      {
        findOne: jest.fn().mockResolvedValue({ id: windowId, isPastDeadline: true, menuPeriodIds: ['period-1'] }),
      } as any,
      { log: jest.fn() } as any,
      { run: jest.fn() } as any,
      { emit: jest.fn() } as any,
    );
  });

  function swapTo(newMenuItemId: string) {
    return service.create('identity-1', { mealSelectionWindowId: windowId, mealSelectionId: 'ms-1', newMenuItemId });
  }

  it('allows a swap to another meal of the same type on the same day', async () => {
    await expect(swapTo('mi-fish')).resolves.toBeDefined();
    expect(mockRepository.insert).toHaveBeenCalled();
  });

  it('rejects a swap to a different meal type', async () => {
    await expect(swapTo('mi-salad')).rejects.toThrow(InvalidInputDataException);
    expect(mockRepository.insert).not.toHaveBeenCalled();
  });

  it('rejects a swap to a menu item on a different day', async () => {
    await expect(swapTo('mi-fish-next-day')).rejects.toThrow(InvalidInputDataException);
    expect(mockRepository.insert).not.toHaveBeenCalled();
  });

  it('allows removing a selection without a new menu item', async () => {
    await expect(
      service.create('identity-1', { mealSelectionWindowId: windowId, mealSelectionId: 'ms-1', clearSelection: true }),
    ).resolves.toBeDefined();
  });
});
