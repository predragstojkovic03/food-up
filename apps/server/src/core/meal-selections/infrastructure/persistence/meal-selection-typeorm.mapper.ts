import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MealSelection } from '../../domain/meal-selection.entity';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

export class MealSelectionTypeOrmMapper extends TypeOrmMapper<
  MealSelection,
  MealSelectionPersistence
> {
  toDomain(persistence: MealSelectionPersistence): MealSelection {
    return MealSelection.reconstitute(
      persistence.id,
      persistence.employeeId,
      persistence.mealSelectionWindow.id,
      persistence.date,
      persistence.menuItem?.id ?? undefined,
      persistence.quantity ?? undefined,
    );
  }

  toPersistence(domain: MealSelection): MealSelectionPersistence {
    const persistence = new MealSelectionPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.menuItem = domain.menuItemId
      ? ({ id: domain.menuItemId } as any as MenuItem)
      : null;
    persistence.mealSelectionWindow = { id: domain.mealSelectionWindowId } as any;
    persistence.date = domain.date;
    persistence.quantity = domain.quantity ?? null;
    return persistence;
  }

  toPersistencePartial(
    domain: Partial<MealSelection>,
  ): Partial<MealSelectionPersistence> {
    const persistence: Partial<MealSelectionPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.employeeId !== undefined) persistence.employeeId = domain.employeeId;
    if (domain.date !== undefined) persistence.date = domain.date;
    if (domain.quantity !== undefined) persistence.quantity = domain.quantity ?? null;
    if (domain.menuItemId !== undefined)
      persistence.menuItem = domain.menuItemId
        ? ({ id: domain.menuItemId } as any)
        : null;
    if (domain.mealSelectionWindowId !== undefined)
      persistence.mealSelectionWindow = { id: domain.mealSelectionWindowId } as any;
    return persistence;
  }
}
