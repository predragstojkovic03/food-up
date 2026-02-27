import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ArchivableTypeormRepository } from 'src/shared/infrastructure/archivable-typeorm.repository';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';
import { SupplierTypeOrmMapper } from './supplier-typeorm.mapper';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

@Injectable()
export class SuppliersTypeOrmRepository
  extends ArchivableTypeormRepository<Supplier, SupplierPersistence>
  implements ISuppliersRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(
      dataSource,
      SupplierPersistence,
      new SupplierTypeOrmMapper(),
      transactionContext,
    );
  }

  override findAll(): Promise<Supplier[]> {
    return this._repository
      .find({
        relations: {
          businessSuppliers: true,
          managingBusiness: true,
        },
      })
      .then((entities) =>
        entities.map((entity) => this._mapper.toDomain(entity)),
      );
  }

  override findOneByCriteriaOrThrow(
    criteria: Partial<Supplier>,
  ): Promise<Supplier> {
    return this._repository
      .findOneOrFail({
        where: criteria,
        relations: {
          businessSuppliers: true,
          managingBusiness: true,
        },
      })
      .then((entity) => this._mapper.toDomain(entity));
  }

  override findOneByCriteria(
    criteria: Partial<Supplier>,
  ): Promise<Supplier | null> {
    return this._repository
      .findOne({
        where: criteria,
        relations: {
          businessSuppliers: true,
          managingBusiness: true,
        },
      })
      .then((entity) => (entity ? this._mapper.toDomain(entity) : null));
  }
}
