import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplierTypeOrmMapper } from './business-supplier-typeorm.mapper';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

@Injectable()
export class BusinessSuppliersTypeOrmRepository extends TypeOrmRepository<BusinessSupplier> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, BusinessSupplierPersistence, new BusinessSupplierTypeOrmMapper(), transactionContext);
  }
}
