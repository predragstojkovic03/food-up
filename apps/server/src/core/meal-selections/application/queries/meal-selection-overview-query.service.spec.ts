import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';
import { MealSelectionOverviewQueryService } from './meal-selection-overview-query.service';

describe('MealSelectionOverviewQueryService', () => {
  let service: MealSelectionOverviewQueryService;
  let mockRepository: { getDailyOverview: jest.Mock };

  beforeEach(() => {
    mockRepository = { getDailyOverview: jest.fn() };
    service = new MealSelectionOverviewQueryService(mockRepository as any);
  });

  describe('getDailyOverview', () => {
    it('delegates to the repository with the given windowId', async () => {
      mockRepository.getDailyOverview.mockResolvedValue([]);

      await service.getDailyOverview('window-1');

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
        },
      ];
      mockRepository.getDailyOverview.mockResolvedValue(items);

      const result = await service.getDailyOverview('window-1');

      expect(result).toBe(items);
    });
  });
});
