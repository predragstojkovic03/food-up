import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersModule } from '../suppliers/suppliers.module';
import {
  MealsRepositoryProvider,
  MealsUseCaseProviders,
} from './infrastructure/meals.providers';
import { Meal } from './infrastructure/persistence/meal.typeorm-entity';
import { MealsController } from './presentation/rest/meals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meal]), SuppliersModule],
  controllers: [MealsController],
  providers: [MealsRepositoryProvider, ...MealsUseCaseProviders],
  exports: [...MealsUseCaseProviders],
})
export class MealsModule {}
