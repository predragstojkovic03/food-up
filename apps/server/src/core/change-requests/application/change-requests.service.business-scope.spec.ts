import { ChangeRequestStatus, EmployeeRole } from '@food-up/shared';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ChangeRequestsService } from './change-requests.service';
import { ChangeRequestsQueryService } from './queries/change-requests-query.service';

describe('Change requests — manager business scope', () => {
  const managerIdentityId = 'identity-manager-a';

  let repository: any;
  let windowsService: any;
  let eventEmitter: any;
  let service: ChangeRequestsService;

  const changeRequest = (id: string, windowId: string) => ({
    id,
    employeeId: `emp-of-${windowId}`,
    mealSelectionWindowId: windowId,
    changeStatus: jest.fn(),
  });

  let crs: Record<string, ReturnType<typeof changeRequest>>;

  beforeEach(() => {
    crs = {
      'cr-own': changeRequest('cr-own', 'win-own'),
      'cr-own-2': changeRequest('cr-own-2', 'win-own'),
      'cr-foreign': changeRequest('cr-foreign', 'win-foreign'),
    };
    repository = {
      findOneByCriteriaOrThrow: jest.fn(({ id }: { id: string }) =>
        Promise.resolve(crs[id]),
      ),
      update: jest.fn().mockResolvedValue(undefined),
    };
    windowsService = {
      findOneInMyBusiness: jest.fn((windowId: string) =>
        windowId === 'win-own'
          ? Promise.resolve({
              id: windowId,
              isPastDeadline: true,
              menuPeriodIds: [],
            })
          : Promise.reject(new EntityInstanceNotFoundException()),
      ),
    };
    eventEmitter = { emit: jest.fn() };

    service = new ChangeRequestsService(
      repository,
      {} as any,
      {} as any,
      {} as any,
      {
        findByIdentity: jest.fn().mockResolvedValue({
          id: 'emp-manager-a',
          role: EmployeeRole.Manager,
        }),
      } as any,
      windowsService,
      { log: jest.fn() } as any,
      { run: jest.fn((fn: () => unknown) => fn()) } as any,
      eventEmitter,
    );
  });

  describe('updateStatus', () => {
    it("approves a change request in the manager's own window", async () => {
      await service.updateStatus(
        'cr-own',
        managerIdentityId,
        ChangeRequestStatus.Approved,
      );
      expect(crs['cr-own'].changeStatus).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith('cr-own', crs['cr-own']);
    });

    it("rejects another business's change request without changing it", async () => {
      await expect(
        service.updateStatus(
          'cr-foreign',
          managerIdentityId,
          ChangeRequestStatus.Approved,
        ),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(crs['cr-foreign'].changeStatus).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it("updates all change requests when every window is the manager's own", async () => {
      await service.bulkUpdateStatus(
        {
          items: [
            { id: 'cr-own', status: ChangeRequestStatus.Approved },
            { id: 'cr-own-2', status: ChangeRequestStatus.Rejected },
          ],
        },
        managerIdentityId,
      );
      expect(repository.update).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it("changes nothing if any item belongs to another business's window", async () => {
      await expect(
        service.bulkUpdateStatus(
          {
            items: [
              { id: 'cr-own', status: ChangeRequestStatus.Approved },
              { id: 'cr-foreign', status: ChangeRequestStatus.Approved },
            ],
          },
          managerIdentityId,
        ),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(crs['cr-own'].changeStatus).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it("rejects a late addition to another business's window", async () => {
      await expect(
        service.create('identity-employee-a', {
          mealSelectionWindowId: 'win-foreign',
          newMenuItemId: 'mi-1',
        } as any),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
    });
  });

  describe('ChangeRequestsQueryService window views', () => {
    let queryRepository: any;
    let queryService: ChangeRequestsQueryService;

    beforeEach(() => {
      queryRepository = {
        findRichByWindow: jest.fn().mockResolvedValue([]),
        findPendingCountByWindow: jest.fn().mockResolvedValue(0),
      };
      queryService = new ChangeRequestsQueryService(
        queryRepository,
        windowsService,
      );
    });

    it("returns the manager's own window data", async () => {
      await expect(
        queryService.findRichByWindowInMyBusiness('win-own', managerIdentityId),
      ).resolves.toEqual([]);
      await expect(
        queryService.findPendingCountByWindowInMyBusiness(
          'win-own',
          managerIdentityId,
        ),
      ).resolves.toBe(0);
    });

    it("rejects another business's window without querying", async () => {
      await expect(
        queryService.findRichByWindowInMyBusiness(
          'win-foreign',
          managerIdentityId,
        ),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      await expect(
        queryService.findPendingCountByWindowInMyBusiness(
          'win-foreign',
          managerIdentityId,
        ),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(queryRepository.findRichByWindow).not.toHaveBeenCalled();
      expect(queryRepository.findPendingCountByWindow).not.toHaveBeenCalled();
    });
  });
});
