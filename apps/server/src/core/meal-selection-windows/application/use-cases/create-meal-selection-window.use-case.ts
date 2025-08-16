import { FindMenuPeriodUseCase } from 'src/core/menu-periods/application/use-cases/find-menu-period.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { MealSelectionWindow } from '../../domain/meal-selection-window.entity';
import { IMealSelectionWindowsRepository } from '../../domain/meal-selection-windows.repository.interface';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  businessId: string;
  menuPeriodId: string;
}

export class CreateMealSelectionWindowUseCase {
  constructor(
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _findMenuPeriodUseCase: FindMenuPeriodUseCase,
  ) {}

  async execute(
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    let menuPeriodId = dto.menuPeriodId ?? null;
    if (menuPeriodId) {
      const menuPeriod =
        await this._findMenuPeriodUseCase.execute(menuPeriodId);
      if (!menuPeriod) {
        throw new EntityInstanceNotFoundException('MenuPeriod not found');
      }
    }
    const entity = new MealSelectionWindow(
      ulid(),
      dto.startTime,
      dto.endTime,
      dto.businessId,
      menuPeriodId,
    );
    return this._repository.insert(entity);
  }
}
