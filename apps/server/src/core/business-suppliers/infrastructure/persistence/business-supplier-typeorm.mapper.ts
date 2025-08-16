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
    );
  }

  toPersistence(domain: BusinessSupplier): BusinessSupplierPersistence {
    const persistence = new BusinessSupplierPersistence();
    persistence.id = domain.id;
    persistence.business = { id: domain.businessId } as any; // Assuming businessId is sufficient for persistence
    persistence.supplier = { id: domain.supplierId } as any; // Assuming supplierId is sufficient for persistence

    return persistence;
  }
}
