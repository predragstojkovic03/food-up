import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplierTypeOrmMapper } from './business-supplier-typeorm.mapper';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

@Injectable()
export class BusinessSuppliersTypeOrmRepository extends TypeOrmRepository<
  BusinessSupplier,
  BusinessSupplierPersistence
> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(
      dataSource,
      BusinessSupplierPersistence,
      new BusinessSupplierTypeOrmMapper(),
      transactionContext,
    );
  }

  async findBySupplierAndBusiness(
    supplierId: string,
    businessId: string,
  ): Promise<BusinessSupplier | null> {
    const entity = await this._repository.findOne({
      where: {
        supplier: { id: supplierId },
        business: { id: businessId },
      },
    });
    return entity ? this._mapper.toDomain(entity) : null;
  }
}
