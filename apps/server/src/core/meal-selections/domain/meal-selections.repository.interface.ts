import { IRepository } from 'src/shared/domain/repository.interface';
import { MealSelection } from './meal-selection.entity';

export const I_MEAL_SELECTIONS_REPOSITORY = Symbol('IMealSelectionsRepository');

export interface IMealSelectionsRepository extends IRepository<MealSelection> {}
