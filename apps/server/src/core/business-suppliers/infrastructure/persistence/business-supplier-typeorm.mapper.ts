import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

export class BusinessSupplierTypeOrmMapper extends TypeOrmMapper<
  BusinessSupplier,
  BusinessSupplierPersistence
> {
  toDomain(persistence: BusinessSupplierPersistence): BusinessSupplier {
    return new BusinessSupplier(
      persistence.id,
      persistence.business.id,
      persistence.supplier.id,
      persistence.language,
    );
  }

  toPersistence(domain: BusinessSupplier): BusinessSupplierPersistence {
    const persistence = new BusinessSupplierPersistence();
    persistence.id = domain.id;
    persistence.business = { id: domain.businessId } as any;
    persistence.supplier = { id: domain.supplierId } as any;
    persistence.language = domain.language;
    return persistence;
  }

  toPersistencePartial(
    domain: Partial<BusinessSupplier>,
  ): Partial<BusinessSupplierPersistence> {
    const persistence: Partial<BusinessSupplierPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.businessId !== undefined)
      persistence.business = { id: domain.businessId } as any;
    if (domain.supplierId !== undefined)
      persistence.supplier = { id: domain.supplierId } as any;
    if (domain.language !== undefined) persistence.language = domain.language;
    return persistence;
  }
}
