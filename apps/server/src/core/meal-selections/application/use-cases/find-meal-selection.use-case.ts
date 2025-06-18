import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export class FindMealSelectionUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(id: string): Promise<MealSelection | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
