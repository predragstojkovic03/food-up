import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { Business } from '../../domain/business.entity';
import { BusinessTypeOrmMapper } from './business-typeorm.mapper';
import { Business as BusinessTypeormEntity } from './business.typeorm-entity';

@Injectable()
export class BusinessTypeormRepository extends TypeOrmRepository<Business, BusinessTypeormEntity> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, BusinessTypeormEntity, new BusinessTypeOrmMapper(), transactionContext);
  }
}
