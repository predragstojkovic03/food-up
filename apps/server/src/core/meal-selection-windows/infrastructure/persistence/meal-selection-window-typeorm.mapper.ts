import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { MealSelectionWindow as MealSelectionWindowPersistence } from './meal-selection-window.typeorm-entity';

export class MealSelectionWindowTypeOrmMapper extends TypeOrmMapper<
  MealSelectionWindow,
  MealSelectionWindowPersistence
> {
  toDomain(persistence: MealSelectionWindowPersistence): MealSelectionWindow {
    console.log('Mapping to domain:', persistence);
    return new MealSelectionWindow(
      persistence.id,
      persistence.startTime,
      persistence.endTime,
      new Set(persistence.targetDates),
      persistence.business.id,
      persistence.menuPeriods?.map((mp) => mp.id) ?? [], // Assuming menuPeriods is an array of objects with at least an id property
    );
  }

  toPersistence(domain: MealSelectionWindow): MealSelectionWindowPersistence {
    const persistence = new MealSelectionWindowPersistence();
    persistence.id = domain.id;
    persistence.startTime = domain.startTime;
    persistence.endTime = domain.endTime;
    persistence.business = { id: domain.businessId } as any;
    persistence.targetDates = Array.from(domain.targetDates);
    persistence.menuPeriods = domain.menuPeriodIds.map((id) => ({ id }) as any); // Assuming menuPeriods is an array of objects with at least an id property
    return persistence;
  }

  toPersistencePartial(domain: Partial<MealSelectionWindow>): Partial<MealSelectionWindowPersistence> {
    const persistence: Partial<MealSelectionWindowPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.startTime !== undefined) persistence.startTime = domain.startTime;
    if (domain.endTime !== undefined) persistence.endTime = domain.endTime;
    if (domain.businessId !== undefined) persistence.business = { id: domain.businessId } as any;
    return persistence;
  }
}
