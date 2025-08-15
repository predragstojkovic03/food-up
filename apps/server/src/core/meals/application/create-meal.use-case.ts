import { ulid } from 'ulid';
import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';

export class CreateMealUseCase {
  constructor(private readonly repository: IMealsRepository) {}

  async execute(meal: Omit<Meal, 'id'>): Promise<Meal> {
    const id = ulid();
    const newMeal = new Meal(id, meal.name, meal.description, meal.type);
    return await this.repository.insert(newMeal);
  }
}
