import { Provider } from '@nestjs/common';
import { FindMenuPeriodUseCase } from 'src/core/menu-periods/application/use-cases/find-menu-period.use-case';
import { CreateMealSelectionWindowUseCase } from '../application/use-cases/create-meal-selection-window.use-case';
import { DeleteMealSelectionWindowUseCase } from '../application/use-cases/delete-meal-selection-window.use-case';
import { FindAllMealSelectionWindowsUseCase } from '../application/use-cases/find-all-meal-selection-windows.use-case';
import { FindMealSelectionWindowUseCase } from '../application/use-cases/find-meal-selection-window.use-case';
import { UpdateMealSelectionWindowUseCase } from '../application/use-cases/update-meal-selection-window.use-case';
import {
  I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  IMealSelectionWindowsRepository,
} from '../domain/meal-selection-windows.repository.interface';
import { MealSelectionWindowsTypeOrmRepository } from './persistence/meal-selection-windows-typeorm.repository';

export const MealSelectionWindowsRepositoryProvider: Provider = {
  provide: I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  useClass: MealSelectionWindowsTypeOrmRepository,
};

export const MealSelectionWindowsUseCaseProviders: Provider[] = [
  {
    provide: CreateMealSelectionWindowUseCase,
    useFactory: (
      repo: IMealSelectionWindowsRepository,
      findMenuPeriodUseCase: FindMenuPeriodUseCase,
    ) => new CreateMealSelectionWindowUseCase(repo, findMenuPeriodUseCase),
    inject: [I_MEAL_SELECTION_WINDOWS_REPOSITORY, FindMenuPeriodUseCase],
  },
  {
    provide: FindAllMealSelectionWindowsUseCase,
    useFactory: (repo: IMealSelectionWindowsRepository) =>
      new FindAllMealSelectionWindowsUseCase(repo),
    inject: [I_MEAL_SELECTION_WINDOWS_REPOSITORY],
  },
  {
    provide: FindMealSelectionWindowUseCase,
    useFactory: (repo: IMealSelectionWindowsRepository) =>
      new FindMealSelectionWindowUseCase(repo),
    inject: [I_MEAL_SELECTION_WINDOWS_REPOSITORY],
  },
  {
    provide: UpdateMealSelectionWindowUseCase,
    useFactory: (
      repo: IMealSelectionWindowsRepository,
      findMenuPeriodUseCase: FindMenuPeriodUseCase,
    ) => new UpdateMealSelectionWindowUseCase(repo, findMenuPeriodUseCase),
    inject: [I_MEAL_SELECTION_WINDOWS_REPOSITORY, FindMenuPeriodUseCase],
  },
  {
    provide: DeleteMealSelectionWindowUseCase,
    useFactory: (repo) => new DeleteMealSelectionWindowUseCase(repo),
    inject: [I_MEAL_SELECTION_WINDOWS_REPOSITORY],
  },
];
