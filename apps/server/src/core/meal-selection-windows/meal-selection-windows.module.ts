import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import {
  MealSelectionWindowsRepositoryProvider,
  MealSelectionWindowsUseCaseProviders,
} from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindow } from './infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealSelectionWindow]), MenuPeriodsModule],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    ...MealSelectionWindowsUseCaseProviders,
  ],
  exports: [...MealSelectionWindowsUseCaseProviders],
  controllers: [MealSelectionWindowsController],
})
export class MealSelectionWindowsModule {}
