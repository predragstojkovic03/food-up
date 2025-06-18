import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export class DeleteMealSelectionUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
