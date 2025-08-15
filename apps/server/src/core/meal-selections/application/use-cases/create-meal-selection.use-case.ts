import { FindEmployeeUseCase } from 'src/core/employees/application/use-cases/find-employee.use-case';
import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
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
  constructor(
    private readonly _repository: IMealSelectionsRepository,
    private readonly _findEmployeeUseCase: FindEmployeeUseCase,
    private readonly _findMenuItemUseCase: FindMenuItemUseCase,
    private readonly _findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
  ) {}

  async execute(dto: CreateMealSelectionDto): Promise<MealSelection> {
    const employee = await this._findEmployeeUseCase.execute(dto.employeeId);
    if (!employee) {
      throw new EntityInstanceNotFoundException('Employee not found');
    }
    const menuItem = await this._findMenuItemUseCase.execute(dto.menuItemId);
    if (!menuItem) {
      throw new EntityInstanceNotFoundException('MenuItem not found');
    }
    const mealSelectionWindow =
      await this._findMealSelectionWindowUseCase.execute(
        dto.mealSelectionWindowId,
      );
    if (!mealSelectionWindow) {
      throw new EntityInstanceNotFoundException(
        'MealSelectionWindow not found',
      );
    }
    const entity = new MealSelection(
      ulid(),
      dto.employeeId,
      dto.menuItemId,
      dto.mealSelectionWindowId,
      dto.quantity ?? null,
    );
    return this._repository.insert(entity);
  }
}
