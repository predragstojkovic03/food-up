import { IRepository } from 'src/shared/domain/repository.interface';
import { Meal } from '../domain/meal.entity';
export const I_MEALS_REPOSITORY = 'IMealsRepository';

export interface IMealsRepository extends IRepository<Meal> {}
