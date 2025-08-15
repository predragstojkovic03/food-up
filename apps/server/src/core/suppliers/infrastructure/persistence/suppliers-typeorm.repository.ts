import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';
import { SupplierTypeOrmMapper } from './supplier-typeorm.mapper';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

@Injectable()
export class SuppliersTypeOrmRepository extends TypeOrmRepository<Supplier> {
  constructor(
    @InjectRepository(SupplierPersistence)
    repository: Repository<Supplier>,
  ) {
    super(repository, new SupplierTypeOrmMapper());
  }
}
