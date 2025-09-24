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
      persistence.price,
      persistence.menuPeriod.id,
      persistence.day,
      persistence.meal.id,
    );
  }

  toPersistence(domain: MenuItem): MenuItemPersistence {
    const persistence = new MenuItemPersistence();
    persistence.id = domain.id;
    persistence.price = domain.price;
    persistence.menuPeriod = { id: domain.menuPeriodId } as any;
    persistence.day = domain.day;
    persistence.meal = { id: domain.mealId } as any;
    return persistence;
  }
}
