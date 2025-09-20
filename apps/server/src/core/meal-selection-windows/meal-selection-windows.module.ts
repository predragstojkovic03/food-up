import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionWindowsService } from './application/meal-selection-windows.service';
import { MealSelectionWindowsRepositoryProvider } from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindow } from './infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealSelectionWindow]), MenuPeriodsModule],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    MealSelectionWindowsService,
  ],
  exports: [MealSelectionWindowsService],
  controllers: [MealSelectionWindowsController],
})
export class MealSelectionWindowsModule {}
