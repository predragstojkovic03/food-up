import { IMealsRepository } from '../domain/meals.repository.interface';

export class DeleteMealUseCase {
  constructor(private readonly repository: IMealsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
