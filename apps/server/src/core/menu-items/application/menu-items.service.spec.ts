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
