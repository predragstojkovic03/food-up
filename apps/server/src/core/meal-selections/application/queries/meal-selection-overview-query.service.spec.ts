import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';
import { MealSelectionOverviewQueryService } from './meal-selection-overview-query.service';

describe('MealSelectionOverviewQueryService', () => {
  let service: MealSelectionOverviewQueryService;
  let mockRepository: { getDailyOverview: jest.Mock };
  let mockWindowsService: { findOneInMyBusiness: jest.Mock };

  beforeEach(() => {
    mockRepository = { getDailyOverview: jest.fn() };
    mockWindowsService = { findOneInMyBusiness: jest.fn().mockResolvedValue({ id: 'window-1' }) };
    service = new MealSelectionOverviewQueryService(mockRepository as any, mockWindowsService as any);
  });

  describe('getDailyOverview', () => {
    it('delegates to the repository with the given windowId', async () => {
      mockRepository.getDailyOverview.mockResolvedValue([]);

      await service.getDailyOverview('window-1', 'identity-1');

      expect(mockRepository.getDailyOverview).toHaveBeenCalledWith('window-1');
    });

    it('returns the items from the repository', async () => {
      const items: WindowDailyOverviewItemDto[] = [
        {
          employeeId: 'e-1',
          employeeName: 'Alice',
          date: '2026-05-26',
          status: 'ordered',
          meals: [],
          changes: [],
        },
      ];
      mockRepository.getDailyOverview.mockResolvedValue(items);

      const result = await service.getDailyOverview('window-1', 'identity-1');

      expect(result).toBe(items);
    });

    it("rejects windows outside the caller's business without querying", async () => {
      mockWindowsService.findOneInMyBusiness.mockRejectedValue(new EntityInstanceNotFoundException());

      await expect(service.getDailyOverview('window-b', 'identity-1')).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      expect(mockWindowsService.findOneInMyBusiness).toHaveBeenCalledWith('window-b', 'identity-1');
      expect(mockRepository.getDailyOverview).not.toHaveBeenCalled();
    });
  });
});
