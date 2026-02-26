import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';
import { SupplierTypeOrmMapper } from './supplier-typeorm.mapper';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

@Injectable()
export class SuppliersTypeOrmRepository
  extends TypeOrmRepository<Supplier>
  implements ISuppliersRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, SupplierPersistence, new SupplierTypeOrmMapper(), transactionContext);
  }
}
