import { Module } from '@nestjs/common';
import { ReportItemsController } from './presentation/rest/report-items.controller';

@Module({
  imports: [],
  controllers: [ReportItemsController],
  providers: [],
})
export class ReportItemsModule {}