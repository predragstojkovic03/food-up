import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { MealSelection } from '../../domain/meal-selection.entity';
import {
  IMealSelectionsRepository,
  RichMealSelection,
} from '../../domain/meal-selections.repository.interface';
import { MealSelectionTypeOrmMapper } from './meal-selection-typeorm.mapper';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

@Injectable()
export class MealSelectionsTypeOrmRepository
  extends TypeOrmRepository<MealSelection, MealSelectionPersistence>
  implements IMealSelectionsRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, MealSelectionPersistence, new MealSelectionTypeOrmMapper(), transactionContext);
  }

  async findByWindow(windowId: string): Promise<MealSelection[]> {
    const entities = await this._repository.find({
      where: { mealSelectionWindow: { id: windowId } } as any,
    });
    return entities.map((e) => this._mapper.toDomain(e));
  }

  async findAllByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<MealSelection[]> {
    const entities = await this._repository.find({
      where: {
        employeeId,
        mealSelectionWindow: { id: windowId },
      } as any,
    });
    return entities.map((e) => this._mapper.toDomain(e));
  }

  async findRichByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<RichMealSelection[]> {
    const entities = await this._repository.find({
      where: {
        employeeId,
        mealSelectionWindow: { id: windowId },
      } as any,
      relations: ['menuItem', 'menuItem.meal'],
    });

    return entities.map((e) => ({
      id: e.id,
      date: e.date,
      mealSelectionWindowId: e.mealSelectionWindow.id,
      menuItemId: e.menuItem?.id ?? null,
      quantity: e.quantity,
      meal: e.menuItem?.meal
        ? { name: e.menuItem.meal.name, type: e.menuItem.meal.type }
        : null,
    }));
  }
}
