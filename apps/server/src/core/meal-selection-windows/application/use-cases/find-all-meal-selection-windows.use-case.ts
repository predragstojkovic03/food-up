import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export class FindAllMealSelectionWindowsUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(): Promise<MealSelectionWindow[]> {
    return this.repository.findAll();
  }
}
