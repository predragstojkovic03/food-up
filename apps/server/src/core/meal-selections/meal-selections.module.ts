import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MealSelectionsRepositoryProvide,
  MealSelectionsUseCaseProviders,
} from './infrastructure/meal-selections.providers';
import { MealSelection } from './infrastructure/persistence/meal-selection.typeorm-entity';
import { MealSelectionsController } from './presentation/rest/meal-selections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealSelection])],
  controllers: [MealSelectionsController],
  providers: [
    MealSelectionsRepositoryProvide,
    ...MealSelectionsUseCaseProviders,
  ],
})
export class MealSelectionsModule {}
