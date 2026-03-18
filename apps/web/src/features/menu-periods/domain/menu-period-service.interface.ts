import {
  ICreateMenuPeriod,
  IMenuPeriodResponse,
  IUpdateMenuPeriod,
} from '@food-up/shared';

export interface IMenuPeriodService {
  getBySupplier(supplierId: string): Promise<IMenuPeriodResponse[]>;
  create(data: ICreateMenuPeriod): Promise<IMenuPeriodResponse>;
  update(id: string, data: IUpdateMenuPeriod): Promise<IMenuPeriodResponse>;
  remove(id: string): Promise<void>;
}
