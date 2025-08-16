import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export class FindMealSelectionUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(id: string): Promise<MealSelection> {
    const mealSelection = await this.repository.findOneByCriteria({ id });
    if (!mealSelection) {
      throw new EntityInstanceNotFoundException('Meal selection not found');
    }
    return mealSelection;
  }
}
