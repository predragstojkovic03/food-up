import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export class DeleteMealSelectionWindowUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
