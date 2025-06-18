import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { MealSelection } from '../../domain/meal-selection.entity';
import { MealSelectionTypeOrmMapper } from './meal-selection-typeorm.mapper';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

@Injectable()
export class MealSelectionsTypeOrmRepository extends TypeOrmRepository<MealSelection> {
  constructor(
    @InjectRepository(MealSelectionPersistence)
    repository: Repository<MealSelectionPersistence>,
  ) {
    super(repository, new MealSelectionTypeOrmMapper());
  }
}
