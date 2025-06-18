import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MealSelectionWindowsRepositoryProvider,
  MealSelectionWindowsUseCaseProviders,
} from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindow } from './infrastructure/persistence/meal-selection-window.typeorm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealSelectionWindow])],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    ...MealSelectionWindowsUseCaseProviders,
  ],
  exports: [
    MealSelectionWindowsRepositoryProvider,
    ...MealSelectionWindowsUseCaseProviders,
  ],
})
export class MealSelectionWindowsModule {}
