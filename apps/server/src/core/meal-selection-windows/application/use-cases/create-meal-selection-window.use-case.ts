import { ulid } from 'ulid';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  businessId: string;
  menuPeriodId?: string | null;
}

export class CreateMealSelectionWindowUseCase {
  constructor(private readonly repository: IMealSelectionWindowsRepository) {}

  async execute(
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const entity = new MealSelectionWindow(
      ulid(),
      dto.startTime,
      dto.endTime,
      dto.businessId,
      dto.menuPeriodId ?? null,
    );
    return this.repository.insert(entity);
  }
}
