import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { Report } from '../../domain/report.entity';
import { ReportTypeOrmMapper } from './report-typeorm.mapper';
import { Report as ReportPersistence } from './report.typeorm-entity';

@Injectable()
export class ReportsTypeOrmRepository extends TypeOrmRepository<Report> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, ReportPersistence, new ReportTypeOrmMapper(), transactionContext);
  }
}
