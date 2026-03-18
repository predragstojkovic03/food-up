import {
  ICreateManagedSupplier,
  ISupplierResponse,
  IUpdateSupplier,
} from '@food-up/shared';

export interface ISupplierService {
  getManagedByBusiness(): Promise<ISupplierResponse[]>;
  getPartnersByBusiness(): Promise<ISupplierResponse[]>;
  createManaged(data: ICreateManagedSupplier): Promise<ISupplierResponse>;
  update(id: string, data: IUpdateSupplier): Promise<ISupplierResponse>;
  remove(id: string): Promise<void>;
}
