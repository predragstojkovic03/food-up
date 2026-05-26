import { WindowDailyOverviewItemDto } from './dto/window-daily-overview-item.dto';

export const I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY = Symbol(
  'IMealSelectionOverviewQueryRepository',
);

export interface IMealSelectionOverviewQueryRepository {
  getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]>;
}
