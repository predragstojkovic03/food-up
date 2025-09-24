import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from '../employees/employees.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionWindowsService } from './application/meal-selection-windows.service';
import { MealSelectionWindowsRepositoryProvider } from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindow } from './infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealSelectionWindow]),
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
