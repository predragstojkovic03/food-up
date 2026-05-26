import {
  ICreateMealSelection,
  IMealSelectionResponse,
  IMyMealSelectionResponse,
  IUpdateMealSelection,
  IWindowDailyOverviewItem,
} from '@food-up/shared';

export interface IMealSelectionService {
  getByWindow(windowId: string): Promise<IMealSelectionResponse[]>;
  getMySelectionsForWindow(windowId: string): Promise<IMyMealSelectionResponse[]>;
  getDailyOverview(windowId: string): Promise<IWindowDailyOverviewItem[]>;
  create(data: ICreateMealSelection): Promise<IMealSelectionResponse>;
  update(id: string, data: IUpdateMealSelection): Promise<IMealSelectionResponse>;
}
