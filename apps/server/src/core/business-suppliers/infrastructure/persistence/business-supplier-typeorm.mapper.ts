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
      persistence.businessId,
      persistence.supplierId,
      persistence.isManaged,
    );
  }

  toPersistence(domain: BusinessSupplier): BusinessSupplierPersistence {
    const persistence = new BusinessSupplierPersistence();
    persistence.id = domain.id;
    persistence.businessId = domain.businessId;
    persistence.supplierId = domain.supplierId;
    persistence.isManaged = domain.isManaged;
    return persistence;
  }
}
