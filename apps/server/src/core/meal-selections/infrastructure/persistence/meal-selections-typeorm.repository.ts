import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
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
    @InjectRepository(MealSelectionPersistence)
    repository: Repository<MealSelectionPersistence>,
  ) {
    super(repository, new MealSelectionTypeOrmMapper());
  }

  override findOneByCriteria(
    criteria: Partial<MealSelection>,
  ): Promise<MealSelection | null> {
    const where = this.buildWhere(criteria);

    return this.findOneByCriteria(where);
  }

  override findOneByCriteriaOrThrow(
    criteria: Partial<MealSelection>,
  ): Promise<MealSelection> {
    const where = this.buildWhere(criteria);

    return this.findOneByCriteriaOrThrow(where);
  }

  private buildWhere(criteria: Partial<MealSelection>) {
    const where: any = { ...criteria };

    if (criteria.employeeId) {
      where.employee = { id: criteria.employeeId };
      delete where.employeeId;
    }

    if (criteria.menuItemId) {
      where.menuItem = { id: criteria.menuItemId };
      delete where.menuItemId;
    }

    if (criteria.mealSelectionWindowId) {
      where.mealSelectionWindow = { id: criteria.mealSelectionWindowId };
      delete where.mealSelectionWindowId;
    }

    return where;
  }
}
