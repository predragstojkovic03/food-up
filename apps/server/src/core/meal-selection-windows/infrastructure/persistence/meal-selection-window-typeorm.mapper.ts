import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { MealSelectionWindow as MealSelectionWindowPersistence } from './meal-selection-window.typeorm-entity';

export class MealSelectionWindowTypeOrmMapper extends TypeOrmMapper<
  MealSelectionWindow,
  MealSelectionWindowPersistence
> {
  toDomain(persistence: MealSelectionWindowPersistence): MealSelectionWindow {
    return new MealSelectionWindow(
      persistence.id,
      persistence.startTime,
      persistence.endTime,
      persistence.businessId,
      persistence.menuPeriodId,
    );
  }

  toPersistence(domain: MealSelectionWindow): MealSelectionWindowPersistence {
    const persistence = new MealSelectionWindowPersistence();
    persistence.id = domain.id;
    persistence.startTime = domain.startTime;
    persistence.endTime = domain.endTime;
    persistence.businessId = domain.businessId;
    persistence.menuPeriodId = domain.menuPeriodId;
    return persistence;
  }
}
