import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MenuItem } from '../../domain/menu-item.entity';
import { MenuItem as MenuItemPersistence } from './menu-item.typeorm-entity';

export class MenuItemTypeOrmMapper extends TypeOrmMapper<
  MenuItem,
  MenuItemPersistence
> {
  toDomain(persistence: MenuItemPersistence): MenuItem {
    return new MenuItem(
      persistence.id,
      persistence.name,
      persistence.description,
      persistence.price,
      persistence.menuPeriodId,
      persistence.day,
      persistence.mealType,
    );
  }

  toPersistence(domain: MenuItem): MenuItemPersistence {
    const persistence = new MenuItemPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.description = domain.description;
    persistence.price = domain.price;
    persistence.menuPeriodId = domain.menuPeriodId;
    persistence.day = domain.day;
    persistence.mealType = domain.mealType;
    return persistence;
  }
}
