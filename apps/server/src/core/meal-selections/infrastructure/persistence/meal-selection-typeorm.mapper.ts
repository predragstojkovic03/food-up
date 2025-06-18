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
      persistence.menuItemId,
      persistence.mealSelectionWindowId,
      persistence.quantity,
    );
  }

  toPersistence(domain: MealSelection): MealSelectionPersistence {
    const persistence = new MealSelectionPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.menuItemId = domain.menuItemId;
    persistence.mealSelectionWindowId = domain.mealSelectionWindowId;
    persistence.quantity = domain.quantity;
    return persistence;
  }
}
