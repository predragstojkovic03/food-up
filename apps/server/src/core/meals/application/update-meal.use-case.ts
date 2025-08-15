import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';

export class UpdateMealUseCase {
  constructor(private readonly repository: IMealsRepository) {}

  async execute(id: string, update: Partial<Omit<Meal, 'id'>>): Promise<Meal> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Meal not found');
    const updated = new Meal(
      id,
      update.name ?? existing.name,
      update.description ?? existing.description,
      update.type ?? existing.type,
    );
    return await this.repository.update(id, updated);
  }
}
