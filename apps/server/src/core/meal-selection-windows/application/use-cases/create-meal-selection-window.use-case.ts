import { FindMenuPeriodUseCase } from 'src/core/menu-periods/application/use-cases/find-menu-period.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  businessId: string;
  menuPeriodIds: string[];
}

export class CreateMealSelectionWindowUseCase {
  constructor(
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _findMenuPeriodUseCase: FindMenuPeriodUseCase,
  ) {}

  async execute(
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const menuPeriodIds = dto.menuPeriodIds ?? [];
    if (menuPeriodIds.length > 0) {
      const menuPeriods = await Promise.all(
        menuPeriodIds.map((id) => this._findMenuPeriodUseCase.execute(id)),
      );
      if (menuPeriods.includes(null)) {
        throw new EntityInstanceNotFoundException('MenuPeriod not found');
      }
    }
    const entity = new MealSelectionWindow(
      ulid(),
      dto.startTime,
      dto.endTime,
      dto.businessId,
      menuPeriodIds,
    );
    return this._repository.insert(entity);
  }
}
