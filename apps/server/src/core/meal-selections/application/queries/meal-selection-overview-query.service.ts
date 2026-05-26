import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

  getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]> {
    return this._repository.getDailyOverview(windowId);
  }
}
