import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Supplier } from '../../domain/supplier.entity';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

export class SupplierTypeOrmMapper extends TypeOrmMapper<
  Supplier,
  SupplierPersistence
> {
  toDomain(persistence: SupplierPersistence): Supplier {
    return new Supplier(
      persistence.id,
      persistence.name,
      persistence.type,
      persistence.contactInfo,
      persistence.businessId,
      persistence.userId,
    );
  }

  toPersistence(domain: Supplier): SupplierPersistence {
    const persistence = new SupplierPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.type = domain.type;
    persistence.contactInfo = domain.contactInfo;
    persistence.businessId = domain.businessId;
    persistence.userId = domain.userId;
    return persistence;
  }
}
