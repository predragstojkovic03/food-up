import { MealSelectionsService } from './meal-selections.service';

describe('MealSelectionsService', () => {
  let service: MealSelectionsService;
  let mockRepository: any;
  let mockWindowsService: any;
  let mockEmployeesService: any;
  let mockMenuItemsService: any;

  const employeeId = 'emp-1';
  const windowId = 'win-1';
  const menuItemId = 'mi-1';
  const identityId = 'identity-1';

  beforeEach(() => {
    mockRepository = { insert: jest.fn(), findOneByCriteriaOrThrow: jest.fn(), update: jest.fn() };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }),
    };
    mockWindowsService = {
      findOne: jest.fn().mockResolvedValue({
        id: windowId,
        isActive: true,
        targetDates: new Set(['2026-01-01']),
        menuPeriodIds: ['period-1'],
      }),
    };
    mockMenuItemsService = {
      findOne: jest.fn().mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: 12.50,
      }),
    };

    service = new MealSelectionsService(
      mockRepository,
      mockWindowsService,
      mockEmployeesService,
      mockMenuItemsService,
      { log: jest.fn() } as any,
    );
  });

  describe('create()', () => {
    it('captures price from menu item onto selection', async () => {
      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
        menuItemId,
      });

      expect(result.price).toBe(12.50);
    });

    it('stores null price when no menu item', async () => {
      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
      });

      expect(result.price).toBeNull();
    });

    it('stores null price when menu item has no price', async () => {
      mockMenuItemsService.findOne.mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: null,
      });

      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
        menuItemId,
      });

      expect(result.price).toBeNull();
    });
  });

  describe('update()', () => {
    it('updates price when new menu item provided', async () => {
      const mockSelection = {
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      };
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(mockSelection);

      await service.update('sel-1', identityId, { menuItemId: 'mi-2' });

      expect(mockSelection.update).toHaveBeenCalledWith('mi-2', undefined, 12.50);
    });

    it('clears price when menuItemId set to null', async () => {
      const mockSelection = {
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      };
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(mockSelection);

      await service.update('sel-1', identityId, { menuItemId: null });

      expect(mockSelection.update).toHaveBeenCalledWith(null, undefined, null);
    });

    it('does not change price when menuItemId not in dto', async () => {
      const mockSelection = {
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      };
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(mockSelection);

      await service.update('sel-1', identityId, { quantity: 3 });

      expect(mockSelection.update).toHaveBeenCalledWith(undefined, 3, undefined);
    });
  });
});
