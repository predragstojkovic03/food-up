import { Module } from '@nestjs/common';
import { BusinessSuppliersModule } from './business-suppliers/business-suppliers.module';
import { BusinessesModule } from './businesses/businesses.module';
import { EmployeesModule } from './employees/employees.module';
import { MealSelectionWindowsModule } from './meal-selection-windows/meal-selection-windows.module';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [
    BusinessesModule,
    EmployeesModule,
    SuppliersModule,
    BusinessSuppliersModule,
    MealSelectionWindowsModule,
  ],
})
export class CoreModule {}
