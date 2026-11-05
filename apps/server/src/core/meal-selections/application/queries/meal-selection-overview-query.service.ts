import { Inject, Injectable } from '@nestjs/common';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import {
  I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY,
  IMealSelectionOverviewQueryRepository,
} from './meal-selection-overview-query-repository.interface';
import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';

@Injectable()
export class MealSelectionOverviewQueryService {
  constructor(
    @Inject(I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY)
    private readonly _repository: IMealSelectionOverviewQueryRepository,
    private readonly _windowsService: MealSelectionWindowsService,
  ) {}

  async getDailyOverview(
    windowId: string,
    identityId: string,
  ): Promise<WindowDailyOverviewItemDto[]> {
    await this._windowsService.findOneInMyBusiness(windowId, identityId);
    return this._repository.getDailyOverview(windowId);
  }
}
