import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { ChangeRequest } from '../../domain/change-request.entity';
import { ChangeRequestTypeOrmMapper } from './change-request-typeorm.mapper';
import { ChangeRequest as ChangeRequestPersistence } from './change-request.typeorm-entity';

@Injectable()
export class ChangeRequestsTypeOrmRepository extends TypeOrmRepository<ChangeRequest> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, ChangeRequestPersistence, new ChangeRequestTypeOrmMapper(), transactionContext);
  }
}
