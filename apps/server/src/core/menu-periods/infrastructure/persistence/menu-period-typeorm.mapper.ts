import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { MenuPeriod as MenuPeriodPersistence } from './menu-period.typeorm-entity';

export class MenuPeriodTypeOrmMapper extends TypeOrmMapper<
  MenuPeriod,
  MenuPeriodPersistence
> {
  toDomain(persistence: MenuPeriodPersistence): MenuPeriod {
    return MenuPeriod.reconstitute(
      persistence.id,
      persistence.startDate,
      persistence.endDate,
      persistence.supplierId,
    );
  }

  toPersistence(domain: MenuPeriod): MenuPeriodPersistence {
    const persistence = new MenuPeriodPersistence();
    persistence.id = domain.id;
    persistence.startDate = domain.startDate;
    persistence.endDate = domain.endDate;
    persistence.supplierId = domain.supplierId;
    return persistence;
  }

  toPersistencePartial(domain: Partial<MenuPeriod>): Partial<MenuPeriodPersistence> {
    const persistence: Partial<MenuPeriodPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.startDate !== undefined) persistence.startDate = domain.startDate;
    if (domain.endDate !== undefined) persistence.endDate = domain.endDate;
    if (domain.supplierId !== undefined) persistence.supplierId = domain.supplierId;
    return persistence;
  }
}
