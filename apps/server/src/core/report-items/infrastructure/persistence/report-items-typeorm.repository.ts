import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { ReportItem } from '../../domain/report-item.entity';
import { ReportItemTypeOrmMapper } from './report-item-typeorm.mapper';
import { ReportItem as ReportItemPersistence } from './report-item.typeorm-entity';

@Injectable()
export class ReportItemsTypeOrmRepository extends TypeOrmRepository<ReportItem, ReportItemPersistence> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, ReportItemPersistence, new ReportItemTypeOrmMapper(), transactionContext);
  }
}
