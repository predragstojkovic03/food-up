import { ICreateMenuItem, IMenuItemResponse } from '@food-up/shared';

export interface IMenuItemService {
  getByMenuPeriod(menuPeriodId: string): Promise<IMenuItemResponse[]>;
  create(data: ICreateMenuItem): Promise<IMenuItemResponse>;
  remove(id: string): Promise<void>;
}
