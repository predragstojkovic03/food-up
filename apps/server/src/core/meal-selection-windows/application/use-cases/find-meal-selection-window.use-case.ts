import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export class FindMealSelectionWindowUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(id: string): Promise<MealSelectionWindow | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
