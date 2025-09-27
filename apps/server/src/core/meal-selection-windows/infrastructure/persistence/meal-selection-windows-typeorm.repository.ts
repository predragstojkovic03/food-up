import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { MoreThanOrEqual, Repository } from 'typeorm';
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

  async findLatestActiveByBusiness(
    businessId: string,
  ): Promise<MealSelectionWindow> {
    return this._repository
      .findOneOrFail({
        where: {
          business: { id: businessId },
          endTime: MoreThanOrEqual(new Date()),
        },
        relations: { menuPeriods: true },
      })
      .then((entity) => {
        console.log('Found entity:', entity);
        return this._mapper.toDomain(entity);
      });
  }
}
