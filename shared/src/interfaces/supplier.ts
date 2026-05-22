import { Language } from '../enums/language.enum';
import { SupplierType } from '../enums/supplier-type.enum';

export interface ISupplierResponse {
  id: string;
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds: string[];
  managingBusinessId?: string;
  language: Language;
}

export interface ICreateManagedSupplier {
  name: string;
  contactInfo: string;
  language: Language;
}

export interface IUpdateSupplier {
  name?: string;
  contactInfo?: string;
  language?: Language;
}
