import { Provider } from '@nestjs/common';
import { FindEmployeeUseCase } from 'src/core/employees/application/use-cases/find-employee.use-case';
import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { CreateMealSelectionUseCase } from '../application/use-cases/create-meal-selection.use-case';
import { DeleteMealSelectionUseCase } from '../application/use-cases/delete-meal-selection.use-case';
import { FindAllMealSelectionsUseCase } from '../application/use-cases/find-all-meal-selections.use-case';
import { FindMealSelectionUseCase } from '../application/use-cases/find-meal-selection.use-case';
import { UpdateMealSelectionUseCase } from '../application/use-cases/update-meal-selection.use-case';
import {
  I_MEAL_SELECTIONS_REPOSITORY,
  IMealSelectionsRepository,
} from '../domain/meal-selections.repository.interface';
import { MealSelectionsTypeOrmRepository } from './persistence/meal-selections-typeorm.repository';

export const MealSelectionsRepositoryProvide: Provider = {
  provide: I_MEAL_SELECTIONS_REPOSITORY,
  useClass: MealSelectionsTypeOrmRepository,
};

export const MealSelectionsUseCaseProviders: Provider[] = [
  {
    provide: CreateMealSelectionUseCase,
    useFactory: (
      repo: IMealSelectionsRepository,
      findEmployeeUseCase: FindEmployeeUseCase,
      findMenuItemUseCase: FindMenuItemUseCase,
      findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
    ) =>
      new CreateMealSelectionUseCase(
        repo,
        findEmployeeUseCase,
        findMenuItemUseCase,
        findMealSelectionWindowUseCase,
      ),
    inject: [
      I_MEAL_SELECTIONS_REPOSITORY,
      FindEmployeeUseCase,
      FindMenuItemUseCase,
      FindMealSelectionWindowUseCase,
    ],
  },
  {
    provide: FindAllMealSelectionsUseCase,
    useFactory: (repo: IMealSelectionsRepository) =>
      new FindAllMealSelectionsUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: FindMealSelectionUseCase,
    useFactory: (repo: IMealSelectionsRepository) =>
      new FindMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: UpdateMealSelectionUseCase,
    useFactory: (
      repo: IMealSelectionsRepository,
      findEmployeeUseCase: FindEmployeeUseCase,
      findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
      findMenuItemUseCase: FindMenuItemUseCase,
    ) =>
      new UpdateMealSelectionUseCase(
        repo,
        findEmployeeUseCase,
        findMenuItemUseCase,
        findMealSelectionWindowUseCase,
      ),
    inject: [
      I_MEAL_SELECTIONS_REPOSITORY,
      FindMealSelectionWindowUseCase,
      FindEmployeeUseCase,
      FindMenuItemUseCase,
    ],
  },
  {
    provide: DeleteMealSelectionUseCase,
    useFactory: (repo: IMealSelectionsRepository) =>
      new DeleteMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
];
