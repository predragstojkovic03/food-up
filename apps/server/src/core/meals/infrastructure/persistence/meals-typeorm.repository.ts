import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Meal } from '../../domain/meal.entity';
import { IMealsRepository } from '../../domain/meals.repository.interface';
import { MealTypeOrmMapper } from './meal-typeorm.mapper';
import { Meal as MealPersistence } from './meal.typeorm-entity';

export class MealsTypeOrmRepository
  extends TypeOrmRepository<Meal>
  implements IMealsRepository
{
  constructor(
    @InjectRepository(MealPersistence)
    readonly _repository: Repository<Meal>,
  ) {
    super(_repository, new MealTypeOrmMapper());
  }
  findById(id: string): Promise<Meal | null> {
    throw new Error('Method not implemented.');
  }
}
