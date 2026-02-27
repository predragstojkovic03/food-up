import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Supplier } from '../../domain/supplier.entity';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

export class SupplierTypeOrmMapper extends TypeOrmMapper<
  Supplier,
  SupplierPersistence
> {
  toDomain(persistence: SupplierPersistence): Supplier {
    return Supplier.reconstitute(
      persistence.id,
      persistence.name,
      persistence.type,
      persistence.contactInfo,
      persistence?.businessSuppliers?.map((bs) => bs.business?.id) ?? [],
      persistence.managingBusinessId ?? undefined,
      persistence.identity?.id,
    );
  }

  toPersistence(domain: Supplier): SupplierPersistence {
    const persistence = new SupplierPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.type = domain.type;
    persistence.contactInfo = domain.contactInfo;
    persistence.managingBusinessId = domain.managingBusinessId ?? null;
    persistence.identity = { id: domain.identityId } as any;
    return persistence;
  }

  toPersistencePartial(
    domain: Partial<Supplier>,
  ): Partial<SupplierPersistence> {
    const persistence: Partial<SupplierPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.type !== undefined) persistence.type = domain.type;
    if (domain.contactInfo !== undefined)
      persistence.contactInfo = domain.contactInfo;
    if (domain.managingBusinessId !== undefined) {
      persistence.managingBusinessId = domain.managingBusinessId ?? null;
    }
    if (domain.identityId !== undefined)
      persistence.identity = { id: domain.identityId } as any;
    return persistence;
  }
}
