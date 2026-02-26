import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { Meal } from '../../domain/meal.entity';
import { IMealsRepository } from '../../domain/meals.repository.interface';
import { MealTypeOrmMapper } from './meal-typeorm.mapper';
import { Meal as MealPersistence } from './meal.typeorm-entity';

@Injectable()
export class MealsTypeOrmRepository
  extends TypeOrmRepository<Meal, MealPersistence>
  implements IMealsRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, MealPersistence, new MealTypeOrmMapper(), transactionContext);
  }

  findById(id: string): Promise<Meal | null> {
    return this.findOneByCriteria({ id });
  }
}
