import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionWindowsService } from './application/meal-selection-windows.service';
import { MealSelectionWindowsRepositoryProvider } from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
  ],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    MealSelectionWindowsService,
  ],
  exports: [MealSelectionWindowsService],
  controllers: [MealSelectionWindowsController],
})
export class MealSelectionWindowsModule {}
