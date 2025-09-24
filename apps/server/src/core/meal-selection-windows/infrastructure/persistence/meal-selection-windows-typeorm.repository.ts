import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';
import { MealSelectionWindowTypeOrmMapper } from './meal-selection-window-typeorm.mapper';
import { MealSelectionWindow as MealSelectionWindowPersistence } from './meal-selection-window.typeorm-entity';

@Injectable()
export class MealSelectionWindowsTypeOrmRepository
  extends TypeOrmRepository<MealSelectionWindow>
  implements IMealSelectionWindowsRepository
{
  constructor(
    @InjectRepository(MealSelectionWindowPersistence)
    protected readonly _repository: Repository<MealSelectionWindowPersistence>,
  ) {
    super(_repository, new MealSelectionWindowTypeOrmMapper());
  }

  findLatestActiveByBusiness(businessId: string): Promise<MealSelectionWindow> {
    return this._repository
      .createQueryBuilder('meal_selection_window')
      .where('meal_selection_window.businessId = :businessId', { businessId })
      .andWhere('meal_selection_window.endTime >= :now', { now: new Date() })
      .orderBy('meal_selection_window.startTime', 'DESC')
      .getOneOrFail()
      .then((entity) => this._mapper.toDomain(entity));
  }
}
