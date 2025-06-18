import { ulid } from 'ulid';
import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export interface CreateMealSelectionDto {
  employeeId: string;
  menuItemId: string;
  mealSelectionWindowId: string;
  quantity?: number | null;
}

export class CreateMealSelectionUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(dto: CreateMealSelectionDto): Promise<MealSelection> {
    const entity = new MealSelection(
      ulid(),
      dto.employeeId,
      dto.menuItemId,
      dto.mealSelectionWindowId,
      dto.quantity ?? null,
    );
    return this.repository.insert(entity);
  }
}
