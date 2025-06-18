import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { MenuPeriod as MenuPeriodPersistence } from './menu-period.typeorm-entity';

export class MenuPeriodTypeOrmMapper extends TypeOrmMapper<
  MenuPeriod,
  MenuPeriodPersistence
> {
  toDomain(persistence: MenuPeriodPersistence): MenuPeriod {
    return new MenuPeriod(
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
}
