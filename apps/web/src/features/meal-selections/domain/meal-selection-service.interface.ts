import {
  ICreateMealSelection,
  IMealSelectionResponse,
  IMyMealSelectionResponse,
  IUpdateMealSelection,
} from '@food-up/shared';

export interface IMealSelectionService {
  getByWindow(windowId: string): Promise<IMealSelectionResponse[]>;
  getMySelectionsForWindow(windowId: string): Promise<IMyMealSelectionResponse[]>;
  create(data: ICreateMealSelection): Promise<IMealSelectionResponse>;
  update(id: string, data: IUpdateMealSelection): Promise<IMealSelectionResponse>;
}
