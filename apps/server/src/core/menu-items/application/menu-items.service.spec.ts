import { Test, TestingModule } from '@nestjs/testing';
import { MealType } from '@food-up/shared';
import { Meal } from 'src/core/meals/domain/meal.entity';
import { MenuPeriod } from 'src/core/menu-periods/domain/menu-period.entity';
import { MealsService } from 'src/core/meals/application/meals.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsQueryService } from './queries/menu-items-query.service';
import { I_MENU_ITEMS_REPOSITORY } from '../domain/menu-items.repository.interface';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { MenuItemsService } from './menu-items.service';

describe('MenuItemsService.update()', () => {
  let service: MenuItemsService;
  let mockRepository: any;
  let mockMealSelectionWindowsService: any;

  const menuItemId = 'mi-1';

  beforeEach(() => {
    mockRepository = {
      findOneByCriteriaOrThrow: jest.fn().mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: 10.00,
        day: '2026-01-01',
      }),
      update: jest.fn(),
    };
    mockMealSelectionWindowsService = {
      existsActiveByMenuPeriodId: jest.fn().mockResolvedValue(false),
    };

    service = new MenuItemsService(
      mockRepository,
      { findWithMealsByMenuPeriodIds: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      mockMealSelectionWindowsService,
    );
  });

  it('throws InvalidOperationException when updating price with active window', async () => {
    mockMealSelectionWindowsService.existsActiveByMenuPeriodId.mockResolvedValue(true);

    await expect(
      service.update(menuItemId, { price: 15.00 }),
    ).rejects.toThrow(InvalidOperationException);

    expect(mockMealSelectionWindowsService.existsActiveByMenuPeriodId)
      .toHaveBeenCalledWith('period-1');
  });

  it('allows price update when no active window', async () => {
    mockMealSelectionWindowsService.existsActiveByMenuPeriodId.mockResolvedValue(false);

    await expect(
      service.update(menuItemId, { price: 15.00 }),
    ).resolves.not.toThrow();

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
  });

  it('skips active-window check when price not in dto', async () => {
    await service.update(menuItemId, { day: '2026-02-01' });

    expect(mockMealSelectionWindowsService.existsActiveByMenuPeriodId)
      .not.toHaveBeenCalled();
  });
});

describe('MenuItemsService.create — price copy', () => {
  let service: MenuItemsService;
  let repositoryMock: Record<string, jest.Mock>;
  let mealsServiceMock: Record<string, jest.Mock>;
  let menuPeriodsServiceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositoryMock = {
      findOneByCriteria: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mealsServiceMock = { findOne: jest.fn() };
    menuPeriodsServiceMock = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: I_MENU_ITEMS_REPOSITORY, useValue: repositoryMock },
        { provide: MenuItemsQueryService, useValue: {} },
        { provide: MealsService, useValue: mealsServiceMock },
        { provide: MenuPeriodsService, useValue: menuPeriodsServiceMock },
        { provide: MealSelectionWindowsService, useValue: {} },
      ],
    }).compile();

    service = module.get(MenuItemsService);
  });

  it('copies meal price onto the created menu item', async () => {
    const meal = Meal.reconstitute('meal-1', 'Pizza', undefined, MealType.Lunch, 'supplier-1', 450);
    const menuPeriod = { id: 'period-1', supplierId: 'supplier-1' } as MenuPeriod;
    mealsServiceMock.findOne.mockResolvedValue(meal);
    menuPeriodsServiceMock.findOne.mockResolvedValue(menuPeriod);

    const result = await service.create({
      menuPeriodId: 'period-1',
      day: '2026-06-11',
      mealId: 'meal-1',
    });

    expect(result.price).toBe(450);
  });

  it('sets menu item price to null when meal has no price', async () => {
    const meal = Meal.reconstitute('meal-2', 'Salad', undefined, MealType.Lunch, 'supplier-1', undefined);
    const menuPeriod = { id: 'period-1', supplierId: 'supplier-1' } as MenuPeriod;
    mealsServiceMock.findOne.mockResolvedValue(meal);
    menuPeriodsServiceMock.findOne.mockResolvedValue(menuPeriod);

    const result = await service.create({
      menuPeriodId: 'period-1',
      day: '2026-06-11',
      mealId: 'meal-2',
    });

    expect(result.price).toBeNull();
  });
});
