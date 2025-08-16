import { FindMenuPeriodUseCase } from 'src/core/menu-periods/application/use-cases/find-menu-period.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodIds?: string[];
}

export class UpdateMealSelectionWindowUseCase {
  constructor(
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _findMenuPeriodUseCase: FindMenuPeriodUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException(
        'MealSelectionWindow not found',
      );

    if (dto.menuPeriodIds) {
      const menuPeriods = await Promise.all(
        dto.menuPeriodIds.map((id) => this._findMenuPeriodUseCase.execute(id)),
      );
      if (menuPeriods.includes(null)) {
        throw new EntityInstanceNotFoundException('MenuPeriod not found');
      }
    }

    const updated = new MealSelectionWindow(
      id,
      dto.startTime ?? existing.startTime,
      dto.endTime ?? existing.endTime,
      dto.businessId ?? existing.businessId,
      [...existing.menuPeriodIds, ...(dto.menuPeriodIds ?? [])], // Merging existing and new menu period IDs
    );
    return this._repository.update(id, updated);
  }
}
