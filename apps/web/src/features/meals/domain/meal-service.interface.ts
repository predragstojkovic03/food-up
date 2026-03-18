import { ICreateMeal, IMealResponse, IUpdateMeal } from '@food-up/shared';

export interface IMealService {
  getBySupplier(supplierId: string): Promise<IMealResponse[]>;
  create(data: ICreateMeal): Promise<IMealResponse>;
  update(id: string, data: IUpdateMeal): Promise<IMealResponse>;
  remove(id: string): Promise<void>;
}
