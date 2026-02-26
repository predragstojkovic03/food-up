import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Meal as MealDomain } from '../../domain/meal.entity';
import { Meal as MealPersistence } from './meal.typeorm-entity';

export class MealTypeOrmMapper extends TypeOrmMapper<
  MealDomain,
  MealPersistence
> {
  toDomain(persistence: MealPersistence): MealDomain {
    return new MealDomain(
      persistence.id,
      persistence.name,
      persistence.description,
      persistence.type,
      persistence.supplier?.id,
      persistence.price,
    );
  }

  toPersistence(domain: MealDomain): MealPersistence {
    const persistence = new MealPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.description = domain.description;
    persistence.type = domain.type;
    persistence.supplier = domain.supplierId
      ? ({ id: domain.supplierId } as any)
      : undefined;
    persistence.price = domain.price;

    return persistence;
  }

  toPersistencePartial(domain: Partial<MealDomain>): Partial<MealPersistence> {
    const persistence: Partial<MealPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.description !== undefined) persistence.description = domain.description;
    if (domain.type !== undefined) persistence.type = domain.type;
    if (domain.price !== undefined) persistence.price = domain.price;
    if (domain.supplierId !== undefined) persistence.supplier = { id: domain.supplierId } as any;
    return persistence;
  }
}
