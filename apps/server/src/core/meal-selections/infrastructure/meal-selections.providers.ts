import { Provider } from '@nestjs/common';
import { CreateMealSelectionUseCase } from '../application/use-cases/create-meal-selection.use-case';
import { DeleteMealSelectionUseCase } from '../application/use-cases/delete-meal-selection.use-case';
import { FindAllMealSelectionsUseCase } from '../application/use-cases/find-all-meal-selections.use-case';
import { FindMealSelectionUseCase } from '../application/use-cases/find-meal-selection.use-case';
import { UpdateMealSelectionUseCase } from '../application/use-cases/update-meal-selection.use-case';
import { I_MEAL_SELECTIONS_REPOSITORY } from '../domain/meal-selections.repository.interface';
import { MealSelectionsTypeOrmRepository } from './persistence/meal-selections-typeorm.repository';

export const MealSelectionsRepositoryProvide: Provider = {
  provide: I_MEAL_SELECTIONS_REPOSITORY,
  useClass: MealSelectionsTypeOrmRepository,
};

export const MealSelectionsUseCaseProviders: Provider[] = [
  {
    provide: CreateMealSelectionUseCase,
    useFactory: (repo) => new CreateMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: FindAllMealSelectionsUseCase,
    useFactory: (repo) => new FindAllMealSelectionsUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: FindMealSelectionUseCase,
    useFactory: (repo) => new FindMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: UpdateMealSelectionUseCase,
    useFactory: (repo) => new UpdateMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
  {
    provide: DeleteMealSelectionUseCase,
    useFactory: (repo) => new DeleteMealSelectionUseCase(repo),
    inject: [I_MEAL_SELECTIONS_REPOSITORY],
  },
];
