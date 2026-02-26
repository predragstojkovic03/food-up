import { BusinessSupplier } from 'src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Business } from '../../domain/business.entity';
import { Business as BusinessPersistence } from './business.typeorm-entity';

export class BusinessTypeOrmMapper extends TypeOrmMapper<
  Business,
  BusinessPersistence
> {
  toDomain(persistence: BusinessPersistence): Business {
    const business = new Business(
      persistence.id,
      persistence.name,
      persistence.contactEmail,
      persistence.contactPhone,
      persistence.employees?.map((employee) => employee.id),
      persistence.businessSuppliers?.map((bs) => bs.supplier?.id),
      persistence.managedSuppliers?.map((supplier) => supplier.id),
    );

    return business;
  }

  toPersistence(domain: Business): any {
    const businessPersistence = new BusinessPersistence();
    businessPersistence.id = domain.id;
    businessPersistence.name = domain.name;
    businessPersistence.contactEmail = domain.contactEmail;
    businessPersistence.contactPhone = domain.contactPhone;
    businessPersistence.managedSuppliers = domain.managedSupplierIds.map(
      (id) => {
        const supplier = new Supplier();
        supplier.id = id;
        return supplier;
      },
    );
    businessPersistence.businessSuppliers = domain.supplierIds.map((id) => {
      const supplierBusiness = new BusinessSupplier();
      supplierBusiness.supplier = { id } as Supplier;
      supplierBusiness.business = businessPersistence;
      return supplierBusiness;
    });

    return businessPersistence;
  }

  toPersistencePartial(
    domain: Partial<Business>,
  ): Partial<BusinessPersistence> {
    const persistence: Partial<BusinessPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.contactEmail !== undefined)
      persistence.contactEmail = domain.contactEmail;
    if (domain.contactPhone !== undefined)
      persistence.contactPhone = domain.contactPhone;
    return persistence;
  }
}
