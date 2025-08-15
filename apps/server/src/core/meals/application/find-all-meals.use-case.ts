import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';

export class FindAllMealsUseCase {
  constructor(private readonly repository: IMealsRepository) {}

  async execute(): Promise<Meal[]> {
    return await this.repository.findAll();
  }
}
