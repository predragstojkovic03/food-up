import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export interface UpdateMealSelectionDto {
  employeeId?: string;
  menuItemId?: string;
  mealSelectionWindowId?: string;
  quantity?: number | null;
}

export class UpdateMealSelectionUseCase {
  constructor(private readonly repository: IMealSelectionsRepository) {}

  async execute(
    id: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('MealSelection not found');
    const updated = new MealSelection(
      id,
      dto.employeeId ?? existing.employeeId,
      dto.menuItemId ?? existing.menuItemId,
      dto.mealSelectionWindowId ?? existing.mealSelectionWindowId,
      dto.quantity ?? existing.quantity,
    );
    return this.repository.update(id, updated);
  }
}
