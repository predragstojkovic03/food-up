import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MealSelectionsModule } from '../meal-selections/meal-selections.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ReportItemsModule } from '../report-items/report-items.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ReportsService } from './application/reports.service';
import { Report } from './infrastructure/persistence/report.typeorm-entity';
import { ReportsRepositoryProvide } from './infrastructure/reports.providers';
import { ReportsController } from './presentation/rest/reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    MenuItemsModule,
    forwardRef(() => ReportItemsModule),
    SuppliersModule,
    MealSelectionsModule,
    MealSelectionWindowsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsRepositoryProvide, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
