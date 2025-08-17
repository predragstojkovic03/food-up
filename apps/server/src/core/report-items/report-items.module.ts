import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ReportsModule } from '../reports/reports.module';
import { ReportItemsService } from './application/report-items.service';
import { ReportItem } from './infrastructure/persistence/report-item.typeorm-entity';
import { ReportItemsRepositoryProvide } from './infrastructure/report-items.providers';
import { ReportItemsController } from './presentation/rest/report-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportItem]),
    MenuItemsModule,
    forwardRef(() => ReportsModule),
  ],
  controllers: [ReportItemsController],
  providers: [ReportItemsRepositoryProvide, ReportItemsService],
})
export class ReportItemsModule {}
