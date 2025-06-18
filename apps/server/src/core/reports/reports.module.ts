import { Module } from '@nestjs/common';
import { ReportsController } from './presentation/rest/reports.controller';

@Module({
  imports: [],
  controllers: [ReportsController],
  providers: [],
})
export class ReportsModule {}