import { forwardRef, Module } from '@nestjs/common';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ReportsModule } from '../reports/reports.module';
import { ReportItemsService } from './application/report-items.service';
import { ReportItemsRepositoryProvide } from './infrastructure/report-items.providers';
import { ReportItemsController } from './presentation/rest/report-items.controller';

@Module({
  imports: [
    MenuItemsModule,
    forwardRef(() => ReportsModule),
  ],
  controllers: [ReportItemsController],
  providers: [ReportItemsRepositoryProvide, ReportItemsService],
})
export class ReportItemsModule {}
