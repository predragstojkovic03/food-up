import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';

export class FindMealUseCase {
  constructor(private readonly repository: IMealsRepository) {}

  async execute(id: string): Promise<Meal | null> {
    return await this.repository.findById(id);
  }
}
