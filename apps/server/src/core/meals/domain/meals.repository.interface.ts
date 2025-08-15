import { Meal } from '../domain/meal.entity';
export const I_MEALS_REPOSITORY = 'IMealsRepository';

export interface IMealsRepository {
  findAll(): Promise<Meal[]>;
  findById(id: string): Promise<Meal | null>;
  insert(meal: Meal): Promise<Meal>;
  update(id: string, meal: Meal): Promise<Meal>;
  delete(id: string): Promise<void>;
  findByCriteria(criteria: Partial<Meal>): Promise<Meal[]>;
  findOneByCriteria(criteria: Partial<Meal>): Promise<Meal | null>;
}
