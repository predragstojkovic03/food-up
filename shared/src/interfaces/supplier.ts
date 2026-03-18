import { SupplierType } from '../enums/supplier-type.enum';

export interface ISupplierResponse {
  id: string;
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds: string[];
  managingBusinessId?: string;
}

export interface ICreateManagedSupplier {
  name: string;
  contactInfo: string;
}

export interface IUpdateSupplier {
  name?: string;
  contactInfo?: string;
}
