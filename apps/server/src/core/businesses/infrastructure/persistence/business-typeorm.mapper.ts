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
    );

    return business;
  }

  toPersistence(domain: Business): any {
    const businessPersistence = new BusinessPersistence();
    businessPersistence.id = domain.id;
    businessPersistence.name = domain.name;
    businessPersistence.contactEmail = domain.contactEmail;

    return businessPersistence;
  }

  toPersistencePartial(domain: Partial<Business>): Partial<BusinessPersistence> {
    const persistence: Partial<BusinessPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.contactEmail !== undefined) persistence.contactEmail = domain.contactEmail;
    if (domain.contactPhone !== undefined) persistence.contactPhone = domain.contactPhone;
    return persistence;
  }
}
