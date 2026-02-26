import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';
import { MealSelectionTypeOrmMapper } from './meal-selection-typeorm.mapper';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

@Injectable()
export class MealSelectionsTypeOrmRepository
  extends TypeOrmRepository<MealSelection>
  implements IMealSelectionsRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, MealSelectionPersistence, new MealSelectionTypeOrmMapper(), transactionContext);
  }

}
