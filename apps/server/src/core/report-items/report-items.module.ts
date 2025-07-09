import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportItem } from './infrastructure/persistence/report-item.typeorm-entity';
import {
  ReportItemsRepositoryProvide,
  ReportItemsUseCaseProviders,
} from './infrastructure/report-items.providers';
import { ReportItemsController } from './presentation/rest/report-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReportItem])],
  controllers: [ReportItemsController],
  providers: [ReportItemsRepositoryProvide, ...ReportItemsUseCaseProviders],
})
export class ReportItemsModule {}
