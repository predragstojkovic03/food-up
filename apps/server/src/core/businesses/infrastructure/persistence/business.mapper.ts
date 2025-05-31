import { ITypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Business } from '../../domain/business.entity';
import { Business as BusinessPersistence } from '../persistence/business.typeorm-entity';

export class BusinessMapper extends ITypeOrmMapper<
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
}
