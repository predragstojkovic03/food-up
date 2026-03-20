import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmployeesModule } from '../employees/employees.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionWindowsService } from './application/meal-selection-windows.service';
import { MealSelectionWindowsRepositoryProvider } from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindowEventHandler } from './infrastructure/meal-selection-window-event-handler.service';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';
import { MEAL_WINDOW_QUEUE } from 'src/shared/infrastructure/notifications/queue-names';

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
    BullModule.registerQueue({ name: MEAL_WINDOW_QUEUE }),
  ],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    MealSelectionWindowsService,
    MealSelectionWindowEventHandler,
  ],
  exports: [MealSelectionWindowsService],
  controllers: [MealSelectionWindowsController],
})
export class MealSelectionWindowsModule {}
