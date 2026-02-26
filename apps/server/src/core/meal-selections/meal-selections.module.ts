import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionsService } from './application/meal-selections.service';
import { MealSelectionsRepositoryProvide } from './infrastructure/meal-selections.providers';
import { MealSelectionsController } from './presentation/rest/meal-selections.controller';

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
    MealSelectionWindowsModule,
  ],
  controllers: [MealSelectionsController],
  providers: [MealSelectionsRepositoryProvide, MealSelectionsService],
  exports: [MealSelectionsService],
})
export class MealSelectionsModule {}
