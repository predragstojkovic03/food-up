import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export class FindMealSelectionWindowUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(id: string): Promise<MealSelectionWindow> {
    const mealSelectionWindow = await this.repository.findOneByCriteria({ id });
    if (!mealSelectionWindow) {
      throw new EntityInstanceNotFoundException(
        'Meal selection window not found',
      );
    }
    return mealSelectionWindow;
  }
}
