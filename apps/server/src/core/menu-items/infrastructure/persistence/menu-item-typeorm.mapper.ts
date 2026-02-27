import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MenuItem } from '../../domain/menu-item.entity';
import { MenuItem as MenuItemPersistence } from './menu-item.typeorm-entity';

export class MenuItemTypeOrmMapper extends TypeOrmMapper<
  MenuItem,
  MenuItemPersistence
> {
  toDomain(persistence: MenuItemPersistence): MenuItem {
    return MenuItem.reconstitute(
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

  toPersistencePartial(domain: Partial<MenuItem>): Partial<MenuItemPersistence> {
    const persistence: Partial<MenuItemPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.price !== undefined) persistence.price = domain.price;
    if (domain.day !== undefined) persistence.day = domain.day;
    if (domain.menuPeriodId !== undefined) persistence.menuPeriod = { id: domain.menuPeriodId } as any;
    if (domain.mealId !== undefined) persistence.meal = { id: domain.mealId } as any;
    return persistence;
  }
}
