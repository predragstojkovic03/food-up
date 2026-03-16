import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { BusinessInvite } from '../../domain/business-invite.entity';
import { BusinessInvite as BusinessInvitePersistence } from './business-invite.typeorm-entity';

export class BusinessInviteTypeOrmMapper extends TypeOrmMapper<
  BusinessInvite,
  BusinessInvitePersistence
> {
  toDomain(persistence: BusinessInvitePersistence): BusinessInvite {
    return BusinessInvite.reconstitute(
      persistence.id,
      persistence.businessId,
      persistence.email,
      persistence.token,
      persistence.expiresAt,
      persistence.usedAt,
    );
  }

  toPersistence(domain: BusinessInvite): BusinessInvitePersistence {
    const entity = new BusinessInvitePersistence();
    entity.id = domain.id;
    entity.businessId = domain.businessId;
    entity.email = domain.email;
    entity.token = domain.token;
    entity.expiresAt = domain.expiresAt;
    entity.usedAt = domain.usedAt;
    return entity;
  }

  toPersistencePartial(
    domain: Partial<BusinessInvite>,
  ): Partial<BusinessInvitePersistence> {
    const entity: Partial<BusinessInvitePersistence> = {};
    if (domain.id !== undefined) entity.id = domain.id;
    if (domain.businessId !== undefined) entity.businessId = domain.businessId;
    if (domain.email !== undefined) entity.email = domain.email;
    if (domain.token !== undefined) entity.token = domain.token;
    if (domain.expiresAt !== undefined) entity.expiresAt = domain.expiresAt;
    if (domain.usedAt !== undefined) entity.usedAt = domain.usedAt;
    return entity;
  }
}
