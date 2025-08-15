import { FindEmployeeUseCase } from 'src/core/employees/application/use-cases/find-employee.use-case';
import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MealSelection } from '../../domain/meal-selection.entity';
import { IMealSelectionsRepository } from '../../domain/meal-selections.repository.interface';

export interface UpdateMealSelectionDto {
  employeeId?: string;
  menuItemId?: string;
  mealSelectionWindowId?: string;
  quantity?: number | null;
}

export class UpdateMealSelectionUseCase {
  constructor(
    private readonly _repository: IMealSelectionsRepository,
    private readonly _findEmployeeUseCase: FindEmployeeUseCase,
    private readonly _findMenuItemUseCase: FindMenuItemUseCase,
    private readonly _findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException('MealSelection not found');
    let employeeIdToCheck = dto.employeeId ?? existing.employeeId;
    if (employeeIdToCheck !== existing.employeeId) {
      const employee =
        await this._findEmployeeUseCase.execute(employeeIdToCheck);
      if (!employee) {
        throw new EntityInstanceNotFoundException('Employee not found');
      }
    }
    let menuItemIdToCheck = dto.menuItemId ?? existing.menuItemId;
    if (menuItemIdToCheck !== existing.menuItemId) {
      const menuItem =
        await this._findMenuItemUseCase.execute(menuItemIdToCheck);
      if (!menuItem) {
        throw new EntityInstanceNotFoundException('MenuItem not found');
      }
    }
    let mealSelectionWindowIdToCheck =
      dto.mealSelectionWindowId ?? existing.mealSelectionWindowId;
    if (mealSelectionWindowIdToCheck !== existing.mealSelectionWindowId) {
      const mealSelectionWindow =
        await this._findMealSelectionWindowUseCase.execute(
          mealSelectionWindowIdToCheck,
        );
      if (!mealSelectionWindow) {
        throw new EntityInstanceNotFoundException(
          'MealSelectionWindow not found',
        );
      }
    }
    const updated = new MealSelection(
      id,
      employeeIdToCheck,
      menuItemIdToCheck,
      mealSelectionWindowIdToCheck,
      dto.quantity ?? existing.quantity,
    );
    return this._repository.update(id, updated);
  }
}
