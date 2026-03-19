import {
  ICreateMealSelectionWindow,
  IGetCurrentMealSelectionWindowResponse,
  IMealSelectionWindowResponse,
  IRelevantMealSelectionWindowResponse,
  IUpdateMealSelectionWindow,
  IWindowMenuItemResponse,
} from '@food-up/shared';

export interface IMealSelectionWindowService {
  getForMyBusiness(): Promise<IMealSelectionWindowResponse[]>;
  getMenuItems(windowId: string): Promise<IWindowMenuItemResponse[]>;
  getCurrent(): Promise<IGetCurrentMealSelectionWindowResponse>;
  getRelevant(): Promise<IRelevantMealSelectionWindowResponse | null>;
  create(data: ICreateMealSelectionWindow): Promise<IMealSelectionWindowResponse>;
  update(id: string, data: IUpdateMealSelectionWindow): Promise<IMealSelectionWindowResponse>;
  remove(id: string): Promise<void>;
}
