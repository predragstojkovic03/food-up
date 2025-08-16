import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BusinessSuppliersModule } from './business-suppliers/business-suppliers.module';
import { BusinessesModule } from './businesses/businesses.module';
import { ChangeRequestsModule } from './change-requests/change-requests.module';
import { EmployeesModule } from './employees/employees.module';
import { IdentityModule } from './identity/identity.module';
import { MealSelectionWindowsModule } from './meal-selection-windows/meal-selection-windows.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { MenuPeriodsModule } from './menu-periods/menu-periods.module';
import { ReportItemsModule } from './report-items/report-items.module';
import { ReportsModule } from './reports/reports.module';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [
    BusinessesModule,
    EmployeesModule,
    SuppliersModule,
    BusinessSuppliersModule,
    MealSelectionWindowsModule,
    MenuItemsModule,
    MenuPeriodsModule,
    ReportItemsModule,
    ReportsModule,
    IdentityModule,
    AuthModule,
    SuppliersModule,
    ChangeRequestsModule,
  ],
})
export class CoreModule {}
