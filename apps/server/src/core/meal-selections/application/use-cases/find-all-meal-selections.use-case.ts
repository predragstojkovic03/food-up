import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export class FindAllMealSelectionsUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(): Promise<MealSelection[]> {
    return this.repository.findAll();
  }
}
