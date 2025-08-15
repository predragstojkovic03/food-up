import { Provider } from '@nestjs/common';
import { CreateMealUseCase } from '../application/create-meal.use-case';
import { DeleteMealUseCase } from '../application/delete-meal.use-case';
import { FindAllMealsUseCase } from '../application/find-all-meals.use-case';
import { FindMealUseCase } from '../application/find-meal.use-case';
import { UpdateMealUseCase } from '../application/update-meal.use-case';
import { I_MEALS_REPOSITORY } from '../domain/meals.repository.interface';
import { MealsTypeOrmRepository } from './persistence/meals-typeorm.repository';

export const MealsRepositoryProvider: Provider = {
  provide: I_MEALS_REPOSITORY,
  useClass: MealsTypeOrmRepository,
};

export const MealsUseCaseProviders: Provider[] = [
  {
    provide: CreateMealUseCase,
    useFactory: (repo) => new CreateMealUseCase(repo),
    inject: [I_MEALS_REPOSITORY],
  },
  {
    provide: FindMealUseCase,
    useFactory: (repo) => new FindMealUseCase(repo),
    inject: [I_MEALS_REPOSITORY],
  },
  {
    provide: FindAllMealsUseCase,
    useFactory: (repo) => new FindAllMealsUseCase(repo),
    inject: [I_MEALS_REPOSITORY],
  },
  {
    provide: UpdateMealUseCase,
    useFactory: (repo) => new UpdateMealUseCase(repo),
    inject: [I_MEALS_REPOSITORY],
  },
  {
    provide: DeleteMealUseCase,
    useFactory: (repo) => new DeleteMealUseCase(repo),
    inject: [I_MEALS_REPOSITORY],
  },
];
