import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import {
  MealSelectionsRepositoryProvide,
  MealSelectionsUseCaseProviders,
} from './infrastructure/meal-selections.providers';
import { MealSelection } from './infrastructure/persistence/meal-selection.typeorm-entity';
import { MealSelectionsController } from './presentation/rest/meal-selections.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealSelection]),
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
    MealSelectionWindowsModule,
  ],
  controllers: [MealSelectionsController],
  providers: [
    MealSelectionsRepositoryProvide,
    ...MealSelectionsUseCaseProviders,
  ],
  exports: [...MealSelectionsUseCaseProviders],
})
export class MealSelectionsModule {}
