import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { MealSelectionWindowTypeOrmMapper } from './meal-selection-window-typeorm.mapper';
import { MealSelectionWindow as MealSelectionWindowPersistence } from './meal-selection-window.typeorm-entity';

@Injectable()
export class MealSelectionWindowsTypeOrmRepository extends TypeOrmRepository<MealSelectionWindow> {
  constructor(
    @InjectRepository(MealSelectionWindowPersistence)
    repository: Repository<MealSelectionWindowPersistence>,
  ) {
    super(repository, new MealSelectionWindowTypeOrmMapper());
  }
}
