import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MealSelectionWindow } from '../domain/meal-selection-window.entity';
import { MealSelectionWindowsService } from './meal-selection-windows.service';

describe('MealSelectionWindowsService — business scope', () => {
  let service: MealSelectionWindowsService;
  let repository: any;
  let menuItemsService: any;

  const managerIdentityId = 'identity-manager-a';
  const date = '2026-10-26';

  function window(id: string, businessId: string, menuPeriodIds = ['mp-own']): MealSelectionWindow {
    return MealSelectionWindow.reconstitute(
      id,
      new Date('2026-10-20T08:00:00Z'),
      new Date('2026-10-23T12:00:00Z'),
      new Set([date]),
      businessId,
      menuPeriodIds,
      false,
      false,
    );
  }

  const windows: Record<string, MealSelectionWindow> = {};
  const menuPeriods: Record<string, object> = {
    'mp-own': { id: 'mp-own', supplierId: 'sup-managed', startDate: date, endDate: date },
    'mp-partner': { id: 'mp-partner', supplierId: 'sup-partner', startDate: date, endDate: date },
    'mp-foreign': { id: 'mp-foreign', supplierId: 'sup-foreign', startDate: date, endDate: date },
  };

  beforeEach(() => {
    windows['win-own'] = window('win-own', 'biz-a');
    windows['win-foreign'] = window('win-foreign', 'biz-b');

    repository = {
      findOneByCriteriaOrThrow: jest.fn(({ id }: { id: string }) =>
        windows[id] ? Promise.resolve(windows[id]) : Promise.reject(new EntityInstanceNotFoundException()),
      ),
      save: jest.fn((w: MealSelectionWindow) => Promise.resolve(w)),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    menuItemsService = {
      findWithMealsByMenuPeriods: jest.fn().mockResolvedValue([{ day: date }]),
    };

    service = new MealSelectionWindowsService(
      repository,
      { findBulkByIds: jest.fn((ids: string[]) => Promise.resolve(ids.map((id) => menuPeriods[id]))) } as any,
      { findByIdentity: jest.fn().mockResolvedValue({ id: 'emp-manager-a', businessId: 'biz-a' }) } as any,
      {
        findManagedByBusiness: jest.fn().mockResolvedValue([{ id: 'sup-managed' }]),
        findPartnersByBusiness: jest.fn().mockResolvedValue([{ id: 'sup-partner' }]),
      } as any,
      menuItemsService,
      { log: jest.fn(), warn: jest.fn() } as any,
    );
  });

  describe('windows of another business respond as not found', () => {
    it.each([
      ['update', (s: MealSelectionWindowsService) => s.update('win-foreign', { isLocked: true }, managerIdentityId)],
      ['delete', (s: MealSelectionWindowsService) => s.delete('win-foreign', managerIdentityId)],
      ['findMenuItemsForWindow', (s: MealSelectionWindowsService) => s.findMenuItemsForWindow('win-foreign', managerIdentityId)],
    ])('%s', async (_, call) => {
      await expect(call(service)).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
      expect(menuItemsService.findWithMealsByMenuPeriods).not.toHaveBeenCalled();
    });
  });

  it("updates, deletes and lists menu items of the manager's own window", async () => {
    await service.update('win-own', { isLocked: true }, managerIdentityId);
    expect(repository.save).toHaveBeenCalled();

    await service.findMenuItemsForWindow('win-own', managerIdentityId);
    expect(menuItemsService.findWithMealsByMenuPeriods).toHaveBeenCalledWith(['mp-own']);

    await service.delete('win-own', managerIdentityId);
    expect(repository.delete).toHaveBeenCalledWith('win-own');
  });

  describe('menu period ownership', () => {
    const createDto = (menuPeriodIds: string[]) => ({
      startTime: new Date('2026-10-20T08:00:00Z'),
      endTime: new Date('2026-10-23T12:00:00Z'),
      menuPeriodIds,
      targetDates: [date],
    });

    it('accepts menu periods of managed and partner suppliers', async () => {
      await expect(service.create(managerIdentityId, createDto(['mp-own', 'mp-partner']))).resolves.toBeDefined();
    });

    it("rejects creating a window with another business's supplier menu", async () => {
      await expect(service.create(managerIdentityId, createDto(['mp-own', 'mp-foreign']))).rejects.toBeInstanceOf(
        InvalidInputDataException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("rejects switching a window to another business's supplier menu", async () => {
      await expect(
        service.update('win-own', { menuPeriodIds: ['mp-foreign'] }, managerIdentityId),
      ).rejects.toBeInstanceOf(InvalidInputDataException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
