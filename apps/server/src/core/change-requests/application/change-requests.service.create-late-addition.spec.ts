import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ChangeRequestsService } from './change-requests.service';

describe('ChangeRequestsService.create() — late addition', () => {
  let service: ChangeRequestsService;
  let mockRepository: any;
  let mockMealSelectionsService: any;
  let mockMenuItemsService: any;
  let mockEmployeesService: any;
  let mockWindowsService: any;

  const employeeId = 'emp-1';
  const windowId = 'win-1';
  const menuItemId = 'mi-1';
  const identityId = 'identity-1';

  beforeEach(() => {
    mockRepository = { insert: jest.fn() };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }),
    };
    mockWindowsService = {
      findOne: jest.fn().mockResolvedValue({
        id: windowId,
        isPastDeadline: true,
        menuPeriodIds: ['period-1'],
      }),
    };
    mockMenuItemsService = {
      findOne: jest.fn().mockResolvedValue({
        id: menuItemId,
        mealId: 'meal-1',
        day: '2025-06-03',
        menuPeriodId: 'period-1',
      }),
    };
    mockMealSelectionsService = {
      findOne: jest.fn(),
      existsByEmployeeWindowWithSameMealTypeAndDateAs: jest.fn(),
    };

    service = new ChangeRequestsService(
      mockRepository,
      mockMealSelectionsService,
      mockMenuItemsService,
      mockEmployeesService,
      mockWindowsService,
      { log: jest.fn() } as any,
      { run: jest.fn() } as any,
      { emit: jest.fn() } as any,
    );
  });

  it('throws when employee already has a selection of the same meal type on the same date', async () => {
    mockMealSelectionsService.existsByEmployeeWindowWithSameMealTypeAndDateAs.mockResolvedValue(true);

    await expect(
      service.create(identityId, {
        mealSelectionWindowId: windowId,
        newMenuItemId: menuItemId,
        newQuantity: 1,
      }),
    ).rejects.toThrow(InvalidInputDataException);

    expect(
      mockMealSelectionsService.existsByEmployeeWindowWithSameMealTypeAndDateAs,
    ).toHaveBeenCalledWith(employeeId, windowId, menuItemId);
  });

  it('allows late addition when no existing selection of the same meal type on the same date', async () => {
    mockMealSelectionsService.existsByEmployeeWindowWithSameMealTypeAndDateAs.mockResolvedValue(false);
    mockRepository.insert = jest.fn().mockResolvedValue(undefined);

    await expect(
      service.create(identityId, {
        mealSelectionWindowId: windowId,
        newMenuItemId: menuItemId,
        newQuantity: 1,
      }),
    ).resolves.not.toThrow();

    expect(mockRepository.insert).toHaveBeenCalledTimes(1);
  });
});
