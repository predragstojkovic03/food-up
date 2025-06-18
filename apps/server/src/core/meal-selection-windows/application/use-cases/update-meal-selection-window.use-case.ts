import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodId?: string | null;
}

export class UpdateMealSelectionWindowUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(
    id: string,
    dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('MealSelectionWindow not found');
    const updated = new MealSelectionWindow(
      id,
      dto.startTime ?? existing.startTime,
      dto.endTime ?? existing.endTime,
      dto.businessId ?? existing.businessId,
      dto.menuPeriodId ?? existing.menuPeriodId,
    );
    return this.repository.update(id, updated);
  }
}
