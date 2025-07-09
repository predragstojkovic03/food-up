import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './infrastructure/persistence/report.typeorm-entity';
import {
  ReportsRepositoryProvide,
  ReportsUseCaseProviders,
} from './infrastructure/reports.providers';
import { ReportsController } from './presentation/rest/reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportsController],
  providers: [ReportsRepositoryProvide, ...ReportsUseCaseProviders],
})
export class ReportsModule {}
