import { Language, SupplierType } from '@food-up/shared';
import { Injectable } from '@nestjs/common';
import { BusinessSupplier } from 'src/core/business-suppliers/domain/business-supplier.entity';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersDomainService {
  resolveEmailLanguage(supplier: Supplier, businessSupplier?: BusinessSupplier): Language;
  resolveEmailLanguage(supplier: Supplier & { type: SupplierType.Managed }): Language;
  resolveEmailLanguage(
    supplier: Supplier & { type: SupplierType.Standalone },
    businessSupplier: BusinessSupplier,
  ): Language;
  resolveEmailLanguage(supplier: Supplier, businessSupplier?: BusinessSupplier): Language {
    if (supplier.isManaged()) return supplier.language;
    return businessSupplier!.language;
  }
}
