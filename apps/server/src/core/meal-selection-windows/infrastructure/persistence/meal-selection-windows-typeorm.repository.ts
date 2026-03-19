import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';
import { MealSelectionWindowTypeOrmMapper } from './meal-selection-window-typeorm.mapper';
import { MealSelectionWindow as MealSelectionWindowPersistence } from './meal-selection-window.typeorm-entity';

@Injectable()
export class MealSelectionWindowsTypeOrmRepository
  extends TypeOrmRepository<MealSelectionWindow, MealSelectionWindowPersistence>
  implements IMealSelectionWindowsRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(
      dataSource,
      MealSelectionWindowPersistence,
      new MealSelectionWindowTypeOrmMapper(),
      transactionContext,
    );
  }

  async findAllByBusiness(businessId: string): Promise<MealSelectionWindow[]> {
    const entities = await this._repository.find({
      where: { business: { id: businessId } } as any,
      order: { startTime: 'DESC' },
    });
    return entities.map((e) => this._mapper.toDomain(e));
  }

  async findLatestActiveByBusiness(
    businessId: string,
  ): Promise<MealSelectionWindow> {
    return this.findOneOrFailMapped({
      where: {
        business: { id: businessId },
        endTime: MoreThanOrEqual(new Date()),
        isLocked: false,
      },
    });
  }

  async findLatestPublishedByBusiness(
    businessId: string,
  ): Promise<MealSelectionWindow | null> {
    const entities = await this._repository.find({
      where: { business: { id: businessId }, isLocked: false } as any,
      order: { endTime: 'DESC' },
      take: 1,
    });
    if (!entities.length) return null;
    return this._mapper.toDomain(entities[0]);
  }
}
