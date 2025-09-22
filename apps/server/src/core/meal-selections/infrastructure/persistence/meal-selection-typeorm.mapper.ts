import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MealSelection } from '../../domain/meal-selection.entity';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

export class MealSelectionTypeOrmMapper extends TypeOrmMapper<
  MealSelection,
  MealSelectionPersistence
> {
  toDomain(persistence: MealSelectionPersistence): MealSelection {
    return new MealSelection(
      persistence.id,
      persistence.employeeId,
      persistence.menuItem.id,
      persistence.mealSelectionWindow.id,
      persistence.date,
      persistence.quantity,
    );
  }

  toPersistence(domain: MealSelection): MealSelectionPersistence {
    const persistence = new MealSelectionPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.menuItem = { id: domain.menuItemId } as any as MenuItem;
    persistence.mealSelectionWindow = {
      id: domain.mealSelectionWindowId,
    } as any;
    persistence.quantity = domain.quantity;
    return persistence;
  }
}
