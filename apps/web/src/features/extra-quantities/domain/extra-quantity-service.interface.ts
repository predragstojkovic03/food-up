import { IExtraQuantity } from '@food-up/shared';

export interface IExtraQuantityService {
  getByWindow(windowId: string): Promise<IExtraQuantity[]>;
  add(data: {
    windowId: string;
    menuItemId: string;
    quantity: number;
    guestName?: string;
  }): Promise<IExtraQuantity>;
  remove(id: string): Promise<void>;
}
