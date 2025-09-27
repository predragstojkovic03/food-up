import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
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
      persistence?.businessSuppliers?.map((bs) => bs.business?.id) ?? [],
      persistence.managingBusiness?.id,
      persistence.identity?.id,
    );
  }

  toPersistence(domain: Supplier): SupplierPersistence {
    const persistence = new SupplierPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.type = domain.type;
    persistence.contactInfo = domain.contactInfo;
    persistence.managingBusiness = domain.managingBusinessId
      ? ({ id: domain.managingBusinessId } as Business)
      : undefined;
    persistence.identity = { id: domain.identityId } as any;
    return persistence;
  }
}
